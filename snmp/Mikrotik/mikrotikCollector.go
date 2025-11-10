package mikrotik

import (
	"fmt"
	"time"

	models "net_monitor/models"
	mikrotiksnmpcollectors "net_monitor/snmp/Mikrotik/MikrotikSnmpCollectors"
	Utils "net_monitor/utils"

	"github.com/gosnmp/gosnmp"
)

type MikrotikCollector struct{}

func NewMikrotikCollector() *MikrotikCollector {
	return &MikrotikCollector{}
}

func (m *MikrotikCollector) GetVendor() string {
	return "mikrotik"
}

func (m *MikrotikCollector) Collect(roteador models.Roteador) (map[string]interface{}, error) {
	snmpParams, err := m.createSNMPParams(roteador)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	data := make(map[string]interface{})

	if cpu, err := mikrotiksnmpcollectors.CollectMikrotikCpuUtilizationPercent(snmpParams, roteador); err == nil {
		data["cpu_usage_percent"] = cpu
	}

	if memory, err := mikrotiksnmpcollectors.CollectMikrotikUsedMemory(snmpParams, roteador); err == nil {
		data["used_memory_mb"] = memory
	}

	if totalMemory, err := mikrotiksnmpcollectors.CollectMikrotikTotalMemory(snmpParams, roteador); err == nil {
		data["total_memory_mb"] = totalMemory
	}

	if diskUsage, err := mikrotiksnmpcollectors.CollectMikrotikUsedHdd(snmpParams, roteador); err == nil {
		data["used_disk_mb"] = diskUsage
	}

	if totalDisk, err := mikrotiksnmpcollectors.CollectMikrotikTotalHdd(snmpParams, roteador); err == nil {
		data["total_disk_mb"] = totalDisk
	}

	if uptime, err := mikrotiksnmpcollectors.CollectMikrotikUptime(snmpParams, roteador); err == nil {
		data["system_uptime"] = uptime
	}

	if physicalInterfaces, err := mikrotiksnmpcollectors.CollectMikrotikPhysicalInterfaces(snmpParams, roteador); err == nil {
		data["physicalInterfaces"] = physicalInterfaces
	}

	return data, nil
}

func (m *MikrotikCollector) CollectMetric(router models.Roteador, metricName string) (interface{}, error) {
	snmpParams, err := m.createSNMPParams(router)
	if err != nil {
		return nil, err
	}
	defer snmpParams.Conn.Close()

	switch metricName {
	case "cpu_usage":
		return mikrotiksnmpcollectors.CollectMikrotikCpuUtilizationPercent(snmpParams, router)
	case "memory_usage":
		return mikrotiksnmpcollectors.CollectMikrotikUsedMemory(snmpParams, router)
	case "disk_usage":
		return mikrotiksnmpcollectors.CollectMikrotikUsedHdd(snmpParams, router)
	case "total_disk":
		return mikrotiksnmpcollectors.CollectMikrotikTotalHdd(snmpParams, router)
	case "total_memory":
		return mikrotiksnmpcollectors.CollectMikrotikTotalMemory(snmpParams, router)
	case "uptime":
		return mikrotiksnmpcollectors.CollectMikrotikUptime(snmpParams, router)
	case "physicalInterfaces":
		return mikrotiksnmpcollectors.CollectMikrotikPhysicalInterfaces(snmpParams, router)
	case "vlans":
		return mikrotiksnmpcollectors.CollectMikrotikVlans(snmpParams, router)
	default:
		return nil, fmt.Errorf("Metric '%s' not supported by Mikrotik collector", metricName)
	}
}

func (m *MikrotikCollector) GetSupportedMetrics() []string {
	return []string{
		"cpu_usage", "memory_usage", "disk_usage", "total_disk",
		"interface_stats", "system_info", "physicalInterfaces",
		"vlans",
	}
}

func (m *MikrotikCollector) GetMetricMapping() map[string]string {
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

func (m *MikrotikCollector) createSNMPParams(router models.Roteador) (*gosnmp.GoSNMP, error) {
	snmpPort, err := Utils.ParseInt(router.SnmpPort)
	if err != nil {
		return nil, err
	}

	params := &gosnmp.GoSNMP{
		Target:    router.IPAddress,
		Port:      uint16(snmpPort),
		Community: router.SnmpCommunity,
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
