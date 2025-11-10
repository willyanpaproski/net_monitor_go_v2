package trap

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	models "net_monitor/models"
	"net_monitor/websocket"

	"github.com/gosnmp/gosnmp"
)

const (
	OID_LINK_DOWN       = "1.3.6.1.6.3.1.1.5.3"
	OID_LINK_UP         = "1.3.6.1.6.3.1.1.5.4"
	OID_IF_INDEX        = ".1.3.6.1.2.1.2.2.1.1"
	OID_IF_ADMIN_STATUS = ".1.3.6.1.2.1.2.2.1.7"
	OID_IF_OPER_STATUS  = ".1.3.6.1.2.1.2.2.1.8"
	OID_IF_DESCR        = ".1.3.6.1.2.1.2.2.1.2"
)

type TrapListener struct {
	listener    *gosnmp.TrapListener
	hub         *websocket.Hub
	routerCache map[string]*models.Roteador
	port        string
}

type InterfaceTrapEvent struct {
	RouterID       string    `json:"router_id"`
	RouterName     string    `json:"router_name"`
	RouterIP       string    `json:"router_ip"`
	InterfaceIndex int       `json:"interface_index"`
	InterfaceName  string    `json:"interface_name"`
	Event          string    `json:"event"`
	AdminStatus    int       `json:"admin_status"`
	OperStatus     int       `json:"oper_status"`
	Timestamp      time.Time `json:"timestamp"`
	TrapOID        string    `json:"trap_oid"`
}

func NewTrapListener(port string, hub *websocket.Hub) *TrapListener {
	return &TrapListener{
		hub:         hub,
		routerCache: make(map[string]*models.Roteador),
		port:        port,
	}
}

func (tl *TrapListener) RegisterRouter(router *models.Roteador) {
	tl.routerCache[router.IPAddress] = router
	log.Printf("Roteador %s (%s) registrado para receber traps", router.Name, router.IPAddress)
}

func (tl *TrapListener) UnregisterRouter(routerIP string) {
	delete(tl.routerCache, routerIP)
	log.Printf("Roteador %s removido do registro de traps", routerIP)
}

func (tl *TrapListener) Start() error {
	listener := gosnmp.NewTrapListener()
	listener.OnNewTrap = tl.handleTrap
	listener.Params = gosnmp.Default

	listener.Params.Version = gosnmp.Version2c
	listener.Params.Community = os.Getenv("SNMP_TRAP_COMMUNITY")

	err := listener.Listen("0.0.0.0:" + tl.port)
	if err != nil {
		return fmt.Errorf("erro ao iniciar trap listener: %v", err)
	}

	tl.listener = listener
	log.Printf("SNMP Trap Listener iniciado na porta %s", tl.port)
	return nil
}

func (tl *TrapListener) Stop() {
	if tl.listener != nil {
		tl.listener.Close()
		log.Println("SNMP Trap Listener encerrado")
	}
}

func (tl *TrapListener) handleTrap(packet *gosnmp.SnmpPacket, addr *net.UDPAddr) {
	log.Printf("Trap recebida de %s", addr.IP.String())
	log.Printf("Packet recebido %s", packet)

	router, exists := tl.routerCache[addr.IP.String()]
	if !exists {
		log.Printf("Trap recebida de IP não registrado: %s", addr.IP.String())
		return
	}

	event := tl.parseTrap(packet, router, addr.IP.String())
	if event != nil {
		tl.broadcastEvent(event)
		tl.logEvent(event)
	}
}

func (tl *TrapListener) parseTrap(packet *gosnmp.SnmpPacket, router *models.Roteador, sourceIP string) *InterfaceTrapEvent {
	event := &InterfaceTrapEvent{
		RouterID:   router.ID.Hex(),
		RouterName: router.Name,
		RouterIP:   sourceIP,
		Timestamp:  time.Now(),
	}

	var trapOID string
	var ifIndex int
	var ifDescr string
	var adminStatus int
	var operStatus int

	for _, variable := range packet.Variables {
		oid := variable.Name

		switch {
		case oid == ".1.3.6.1.6.3.1.1.4.1.0":
			trapOID = fmt.Sprintf("%v", variable.Value)
			if len(trapOID) > 0 && trapOID[0] == '.' {
				trapOID = trapOID[1:]
			}

		case contains(oid, OID_IF_INDEX):
			if idx, ok := variable.Value.(int); ok {
				ifIndex = idx
			}

		case contains(oid, OID_IF_DESCR):
			if desc, ok := variable.Value.([]byte); ok {
				ifDescr = string(desc)
			} else if desc, ok := variable.Value.(string); ok {
				ifDescr = desc
			}

		case contains(oid, OID_IF_ADMIN_STATUS):
			if status, ok := variable.Value.(int); ok {
				adminStatus = status
			}

		case contains(oid, OID_IF_OPER_STATUS):
			if status, ok := variable.Value.(int); ok {
				operStatus = status
			}
		}
	}

	if trapOID == OID_LINK_DOWN {
		event.Event = "link_down"
	} else if trapOID == OID_LINK_UP {
		event.Event = "link_up"
	} else {
		log.Printf("Trap OID desconhecido: %s", trapOID)
		return nil
	}

	event.TrapOID = trapOID
	event.InterfaceIndex = ifIndex
	event.InterfaceName = ifDescr
	event.AdminStatus = adminStatus
	event.OperStatus = operStatus

	return event
}

func (tl *TrapListener) broadcastEvent(event *InterfaceTrapEvent) {
	jsonData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Erro ao serializar evento de trap: %v", err)
		return
	}

	tl.hub.Broadcast(jsonData)
	log.Printf("Evento de trap broadcast: %s - Interface %s (%d) em %s",
		event.Event, event.InterfaceName, event.InterfaceIndex, event.RouterName)
}

func (tl *TrapListener) logEvent(event *InterfaceTrapEvent) {
	statusStr := "DOWN"
	if event.Event == "link_up" {
		statusStr = "UP"
	}

	log.Printf("[TRAP EVENT] Router: %s | Interface: %s (index: %d) | Status: %s | Admin: %d | Oper: %d",
		event.RouterName,
		event.InterfaceName,
		event.InterfaceIndex,
		statusStr,
		event.AdminStatus,
		event.OperStatus,
	)
}

func contains(haystack, needle string) bool {
	return len(haystack) >= len(needle) && haystack[:len(needle)] == needle
}
