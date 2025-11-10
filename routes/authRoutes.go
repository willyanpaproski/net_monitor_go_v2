package routes

import (
	controllers "net_monitor/controllers"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(
	router *gin.Engine,
	authController *controllers.AuthController,
) {
	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.POST("/refresh", authController.RefreshToken)
			auth.GET("/google", authController.GoogleLogin)
			auth.GET("/google/callback", authController.GoogleCallback)
			auth.POST("/logout", authController.Logout)
		}
	}
}
