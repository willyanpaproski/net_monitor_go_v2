package mikrotikScheduler

import (
	interfaces "net_monitor/interfaces"
	models "net_monitor/models"
	repository "net_monitor/repository"
	Utils "net_monitor/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var _ interfaces.Scheduler = (*MemoryScheduler)(nil)

type AverageMemoryScheduler struct {
	RouterRepo *repository.MongoRepository[models.Roteador]
	StopCh     chan struct{}
}

func NewAverageMemoryCalculatorScheduler(
	routerRepo *repository.MongoRepository[models.Roteador],
) *AverageMemoryScheduler {
	return &AverageMemoryScheduler{
		RouterRepo: routerRepo,
		StopCh:     make(chan struct{}),
	}
}

func (s *AverageMemoryScheduler) Start() {
	for {
		timer := Utils.GetNextMidnight()
		select {
		case <-timer.C:
			s.calculateAllAverageMemoryUsage()
		case <-s.StopCh:
			timer.Stop()
			return
		}
	}
}

func (s *AverageMemoryScheduler) Stop() {
	close(s.StopCh)
}

func (s *AverageMemoryScheduler) calculateAllAverageMemoryUsage() {
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
		go s.calculateAverageMemoryUsage(router)
	}
}

func (s *AverageMemoryScheduler) calculateAverageMemoryUsage(router models.Roteador) {
	if router.MemoryUsageToday == nil {
		errUpdate := s.RouterRepo.UpdateByFilter(
			bson.M{"_id": router.ID},
			bson.M{"$set": bson.M{"memoryUsageToday": []models.MemoryRecord{}}},
		)
		if errUpdate != nil {
			return
		}
		return
	}
	if len(router.MemoryUsageToday) == 0 {
		return
	}
	totalMemory := 0.0
	for _, memoryRegister := range router.MemoryUsageToday {
		totalMemory += memoryRegister.Value
	}
	now := primitive.NewDateTimeFromTime(time.Now())
	newRecord := models.MemoryRecord{
		Timestamp: now,
		Value:     totalMemory / float64(len(router.MemoryUsageToday)),
	}
	update := bson.M{
		"$push": bson.M{
			"monthAvarageMemoryUsage": newRecord,
		},
		"$set": bson.M{
			"memoryUsageToday": []models.MemoryRecord{},
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
