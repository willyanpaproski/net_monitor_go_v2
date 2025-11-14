package mikrotiksnmpcollectors

import (
	"net_monitor/interfaces"
	snmp "net_monitor/snmp"
	Utils "net_monitor/utils"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikUsedMemory(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (float64, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.2.1.25.2.3.1.6.65536", "usedMemory", device)
	if err != nil {
		return 0, err
	}

	usedMemoryMB := float64(result) / 1024.0
	return Utils.ChangeFloatPrecision(usedMemoryMB, 1), nil
}
