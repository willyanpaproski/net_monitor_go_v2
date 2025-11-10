package controllers

import (
	"net/http"
	models "net_monitor/models"
	services "net_monitor/services"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	Service services.UserService
}

func NewUserController(service services.UserService) *UserController {
	return &UserController{Service: service}
}

func (c *UserController) GetAllUsers(goGin *gin.Context) {
	users, err := c.Service.GetAll()
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	goGin.JSON(http.StatusOK, users)
}

func (c *UserController) GetUserById(goGin *gin.Context) {
	id := goGin.Param("id")
	user, err := c.Service.GetById(id)
	if err != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if user == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}
	goGin.JSON(http.StatusOK, user)
}

func (c *UserController) CreateUser(goGin *gin.Context) {
	var req models.User
	if errValidation := goGin.ShouldBindJSON(&req); errValidation != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	errCreate := c.Service.Create(&req)
	if errCreate != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errCreate.Error()})
		return
	}
	goGin.JSON(http.StatusCreated, req)
}

func (c *UserController) UpdateUser(goGin *gin.Context) {
	id := goGin.Param("id")
	var req models.User
	user, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if user == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}
	if errValidation := goGin.ShouldBindJSON(&req); errValidation != nil {
		goGin.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	errUpdate := c.Service.Update(id, &req)
	if errUpdate != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errUpdate.Error()})
		return
	}
	goGin.JSON(http.StatusOK, req)
}

func (c *UserController) DeleteUser(goGin *gin.Context) {
	id := goGin.Param("id")
	user, errSearch := c.Service.GetById(id)
	if errSearch != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errSearch.Error()})
		return
	}
	if user == nil {
		goGin.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}
	errDelete := c.Service.Delete(id)
	if errDelete != nil {
		goGin.JSON(http.StatusInternalServerError, gin.H{"error": errDelete.Error()})
		return
	}
	goGin.JSON(http.StatusNoContent, nil)
}
