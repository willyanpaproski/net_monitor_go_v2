package interfaces

type SNMPCollector interface {
	Collect(device NetworkDevice) (map[string]interface{}, error)
	GetVendor() string
}

type ExtendedSNMPCollector interface {
	SNMPCollector
	CollectMetric(device NetworkDevice, metricName string) (interface{}, error)
	GetSupportedMetrics() []string
	GetMetricMapping() map[string]string
}
