package controllers

import (
	"net/http"
	"net_monitor/services"

	"github.com/gin-gonic/gin"
)

type IPVersionMetricController struct {
	Service       services.IPVersionMetricService
	RouterService services.RoteadorService
}

func NewIPVersionMetricController(service services.IPVersionMetricService, routerService services.RoteadorService) *IPVersionMetricController {
	return &IPVersionMetricController{Service: service, RouterService: routerService}
}

func (c *IPVersionMetricController) GetIPVersionFlowsPercent(goGin *gin.Context) {
	metrics, err := c.Service.GetIPVersionFlowsPercent()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, metrics)
}

func (c *IPVersionMetricController) GetIPVersionFlowsPercentByRouter(goGin *gin.Context) {
	routerId := goGin.Param("routerId")
	metrics, errMetric := c.Service.GetIPVersionFlowsPercentByRouter(routerId)
	if errMetric != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errMetric.Error()})
		return
	}
	router, errSearch := c.RouterService.GetById(routerId)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if router == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Router not found"})
		return
	}
	goGin.JSON(http.StatusOK, metrics)
}

func (c *IPVersionMetricController) GetIPVersionBytes(goGin *gin.Context) {
	metrics, err := c.Service.GetIPVersionBytes()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, metrics)
}

func (c *IPVersionMetricController) GetIPVersionBytesByRouter(goGin *gin.Context) {
	routerId := goGin.Param("routerId")
	metrics, errMetric := c.Service.GetIPVersionBytesByRouter(routerId)
	if errMetric != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errMetric.Error()})
		return
	}
	router, errSearch := c.RouterService.GetById(routerId)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if router == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Router not found"})
		return
	}
	goGin.JSON(http.StatusOK, metrics)
}
