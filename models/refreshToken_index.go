package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func RefreshTokenIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "usuarioId", Value: 1}},
			Options: options.Index().SetName("_usuarioId"),
		},
		{
			Keys:    bson.D{{Key: "token", Value: 1}},
			Options: options.Index().SetName("_token"),
		},
		{
			Keys:    bson.D{{Key: "expiresAt", Value: 1}},
			Options: options.Index().SetName("_expiresAt"),
		},
		{
			Keys:    bson.D{{Key: "created_at", Value: 1}},
			Options: options.Index().SetName("_created_at"),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexModel)
	if err != nil {
		log.Fatalf("Error creating unique index for Refreshtokens: %v", err)
	}
}
