package Utils

import "time"

func GetNextMidnight() *time.Timer {
	now := time.Now()
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	durationUntilMidnight := nextMidnight.Sub(now)
	timer := time.NewTimer(durationUntilMidnight)
	return timer
}
