package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
)

type LogService interface {
	GetAll() ([]models.Log, error)
	Create(log *models.Log) error
	GetById(id string) (*models.Log, error)
}

type logServiceImpl struct {
	repo *repository.MongoRepository[models.Log]
}

func NewLogService(repo *repository.MongoRepository[models.Log]) LogService {
	return &logServiceImpl{repo: repo}
}

func (s *logServiceImpl) GetAll() ([]models.Log, error) {
	return s.repo.GetAll()
}

func (s *logServiceImpl) Create(log *models.Log) error {
	return s.repo.Create(log)
}

func (s *logServiceImpl) GetById(id string) (*models.Log, error) {
	return s.repo.GetById(id)
}
