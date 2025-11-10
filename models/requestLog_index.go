package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func RequestLogIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "method", Value: 1}},
			Options: options.Index().SetName("_method"),
		},
		{
			Keys:    bson.D{{Key: "path", Value: 1}},
			Options: options.Index().SetName("_path"),
		},
		{
			Keys:    bson.D{{Key: "statusCode", Value: 1}},
			Options: options.Index().SetName("_statusCode"),
		},
		{
			Keys:    bson.D{{Key: "duration", Value: 1}},
			Options: options.Index().SetName("_duration"),
		},
		{
			Keys:    bson.D{{Key: "clientIp", Value: 1}},
			Options: options.Index().SetName("_clientIp"),
		},
		{
			Keys:    bson.D{{Key: "userAgent", Value: 1}},
			Options: options.Index().SetName("_userAgent"),
		},
		{
			Keys:    bson.D{{Key: "body", Value: 1}},
			Options: options.Index().SetName("_body"),
		},
		{
			Keys:    bson.D{{Key: "timeStamp", Value: 1}},
			Options: options.Index().SetName("_timeStamp"),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexModel)
	if err != nil {
		log.Fatalf("Error creating indexes for RequestLog: %v", err)
	}
}
