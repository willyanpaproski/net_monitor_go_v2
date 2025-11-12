package thinkoltsnmpcollectors

import (
	"net_monitor/models"
	"net_monitor/services"
	"net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectThinkOltUptime(goSnmp *gosnmp.GoSNMP, transmitter models.TransmissorFibra) (string, error) {
	result, err := snmp.GetTimeTicksOid(goSnmp, "1.3.6.1.2.1.1.3.0", "uptime", services.OLTAdapter{OLT: transmitter})

	if err != nil {
		return "", err
	}

	return result, nil
}
