package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	"net_monitor/services"
	snmp "net_monitor/snmp"
	Utils "net_monitor/utils"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikTotalMemory(goSnmp *gosnmp.GoSNMP, router models.Roteador) (float64, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.2.1.25.2.3.1.5.65536", "totalMemory", services.RouterAdapter{Router: router})
	if err != nil {
		return 0, err
	}

	totalMemoryMB := float64(result) / 1024.0
	return Utils.ChangeFloatPrecision(totalMemoryMB, 1), nil
}
