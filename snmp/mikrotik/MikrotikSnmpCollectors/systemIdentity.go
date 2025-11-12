package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	"net_monitor/services"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikSistemIdentity(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.2.1.1.5.0", "systemIdentity", services.RouterAdapter{Router: router})
	if err != nil {
		return "", err
	}

	return result, nil
}
