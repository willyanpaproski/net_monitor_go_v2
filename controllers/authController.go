package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (c *AuthController) Login(goGin *gin.Context) {
	var req models.LoginRequest
	if err := goGin.ShouldBindJSON(&req); err != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	response, err, apiErr := c.authService.Login(req.Email, req.Password)
	if err != nil {
		goGin.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}

	goGin.JSON(http.StatusOK, response)
}

func (c *AuthController) RefreshToken(goGin *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := goGin.ShouldBindJSON(&req); err != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token requirido"})
		return
	}

	response, err, apiErr := c.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		goGin.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}

	goGin.JSON(http.StatusOK, response)
}

func (c *AuthController) GoogleLogin(goGin *gin.Context) {
	url := c.authService.GoogleOAuthUrl()
	goGin.JSON(http.StatusOK, gin.H{"url": url})
}

func (c *AuthController) GoogleCallback(goGin *gin.Context) {
	code := goGin.Query("code")
	if code == "" {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Código de autorização requirido"})
		return
	}

	response, err, apiErr := c.authService.GoogleCallback(code)
	if err != nil {
		goGin.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	if apiErr != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": apiErr})
		return
	}

	goGin.JSON(http.StatusOK, response)
}

func (c *AuthController) Logout(goGin *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := goGin.ShouldBindJSON(&req); err != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token requirido"})
		return
	}

	if err := c.authService.Logout(req.RefreshToken); err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	goGin.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso"})
}

func (c *AuthController) Me(goGin *gin.Context) {
	user, exists := goGin.Get("user")
	if !exists {
		goGin.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	goGin.JSON(http.StatusOK, user)
}
