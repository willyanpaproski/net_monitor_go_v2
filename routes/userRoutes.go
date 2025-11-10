package routes

import (
	controllers "net_monitor/controllers"
	"net_monitor/middlewares"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

func SetupUserRoutes(
	router *gin.Engine,
	userController *controllers.UserController,
	authService services.AuthService,
) {
	api := router.Group("/api")
	{
		users := api.Group("/users")
		users.Use(middlewares.AuthMiddleware(authService))
		{
			users.GET("", userController.GetAllUsers)
			users.GET("/:id", userController.GetUserById)
			users.POST("", userController.CreateUser)
			users.PATCH("/:id", userController.UpdateUser)
			users.DELETE("/:id", userController.DeleteUser)
		}
	}
}
