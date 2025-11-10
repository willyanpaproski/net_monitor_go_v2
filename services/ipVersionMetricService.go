package services

import (
	"context"
	"fmt"
	"net_monitor/netflow/metrics"
	"net_monitor/repository"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type IPVersionMetricService interface {
	GetIPVersionFlowsPercent() ([]IPVersionDailyData, error)
	GetIPVersionFlowsPercentByRouter(routerId string) ([]IPVersionDailyData, error)
	GetIPVersionBytes() ([]IPVersionBytesDailyData, error)
	GetIPVersionBytesByRouter(routerId string) ([]IPVersionBytesDailyData, error)
}

type IPVersionDailyData struct {
	Date           string  `json:"date"`
	IPv4Percentage float64 `json:"ipv4Percentage"`
	IPv6Percentage float64 `json:"ipv6Percentage"`
	TotalFlows     uint64  `json:"totalFlows"`
}

type IPVersionBytesDailyData struct {
	Date       string  `json:"date"`
	IPv4Bytes  uint64  `json:"ipv4Bytes"`
	IPv6Bytes  uint64  `json:"ipv6Bytes"`
	IPv4MB     float64 `json:"ipv4MB"`
	IPv6MB     float64 `json:"ipv6MB"`
	TotalBytes uint64  `json:"totalBytes"`
	TotalMB    float64 `json:"totalMB"`
}

type ipVersionMetricServiceImpl struct {
	repo *repository.MongoRepository[metrics.IPVersionMetric]
}

func NewIPVersionMetricService(repo *repository.MongoRepository[metrics.IPVersionMetric]) IPVersionMetricService {
	return &ipVersionMetricServiceImpl{repo: repo}
}

func (s *ipVersionMetricServiceImpl) GetIPVersionFlowsPercent() ([]IPVersionDailyData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	now := time.Now()
	brazilLocation := time.FixedZone("BRT", -3*60*60)
	nowBrazil := now.In(brazilLocation)
	startDate := nowBrazil.AddDate(0, 0, -30).Truncate(24 * time.Hour)
	startDateUTC := startDate.UTC()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"timestamp": bson.M{
					"$gte": primitive.NewDateTimeFromTime(startDateUTC),
				},
			},
		},
		{
			"$addFields": bson.M{
				"brazilDate": bson.M{
					"$dateToString": bson.M{
						"format":   "%Y-%m-%d",
						"date":     "$timestamp",
						"timezone": "-03:00",
					},
				},
			},
		},
		{
			"$group": bson.M{
				"_id": "$brazilDate",
				"totalIPv4Flows": bson.M{
					"$sum": "$ipv4FlowCount",
				},
				"totalIPv6Flows": bson.M{
					"$sum": "$ipv6FlowCount",
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalFlows": bson.M{
					"$add": []interface{}{"$totalIPv4Flows", "$totalIPv6Flows"},
				},
			},
		},
		{
			"$addFields": bson.M{
				"ipv4Percentage": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$totalFlows", 0}},
						"then": 0,
						"else": bson.M{
							"$multiply": []interface{}{
								bson.M{"$divide": []interface{}{"$totalIPv4Flows", "$totalFlows"}},
								100,
							},
						},
					},
				},
				"ipv6Percentage": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$totalFlows", 0}},
						"then": 0,
						"else": bson.M{
							"$multiply": []interface{}{
								bson.M{"$divide": []interface{}{"$totalIPv6Flows", "$totalFlows"}},
								100,
							},
						},
					},
				},
			},
		},
		{
			"$sort": bson.M{"_id": 1},
		},
		{
			"$project": bson.M{
				"_id":            0,
				"date":           "$_id",
				"ipv4Percentage": 1,
				"ipv6Percentage": 1,
				"totalFlows":     1,
			},
		},
	}

	cursor, err := s.repo.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("erro ao agregar métricas de IPv4/IPv6: %w", err)
	}
	defer cursor.Close(ctx)

	var results []IPVersionDailyData
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resultados: %w", err)
	}

	return results, nil
}

func (s *ipVersionMetricServiceImpl) GetIPVersionFlowsPercentByRouter(routerId string) ([]IPVersionDailyData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(routerId)
	if err != nil {
		return nil, fmt.Errorf("routerId inválido: %w", err)
	}

	now := time.Now()
	brazilLocation := time.FixedZone("BRT", -3*60*60)
	nowBrazil := now.In(brazilLocation)
	startDate := nowBrazil.AddDate(0, 0, -30).Truncate(24 * time.Hour)
	startDateUTC := startDate.UTC()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"routerId": objectID,
				"timestamp": bson.M{
					"$gte": primitive.NewDateTimeFromTime(startDateUTC),
				},
			},
		},
		{
			"$addFields": bson.M{
				"brazilDate": bson.M{
					"$dateToString": bson.M{
						"format":   "%Y-%m-%d",
						"date":     "$timestamp",
						"timezone": "-03:00",
					},
				},
			},
		},
		{
			"$group": bson.M{
				"_id": "$brazilDate",
				"totalIPv4Flows": bson.M{
					"$sum": "$ipv4FlowCount",
				},
				"totalIPv6Flows": bson.M{
					"$sum": "$ipv6FlowCount",
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalFlows": bson.M{
					"$add": []interface{}{"$totalIPv4Flows", "$totalIPv6Flows"},
				},
			},
		},
		{
			"$addFields": bson.M{
				"ipv4Percentage": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$totalFlows", 0}},
						"then": 0,
						"else": bson.M{
							"$multiply": []interface{}{
								bson.M{"$divide": []interface{}{"$totalIPv4Flows", "$totalFlows"}},
								100,
							},
						},
					},
				},
				"ipv6Percentage": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$totalFlows", 0}},
						"then": 0,
						"else": bson.M{
							"$multiply": []interface{}{
								bson.M{"$divide": []interface{}{"$totalIPv6Flows", "$totalFlows"}},
								100,
							},
						},
					},
				},
			},
		},
		{
			"$sort": bson.M{"_id": 1},
		},
		{
			"$project": bson.M{
				"_id":            0,
				"date":           "$_id",
				"ipv4Percentage": 1,
				"ipv6Percentage": 1,
				"totalFlows":     1,
			},
		},
	}

	cursor, err := s.repo.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("erro ao agregar métricas de IPv4/IPv6 por roteador: %w", err)
	}
	defer cursor.Close(ctx)

	var results []IPVersionDailyData
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resultados: %w", err)
	}

	return results, nil
}

func (s *ipVersionMetricServiceImpl) GetIPVersionBytes() ([]IPVersionBytesDailyData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	now := time.Now()
	brazilLocation := time.FixedZone("BRT", -3*60*60)
	nowBrazil := now.In(brazilLocation)
	startDate := nowBrazil.AddDate(0, 0, -30).Truncate(24 * time.Hour)
	startDateUTC := startDate.UTC()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"timestamp": bson.M{
					"$gte": primitive.NewDateTimeFromTime(startDateUTC),
				},
			},
		},
		{
			"$addFields": bson.M{
				"brazilDate": bson.M{
					"$dateToString": bson.M{
						"format":   "%Y-%m-%d",
						"date":     "$timestamp",
						"timezone": "-03:00",
					},
				},
			},
		},
		{
			"$group": bson.M{
				"_id": "$brazilDate",
				"ipv4Bytes": bson.M{
					"$sum": "$ipv4Bytes",
				},
				"ipv6Bytes": bson.M{
					"$sum": "$ipv6Bytes",
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalBytes": bson.M{
					"$add": []interface{}{"$ipv4Bytes", "$ipv6Bytes"},
				},
				"ipv4MB": bson.M{
					"$divide": []interface{}{"$ipv4Bytes", 1048576},
				},
				"ipv6MB": bson.M{
					"$divide": []interface{}{"$ipv6Bytes", 1048576},
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalMB": bson.M{
					"$add": []interface{}{"$ipv4MB", "$ipv6MB"},
				},
			},
		},
		{
			"$sort": bson.M{"_id": 1},
		},
		{
			"$project": bson.M{
				"_id":        0,
				"date":       "$_id",
				"ipv4Bytes":  1,
				"ipv6Bytes":  1,
				"ipv4MB":     1,
				"ipv6MB":     1,
				"totalBytes": 1,
				"totalMB":    1,
			},
		},
	}

	cursor, err := s.repo.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("erro ao agregar bytes de IPv4/IPv6: %w", err)
	}
	defer cursor.Close(ctx)

	var results []IPVersionBytesDailyData
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resultados: %w", err)
	}

	return results, nil
}

func (s *ipVersionMetricServiceImpl) GetIPVersionBytesByRouter(routerId string) ([]IPVersionBytesDailyData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(routerId)
	if err != nil {
		return nil, fmt.Errorf("routerId inválido: %w", err)
	}

	now := time.Now()
	brazilLocation := time.FixedZone("BRT", -3*60*60)
	nowBrazil := now.In(brazilLocation)
	startDate := nowBrazil.AddDate(0, 0, -30).Truncate(24 * time.Hour)
	startDateUTC := startDate.UTC()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"routerId": objectID,
				"timestamp": bson.M{
					"$gte": primitive.NewDateTimeFromTime(startDateUTC),
				},
			},
		},
		{
			"$addFields": bson.M{
				"brazilDate": bson.M{
					"$dateToString": bson.M{
						"format":   "%Y-%m-%d",
						"date":     "$timestamp",
						"timezone": "-03:00",
					},
				},
			},
		},
		{
			"$group": bson.M{
				"_id": "$brazilDate",
				"ipv4Bytes": bson.M{
					"$sum": "$ipv4Bytes",
				},
				"ipv6Bytes": bson.M{
					"$sum": "$ipv6Bytes",
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalBytes": bson.M{
					"$add": []interface{}{"$ipv4Bytes", "$ipv6Bytes"},
				},
				"ipv4MB": bson.M{
					"$divide": []interface{}{"$ipv4Bytes", 1048576},
				},
				"ipv6MB": bson.M{
					"$divide": []interface{}{"$ipv6Bytes", 1048576},
				},
			},
		},
		{
			"$addFields": bson.M{
				"totalMB": bson.M{
					"$add": []interface{}{"$ipv4MB", "$ipv6MB"},
				},
			},
		},
		{
			"$sort": bson.M{"_id": 1},
		},
		{
			"$project": bson.M{
				"_id":        0,
				"date":       "$_id",
				"ipv4Bytes":  1,
				"ipv6Bytes":  1,
				"ipv4MB":     1,
				"ipv6MB":     1,
				"totalBytes": 1,
				"totalMB":    1,
			},
		},
	}

	cursor, err := s.repo.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("erro ao agregar bytes de IPv4/IPv6 por roteador: %w", err)
	}
	defer cursor.Close(ctx)

	var results []IPVersionBytesDailyData
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resultados: %w", err)
	}

	return results, nil
}
