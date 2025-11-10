package interfaces

import (
	models "net_monitor/models"
)

type SNMPCollector interface {
	Collect(router models.Roteador) (map[string]interface{}, error)
	GetVendor() string
}

type ExtendedSNMPCollector interface {
	SNMPCollector
	CollectMetric(router models.Roteador, metricName string) (interface{}, error)
	GetSupportedMetrics() []string
	GetMetricMapping() map[string]string
}
