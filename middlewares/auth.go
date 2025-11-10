package middlewares

import (
	"net/http"
	services "net_monitor/services"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService services.AuthService) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth token required"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		user, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	})
}
