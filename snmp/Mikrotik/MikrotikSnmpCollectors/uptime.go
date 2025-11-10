package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikUptime(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetTimeTicksOid(goSnmp, "1.3.6.1.2.1.1.3.0", "uptime", router)

	if err != nil {
		return "", err
	}

	return result, nil
}
