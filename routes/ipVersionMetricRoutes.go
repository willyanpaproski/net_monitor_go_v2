package routes

import (
	"net_monitor/controllers"
	"net_monitor/middlewares"
	"net_monitor/services"

	"github.com/gin-gonic/gin"
)

func SetupIPVersionMetricRoutes(
	router *gin.Engine,
	ipVersionController *controllers.IPVersionMetricController,
	authService services.AuthService,
) {
	api := router.Group("/api/metrics")
	{
		ipVersionMetrics := api.Group("/ipVersion")
		ipVersionMetrics.Use(middlewares.AuthMiddleware(authService))
		{
			ipVersionMetrics.GET("/flowPercent", ipVersionController.GetIPVersionFlowsPercent)
			ipVersionMetrics.GET("/flowPercent/:routerId", ipVersionController.GetIPVersionFlowsPercentByRouter)
			ipVersionMetrics.GET("/bandWidthUsage", ipVersionController.GetIPVersionBytes)
			ipVersionMetrics.GET("/bandWidthUsage/:routerId", ipVersionController.GetIPVersionBytesByRouter)
		}
	}
}
