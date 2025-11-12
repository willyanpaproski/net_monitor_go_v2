package mikrotiksnmpcollectors

import (
	"log"
	models "net_monitor/models"
	"net_monitor/services"
	snmp "net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectMikrotikCpuUtilizationPercent(goSnmp *gosnmp.GoSNMP, router models.Roteador) (int, error) {
	result, err := snmp.GetIntOid(goSnmp, "1.3.6.1.2.1.25.3.3.1.2.1", "cpuUtilizationPercent", services.RouterAdapter{Router: router})
	if err != nil {
		log.Printf("Erro ao coletar o uso de cpu via snmp %v", err)
		return 0, err
	}

	return result, nil
}
