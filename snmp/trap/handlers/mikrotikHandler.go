package handlers

import (
	"fmt"
	"net_monitor/interfaces"
	"time"

	"github.com/gosnmp/gosnmp"
)

const (
	MIKROTIK_BASE_OID       = "1.3.6.1.4.1.14988"
	MIKROTIK_LINK_UP        = "1.3.6.1.4.1.14988.1.1.1.2.1"
	MIKROTIK_LINK_DOWN      = "1.3.6.1.4.1.14988.1.1.1.2.2"
	MIKROTIK_HIGH_CPU       = "1.3.6.1.4.1.14988.1.1.3.1"
	MIKROTIK_HIGH_MEMORY    = "1.3.6.1.4.1.14988.1.1.3.2"
	MIKROTIK_DISK_FULL      = "1.3.6.1.4.1.14988.1.1.3.3"
	MIKROTIK_LICENSE_EXPIRE = "1.3.6.1.4.1.14988.1.1.3.4"
)

type MikrotikTrapHandler struct {
	rfcHandler *RFCTrapHandler
}

func NewMikrotikTrapHandler() *MikrotikTrapHandler {
	return &MikrotikTrapHandler{
		rfcHandler: NewRFCTrapHandler(),
	}
}

func (h *MikrotikTrapHandler) GetVendor() string {
	return "mikrotik"
}

func (h *MikrotikTrapHandler) CanHandle(trapOID string) bool {
	if h.contains(trapOID, MIKROTIK_BASE_OID) {
		return true
	}
	return h.rfcHandler.CanHandle(trapOID)
}

func (h *MikrotikTrapHandler) GetSupportedTraps() []string {
	mikrotikTraps := []string{
		MIKROTIK_LINK_UP,
		MIKROTIK_LINK_DOWN,
		MIKROTIK_HIGH_CPU,
		MIKROTIK_HIGH_MEMORY,
		MIKROTIK_DISK_FULL,
		MIKROTIK_LICENSE_EXPIRE,
	}
	return append(mikrotikTraps, h.rfcHandler.GetSupportedTraps()...)
}

func (h *MikrotikTrapHandler) ParseTrap(packet *gosnmp.SnmpPacket, device interfaces.NetworkDevice, deviceType string) (*interfaces.TrapEvent, error) {
	trapOID := h.extractTrapOID(packet)
	if trapOID == "" {
		return nil, fmt.Errorf("Trap OID not found")
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

	switch trapOID {
	case MIKROTIK_LINK_UP:
		return h.parseMikrotikLinkUp(packet, event)
	case MIKROTIK_LINK_DOWN:
		return h.parseMikrotikLinkDown(packet, event)
	case MIKROTIK_HIGH_CPU:
		return h.parseHighCPU(packet, event)
	case MIKROTIK_HIGH_MEMORY:
		return h.parseHighMemory(packet, event)
	case MIKROTIK_DISK_FULL:
		return h.parseDiskFull(packet, event)
	case MIKROTIK_LICENSE_EXPIRE:
		return h.parseLicenseExpire(packet, event)
	default:
		return nil, fmt.Errorf("Mikrotik trap not supported: %s", trapOID)
	}
}

func (h *MikrotikTrapHandler) parseMikrotikLinkUp(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "mikrotik_link_up"
	event.Severity = "info"
	event.Message = "Mikrotik interface UP"

	h.extractMikrotikInterfaceData(packet, event)

	return event, nil
}

func (h *MikrotikTrapHandler) parseMikrotikLinkDown(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "mikrotik_link_down"
	event.Severity = "warning"
	event.Message = "Mikrotik interface DOWN"

	h.extractMikrotikInterfaceData(packet, event)

	return event, nil
}

func (h *MikrotikTrapHandler) parseHighCPU(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "high_cpu"
	event.Severity = "warning"
	event.Message = "Mikrotik high CPU usage detected"

	for _, variable := range packet.Variables {
		if h.contains(variable.Name, "1.3.6.1.4.1.14988.1.1.3.1.1") {
			if cpu, ok := variable.Value.(int); ok {
				event.Data["cpu_usage"] = cpu
				event.Message = fmt.Sprintf("High CPU usage: %d%%", cpu)
			}
		}
	}

	return event, nil
}

func (h *MikrotikTrapHandler) parseHighMemory(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "high_memory"
	event.Severity = "warning"
	event.Message = "Mikrotik high memory usage detected"

	for _, variable := range packet.Variables {
		if h.contains(variable.Name, "1.3.6.1.4.1.14988.1.1.3.2.1") {
			if mem, ok := variable.Value.(int); ok {
				event.Data["memory_usage"] = mem
				event.Message = fmt.Sprintf("High memory usage: %d%%", mem)
			}
		}
	}

	return event, nil
}

func (h *MikrotikTrapHandler) parseDiskFull(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "disk_full"
	event.Severity = "critical"
	event.Message = "Mikrotik disk full"

	for _, variable := range packet.Variables {
		if h.contains(variable.Name, "1.3.6.1.4.1.14988.1.1.3.3.1") {
			if disk, ok := variable.Value.(int); ok {
				event.Data["disk_usage"] = disk
				event.Message = fmt.Sprintf("Disk full: %d%%", disk)
			}
		}
	}

	return event, nil
}

func (h *MikrotikTrapHandler) parseLicenseExpire(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) (*interfaces.TrapEvent, error) {
	event.EventType = "license_expire"
	event.Severity = "warning"
	event.Message = "Licença próxima do vencimento"

	for _, variable := range packet.Variables {
		if h.contains(variable.Name, "1.3.6.1.4.1.14988.1.1.3.4.1") {
			if days, ok := variable.Value.(int); ok {
				event.Data["days_to_expire"] = days
				event.Message = fmt.Sprintf("Licença expira em %d dias", days)
			}
		}
	}

	return event, nil
}

func (h *MikrotikTrapHandler) extractMikrotikInterfaceData(packet *gosnmp.SnmpPacket, event *interfaces.TrapEvent) {
	for _, variable := range packet.Variables {
		oid := variable.Name

		if h.contains(oid, "1.3.6.1.4.1.14988.1.1.1.2.1.1") {
			if name, ok := variable.Value.([]byte); ok {
				event.Data["interface_name"] = string(name)
			} else if name, ok := variable.Value.(string); ok {
				event.Data["interface_name"] = name
			}
		}

		if h.contains(oid, "1.3.6.1.4.1.14988.1.1.1.2.1.2") {
			if speed, ok := variable.Value.(int); ok {
				event.Data["interface_speed"] = speed
			}
		}
	}
}

func (h *MikrotikTrapHandler) extractTrapOID(packet *gosnmp.SnmpPacket) string {
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

func (h *MikrotikTrapHandler) contains(haystack, needle string) bool {
	if len(haystack) > 0 && haystack[0] == '.' {
		haystack = haystack[1:]
	}
	if len(needle) > 0 && needle[0] == '.' {
		needle = needle[1:]
	}
	return len(haystack) >= len(needle) && haystack[:len(needle)] == needle
}
