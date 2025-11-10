package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type RoteadorController struct {
	Service     services.RoteadorService
	TrapService *services.TrapService
}

func NewRoteadorController(service services.RoteadorService, trapService services.TrapService) *RoteadorController {
	return &RoteadorController{Service: service, TrapService: &trapService}
}

func (c *RoteadorController) GetAllRoteadores(goGin *gin.Context) {
	roteadores, err := c.Service.GetAll()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, roteadores)
}

func (c *RoteadorController) GetRoteadorById(goGin *gin.Context) {
	id := goGin.Param("id")
	roteador, err := c.Service.GetById(id)
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if roteador == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Roteador não encontrado"})
		return
	}
	goGin.JSON(http.StatusOK, roteador)
}

func (c *RoteadorController) CreateRoteador(goGin *gin.Context) {
	var req models.Roteador
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
		device := services.RouterAdapter{Router: req}
		c.TrapService.RegisterDevice(device, services.DeviceTypeRouter)
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}
	goGin.JSON(http.StatusCreated, req)
}

func (c *RoteadorController) UpdateRoteador(goGin *gin.Context) {
	id := goGin.Param("id")
	var req models.Roteador
	roteador, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if roteador == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Roteador não encontrado"})
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

func (c *RoteadorController) DeleteRoteador(goGin *gin.Context) {
	id := goGin.Param("id")
	roteador, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if roteador == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Roteador não encontrado"})
		return
	}
	if c.TrapService != nil {
		c.TrapService.UnregisterDevice(roteador.IPAddress)
	}
	errDelete := c.Service.Delete(id)
	if errDelete != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errDelete.Error()})
		return
	}
	goGin.JSON(http.StatusNoContent, nil)
}
