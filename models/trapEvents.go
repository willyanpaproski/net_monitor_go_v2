package models

import (
	"net_monitor/interfaces"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TrapEvent struct {
	ID        primitive.ObjectID   `json:"id,omitempty" bson:"_id,omitempty"`
	TrapEvent interfaces.TrapEvent `json:"trapEvent" bson:"trapEvent"`
}
