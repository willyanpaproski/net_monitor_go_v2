package tplinkp7000snmpcollectors

import (
	"net_monitor/interfaces"
	"net_monitor/snmp"
	"strconv"
	"strings"

	"github.com/gosnmp/gosnmp"
)

func CollectTpLinkP7000Temperature(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) (float64, error) {
	result, err := snmp.GetStringOid(goSnmp, "1.3.6.1.4.1.11863.6.4.1.3.1.1.2.1", "temperature", device)
	if err != nil {
		return 0.0, err
	}

	temperature, err := strconv.ParseFloat(strings.ReplaceAll(strings.ReplaceAll(result, " ", ""), "\r\n", ""), 64)

	if err != nil {
		return 0.0, nil
	}

	return temperature, nil
}
