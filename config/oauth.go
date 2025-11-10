package config

import (
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthConfig struct {
	GoogleConfig *oauth2.Config
	JWTSecret    string
}

func NewAuthConfig() *OAuthConfig {
	return &OAuthConfig{
		GoogleConfig: &oauth2.Config{
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
}
