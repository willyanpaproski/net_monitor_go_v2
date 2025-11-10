package mikrotikScheduler

import (
	"time"

	models "net_monitor/models"
	repository "net_monitor/repository"
	mikrotik "net_monitor/snmp/Mikrotik"
	"net_monitor/interfaces"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*MemoryScheduler)(nil)

type MemoryScheduler struct {
	RoteadorRepo *repository.MongoRepository[models.Roteador]
	Collector    *mikrotik.MikrotikCollector
	StopCh       chan struct{}
}

func NewMemoryScheduler(
	roteadorRepo *repository.MongoRepository[models.Roteador],
	collector *mikrotik.MikrotikCollector,
) *MemoryScheduler {
	return &MemoryScheduler{
		RoteadorRepo: roteadorRepo,
		Collector:    collector,
		StopCh:       make(chan struct{}),
	}
}

func (s *MemoryScheduler) Start() {
	initialTimer := time.NewTimer(10 * time.Minute)
	select {
	case <-initialTimer.C:
		s.collectAllMemoryUsage()
	case <-s.StopCh:
		initialTimer.Stop()
		return
	}
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.collectAllMemoryUsage()
		case <-s.StopCh:
			return
		}
	}
}

func (s *MemoryScheduler) Stop() {
	close(s.StopCh)
}

func (s *MemoryScheduler) collectAllMemoryUsage() {
	routers, err := s.RoteadorRepo.GetByFilter(bson.M{
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
		go s.collectRouterMemory(router)
	}
}

func (s *MemoryScheduler) collectRouterMemory(router models.Roteador) {
	memoryUsage, err := s.Collector.CollectMetric(router, "memory_usage")
	if err != nil {
		return
	}
	memoryValue, ok := memoryUsage.(float64)
	if !ok {
		return
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.MemoryRecord{
		Timestamp: now,
		Value:     memoryValue,
	}
	update := bson.M{
		"$push": bson.M{
			"memoryUsageToday": newRecord,
		},
	}
	err = s.RoteadorRepo.UpdateByFilter(
		bson.M{"_id": router.ID},
		update,
	)
	if err != nil {
		return
	}
}
