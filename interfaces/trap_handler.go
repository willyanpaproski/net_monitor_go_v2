package interfaces

import (
	"time"

	"github.com/gosnmp/gosnmp"
)

type ONUChangeConfigEvent struct {
	SerialNumber string `json:"serialNumber"`
	OnuStatus    string `json:"onuStatus"`
}

type TrapEvent struct {
	DeviceID       string                 `json:"device_id"`
	DeviceName     string                 `json:"device_name"`
	DeviceIP       string                 `json:"device_ip"`
	DeviceType     string                 `json:"device_type"`
	Vendor         string                 `json:"vendor"`
	TrapOID        string                 `json:"trap_oid"`
	EventType      string                 `json:"event_type"`
	Message        string                 `json:"message"`
	Data           map[string]interface{} `json:"data"`
	OnuChangeEvent ONUChangeConfigEvent   `json:"onuChangeEvent"`
	Timestamp      time.Time              `json:"timestamp"`
}

type TrapHandler interface {
	GetVendor() string
	CanHandle(trapOID string) bool
	ParseTrap(packet *gosnmp.SnmpPacket, device NetworkDevice, deviceType string) (*TrapEvent, error)
}
