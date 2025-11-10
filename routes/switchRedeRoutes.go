package routes

import (
	controllers "net_monitor/controllers"
	middlewares "net_monitor/middlewares"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

func SetupSwitchRedeRoutes(
	router *gin.Engine,
	switchRedeController *controllers.SwitchRedeController,
	authService services.AuthService,
) {
	api := router.Group("/api")
	{
		switchesRede := api.Group("/switches")
		switchesRede.Use(middlewares.AuthMiddleware(authService))
		{
			switchesRede.GET("", switchRedeController.GetAllSwitchesRede)
			switchesRede.GET("/:id", switchRedeController.GetSwitchRedeById)
			switchesRede.POST("", switchRedeController.CreateSwitchRede)
			switchesRede.PATCH("/:id", switchRedeController.UpdateSwitchRede)
			switchesRede.DELETE("/:id", switchRedeController.Delete)
		}
	}
}
