package handlers

import (
	"fmt"
	"log"
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
	log.Printf("[THINK DEBUG] Verificando se pode tratar trap OID: %s", trapOID)

	if h.contains(trapOID, THINK_BASE_OID) {
		//log.Printf("[THINK DEBUG] Trap OID reconhecida como Think: %s", trapOID)
		return true
	}

	canHandleRFC := h.rfcHandler.CanHandle(trapOID)
	//log.Printf("[THINK DEBUG] RFC pode tratar? %v", canHandleRFC)
	return canHandleRFC
}

func (h *ThinkOltTrapHandler) GetSupportedTraps() []string {
	thinkOltTraps := []string{
		THINK_ONU_CONFIG_STATE,
		THINK_ONU_SN_OID,
	}
	return append(thinkOltTraps, h.rfcHandler.GetSupportedTraps()...)
}

func (h *ThinkOltTrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	// log.Printf("[THINK DEBUG] Iniciando parse da trap para dispositivo %s", device.GetName())

	log.Printf("[THINK DEBUG] Pacote contém %d variáveis:", len(packet.Variables))
	for i, variable := range packet.Variables {
		log.Printf("[THINK DEBUG] Variável %d: OID=%s, Type=%T, Value=%v",
			i, variable.Name, variable.Value, variable.Value)
	}

	trapOID := h.rfcHandler.ExtractTrapOID(packet)
	//log.Printf("[THINK DEBUG] Trap OID extraído: %s", trapOID)

	if trapOID == "" {
		//log.Printf("[THINK ERROR] Trap OID não encontrado no pacote")
		return nil, fmt.Errorf("trap OID não encontrado")
	}

	if h.rfcHandler.CanHandle(trapOID) {
		//log.Printf("[THINK DEBUG] Delegando para handler RFC")
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
	event.Severity = "info"
	event.Message = "ONU mudou de estado de configuração"

	h.extractThinkONUData(packet, event)

	return event, nil
}

func (h *ThinkOltTrapHandler) parseGenericThinkTrap(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "think_generic_trap"
	event.Severity = "info"
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

	fmt.Println(event.OnuChangeEvent)

	h.rfcHandler.ExtractInterfaceData(packet, event)
}

func (h *ThinkOltTrapHandler) contains(haystack, needle string) bool {
	if len(haystack) > 0 && haystack[0] == '.' {
		haystack = haystack[1:]
	}
	if len(needle) > 0 && needle[0] == '.' {
		needle = needle[1:]
	}
	return len(haystack) >= len(needle) && haystack[:len(needle)] == needle
}
