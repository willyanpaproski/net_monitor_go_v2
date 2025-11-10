package services

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	utils "net_monitor/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SwitchRedeService interface {
	GetAll() ([]models.SwitchRede, error)
	Create(switchRede *models.SwitchRede) (error, *utils.APIError)
	GetById(id string) (*models.SwitchRede, error)
	Update(id string, switchRede *models.SwitchRede) (error, *utils.APIError)
	Delete(id string) error
}

type switchRedeImpl struct {
	repo *repository.MongoRepository[models.SwitchRede]
}

func NewSwitchRedeService(repo *repository.MongoRepository[models.SwitchRede]) SwitchRedeService {
	return &switchRedeImpl{repo: repo}
}

func (s *switchRedeImpl) GetAll() ([]models.SwitchRede, error) {
	return s.repo.GetAll()
}

func (s *switchRedeImpl) GetById(id string) (*models.SwitchRede, error) {
	return s.repo.GetById(id)
}

func (s *switchRedeImpl) Create(switchRede *models.SwitchRede) (error, *utils.APIError) {
	networkSwitch, errSearch := s.repo.GetByFilter(bson.M{"name": switchRede.Name})
	if errSearch != nil {
		return errSearch, nil
	}

	if networkSwitch != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_SWITCH_NAME",
			Message: "A switch with that name already exists",
		}
	}

	hashedPassword, err := utils.HashPassword(switchRede.AccessPassword)
	if err != nil {
		return err, nil
	}
	switchRede.AccessPassword = hashedPassword
	return s.repo.Create(switchRede), nil
}

func (s *switchRedeImpl) Update(id string, switchRede *models.SwitchRede) (error, *utils.APIError) {
	switchObjectId, errObjectId := primitive.ObjectIDFromHex(id)
	if errObjectId != nil {
		return errObjectId, nil
	}

	networkSwitch, errSearch := s.repo.GetByFilter(bson.M{
		"$and": []bson.M{
			{"name": switchRede.Name},
			{"_id": bson.M{"$ne": switchObjectId}},
		},
	})
	if errSearch != nil {
		return errSearch, nil
	}
	if networkSwitch != nil {
		return nil, &utils.APIError{
			Code:    "DUPLICATED_SWITCH_NAME",
			Message: "A switch with that name already exists",
		}
	}

	hashedPassword, err := utils.HashPassword(switchRede.AccessPassword)
	if err != nil {
		return err, nil
	}
	switchRede.AccessPassword = hashedPassword
	return s.repo.Update(id, switchRede), nil
}

func (s *switchRedeImpl) Delete(id string) error {
	return s.repo.Delete(id)
}
