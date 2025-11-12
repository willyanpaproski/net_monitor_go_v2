package handlers

import (
	"fmt"
	"log"
	"net_monitor/interfaces"
	"time"

	"github.com/gosnmp/gosnmp"
)

const (
	THINK_BASE_OID                = "1.3.6.1.4.1.17409"
	THINK_ONU_CONFIG_STATE_CHANGE = "1.3.6.1.4.1.17409.2.2.12.1.2.7.0"
	THINK_ONU_ALARM_OID           = "1.3.6.1.4.1.17409.2.2.12.1.2.6.0"
	THINK_ONU_STATUS_OID          = "1.3.6.1.4.1.17409.2.2.12.1.2.4.0"
	THINK_ONU_INFO_OID            = "1.3.6.1.4.1.17409.2.2.12.1.2.1.0"
	THINK_ONU_DESCRIPTION_OID     = "1.3.6.1.4.1.17409.2.2.12.1.2.3.0"
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
		log.Printf("[THINK DEBUG] Trap OID reconhecida como Think: %s", trapOID)
		return true
	}

	canHandleRFC := h.rfcHandler.CanHandle(trapOID)
	log.Printf("[THINK DEBUG] RFC pode tratar? %v", canHandleRFC)
	return canHandleRFC
}

func (h *ThinkOltTrapHandler) GetSupportedTraps() []string {
	thinkOltTraps := []string{
		THINK_ONU_CONFIG_STATE_CHANGE,
		THINK_ONU_ALARM_OID,
		THINK_ONU_STATUS_OID,
		THINK_ONU_INFO_OID,
		THINK_ONU_DESCRIPTION_OID,
	}
	return append(thinkOltTraps, h.rfcHandler.GetSupportedTraps()...)
}

func (h *ThinkOltTrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	log.Printf("[THINK DEBUG] Iniciando parse da trap para dispositivo %s", device.GetName())

	log.Printf("[THINK DEBUG] Pacote contém %d variáveis:", len(packet.Variables))
	for i, variable := range packet.Variables {
		log.Printf("[THINK DEBUG] Variável %d: OID=%s, Type=%T, Value=%v",
			i, variable.Name, variable.Value, variable.Value)
	}

	trapOID := h.rfcHandler.ExtractTrapOID(packet)
	log.Printf("[THINK DEBUG] Trap OID extraído: %s", trapOID)

	if trapOID == "" {
		log.Printf("[THINK ERROR] Trap OID não encontrado no pacote")
		return nil, fmt.Errorf("trap OID não encontrado")
	}

	if h.rfcHandler.CanHandle(trapOID) {
		log.Printf("[THINK DEBUG] Delegando para handler RFC")
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

	log.Printf("[THINK DEBUG] Processando trap específica do Think: %s", trapOID)

	switch trapOID {
	case THINK_ONU_CONFIG_STATE_CHANGE:
		return h.parseOnuConfigStateChange(packet, event)
	default:
		log.Printf("[THINK WARN] Trap OID Think desconhecida: %s, processando dados genéricos", trapOID)
		return h.parseGenericThinkTrap(packet, event)
	}
}

func (h *ThinkOltTrapHandler) parseOnuConfigStateChange(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	log.Printf("[THINK DEBUG] Parseando ONU Config State Change")

	event.EventType = "onu_config_state_change"
	event.Severity = "info"
	event.Message = "ONU mudou de estado de configuração"

	h.extractThinkONUData(packet, event)

	return event, nil
}

func (h *ThinkOltTrapHandler) parseGenericThinkTrap(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	log.Printf("[THINK DEBUG] Parseando trap Think genérica")

	event.EventType = "think_generic_trap"
	event.Severity = "info"
	event.Message = "Trap Think genérica recebida"

	h.extractThinkONUData(packet, event)

	return event, nil
}

func (h *ThinkOltTrapHandler) extractThinkONUData(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) {
	log.Printf("[THINK DEBUG] Extraindo dados da ONU")

	for _, variable := range packet.Variables {
		oid := variable.Name
		if len(oid) > 0 && oid[0] == '.' {
			oid = oid[1:]
		}

		log.Printf("[THINK DEBUG] Analisando OID: %s", oid)

		if h.contains(oid, THINK_ONU_CONFIG_STATE_CHANGE) {
			event.Data["config_state"] = variable.Value
			log.Printf("[THINK DEBUG] Config State: %v", variable.Value)
		}

		if h.contains(oid, THINK_ONU_ALARM_OID) {
			event.Data["alarm"] = variable.Value
			log.Printf("[THINK DEBUG] Alarm: %v", variable.Value)
		}

		if h.contains(oid, THINK_ONU_STATUS_OID) {
			event.Data["status"] = variable.Value
			log.Printf("[THINK DEBUG] Status: %v", variable.Value)
		}

		if h.contains(oid, THINK_ONU_INFO_OID) {
			if info, ok := variable.Value.([]byte); ok {
				event.Data["info"] = string(info)
				log.Printf("[THINK DEBUG] Info: %s", string(info))
			} else {
				event.Data["info"] = variable.Value
				log.Printf("[THINK DEBUG] Info: %v", variable.Value)
			}
		}

		if h.contains(oid, THINK_ONU_DESCRIPTION_OID) {
			if desc, ok := variable.Value.([]byte); ok {
				event.Data["description"] = string(desc)
				log.Printf("[THINK DEBUG] Description: %s", string(desc))
			} else {
				event.Data["description"] = variable.Value
				log.Printf("[THINK DEBUG] Description: %v", variable.Value)
			}
		}
	}

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
