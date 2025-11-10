package mikrotikScheduler

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	"net_monitor/utils"
	interfaces "net_monitor/interfaces"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*CPUScheduler)(nil)

type AverageCpuScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	StopCh     chan struct{}
}

func NewAverageCpuCalculatorScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
) *AverageCpuScheduler {
	return &AverageCpuScheduler{
		RouterRepo: routerRepo,
		StopCh:     make(chan struct{}),
	}
}

func (s *AverageCpuScheduler) Start() {
	for {
		timer := Utils.GetNextMidnight()
		select {
		case <-timer.C:
			s.calculateAllAverageCpuUsage()
		case <-s.StopCh:
			return
		}
	}
}

func (s *AverageCpuScheduler) Stop() {
	close(s.StopCh)
}

func (s *AverageCpuScheduler) calculateAllAverageCpuUsage() {
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
		go s.calculateAverageCpuUsage(router)
	}
}

func (s *AverageCpuScheduler) calculateAverageCpuUsage(router models.Roteador) {
	if router.CpuUsageToday == nil {
		errUpdate := s.RouterRepo.UpdateByFilter(
			bson.M{"_id": router.ID},
			bson.M{"$set": bson.M{"memoryUsageToday": []models.CpuRecord{}}},
		)
		if errUpdate != nil {
			return
		}
		return
	}
	if len(router.CpuUsageToday) == 0 {
		return
	}
	totalCpuUsage := 0
	for _, cpuRegister := range router.CpuUsageToday {
		totalCpuUsage += cpuRegister.Value
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.CpuRecord{
		Timestamp: now,
		Value:     totalCpuUsage / len(router.CpuUsageToday),
	}
	update := bson.M{
		"$push": bson.M{
			"monthAverageCpuUsage": newRecord,
		},
		"$set": bson.M{
			"cpuUsageToday": []models.CpuRecord{},
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
