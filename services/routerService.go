package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	utils "net_monitor/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RoteadorService interface {
	GetAll() ([]models.Roteador, error)
	Create(roteador *models.Roteador) (error, *utils.APIError)
	GetById(id string) (*models.Roteador, error)
	Update(id string, roteador *models.Roteador) (error, *utils.APIError)
	Delete(id string) error
}

type roteadorServiceImpl struct {
	repo *repository.MongoRepository[models.Roteador]
}

func NewRoteadorService(repo *repository.MongoRepository[models.Roteador]) RoteadorService {
	return &roteadorServiceImpl{repo: repo}
}

func (s *roteadorServiceImpl) GetAll() ([]models.Roteador, error) {
	return s.repo.GetAll()
}

func (s *roteadorServiceImpl) Create(roteador *models.Roteador) (error, *utils.APIError) {
	router, errSearch := s.repo.GetByFilter(bson.M{"name": roteador.Name})
	if errSearch != nil {
		return errSearch, nil
	}
	if router != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_ROUTER_NAME",
			Message: "A router with that name already exists",
		}
	}
	hashedPassword, err := utils.HashPassword(roteador.AccessPassword)
	if err != nil {
		return err, nil
	}
	roteador.AccessPassword = hashedPassword
	roteador.MemoryUsageToday = []models.MemoryRecord{}
	roteador.MonthAvarageMemoryUsage = []models.MemoryRecord{}
	roteador.CpuUsageToday = []models.CpuRecord{}
	roteador.MonthAverageCpuUsage = []models.CpuRecord{}
	roteador.DiskUsageToday = []models.DiskRecord{}
	roteador.MonthAverageDiskUsage = []models.DiskRecord{}
	return s.repo.Create(roteador), nil
}

func (s *roteadorServiceImpl) GetById(id string) (*models.Roteador, error) {
	return s.repo.GetById(id)
}

func (s *roteadorServiceImpl) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *roteadorServiceImpl) Update(id string, roteador *models.Roteador) (error, *utils.APIError) {
	routerObectId, errObjectId := primitive.ObjectIDFromHex(id)
	if errObjectId != nil {
		return errObjectId, nil
	}
	router, errSearch := s.repo.GetByFilter(bson.M{
		"$and": []bson.M{
			{"name": roteador.Name},
			{"_id": bson.M{"$ne": routerObectId}},
		},
	})
	if errSearch != nil {
		return errSearch, nil
	}
	if router != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_ROUTER_NAME",
			Message: "A router with that name already exists",
		}
	}
	existentRouter, errGet := s.repo.GetById(id)
	if errGet != nil {
		return errGet, nil
	}
	if existentRouter == nil {
		return nil, &utils.APIError{
			Code:    "ROUTER_NOT_FOUND",
			Message: "Router not found",
		}
	}
	hashedPassword, err := utils.HashPassword(roteador.AccessPassword)
	if err != nil {
		return err, nil
	}
	roteador.MemoryUsageToday = existentRouter.MemoryUsageToday
	roteador.MonthAvarageMemoryUsage = existentRouter.MonthAvarageMemoryUsage
	roteador.CpuUsageToday = existentRouter.CpuUsageToday
	roteador.MonthAverageCpuUsage = existentRouter.MonthAverageCpuUsage
	roteador.DiskUsageToday = existentRouter.DiskUsageToday
	roteador.MonthAverageDiskUsage = existentRouter.MonthAverageDiskUsage
	roteador.AccessPassword = hashedPassword
	return s.repo.Update(id, roteador), nil
}
