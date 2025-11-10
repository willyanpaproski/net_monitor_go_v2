package Utils

import (
	"reflect"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SetMongoID(doc interface{}, id primitive.ObjectID) {
	v := reflect.ValueOf(doc)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	if v.Kind() == reflect.Struct {
		field := v.FieldByName("ID")
		if field.IsValid() && field.CanSet() && field.Type() == reflect.TypeOf(primitive.ObjectID{}) {
			field.Set(reflect.ValueOf(id))
		}
	}
}
