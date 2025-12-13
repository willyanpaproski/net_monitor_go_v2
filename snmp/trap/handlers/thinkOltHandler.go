package handlers

import (
	"fmt"
	"net_monitor/interfaces"
	"net_monitor/snmp"
	"strings"
	"time"

	"github.com/gosnmp/gosnmp"
)

const (
	THINK_BASE_OID             = "1.3.6.1.4.1.17409"
	THINK_ONU_STATE_CHANGE_OID = "1.3.6.1.4.1.17409.2.2.12"
	THINK_ONU_CONFIG_STATE     = "1.3.6.1.4.1.17409.2.2.12.1.2.7.0"
	THINK_ONU_SN_OID           = "1.3.6.1.4.1.17409.2.2.12.1.2.3.0"
	THINK_ONU_STATUS_OID       = "1.3.6.1.4.1.17409.2.2.12.1.2.4.0"
)

type ThinkOltTrapHandler struct {
	rfcHandler *RFCTrapHandler
}

func NewThinkOltTrapHandler() *ThinkOltTrapHandler {
	return &ThinkOltTrapHandler{
		rfcHandler: NewRFCTrapHandler(),
	}
}

func (h *ThinkOltTrapHandler) GetVendor() string {
	return "think"
}

func (h *ThinkOltTrapHandler) CanHandle(trapOID string) bool {
	if snmp.ContainsOid(trapOID, THINK_BASE_OID) {
		return true
	}

	canHandleRFC := h.rfcHandler.CanHandle(trapOID)
	return canHandleRFC
}

func (h *ThinkOltTrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	// log.Printf("[THINK DEBUG] Pacote contém %d variáveis:", len(packet.Variables))
	// for i, variable := range packet.Variables {
	// 	log.Printf("[THINK DEBUG] Variável %d: OID=%s, Type=%T, Value=%v",
	// 		i, variable.Name, variable.Value, variable.Value)
	// }

	trapOID := h.rfcHandler.ExtractTrapOID(packet)

	if trapOID == "" {
		return nil, fmt.Errorf("trap OID not found")
	}

	if h.rfcHandler.CanHandle(trapOID) {
		return h.rfcHandler.ParseTrap(packet, device, deviceType)
	}

	event := &interfaces.TrapEvent{
		DeviceID:   device.GetID(),
		DeviceName: device.GetName(),
		DeviceIP:   device.GetIPAddress(),
		DeviceType: deviceType,
		Vendor:     device.GetIntegration(),
		TrapOID:    trapOID,
		Timestamp:  time.Now(),
		Data:       make(map[string]interface{}),
	}

	if snmp.ContainsOid(trapOID, THINK_ONU_STATE_CHANGE_OID) {
		return h.parseOnuConfigStateChange(packet, event)
	} else {
		return h.parseGenericThinkTrap(packet, event)
	}
}

func (h *ThinkOltTrapHandler) parseOnuConfigStateChange(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "ONU_STATE_CHANGE"
	event.Message = "ONU mudou de estado de configuração"

	h.extractThinkONUData(packet, event)

	return event, nil
}

func (h *ThinkOltTrapHandler) parseGenericThinkTrap(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "think_generic_trap"
	event.Message = "Trap Think genérica recebida"

	h.extractThinkONUData(packet, event)

	return event, nil
}

func (h *ThinkOltTrapHandler) extractThinkONUData(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) {
	onuSn := ""
	onuStatus := ""

	for _, variable := range packet.Variables {
		oid := variable.Name
		if len(oid) > 0 && oid[0] == '.' {
			oid = oid[1:]
		}

		if snmp.ContainsOid(oid, THINK_ONU_SN_OID) {
			if sn, ok := variable.Value.([]byte); ok {
				onuSn = strings.Replace(string(sn), "SN ", "", 1)
			}
		}

		if snmp.ContainsOid(oid, THINK_ONU_STATUS_OID) {
			status := variable.Value
			switch status {
			case 113001:
				onuStatus = "ONU_UP"
			case 113002:
				onuStatus = "ONU_DOWN"
			default:
				onuStatus = "unknown"
			}
		}
	}

	event.OnuChangeEvent = interfaces.ONUChangeConfigEvent{
		SerialNumber: onuSn,
		OnuStatus:    onuStatus,
	}

	h.rfcHandler.ExtractInterfaceData(packet, event)
}
