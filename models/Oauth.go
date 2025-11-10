package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OAuthProvider struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UsuarioID  primitive.ObjectID `bson:"usuarioId" json:"usuarioId"`
	Provider   string             `bson:"provider" json:"provider"`
	ProviderID string             `bson:"providerId" json:"providerId"`
	Email      string             `bson:"email" json:"email"`
	Nome       string             `bson:"nome" json:"nome"`
	Avatar     string             `bson:"avatar" json:"avatar"`
	Created_At primitive.DateTime `bson:"created_at" json:"created_at"`
	Updated_At primitive.DateTime `bson:"updated_at" json:"updated_at"`
}

type RefreshToken struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UsuarioID  primitive.ObjectID `bson:"usuarioId" json:"usuarioId"`
	Token      string             `bson:"token" json:"token"`
	ExpiresAt  time.Time          `bson:"expiresAt" json:"expiresAt"`
	Created_At primitive.DateTime `bson:"createdAt" json:"createdAt"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         User      `json:"user"`
}
