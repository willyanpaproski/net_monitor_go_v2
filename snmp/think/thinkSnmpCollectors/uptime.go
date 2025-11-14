package thinksnmpcollectors

import (
	"net_monitor/interfaces"
	"net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectThinkUptime(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (string, error) {
	result, err := snmp.GetTimeTicksOid(goSnmp, "1.3.6.1.2.1.1.3.0", "uptime", device)

	if err != nil {
		return "", err
	}

	return result, nil
}
