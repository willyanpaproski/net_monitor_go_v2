package mikrotikScheduler

import (
	"net_monitor/interfaces"
	models "net_monitor/models"
	repository "net_monitor/repository"
	mikrotik "net_monitor/snmp/mikrotik"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*DiskScheduler)(nil)

type DiskScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	Collector  *mikrotik.MikrotikCollector
	StopCh     chan struct{}
}

func NewDiskScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
	collector *mikrotik.MikrotikCollector,
) *DiskScheduler {
	return &DiskScheduler{
		RouterRepo: routerRepo,
		Collector:  collector,
		StopCh:     make(chan struct{}),
	}
}

func (s *DiskScheduler) Start() {
	initialTimer := time.NewTimer(10 * time.Minute)
	select {
	case <-initialTimer.C:
		s.CollectAllDiskUsage()
	case <-s.StopCh:
		initialTimer.Stop()
		return
	}
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.CollectAllDiskUsage()
		case <-s.StopCh:
			return
		}
	}
}

func (s *DiskScheduler) Stop() {
	close(s.StopCh)
}

func (s *DiskScheduler) CollectAllDiskUsage() {
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
		go s.CollectDiskUsage(router)
	}
}

func (s *DiskScheduler) CollectDiskUsage(router models.Roteador) {
	diskUsage, err := s.Collector.CollectMetric(router, "disk_usage")
	if err != nil {
		return
	}
	diskValue, ok := diskUsage.(float64)
	if !ok {
		return
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.DiskRecord{
		Timestamp: now,
		Value:     diskValue,
	}
	update := bson.M{
		"$push": bson.M{
			"diskUsageToday": newRecord,
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
