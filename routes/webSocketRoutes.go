package routes

import (
	"net/http"

	services "net_monitor/services"
	"net_monitor/websocket"

	"github.com/gin-gonic/gin"
)

func SetupWebSocketRoutes(
	router *gin.Engine,
	hub *websocket.Hub,
	snmpService *services.SNMPService,
) {
	router.GET("/ws/snmp", gin.WrapH(http.HandlerFunc(hub.ServeWS)))

	api := router.Group("/api/snmp")
	{
		api.POST("/start/:router_id", func(c *gin.Context) {
			deviceID := c.Param("router_id")

			if err := snmpService.StartCollection(deviceID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Coleta iniciada"})
		})

		api.POST("/stop/:router_id", func(c *gin.Context) {
			deviceID := c.Param("router_id")
			snmpService.StopCollection(deviceID)
			c.JSON(http.StatusOK, gin.H{"message": "Coleta interrompida"})
		})

		api.POST("/device/start/:device_id", func(c *gin.Context) {
			deviceID := c.Param("device_id")

			if err := snmpService.StartCollection(deviceID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Coleta iniciada com sucesso"})
		})

		api.POST("/device/stop/:device_id", func(c *gin.Context) {
			deviceID := c.Param("device_id")
			snmpService.StopCollection(deviceID)
			c.JSON(http.StatusOK, gin.H{"message": "Coleta interrompida com sucesso"})
		})

		api.GET("/status", func(c *gin.Context) {
			status := snmpService.GetActiveCollections()
			c.JSON(http.StatusOK, gin.H{"active_collections": status})
		})

		api.GET("/status/:device_id", func(c *gin.Context) {
			deviceID := c.Param("device_id")
			isActive := snmpService.IsCollectionActive(deviceID)

			c.JSON(http.StatusOK, gin.H{
				"device_id": deviceID,
				"is_active": isActive,
			})
		})

		api.POST("/olt/start/:olt_id", func(c *gin.Context) {
			oltID := c.Param("olt_id")

			if err := snmpService.StartCollection(oltID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Coleta de OLT iniciada"})
		})

		api.POST("/olt/stop/:olt_id", func(c *gin.Context) {
			oltID := c.Param("olt_id")
			snmpService.StopCollection(oltID)
			c.JSON(http.StatusOK, gin.H{"message": "Coleta de OLT interrompida"})
		})

		api.POST("/switch/start/:switch_id", func(c *gin.Context) {
			switchID := c.Param("switch_id")

			if err := snmpService.StartCollection(switchID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Coleta de Switch iniciada"})
		})

		api.POST("/switch/stop/:switch_id", func(c *gin.Context) {
			switchID := c.Param("switch_id")
			snmpService.StopCollection(switchID)
			c.JSON(http.StatusOK, gin.H{"message": "Coleta de Switch interrompida"})
		})
	}
}
