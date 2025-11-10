package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func UserIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "active", Value: 1}},
			Options: options.Index().SetName("_active"),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("_username"),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("_email"),
		},
		{
			Keys:    bson.D{{Key: "password", Value: 1}},
			Options: options.Index().SetName("_password"),
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
		log.Fatalf("Error creating indexes for User: %v", err)
	}
}
