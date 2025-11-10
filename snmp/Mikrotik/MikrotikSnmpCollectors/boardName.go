package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikBoardName(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.4.1.14988.1.1.7.9.0", "boardName", router)
	if err != nil {
		return "", err
	}

	return result, nil
}
