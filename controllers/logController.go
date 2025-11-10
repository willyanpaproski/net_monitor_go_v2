package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type LogController struct {
	Service services.LogService
}

func NewLogController(service services.LogService) *LogController {
	return &LogController{Service: service}
}

func (c *LogController) GetAllLogs(goGin *gin.Context) {
	logs, err := c.Service.GetAll()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, logs)
}

func (c *LogController) GetLogById(goGin *gin.Context) {
	id := goGin.Param("id")
	log, err := c.Service.GetById(id)
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if log == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Log não encontrado"})
		return
	}
	goGin.JSON(http.StatusOK, log)
}

func (c *LogController) CreateLog(goGin *gin.Context) {
	var req models.Log
	if errValidation := goGin.ShouldBindJSON(&req); errValidation != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": errValidation.Error()})
		return
	}
	errCreate := c.Service.Create(&req)
	if errCreate != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errCreate.Error()})
		return
	}
	goGin.JSON(http.StatusCreated, req)
}
