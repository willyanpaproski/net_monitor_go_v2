package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type TransmissorFibraController struct {
	Service     services.TransmissorFibraService
	TrapService *services.TrapService
}

func NewTransmissorFibraController(service services.TransmissorFibraService, trapService services.TrapService) *TransmissorFibraController {
	return &TransmissorFibraController{Service: service, TrapService: &trapService}
}

func (c *TransmissorFibraController) GetAllTransmissoresFibra(goGin *gin.Context) {
	transmissoresFibra, err := c.Service.GetAll()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, transmissoresFibra)
}

func (c *TransmissorFibraController) GetTransmissorFibraById(goGin *gin.Context) {
	id := goGin.Param("id")
	transmissorFibra, err := c.Service.GetById(id)
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if transmissorFibra == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Transmissor de fibra não encontrado"})
		return
	}
	goGin.JSON(http.StatusOK, transmissorFibra)
}

func (c *TransmissorFibraController) CreateTransmissorFibra(goGin *gin.Context) {
	var req models.TransmissorFibra
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
		device := services.OLTAdapter{OLT: req}
		c.TrapService.RegisterDevice(device, services.DeviceTypeOLT)
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}
	goGin.JSON(http.StatusCreated, req)
}

func (c *TransmissorFibraController) UpdateTransmissorFibra(goGin *gin.Context) {
	id := goGin.Param("id")
	var req models.TransmissorFibra
	transmissorFibra, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if transmissorFibra == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Transmissor de fibra não encontrado"})
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

func (c *TransmissorFibraController) DeleteTransmissorFibra(goGin *gin.Context) {
	id := goGin.Param("id")
	transmitter, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if transmitter == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Transmissor de fibra não encontrado"})
		return
	}
	if c.TrapService != nil {
		c.TrapService.UnregisterDevice(transmitter.IPAddress)
	}
	errDelete := c.Service.Delete(id)
	if errDelete != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errDelete.Error()})
		return
	}
	goGin.JSON(http.StatusNoContent, nil)
}
