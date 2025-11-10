package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type RequestLog struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Method     string             `json:"method" bson:"method"`
	Path       string             `json:"path" bson:"path"`
	Body       string             `json:"body" bson:"body"`
	StatusCode int                `json:"statusCode" bson:"statusCode"`
	Duration   int64              `json:"duration" bson:"duration"`
	ClientIP   string             `json:"clientIP" bson:"clientIP"`
	UserAgent  string             `json:"userAgent" bson:"userAgent"`
	Timestamp  primitive.DateTime `json:"timestamp" bson:"timestamp"`
}
