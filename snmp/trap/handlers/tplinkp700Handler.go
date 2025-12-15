package handlers

import (
	"fmt"
	"log"
	"net_monitor/interfaces"
	"net_monitor/snmp"
	"time"

	"github.com/gosnmp/gosnmp"
)

const (
	P7000_BASE_OID = "1.3.6.1.4.1.11863"
)

type TPLinkP7000TrapHandler struct {
	rfcHandler *RFCTrapHandler
}

func NewTPLinkP7000TrapHandler() *TPLinkP7000TrapHandler {
	return &TPLinkP7000TrapHandler{
		rfcHandler: NewRFCTrapHandler(),
	}
}

func (h *TPLinkP7000TrapHandler) GetVendor() string {
	return "tplinkp7000"
}

func (h *TPLinkP7000TrapHandler) CanHandle(trapOID string) bool {
	fmt.Printf("Trap do djabo %v", trapOID)
	if snmp.ContainsOid(trapOID, P7000_BASE_OID) {
		return true
	}

	canHandleRFC := h.rfcHandler.CanHandle(trapOID)
	return canHandleRFC
}

func (h *TPLinkP7000TrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	log.Printf("[TP-LINK DEBUG] Pacote contém %d variáveis:", len(packet.Variables))
	for i, variable := range packet.Variables {
		log.Printf("[TP-LINK DEBUG] Variável %d: OID=%s, Type=%T, Value=%v", i, variable.Name, variable.Value, variable.Value)
	}

	trapOid := h.rfcHandler.ExtractTrapOID(packet)

	if trapOid == "" {
		return nil, fmt.Errorf("trap OID not found")
	}

	if h.rfcHandler.CanHandle(trapOid) {
		return h.rfcHandler.ParseTrap(packet, device, deviceType)
	}

	event := &interfaces.TrapEvent{
		DeviceID:   device.GetID(),
		DeviceName: device.GetName(),
		DeviceIP:   device.GetIPAddress(),
		DeviceType: deviceType,
		Vendor:     device.GetIntegration(),
		TrapOID:    trapOid,
		Timestamp:  time.Now(),
		Data:       make(map[string]interface{}),
	}

	return event, nil
}
