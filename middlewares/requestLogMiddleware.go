package middlewares

import (
	"bytes"
	"io"
	"log"
	models "net_monitor/models"
	services "net_monitor/services"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RequestLoggerMiddleware(logService services.RequestLogService) gin.HandlerFunc {
	return func(goGin *gin.Context) {
		if goGin.Request.Method == "GET" || goGin.Request.Method == "OPTIONS" {
			return
		}

		start := time.Now()

		var bodyBytes []byte
		var bodyString string

		if goGin.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(goGin.Request.Body)
			bodyString = string(bodyBytes)

			goGin.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		goGin.Next()

		duration := time.Since(start)

		requestLog := &models.RequestLog{
			Method:     goGin.Request.Method,
			Path:       goGin.Request.URL.Path,
			StatusCode: goGin.Writer.Status(),
			Duration:   duration.Microseconds(),
			ClientIP:   goGin.Request.RemoteAddr,
			UserAgent:  goGin.Request.UserAgent(),
			Body:       bodyString,
			Timestamp:  primitive.NewDateTimeFromTime(start),
		}

		go func() {
			if err := logService.Create(requestLog); err != nil {
				log.Fatalf("Error creating request log: %v;    %v", err, requestLog)
			}
		}()
	}
}
