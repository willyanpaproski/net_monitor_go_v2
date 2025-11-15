package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"sync"

	"net_monitor/interfaces"
	"net_monitor/snmp/trap/handlers"
	"net_monitor/websocket"

	"github.com/gosnmp/gosnmp"
)

type TrapService struct {
	listener     *gosnmp.TrapListener
	hub          *websocket.Hub
	deviceCache  map[string]*CachedDevice
	trapHandlers map[string]interfaces.TrapHandler
	rfcHandler   interfaces.TrapHandler
	port         string
	mu           sync.RWMutex
}

type CachedDevice struct {
	Device     interfaces.NetworkDevice
	DeviceType DeviceType
}

func NewTrapService(
	hub *websocket.Hub,
	deviceService DeviceService,
	port string,
) *TrapService {
	ts := &TrapService{
		hub:          hub,
		deviceCache:  make(map[string]*CachedDevice),
		trapHandlers: make(map[string]interfaces.TrapHandler),
		port:         port,
	}

	ts.rfcHandler = handlers.NewRFCTrapHandler()

	return ts
}

func (ts *TrapService) RegisterTrapHandler(handler interfaces.TrapHandler) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	ts.trapHandlers[handler.GetVendor()] = handler
	log.Printf("Trap handler registrado para vendor: %s", handler.GetVendor())
}

func (ts *TrapService) RegisterDevice(device interfaces.NetworkDevice, deviceType DeviceType) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	ts.deviceCache[device.GetIPAddress()] = &CachedDevice{
		Device:     device,
		DeviceType: deviceType,
	}
	log.Printf("Dispositivo %s (%s) registrado para receber traps",
		device.GetName(), device.GetIPAddress())
}

func (ts *TrapService) UnregisterDevice(deviceIP string) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	delete(ts.deviceCache, deviceIP)
	log.Printf("Dispositivo %s removido do registro de traps", deviceIP)
}

func (ts *TrapService) Start() error {
	listener := gosnmp.NewTrapListener()
	listener.OnNewTrap = ts.handleTrap
	listener.Params = gosnmp.Default

	listener.Params.Version = gosnmp.Version2c
	listener.Params.Community = os.Getenv("SNMP_TRAP_COMMUNITY")

	err := listener.Listen("0.0.0.0:" + ts.port)
	if err != nil {
		return fmt.Errorf("erro ao iniciar trap listener: %v", err)
	}

	ts.listener = listener
	log.Printf("SNMP Trap Listener iniciado na porta %s", ts.port)
	return nil
}

func (ts *TrapService) Stop() {
	if ts.listener != nil {
		ts.listener.Close()
		log.Println("SNMP Trap Listener encerrado")
	}
}

func (ts *TrapService) handleTrap(packet *gosnmp.SnmpPacket, addr *net.UDPAddr) {
	log.Printf("Trap recebida de %s", addr.IP.String())

	ts.mu.RLock()
	cachedDevice, exists := ts.deviceCache[addr.IP.String()]
	ts.mu.RUnlock()

	if !exists {
		log.Printf("Trap recebida de IP não registrado: %s", addr.IP.String())
		return
	}

	event, err := ts.parseTrap(packet, cachedDevice)
	if err != nil {
		log.Printf("Erro ao parsear trap de %s: %v", addr.IP.String(), err)
		return
	}

	if event != nil {
		ts.broadcastEvent(event)
		ts.logEvent(event)
	}
}

func (ts *TrapService) parseTrap(packet *gosnmp.SnmpPacket, cachedDevice *CachedDevice) (*interfaces.TrapEvent, error) {
	device := cachedDevice.Device
	deviceType := string(cachedDevice.DeviceType)
	vendor := device.GetIntegration()

	ts.mu.RLock()
	handler, exists := ts.trapHandlers[vendor]
	ts.mu.RUnlock()

	if exists {
		trapOID := ts.extractTrapOID(packet)
		if handler.CanHandle(trapOID) {
			log.Printf("Usando handler vendorizado '%s' para trap %s", vendor, trapOID)
			return handler.ParseTrap(packet, device, deviceType)
		}
	}

	log.Printf("Usando handler RFC padrão para dispositivo %s", device.GetName())
	return ts.rfcHandler.ParseTrap(packet, device, deviceType)
}

func (ts *TrapService) extractTrapOID(packet *gosnmp.SnmpPacket) string {
	fmt.Print(packet)
	for _, variable := range packet.Variables {
		if variable.Name == "1.3.6.1.6.3.1.1.4.1.0" || variable.Name == ".1.3.6.1.6.3.1.1.4.1.0" {
			trapOID := fmt.Sprintf("%v", variable.Value)
			if len(trapOID) > 0 && trapOID[0] == '.' {
				trapOID = trapOID[1:]
			}
			return trapOID
		}
	}
	return ""
}

func (ts *TrapService) broadcastEvent(event *interfaces.TrapEvent) {
	jsonData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Erro ao serializar evento de trap: %v", err)
		return
	}

	ts.hub.Broadcast(jsonData)
	log.Printf("Evento de trap broadcast: %s - %s em %s",
		event.EventType, event.Message, event.DeviceName)
}

func (ts *TrapService) logEvent(event *interfaces.TrapEvent) {
	log.Printf("[TRAP EVENT] Device: %s (%s) | Type: %s | Event: %s | Severity: %s | Message: %s",
		event.DeviceName,
		event.DeviceType,
		event.Vendor,
		event.EventType,
		event.Severity,
		event.Message,
	)

	if len(event.Data) > 0 {
		log.Printf("[TRAP DATA] %+v", event.Data)
	}
}

func (ts *TrapService) GetRegisteredDevices() []string {
	ts.mu.RLock()
	defer ts.mu.RUnlock()

	devices := make([]string, 0, len(ts.deviceCache))
	for ip := range ts.deviceCache {
		devices = append(devices, ip)
	}
	return devices
}

func (ts *TrapService) GetRegisteredHandlers() []string {
	ts.mu.RLock()
	defer ts.mu.RUnlock()

	handlers := make([]string, 0, len(ts.trapHandlers)+1)
	handlers = append(handlers, "rfc")
	for vendor := range ts.trapHandlers {
		handlers = append(handlers, vendor)
	}
	return handlers
}
