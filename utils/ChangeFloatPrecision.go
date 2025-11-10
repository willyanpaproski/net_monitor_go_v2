package Utils

import (
	"math"
)

func ChangeFloatPrecision(value float64, precision int) float64 {
	multiplier := math.Pow(10, float64(precision))
	return math.Round(value*multiplier) / multiplier
}
