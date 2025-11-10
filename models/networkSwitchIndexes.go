package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SwitchRedeIndexes(collection *mongo.Collection) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "active", Value: 1}},
			Options: options.Index().SetName("_active"),
		},
		{
			Keys:    bson.D{{Key: "integration", Value: 1}},
			Options: options.Index().SetName("_integration"),
		},
		{
			Keys:    bson.D{{Key: "name", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("_name"),
		},
		{
			Keys:    bson.D{{Key: "description", Value: 1}},
			Options: options.Index().SetName("_description"),
		},
		{
			Keys:    bson.D{{Key: "accessUser", Value: 1}},
			Options: options.Index().SetName("_accessUser"),
		},
		{
			Keys:    bson.D{{Key: "ipAddress", Value: 1}},
			Options: options.Index().SetName("_ipAddress"),
		},
		{
			Keys:    bson.D{{Key: "snmpCommunity", Value: 1}},
			Options: options.Index().SetName("_snmpCommunity"),
		},
		{
			Keys:    bson.D{{Key: "snmpPort", Value: 1}},
			Options: options.Index().SetName("_snmpPort"),
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
		log.Fatalf("Error creating unique index for SwitchRede: %v", err)
	}
}
