package thinkolt

import (
	"fmt"
	"net_monitor/models"
	thinkoltsnmpcollectors "net_monitor/snmp/thinkOlt/thinkOltSnmpCollectors"
	Utils "net_monitor/utils"
	"time"

	"github.com/gosnmp/gosnmp"
)

type ThinkOltCollector struct{}

func NewThinkOltCollector() *ThinkOltCollector {
	return &ThinkOltCollector{}
}

func (t *ThinkOltCollector) GetVendor() string {
	return "think"
}

func (t *ThinkOltCollector) Collect(transmitter models.TransmissorFibra) (map[string]interface{}, error) {
	snmpParams, err := t.createSNMPParams(transmitter)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	data := make(map[string]interface{})

	if uptime, err := thinkoltsnmpcollectors.CollectThinkOltUptime(snmpParams, transmitter); err == nil {
		data["system_uptime"] = uptime
	}

	return data, nil
}

func (t *ThinkOltCollector) CollectMetric(transmitter models.TransmissorFibra, metricName string) (interface{}, error) {
	snmpParams, err := t.createSNMPParams(transmitter)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	switch metricName {
	case "uptime":
		return thinkoltsnmpcollectors.CollectThinkOltUptime(snmpParams, transmitter)
	default:
		return nil, fmt.Errorf("Metric '%s' not supported by ThinkOlt collector", metricName)
	}
}

func (t *ThinkOltCollector) GetSupportedMetrics() []string {
	return []string{
		"cpu_usage", "memory_usage", "disk_usage", "total_disk",
		"interface_stats", "system_info", "physicalInterfaces",
		"vlans",
	}
}

func (t *ThinkOltCollector) GetMetricMapping() map[string]string {
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

func (t *ThinkOltCollector) createSNMPParams(transmitter models.TransmissorFibra) (*gosnmp.GoSNMP, error) {
	snmpPort, err := Utils.ParseInt(transmitter.SnmpPort)
	if err != nil {
		return nil, err
	}

	params := &gosnmp.GoSNMP{
		Target:    transmitter.IPAddress,
		Port:      uint16(snmpPort),
		Community: transmitter.SnmpCommunity,
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
