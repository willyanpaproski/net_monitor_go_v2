package mikrotikScheduler

import (
	"net_monitor/interfaces"
	models "net_monitor/models"
	repository "net_monitor/repository"
	Utils "net_monitor/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*DiskScheduler)(nil)

type AverageDiskScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	StopCh     chan struct{}
}

func NewAverageDiskCalculatorScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
) *AverageDiskScheduler {
	return &AverageDiskScheduler{
		RouterRepo: routerRepo,
		StopCh:     make(chan struct{}),
	}
}

func (s *AverageDiskScheduler) Start() {
	for {
		timer := Utils.GetNextMidnight()
		select {
		case <-timer.C:
			s.calculateAllAverageDiskUsage()
		case <-s.StopCh:
			timer.Stop()
			return
		}
	}
}

func (s *AverageDiskScheduler) Stop() {
	close(s.StopCh)
}

func (s *AverageDiskScheduler) calculateAllAverageDiskUsage() {
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
		go s.calculateAverageDiskUsage(router)
	}
}

func (s *AverageDiskScheduler) calculateAverageDiskUsage(router models.Roteador) {
	if router.DiskUsageToday == nil {
		errUpdate := s.RouterRepo.UpdateByFilter(
			bson.M{"_id": router.ID},
			bson.M{"$set": bson.M{"diskUsageToday": []models.DiskRecord{}}},
		)
		if errUpdate != nil {
			return
		}
		return
	}
	if len(router.DiskUsageToday) == 0 {
		return
	}
	totalDisk := 0.0
	for _, diskRegister := range router.DiskUsageToday {
		totalDisk += diskRegister.Value
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.DiskRecord{
		Timestamp: now,
		Value:     totalDisk / float64(len(router.DiskUsageToday)),
	}
	update := bson.M{
		"$push": bson.M{
			"monthAverageDiskUsage": newRecord,
		},
		"$set": bson.M{
			"diskUsageToday": []models.DiskRecord{},
		},
	}
	errRecord := s.RouterRepo.UpdateByFilter(
		bson.M{"_id": router.ID},
		update,
	)
	if errRecord != nil {
		return
	}
}
