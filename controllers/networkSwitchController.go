package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type SwitchRedeController struct {
	Service     services.SwitchRedeService
	TrapService *services.TrapService
}

func NewSwitchRedeController(service services.SwitchRedeService, trapService services.TrapService) *SwitchRedeController {
	return &SwitchRedeController{Service: service, TrapService: &trapService}
}

func (c *SwitchRedeController) GetAllSwitchesRede(goGin *gin.Context) {
	switchesRede, err := c.Service.GetAll()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, switchesRede)
}

func (c *SwitchRedeController) GetSwitchRedeById(goGin *gin.Context) {
	id := goGin.Param("id")
	switchRede, err := c.Service.GetById(id)
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if switchRede == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Switch não encontrado"})
		return
	}
	goGin.JSON(http.StatusOK, switchRede)
}

func (c *SwitchRedeController) CreateSwitchRede(goGin *gin.Context) {
	var req models.SwitchRede
	if errValidation := goGin.ShouldBindJSON(&req); errValidation != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	errCreate, apiErr := c.Service.Create(&req)
	if errCreate != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errCreate.Error()})
		return
	}
	if c.TrapService != nil {
		device := services.SwitchAdapter{Switch: req}
		c.TrapService.RegisterDevice(device, services.DeviceTypeSwitch)
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}
	goGin.JSON(http.StatusCreated, req)
}

func (c *SwitchRedeController) UpdateSwitchRede(goGin *gin.Context) {
	id := goGin.Param("id")
	var req models.SwitchRede
	switchRede, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if switchRede == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Switch não encontrado"})
		return
	}
	if errValidation := goGin.ShouldBindJSON(&req); errValidation != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	errUpdate, apiErr := c.Service.Update(id, &req)
	if errUpdate != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errUpdate.Error()})
		return
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}
	goGin.JSON(http.StatusOK, req)
}

func (c *SwitchRedeController) Delete(goGin *gin.Context) {
	id := goGin.Param("id")
	networkSwitch, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if networkSwitch == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Switch not found"})
		return
	}
	if c.TrapService != nil {
		c.TrapService.UnregisterDevice(networkSwitch.IPAddress)
	}
	errDelete := c.Service.Delete(id)
	if errDelete != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errDelete.Error()})
		return
	}
	goGin.JSON(http.StatusNoContent, nil)
}
