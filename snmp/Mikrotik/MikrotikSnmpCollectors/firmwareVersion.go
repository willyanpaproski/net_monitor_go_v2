package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikFirmwareVersion(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.4.1.14988.1.1.4.4.0", "firmWareVersion", router)
	if err != nil {
		return "", err
	}

	return result, nil
}
