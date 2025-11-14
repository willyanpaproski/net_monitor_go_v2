package config

import "time"

type MetricConfig struct {
	Name         string        `json:"name"`
	Interval     time.Duration `json:"interval"`
	DataKey      string        `json:"data_key"`
	FallbackKeys []string      `json:"fallback_keys"`
	Required     bool          `json:"required"`
}

var VendorMetricMappings = map[string][]MetricConfig{
	"mikrotik": {
		{
			Name:         "cpu_usage",
			Interval:     5 * time.Second,
			DataKey:      "cpu_usage_percent",
			FallbackKeys: []string{"cpu", "processor_usage"},
			Required:     true,
		},
		{
			Name:         "memory_usage",
			Interval:     5 * time.Second,
			DataKey:      "used_memory_mb",
			FallbackKeys: []string{"memory", "mem_used", "memory_used"},
			Required:     true,
		},
		{
			Name:         "total_memory",
			Interval:     120 * time.Second,
			DataKey:      "total_memory_mb",
			FallbackKeys: []string{"total_memory", "total_mem"},
			Required:     true,
		},
		{
			Name:         "disk_usage",
			Interval:     5 * time.Second,
			DataKey:      "used_disk_mb",
			FallbackKeys: []string{"disk", "disk_used"},
			Required:     true,
		},
		{
			Name:         "total_disk",
			Interval:     120 * time.Second,
			DataKey:      "total_disk_mb",
			FallbackKeys: []string{"total_disk"},
			Required:     true,
		},
		{
			Name:         "uptime",
			Interval:     10 * time.Second,
			DataKey:      "system_uptime",
			FallbackKeys: []string{"system_uptime"},
			Required:     true,
		},
		{
			Name:         "physicalInterfaces",
			Interval:     30 * time.Second,
			DataKey:      "physicalInterfaces",
			FallbackKeys: []string{"physicalInterfaces"},
			Required:     true,
		},
		{
			Name:         "vlans",
			Interval:     30 * time.Second,
			DataKey:      "vlans",
			FallbackKeys: []string{"vlans"},
			Required:     true,
		},
	},
	"think": {
		{
			Name:         "uptime",
			Interval:     10 * time.Second,
			DataKey:      "system_uptime",
			FallbackKeys: []string{"system_uptime"},
			Required:     true,
		},
		{
			Name:         "memory_usage",
			Interval:     5 * time.Second,
			DataKey:      "used_memory_mb",
			FallbackKeys: []string{"memory", "mem_used", "memory_used"},
			Required:     true,
		},
	},
	"cisco": {
		{
			Name:         "cpu_usage",
			Interval:     3 * time.Second,
			DataKey:      "cpu_utilization",
			FallbackKeys: []string{"cpu_usage_percent", "cpu", "processor_load"},
			Required:     true,
		},
		{
			Name:         "memory_usage",
			Interval:     8 * time.Second,
			DataKey:      "memory_utilized",
			FallbackKeys: []string{"used_memory_mb", "memory_used", "mem_usage"},
			Required:     true,
		},
		{
			Name:         "uptime",
			Interval:     45 * time.Second,
			DataKey:      "system_uptime",
			FallbackKeys: []string{"uptime_seconds", "uptime"},
			Required:     false,
		},
		{
			Name:         "interface_stats",
			Interval:     10 * time.Second,
			DataKey:      "port_statistics",
			FallbackKeys: []string{"interfaces", "interface_data"},
			Required:     false,
		},
	},
	"juniper": {
		{
			Name:         "cpu_usage",
			Interval:     7 * time.Second,
			DataKey:      "routing_engine_cpu",
			FallbackKeys: []string{"cpu_usage_percent", "cpu_utilization"},
			Required:     true,
		},
		{
			Name:         "memory_usage",
			Interval:     12 * time.Second,
			DataKey:      "routing_engine_memory",
			FallbackKeys: []string{"used_memory_mb", "memory_usage"},
			Required:     true,
		},
	},
}

var DefaultMetricMappings = []MetricConfig{
	{
		Name:         "cpu_usage",
		Interval:     10 * time.Second,
		DataKey:      "cpu_usage_percent",
		FallbackKeys: []string{"cpu", "processor_usage", "cpu_utilization"},
		Required:     true,
	},
	{
		Name:         "memory_usage",
		Interval:     15 * time.Second,
		DataKey:      "used_memory_mb",
		FallbackKeys: []string{"memory", "memory_used", "mem_usage"},
		Required:     true,
	},
	{
		Name:         "uptime",
		Interval:     60 * time.Second,
		DataKey:      "uptime_seconds",
		FallbackKeys: []string{"uptime", "system_uptime"},
		Required:     false,
	},
}
