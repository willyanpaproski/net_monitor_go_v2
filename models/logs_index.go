package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func LogsIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "tipo", Value: 1}},
			Options: options.Index().SetName("_tipo"),
		},
		{
			Keys:    bson.D{{Key: "campos", Value: 1}},
			Options: options.Index().SetName("_campos"),
		},
		{
			Keys:    bson.D{{Key: "usuario", Value: 1}},
			Options: options.Index().SetName("_usuario"),
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
		log.Fatalf("Error creating indexes for Logs: %v", err)
	}
}
