package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net_monitor/config"
	models "net_monitor/models"
	repository "net_monitor/repository"
	utils "net_monitor/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
)

type AuthService interface {
	Login(email, password string) (*models.LoginResponse, error, *utils.APIError)
	RefreshToken(refreshToken string) (*models.LoginResponse, error, *utils.APIError)
	GoogleOAuthUrl() string
	GoogleCallback(code string) (*models.LoginResponse, error, *utils.APIError)
	Logout(refreshToken string) error
	ValidateToken(token string) (*models.User, error)
}

type authServiceImpl struct {
	userRepo         *repository.MongoRepository[models.User]
	oauthRepo        *repository.MongoRepository[models.OAuthProvider]
	refreshTokenRepo *repository.MongoRepository[models.RefreshToken]
	userService      UserService
	jwtManager       *utils.JWTManager
	oauthConfig      *config.OAuthConfig
}

func NewAuthService(
	userRepo *repository.MongoRepository[models.User],
	oauthRepo *repository.MongoRepository[models.OAuthProvider],
	refreshTokenRepo *repository.MongoRepository[models.RefreshToken],
	userService UserService,
	jwtManager *utils.JWTManager,
	oauthConfig *config.OAuthConfig,
) AuthService {
	return &authServiceImpl{
		userRepo:         userRepo,
		oauthRepo:        oauthRepo,
		refreshTokenRepo: refreshTokenRepo,
		userService:      userService,
		jwtManager:       jwtManager,
		oauthConfig:      oauthConfig,
	}
}

func (s *authServiceImpl) Login(email, password string) (*models.LoginResponse, error, *utils.APIError) {
	users, err := s.userRepo.GetByFilter(bson.M{"email": email})
	if err != nil {
		return nil, err, nil
	}

	if len(users) == 0 {
		return nil, nil, &utils.APIError{
			Code:    "USER_NOT_FOUND",
			Message: "User not found",
		}
	}

	if !users[0].Active {
		return nil, nil, &utils.APIError{
			Code:    "INACTIVE_USER",
			Message: "User inactive",
		}
	}

	user := users[0]

	if !utils.ComparePassword(password, user.Password) {
		return nil, nil, &utils.APIError{
			Code:    "INVALID_PASSWORD",
			Message: "Invalid password",
		}
	}

	return s.generateLoginResponse(&user)
}

func (s *authServiceImpl) RefreshToken(refreshTokenStr string) (*models.LoginResponse, error, *utils.APIError) {
	tokens, err := s.refreshTokenRepo.GetByFilter(bson.M{"token": refreshTokenStr})
	if err != nil {
		return nil, err, nil
	}

	if len(tokens) == 0 {
		return nil, errors.New("Invalid refresh token"), nil
	}

	refreshToken := tokens[0]

	if time.Now().After(refreshToken.ExpiresAt) {
		s.refreshTokenRepo.Delete(refreshToken.ID.Hex())
		return nil, errors.New("Refresh token expired"), nil
	}

	user, err := s.userService.GetById(refreshToken.UsuarioID.Hex())
	if err != nil {
		return nil, err, nil
	}

	s.refreshTokenRepo.Delete(refreshToken.ID.Hex())

	return s.generateLoginResponse(user)
}

func (s *authServiceImpl) GoogleOAuthUrl() string {
	return s.oauthConfig.GoogleConfig.AuthCodeURL("state", oauth2.AccessTypeOffline)
}

func (s *authServiceImpl) GoogleCallback(code string) (*models.LoginResponse, error, *utils.APIError) {
	token, err := s.oauthConfig.GoogleConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("Error changing code: %v", err), nil
	}

	client := s.oauthConfig.GoogleConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("Error fetching user info: %v", err), nil
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, fmt.Errorf("Error decoding response: %v", err), nil
	}

	users, err := s.userRepo.GetByFilter(bson.M{"email": googleUser.Email})
	if err != nil {
		return nil, err, nil
	}

	var user *models.User

	if len(users) > 0 {
		user = &users[0]
	}

	oauthProviders, err := s.oauthRepo.GetByFilter(bson.M{
		"usuarioId":  user.ID,
		"provider":   "google",
		"providerId": googleUser.ID,
	})
	if err != nil {
		return nil, err, nil
	}

	if len(oauthProviders) == 0 {
		oauthProvider := models.OAuthProvider{
			ID:         primitive.NewObjectID(),
			UsuarioID:  user.ID,
			Provider:   "google",
			ProviderID: googleUser.ID,
			Email:      googleUser.Email,
			Nome:       googleUser.Name,
			Avatar:     googleUser.Picture,
			Created_At: primitive.NewDateTimeFromTime(time.Now()),
			Updated_At: primitive.NewDateTimeFromTime(time.Now()),
		}

		if err := s.oauthRepo.Create(&oauthProvider); err != nil {
			return nil, err, nil
		}
	}

	return s.generateLoginResponse(user)
}

func (s *authServiceImpl) Logout(refreshTokenStr string) error {
	tokens, err := s.refreshTokenRepo.GetByFilter(bson.M{"token": refreshTokenStr})
	if err != nil {
		return err
	}

	if len(tokens) > 0 {
		return s.refreshTokenRepo.Delete(tokens[0].ID.Hex())
	}

	return nil
}

func (s *authServiceImpl) ValidateToken(tokenStr string) (*models.User, error) {
	claims, err := s.jwtManager.ValidateToken(tokenStr)
	if err != nil {
		return nil, err
	}

	return s.userService.GetById(claims.UserID)
}

func (s *authServiceImpl) generateLoginResponse(user *models.User) (*models.LoginResponse, error, *utils.APIError) {
	accessToken, expiresAt, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		return nil, err, nil
	}

	refreshTokenStr := s.jwtManager.GenerateRefreshToken()
	refreshToken := models.RefreshToken{
		ID:         primitive.NewObjectID(),
		UsuarioID:  user.ID,
		Token:      refreshTokenStr,
		ExpiresAt:  time.Now().Add(7 * 24 * time.Hour),
		Created_At: primitive.NewDateTimeFromTime(time.Now()),
	}

	if err := s.refreshTokenRepo.Create(&refreshToken); err != nil {
		return nil, err, nil
	}

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		ExpiresAt:    expiresAt,
		User:         *user,
	}, nil, nil
}
