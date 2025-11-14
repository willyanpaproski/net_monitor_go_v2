package websocket

import (
	"log"
	"net/http"
	"sync"
	"time"

	"net_monitor/interfaces"
	models "net_monitor/models"

	"github.com/gorilla/websocket"
)

type AuthService interface {
	ValidateToken(token string) (*models.User, error)
}

type Hub struct {
	clients     map[*Client]bool
	register    chan *Client
	unregister  chan *Client
	broadcast   chan []byte
	collectors  map[string]SNMPCollector
	mu          sync.RWMutex
	authService AuthService
}

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	deviceID string
	vendor   string
}

type SNMPCollector interface {
	Collect(device interfaces.NetworkDevice) (map[string]interface{}, error)
	GetVendor() string
}

type SNMPMessage struct {
	DeviceID   string                 `json:"device_id"`
	DeviceName string                 `json:"device_name"`
	DeviceType string                 `json:"device_type"`
	Vendor     string                 `json:"vendor"`
	Data       map[string]interface{} `json:"data"`
	Timestamp  time.Time              `json:"timestamp"`
	Error      string                 `json:"error,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func NewHub(authService AuthService) *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		broadcast:   make(chan []byte, 256),
		collectors:  make(map[string]SNMPCollector),
		authService: authService,
	}
}

func (h *Hub) RegisterCollector(collector SNMPCollector) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.collectors[collector.GetVendor()] = collector
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client connected for device %s (%s)", client.deviceID, client.vendor)

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client disconnected for device %s", client.deviceID)
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) Broadcast(message []byte) {
	h.broadcast <- message
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	deviceID := r.URL.Query().Get("device_id")
	if deviceID == "" {
		deviceID = r.URL.Query().Get("router_id")
	}
	if deviceID == "" {
		deviceID = r.URL.Query().Get("olt_id")
	}
	if deviceID == "" {
		deviceID = r.URL.Query().Get("switch_id")
	}

	vendor := r.URL.Query().Get("vendor")
	authToken := r.URL.Query().Get("token")

	_, errToken := h.authService.ValidateToken(authToken)
	if errToken != nil {
		log.Printf("Auth token required: %v", errToken)
		http.Error(w, "Auth token required", http.StatusUnauthorized)
		return
	}

	if deviceID == "" {
		http.Error(w, "Device ID is required", http.StatusBadRequest)
		return
	}

	if vendor == "" {
		http.Error(w, "Vendor is required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Erro at websocket upgrade: %v", err)
		return
	}

	client := &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		deviceID: deviceID,
		vendor:   vendor,
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()

	log.Printf("Websocket connected successfully for device %s (%s)", deviceID, vendor)
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Unspected error at websocket: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Error sending message to websocket: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping to websocket: %v", err)
				return
			}
		}
	}
}

func (h *Hub) GetConnectedClients() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) GetClientsByDevice(deviceID string) []*Client {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var clients []*Client
	for client := range h.clients {
		if client.deviceID == deviceID {
			clients = append(clients, client)
		}
	}

	return clients
}
