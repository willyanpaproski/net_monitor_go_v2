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
	// Rota WebSocket SNMP - aceita device_id, router_id, olt_id ou switch_id
	router.GET("/ws/snmp", gin.WrapH(http.HandlerFunc(hub.ServeWS)))

	// Grupo de rotas API para controle SNMP
	api := router.Group("/api/snmp")
	{
		// Rota compatível com versão anterior (usando router_id)
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

		// Novas rotas genéricas para qualquer dispositivo
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

		// Rota para obter status das coletas ativas
		api.GET("/status", func(c *gin.Context) {
			status := snmpService.GetActiveCollections()
			c.JSON(http.StatusOK, gin.H{"active_collections": status})
		})

		// Rota para verificar se uma coleta específica está ativa
		api.GET("/status/:device_id", func(c *gin.Context) {
			deviceID := c.Param("device_id")
			isActive := snmpService.IsCollectionActive(deviceID)

			c.JSON(http.StatusOK, gin.H{
				"device_id": deviceID,
				"is_active": isActive,
			})
		})

		// Rotas específicas para OLTs
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

		// Rotas específicas para Switches
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
