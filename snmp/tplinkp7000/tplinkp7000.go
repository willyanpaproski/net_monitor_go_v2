package tplinkp7000

import (
	"fmt"
	"net_monitor/interfaces"
	"net_monitor/snmp/tplinkp7000/tplinkp7000snmpcollectors"
	Utils "net_monitor/utils"
	"time"

	"github.com/gosnmp/gosnmp"
)

type TpLinkP7000Collector struct{}

func NewTpLinkP7000Collector() *TpLinkP7000Collector {
	return &TpLinkP7000Collector{}
}

func (t *TpLinkP7000Collector) GetVendor() string {
	return "tplinkp7000"
}

func (t *TpLinkP7000Collector) Collect(device interfaces.NetworkDevice) (map[string]interface{}, error) {
	snmpParams, err := t.createSNMPParams(device)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	data := make(map[string]interface{})

	if uptime, err := tplinkp7000snmpcollectors.CollectTpLinkP7000Uptime(snmpParams, device); err == nil {
		data["uptime"] = uptime
	}

	if cpu, err := tplinkp7000snmpcollectors.CollectTpLinkP7000CpuUtilizationPercent(snmpParams, device); err == nil {
		data["cpu_usage_percent"] = cpu
	}

	return data, nil
}

func (t *TpLinkP7000Collector) CollectMetric(device interfaces.NetworkDevice, metricName string) (interface{}, error) {
	snmpParams, err := t.createSNMPParams(device)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	switch metricName {
	case "uptime":
		return tplinkp7000snmpcollectors.CollectTpLinkP7000Uptime(snmpParams, device)
	case "cpu_usage":
		return tplinkp7000snmpcollectors.CollectTpLinkP7000CpuUtilizationPercent(snmpParams, device)
	default:
		return nil, fmt.Errorf("Metric '%s' not supported by TpLinkP7000 collector", metricName)
	}
}

func (t *TpLinkP7000Collector) GetSupportedMetrics() []string {
	return []string{
		"cpu_usage", "memory_usage", "disk_usage", "total_disk",
		"interface_stats", "system_info", "physicalInterfaces",
		"vlans",
	}
}

func (t *TpLinkP7000Collector) GetMetricMapping() map[string]string {
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

func (t *TpLinkP7000Collector) createSNMPParams(device interfaces.NetworkDevice) (*gosnmp.GoSNMP, error) {
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
