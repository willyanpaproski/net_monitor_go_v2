package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
)

type RequestLogService interface {
	GetAll() ([]models.RequestLog, error)
	Create(requestLog *models.RequestLog) error
	GetById(id string) (*models.RequestLog, error)
}

type requestLogServiceImpl struct {
	repo *repository.MongoRepository[models.RequestLog]
}

func NewRequestLogService(repo *repository.MongoRepository[models.RequestLog]) RequestLogService {
	return &requestLogServiceImpl{repo: repo}
}

func (s *requestLogServiceImpl) GetAll() ([]models.RequestLog, error) {
	return s.repo.GetAll()
}

func (s *requestLogServiceImpl) Create(requestLog *models.RequestLog) error {
	return s.repo.Create(requestLog)
}

func (s *requestLogServiceImpl) GetById(id string) (*models.RequestLog, error) {
	return s.repo.GetById(id)
}
