package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	utils "net_monitor/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TransmissorFibraService interface {
	GetAll() ([]models.TransmissorFibra, error)
	Create(transmissorFibra *models.TransmissorFibra) (error, *utils.APIError)
	GetById(id string) (*models.TransmissorFibra, error)
	Update(id string, transmissorFibra *models.TransmissorFibra) (error, *utils.APIError)
	Delete(id string) error
}

type transmissorFibraImpl struct {
	repo *repository.MongoRepository[models.TransmissorFibra]
}

func NewTransmissorFibraService(repo *repository.MongoRepository[models.TransmissorFibra]) TransmissorFibraService {
	return &transmissorFibraImpl{repo: repo}
}

func (s *transmissorFibraImpl) GetAll() ([]models.TransmissorFibra, error) {
	return s.repo.GetAll()
}

func (s *transmissorFibraImpl) Create(transmissorFibra *models.TransmissorFibra) (error, *utils.APIError) {
	transmitter, errSearch := s.repo.GetByFilter(bson.M{"name": transmissorFibra.Name})
	if errSearch != nil {
		return errSearch, nil
	}
	if transmitter != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_TRANSMITTER_NAME",
			Message: "A transmitter with that name already exists",
		}
	}
	hashedPassword, err := utils.HashPassword(transmissorFibra.AccessPassword)
	if err != nil {
		return err, nil
	}
	transmissorFibra.AccessPassword = hashedPassword
	return s.repo.Create(transmissorFibra), nil
}

func (s *transmissorFibraImpl) GetById(id string) (*models.TransmissorFibra, error) {
	return s.repo.GetById(id)
}

func (s *transmissorFibraImpl) Update(id string, transmissorFibra *models.TransmissorFibra) (error, *utils.APIError) {
	transmitterObjectId, errObjectId := primitive.ObjectIDFromHex(id)
	if errObjectId != nil {
		return errObjectId, nil
	}
	transmitter, errSearch := s.repo.GetByFilter(bson.M{
		"$and": []bson.M{
			{"name": transmissorFibra.Name},
			{"_id": bson.M{"$ne": transmitterObjectId}},
		},
	})
	if errSearch != nil {
		return errSearch, nil
	}
	if transmitter != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_TRANSMITTER_NAME",
			Message: "A transmitter with that name already exists",
		}
	}

	hashedPassword, err := utils.HashPassword(transmissorFibra.AccessPassword)
	if err != nil {
		return err, nil
	}
	transmissorFibra.AccessPassword = hashedPassword
	return s.repo.Update(id, transmissorFibra), nil
}

func (s *transmissorFibraImpl) Delete(id string) error {
	return s.repo.Delete(id)
}
