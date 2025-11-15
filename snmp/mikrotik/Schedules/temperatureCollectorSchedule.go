package mikrotikScheduler

import (
	"net_monitor/interfaces"
	"net_monitor/models"
	"net_monitor/repository"
	"net_monitor/services"
	"net_monitor/snmp/mikrotik"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*TemperatureScheduler)(nil)

type TemperatureScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	Collector  *mikrotik.MikrotikCollector
	StopCh     chan struct{}
}

func NewTemperatureScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
	collector *mikrotik.MikrotikCollector,
) *TemperatureScheduler {
	return &TemperatureScheduler{
		RouterRepo: routerRepo,
		Collector:  collector,
		StopCh:     make(chan struct{}),
	}
}

func (s *TemperatureScheduler) Start() {
	initialTimer := time.NewTimer(10 * time.Minute)
	select {
	case <-initialTimer.C:
		s.collectAllTemperatureUsage()
	case <-s.StopCh:
		initialTimer.Stop()
		return
	}
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.collectAllTemperatureUsage()
		case <-s.StopCh:
			return
		}
	}
}

func (s *TemperatureScheduler) Stop() {
	close(s.StopCh)
}

func (s *TemperatureScheduler) collectAllTemperatureUsage() {
	routers, err := s.RouterRepo.GetByFilter(bson.M{
		"integration": models.RoteadorMikrotik,
		"active":      true,
	})
	if err != nil {
		return
	}
	if len(routers) == 0 {
		return
	}
	for _, router := range routers {
		routerDevice := services.RouterAdapter{Router: router}
		go s.collectTemperature(routerDevice)
	}
}

func (s *TemperatureScheduler) collectTemperature(device interfaces.NetworkDevice) {
	temperature, err := s.Collector.CollectMetric(device, "temperature")
	if err != nil {
		return
	}
	temperatureValue, ok := temperature.(float64)
	if !ok {
		return
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.TemperatureRecord{
		Timestamp: now,
		Value:     temperatureValue,
	}
	update := bson.M{
		"$push": bson.M{
			"temperatureToday": newRecord,
		},
	}
	err = s.RouterRepo.UpdateByFilter(
		bson.M{"_id": device.GetID()},
		update,
	)
	if err != nil {
		return
	}
}
