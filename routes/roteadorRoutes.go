package routes

import (
	controllers "net_monitor/controllers"
	middlewares "net_monitor/middlewares"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

func SetupRoteadorRoutes(
	router *gin.Engine,
	roteadorController *controllers.RoteadorController,
	authService services.AuthService,
) {
	api := router.Group("/api")
	{
		roteadores := api.Group("/routers")
		roteadores.Use(middlewares.AuthMiddleware(authService))
		{
			roteadores.GET("", roteadorController.GetAllRoteadores)
			roteadores.GET("/:id", roteadorController.GetRoteadorById)
			roteadores.POST("", roteadorController.CreateRoteador)
			roteadores.PATCH("/:id", roteadorController.UpdateRoteador)
			roteadores.DELETE("/:id", roteadorController.DeleteRoteador)
		}
	}
}
