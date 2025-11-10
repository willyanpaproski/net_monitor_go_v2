package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Log struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Tipo       string             `json:"tipo" bson:"tipo"`
	Campos     string             `json:"campos" bson:"campos"`
	Usuario    primitive.ObjectID `json:"usuario" bson:"usuario"`
	Created_At primitive.DateTime `json:"created_at" bson:"created_at"`
	Updated_At primitive.DateTime `json:"updated_at" bson:"updated_at"`
}
