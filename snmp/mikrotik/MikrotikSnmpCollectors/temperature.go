package mikrotiksnmpcollectors

import (
	"net_monitor/interfaces"
	"net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikTemperature(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (float64, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.4.1.14988.1.1.3.10.0", "temperature", device)

	if err != nil {
		return 0.0, err
	}

	return float64(result) / 10, nil
}
