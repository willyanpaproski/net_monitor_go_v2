package db

import (
	"context"
	"fmt"
	"log"
	models "net_monitor/models"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var MongoClient *mongo.Client

const DBName = "net_monitor"

func InitDatabase() {
	mongoDbHost := os.Getenv("MONGODB_HOST")
	mongoDbPort := os.Getenv("MONGODB_PORT")
	mongoDbUser := os.Getenv("MONGODB_USER")
	mongoDbPassword := os.Getenv("MONGODB_PASSWORD")
	mongoDbDatabase := os.Getenv("MONGODB_DATABASE")
	mongoDbUrl := fmt.Sprintf("mongodb://%s:%s@%s:%s/%s?authSource=admin", mongoDbUser, mongoDbPassword, mongoDbHost, mongoDbPort, mongoDbDatabase)

	if os.Getenv("ENVIROMENT") == "dev" {
		mongoDbUrl = fmt.Sprintf("mongodb://127.0.0.1:%s/%s", mongoDbPort, mongoDbDatabase)
	}

	clientOptions := options.Client().ApplyURI(mongoDbUrl)

	var err error

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	MongoClient, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Error connecting with mongodb %v", err)
	}

	err = MongoClient.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatalf("Error making ping to mongodb %v", err)
	}

	log.Println("Connection with mongodb working")

	db := MongoClient.Database("net_monitor")

	models.RoteadorIndexes(db.Collection("roteador"))
	models.TransmissorFibraIndexes(db.Collection("transmissorFibra"))
	models.SwitchRedeIndexes(db.Collection("switchRede"))
	models.UserIndexes(db.Collection("user"))
	models.OAuthProviderIndexes(db.Collection("oauth_providers"))
	models.RefreshTokenIndexes(db.Collection("refresh_tokens"))
}

func GetCollection(collectionName string) *mongo.Collection {
	return MongoClient.Database(DBName).Collection(collectionName)
}

func GetDatabase() *mongo.Database {
	if MongoClient == nil {
		log.Fatalf("MongoClient is nil — você precisa chamar db.InitDatabase() antes de usar GetDatabase()")
	}
	return MongoClient.Database(DBName)
}
