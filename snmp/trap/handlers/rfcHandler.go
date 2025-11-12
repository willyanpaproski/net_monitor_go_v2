package handlers

import (
	"fmt"
	"time"

	"net_monitor/interfaces"

	"github.com/gosnmp/gosnmp"
)

const (
	OID_LINK_DOWN       = "1.3.6.1.6.3.1.1.5.3"
	OID_LINK_UP         = "1.3.6.1.6.3.1.1.5.4"
	OID_COLD_START      = "1.3.6.1.6.3.1.1.5.1"
	OID_WARM_START      = "1.3.6.1.6.3.1.1.5.2"
	OID_AUTH_FAILURE    = "1.3.6.1.6.3.1.1.5.5"
	OID_SNMP_TRAP_OID   = "1.3.6.1.6.3.1.1.4.1.0"
	OID_IF_INDEX        = "1.3.6.1.2.1.2.2.1.1"
	OID_IF_DESCR        = "1.3.6.1.2.1.2.2.1.2"
	OID_IF_ADMIN_STATUS = "1.3.6.1.2.1.2.2.1.7"
	OID_IF_OPER_STATUS  = "1.3.6.1.2.1.2.2.1.8"
)

type RFCTrapHandler struct{}

func NewRFCTrapHandler() *RFCTrapHandler {
	return &RFCTrapHandler{}
}

func (h *RFCTrapHandler) GetVendor() string {
	return "rfc"
}

func (h *RFCTrapHandler) CanHandle(trapOID string) bool {
	standardTraps := map[string]bool{
		OID_LINK_DOWN:    true,
		OID_LINK_UP:      true,
		OID_COLD_START:   true,
		OID_WARM_START:   true,
		OID_AUTH_FAILURE: true,
	}
	return standardTraps[trapOID]
}

func (h *RFCTrapHandler) GetSupportedTraps() []string {
	return []string{
		OID_LINK_DOWN,
		OID_LINK_UP,
		OID_COLD_START,
		OID_WARM_START,
		OID_AUTH_FAILURE,
	}
}

func (h *RFCTrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	event := &interfaces.TrapEvent{
		DeviceID:   device.GetID(),
		DeviceName: device.GetName(),
		DeviceIP:   device.GetIPAddress(),
		DeviceType: deviceType,
		Vendor:     device.GetIntegration(),
		Timestamp:  time.Now(),
		Data:       make(map[string]interface{}),
	}

	trapOID := h.ExtractTrapOID(packet)
	if trapOID == "" {
		return nil, fmt.Errorf("trap OID não encontrado no pacote")
	}

	event.TrapOID = trapOID

	switch trapOID {
	case OID_LINK_DOWN:
		return h.parseLinkDown(packet, event)
	case OID_LINK_UP:
		return h.parseLinkUp(packet, event)
	case OID_COLD_START:
		return h.parseColdStart(packet, event)
	case OID_WARM_START:
		return h.parseWarmStart(packet, event)
	case OID_AUTH_FAILURE:
		return h.parseAuthFailure(packet, event)
	default:
		return nil, fmt.Errorf("trap OID RFC não suportado: %s", trapOID)
	}
}

func (h *RFCTrapHandler) ExtractTrapOID(packet *gosnmp.SnmpPacket) string {
	for _, variable := range packet.Variables {
		oid := variable.Name
		if len(oid) > 0 && oid[0] == '.' {
			oid = oid[1:]
		}

		if oid == "1.3.6.1.6.3.1.1.4.1.0" {
			trapOID := fmt.Sprintf("%v", variable.Value)
			if len(trapOID) > 0 && trapOID[0] == '.' {
				trapOID = trapOID[1:]
			}
			return trapOID
		}
	}
	return ""
}

func (h *RFCTrapHandler) parseLinkDown(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "link_down"
	event.Severity = "warning"
	event.Message = "Link de interface está DOWN"

	h.ExtractInterfaceData(packet, event)

	return event, nil
}

func (h *RFCTrapHandler) parseLinkUp(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "link_up"
	event.Severity = "info"
	event.Message = "Link de interface está UP"

	h.ExtractInterfaceData(packet, event)

	return event, nil
}

func (h *RFCTrapHandler) parseColdStart(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "cold_start"
	event.Severity = "critical"
	event.Message = "Dispositivo reiniciado (cold start)"

	return event, nil
}

func (h *RFCTrapHandler) parseWarmStart(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "warm_start"
	event.Severity = "warning"
	event.Message = "Dispositivo reiniciado (warm start)"

	return event, nil
}

func (h *RFCTrapHandler) parseAuthFailure(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "auth_failure"
	event.Severity = "critical"
	event.Message = "Falha de autenticação SNMP detectada"

	return event, nil
}

func (h *RFCTrapHandler) ExtractInterfaceData(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) {
	for _, variable := range packet.Variables {
		oid := variable.Name

		if h.contains(oid, OID_IF_INDEX) {
			if idx, ok := variable.Value.(int); ok {
				event.Data["interface_index"] = idx
			}
		}

		if h.contains(oid, OID_IF_DESCR) {
			if desc, ok := variable.Value.([]byte); ok {
				event.Data["interface_name"] = string(desc)
			} else if desc, ok := variable.Value.(string); ok {
				event.Data["interface_name"] = desc
			}
		}

		if h.contains(oid, OID_IF_ADMIN_STATUS) {
			if status, ok := variable.Value.(int); ok {
				event.Data["admin_status"] = status
			}
		}

		if h.contains(oid, OID_IF_OPER_STATUS) {
			if status, ok := variable.Value.(int); ok {
				event.Data["oper_status"] = status
			}
		}
	}
}

func (h *RFCTrapHandler) contains(haystack, needle string) bool {
	if len(haystack) > 0 && haystack[0] == '.' {
		haystack = haystack[1:]
	}
	if len(needle) > 0 && needle[0] == '.' {
		needle = needle[1:]
	}
	return len(haystack) >= len(needle) && haystack[:len(needle)] == needle
}
