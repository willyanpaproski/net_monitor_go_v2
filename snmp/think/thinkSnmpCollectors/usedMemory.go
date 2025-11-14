package thinksnmpcollectors

import (
	"net_monitor/interfaces"
	"net_monitor/snmp"
	Utils "net_monitor/utils"

	"github.com/gosnmp/gosnmp"
)

func CollectThinkUsedMemory(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (float64, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.4.1.2011.5.25.31.1.1.1.1.7", "usedMemory", device)
	if err != nil {
		return 0, err
	}

	usedMemoryMB := float64(result) / 1024.0
	return Utils.ChangeFloatPrecision(usedMemoryMB, 1), nil
}
