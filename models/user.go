package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Active     bool               `json:"active" bson:"active"`
	Username   string             `json:"username" bson:"username"`
	Email      string             `json:"email" bson:"email"`
	Password   string             `json:"password" bson:"password"`
	Created_At primitive.DateTime `json:"created_at" bson:"created_at"`
	Updated_At primitive.DateTime `json:"updated_at" bson:"updated_at"`
}
