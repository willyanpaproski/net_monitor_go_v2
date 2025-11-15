package tplinkp7000snmpcollectors

import (
	"net_monitor/interfaces"
	"net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectTpLinkP7000MemoryUsagePercent(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (int, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.4.1.11863.6.4.1.2.1.1.2.1", "memory_usage_percent", device)

	if err != nil {
		return 0, err
	}

	return result, nil
}
