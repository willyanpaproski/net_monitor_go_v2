package mikrotiksnmpcollectors

import (
	models "net_monitor/models"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikSoftwareId(goSnmp *gosnmp.GoSNMP, router models.Roteador) (string, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.4.1.14988.1.1.4.1.0", "softwareId", router)
	if err != nil {
		return "", err
	}

	return result, nil
}
