package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func OAuthProviderIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "usuarioId", Value: 1}},
			Options: options.Index().SetName("_usuarioId"),
		},
		{
			Keys:    bson.D{{Key: "provider", Value: 1}},
			Options: options.Index().SetName("_provider"),
		},
		{
			Keys:    bson.D{{Key: "providerId", Value: 1}},
			Options: options.Index().SetName("_providerId"),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetName("_email"),
		},
		{
			Keys:    bson.D{{Key: "nome", Value: 1}},
			Options: options.Index().SetName("_nome"),
		},
		{
			Keys:    bson.D{{Key: "avatar", Value: 1}},
			Options: options.Index().SetName("_avatar"),
		},
		{
			Keys:    bson.D{{Key: "created_at", Value: 1}},
			Options: options.Index().SetName("_created_at"),
		},
		{
			Keys:    bson.D{{Key: "updated_at", Value: 1}},
			Options: options.Index().SetName("_updated_at"),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexModel)
	if err != nil {
		log.Fatalf("Error creating unique index for OAuthProvider: %v", err)
	}
}
