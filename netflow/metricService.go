package netflow

import (
	models "net_monitor/models"

	"go.mongodb.org/mongo-driver/mongo"
)

type MetricProcessor interface {
	Process(router *models.Roteador, decoded *DecodedIPFIXMessage) error
	Name() string
}

type MetricContext struct {
	DB         *mongo.Database
	RouterRepo interface{}
}

var (
	metricProcessors []MetricProcessor
	globalContext    *MetricContext
)

func InitializeMetrics(db *mongo.Database, routerRepo interface{}) {
	globalContext = &MetricContext{
		DB:         db,
		RouterRepo: routerRepo,
	}
}

func RegisterMetricProcessor(processor MetricProcessor) {
	metricProcessors = append(metricProcessors, processor)
}

func GetMetricProcessors() []MetricProcessor {
	return metricProcessors
}

func GetMetricContext() *MetricContext {
	return globalContext
}
