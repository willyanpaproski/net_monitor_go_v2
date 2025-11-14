package think

import (
	"fmt"
	"net_monitor/interfaces"
	thinkoltsnmpcollectors "net_monitor/snmp/think/thinkSnmpCollectors"
	Utils "net_monitor/utils"
	"time"

	"github.com/gosnmp/gosnmp"
)

type ThinkCollector struct{}

func NewThinkCollector() *ThinkCollector {
	return &ThinkCollector{}
}

func (t *ThinkCollector) GetVendor() string {
	return "think"
}

func (t *ThinkCollector) Collect(device interfaces.NetworkDevice) (map[string]interface{}, error) {
	snmpParams, err := t.createSNMPParams(device)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	data := make(map[string]interface{})

	if uptime, err := thinkoltsnmpcollectors.CollectThinkUptime(snmpParams, device); err == nil {
		data["system_uptime"] = uptime
	}

	if usedMemory, err := thinkoltsnmpcollectors.CollectThinkUsedMemory(snmpParams, device); err == nil {
		data["used_memory_mb"] = usedMemory
	}

	return data, nil
}

func (t *ThinkCollector) CollectMetric(device interfaces.NetworkDevice, metricName string) (interface{}, error) {
	snmpParams, err := t.createSNMPParams(device)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	switch metricName {
	case "uptime":
		return thinkoltsnmpcollectors.CollectThinkUptime(snmpParams, device)
	case "memory_usage":
		return thinkoltsnmpcollectors.CollectThinkUsedMemory(snmpParams, device)
	default:
		return nil, fmt.Errorf("Metric '%s' not supported by ThinkOlt collector", metricName)
	}
}

func (t *ThinkCollector) GetSupportedMetrics() []string {
	return []string{
		"cpu_usage", "memory_usage", "disk_usage", "total_disk",
		"interface_stats", "system_info", "physicalInterfaces",
		"vlans",
	}
}

func (t *ThinkCollector) GetMetricMapping() map[string]string {
	return map[string]string{
		"cpu_usage":          "cpu_usage_percent",
		"memory_usage":       "used_memory_mb",
		"total_memory":       "total_memory_mb",
		"disk_usage":         "used_disk_mb",
		"total_disk":         "total_disk",
		"physicalInterfaces": "physicalInterfaces",
		"vlans":              "vlans",
	}
}

func (t *ThinkCollector) createSNMPParams(device interfaces.NetworkDevice) (*gosnmp.GoSNMP, error) {
	snmpPort, err := Utils.ParseInt(device.GetSnmpPort())
	if err != nil {
		return nil, err
	}

	params := &gosnmp.GoSNMP{
		Target:    device.GetIPAddress(),
		Port:      uint16(snmpPort),
		Community: device.GetSnmpCommunity(),
		Version:   gosnmp.Version2c,
		Timeout:   2 * time.Second,
		Retries:   1,
	}

	err = params.Connect()
	if err != nil {
		return nil, err
	}

	return params, nil
}
