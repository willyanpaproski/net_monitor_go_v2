package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	"net_monitor/services"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikBoardName(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.4.1.14988.1.1.7.9.0", "boardName", services.RouterAdapter{Router: router})
	if err != nil {
		return "", err
	}

	return result, nil
}
