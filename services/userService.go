package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	utils "net_monitor/utils"
)

type UserService interface {
	GetAll() ([]models.User, error)
	Create(user *models.User) error
	GetById(id string) (*models.User, error)
	Update(id string, user *models.User) error
	Delete(id string) error
}

type userServiceImpl struct {
	repo *repository.MongoRepository[models.User]
}

func NewUserService(repo *repository.MongoRepository[models.User]) UserService {
	return &userServiceImpl{repo: repo}
}

func (s *userServiceImpl) GetAll() ([]models.User, error) {
	return s.repo.GetAll()
}

func (s *userServiceImpl) Create(user *models.User) error {
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	return s.repo.Create(user)
}

func (s *userServiceImpl) GetById(id string) (*models.User, error) {
	return s.repo.GetById(id)
}

func (s *userServiceImpl) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *userServiceImpl) Update(id string, user *models.User) error {
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	return s.repo.Update(id, user)
}
