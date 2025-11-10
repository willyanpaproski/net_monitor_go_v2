package repository

import (
	"context"
	"errors"
	"net_monitor/utils"
	"reflect"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoRepository[T any] struct {
	Collection *mongo.Collection
}

func NewMongoRepository[T any](collection *mongo.Collection) *MongoRepository[T] {
	return &MongoRepository[T]{Collection: collection}
}

func (r *MongoRepository[T]) Create(collection *T) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	r.setTimestamps(collection, true)

	result, err := r.Collection.InsertOne(ctx, collection)
	if err != nil {
		return err
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		Utils.SetMongoID(collection, oid)
	}

	return nil
}

func (r *MongoRepository[T]) GetAll() ([]T, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.Collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []T
	for cursor.Next(ctx) {
		var elem T
		if err := cursor.Decode(&elem); err != nil {
			return nil, err
		}
		results = append(results, elem)
	}

	return results, nil
}

func (r *MongoRepository[T]) GetById(id string) (*T, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var result T
	err = r.Collection.FindOne(ctx, bson.M{"_id": objId}).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}

	return &result, err
}

func (r *MongoRepository[T]) Update(id string, collection *T) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	r.setTimestamps(collection, false)

	objId, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return err
	}

	_, err = r.Collection.ReplaceOne(ctx, bson.M{"_id": objId}, collection)
	return err
}

func (r *MongoRepository[T]) Delete(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.Collection.DeleteOne(ctx, bson.M{"_id": objId})
	return err
}

func (r *MongoRepository[T]) GetByFilter(filter bson.M) ([]T, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []T
	for cursor.Next(ctx) {
		var elem T
		if err := cursor.Decode(&elem); err != nil {
			return nil, err
		}
		results = append(results, elem)
	}

	return results, nil
}

func (r *MongoRepository[T]) setTimestamps(collection *T, isCreate bool) {
	v := reflect.ValueOf(collection).Elem()
	now := primitive.NewDateTimeFromTime(time.Now())

	if isCreate {
		if createdField := v.FieldByName("Created_At"); createdField.IsValid() && createdField.CanSet() {
			createdField.Set(reflect.ValueOf(now))
		}
	}

	if updatedField := v.FieldByName("Updated_At"); updatedField.IsValid() && updatedField.CanSet() {
		updatedField.Set(reflect.ValueOf(now))
	}
}

func (r *MongoRepository[T]) UpdateByFilter(filter interface{}, update interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.Collection.UpdateOne(ctx, filter, update)
	return err
}
