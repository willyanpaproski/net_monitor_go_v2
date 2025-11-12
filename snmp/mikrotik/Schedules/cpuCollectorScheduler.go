package mikrotikScheduler

import (
	interfaces "net_monitor/interfaces"
	models "net_monitor/models"
	repository "net_monitor/repository"
	mikrotik "net_monitor/snmp/mikrotik"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*CPUScheduler)(nil)

type CPUScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	Collector  *mikrotik.MikrotikCollector
	StopCh     chan struct{}
}

func NewCPUScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
	collector *mikrotik.MikrotikCollector,
) *CPUScheduler {
	return &CPUScheduler{
		RouterRepo: routerRepo,
		Collector:  collector,
		StopCh:     make(chan struct{}),
	}
}

func (s *CPUScheduler) Start() {
	initialTimer := time.NewTimer(10 * time.Minute)
	select {
	case <-initialTimer.C:
		s.collectAllCpuUsage()
	case <-s.StopCh:
		initialTimer.Stop()
		return
	}
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.collectAllCpuUsage()
		case <-s.StopCh:
			return
		}
	}
}

func (s *CPUScheduler) Stop() {
	close(s.StopCh)
}

func (s *CPUScheduler) collectAllCpuUsage() {
	routers, err := s.RouterRepo.GetByFilter(bson.M{
		"integration": models.RoteadorMikrotik,
		"active":      true,
	})
	if err != nil {
		return
	}
	if routers == nil || len(routers) == 0 {
		return
	}
	for _, router := range routers {
		go s.collectCpuUsage(router)
	}
}

func (s *CPUScheduler) collectCpuUsage(router models.Roteador) {
	cpuUsage, err := s.Collector.CollectMetric(router, "cpu_usage")
	if err != nil {
		return
	}
	cpuUsageValue, ok := cpuUsage.(int)
	if !ok {
		return
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.CpuRecord{
		Timestamp: now,
		Value:     cpuUsageValue,
	}
	update := bson.M{
		"$push": bson.M{
			"cpuUsageToday": newRecord,
		},
	}
	err = s.RouterRepo.UpdateByFilter(
		bson.M{"_id": router.ID},
		update,
	)
	if err != nil {
		return
	}
}
