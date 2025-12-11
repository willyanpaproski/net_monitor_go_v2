package metrics

import (
	"context"
	"log"
	models "net_monitor/models"
	"net_monitor/netflow"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DNSServer struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	IPAddress    string             `bson:"ipAddress" json:"ipAddress"`
	Hostname     string             `bson:"hostname,omitempty" json:"hostname,omitempty"`
	FirstSeen    primitive.DateTime `bson:"firstSeen" json:"firstSeen"`
	LastSeen     primitive.DateTime `bson:"lastSeen" json:"lastSeen"`
	TotalQueries uint64             `bson:"totalQueries" json:"totalQueries"`
	CreatedAt    primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt    primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}

type DNSQualityMetric struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	RouterID            primitive.ObjectID `bson:"routerId,omitempty" json:"routerId,omitempty"`
	RouterIP            string             `bson:"routerIp" json:"routerIp"`
	DNSServerID         primitive.ObjectID `bson:"dnsServerId" json:"dnsServerId"`
	DNSServerIP         string             `bson:"dnsServerIp" json:"dnsServerIp"`
	Timestamp           primitive.DateTime `bson:"timestamp" json:"timestamp"`
	TotalQueries        uint64             `bson:"totalQueries" json:"totalQueries"`
	TotalResponses      uint64             `bson:"totalResponses" json:"totalResponses"`
	AvgResponseTime     float64            `bson:"avgResponseTime" json:"avgResponseTime"`
	MinResponseTime     uint64             `bson:"minResponseTime" json:"minResponseTime"`
	MaxResponseTime     uint64             `bson:"maxResponseTime" json:"maxResponseTime"`
	TotalResponseTime   uint64             `bson:"totalResponseTime" json:"totalResponseTime"`
	QueryBytes          uint64             `bson:"queryBytes" json:"queryBytes"`
	ResponseBytes       uint64             `bson:"responseBytes" json:"responseBytes"`
	TotalBytes          uint64             `bson:"totalBytes" json:"totalBytes"`
	TimeoutCount        uint64             `bson:"timeoutCount" json:"timeoutCount"`
	TimeoutPercentage   float64            `bson:"timeoutPercentage" json:"timeoutPercentage"`
	SuccessRate         float64            `bson:"successRate" json:"successRate"`
	ResponsesUnder50ms  uint64             `bson:"responsesUnder50ms" json:"responsesUnder50ms"`
	Responses50to100ms  uint64             `bson:"responses50to100ms" json:"responses50to100ms"`
	Responses100to500ms uint64             `bson:"responses100to500ms" json:"responses100to500ms"`
	ResponsesOver500ms  uint64             `bson:"responsesOver500ms" json:"responsesOver500ms"`
	CreatedAt           primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt           primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}

type DNSQualityMetricProcessor struct {
	metricsCollection *mongo.Collection
	serversCollection *mongo.Collection
}

type DNSStats struct {
	ServerIP           string
	QueryCount         uint64
	ResponseCount      uint64
	QueryBytes         uint64
	ResponseBytes      uint64
	TotalResponseTime  uint64
	ResponseTimeCount  uint64
	MinResponse        uint64
	MaxResponse        uint64
	Under50ms          uint64
	Between50And100ms  uint64
	Between100And500ms uint64
	Over500ms          uint64
}

type DNSFlow struct {
	ServerIP  string
	ClientIP  string
	Timestamp uint64
	IsQuery   bool
}

func NewDNSQualityMetricProcessor() *DNSQualityMetricProcessor {
	ctx := netflow.GetMetricContext()
	if ctx == nil || ctx.DB == nil {
		log.Printf("[DNSQualityMetric] Aviso: MetricContext não inicializado")
		return &DNSQualityMetricProcessor{}
	}

	processor := &DNSQualityMetricProcessor{
		metricsCollection: ctx.DB.Collection("dns_quality_metrics"),
		serversCollection: ctx.DB.Collection("dns_servers"),
	}

	processor.createIndexes()

	return processor
}

func (p *DNSQualityMetricProcessor) createIndexes() {
	if p.serversCollection == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "ipAddress", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	p.serversCollection.Indexes().CreateOne(ctx, indexModel)

	if p.metricsCollection != nil {
		indexModel = mongo.IndexModel{
			Keys: bson.D{
				{Key: "dnsServerIp", Value: 1},
				{Key: "timestamp", Value: -1},
			},
		}
		p.metricsCollection.Indexes().CreateOne(ctx, indexModel)
	}
}

func (p *DNSQualityMetricProcessor) Name() string {
	return "dns_quality_analyzer"
}

func (p *DNSQualityMetricProcessor) Process(router *models.Roteador, decoded *netflow.DecodedIPFIXMessage) error {
	if len(decoded.FlowRecords) == 0 {
		return nil
	}

	dnsServerStats := make(map[string]*DNSStats)
	var dnsFlows []DNSFlow

	for _, record := range decoded.FlowRecords {
		isDNSQuery := record.DestinationTransportPort == 53 && record.ProtocolIdentifier == 17
		isDNSResponse := record.SourceTransportPort == 53 && record.ProtocolIdentifier == 17

		if !isDNSQuery && !isDNSResponse {
			continue
		}

		var dnsServerIP, clientIP string
		var timestamp uint64

		if isDNSQuery {
			dnsServerIP = record.DestinationIPv4Address
			if dnsServerIP == "" {
				dnsServerIP = record.DestinationIPv6Address
			}
			clientIP = record.SourceIPv4Address
			if clientIP == "" {
				clientIP = record.SourceIPv6Address
			}

			if postNATSrc, ok := record.RawFields["postNATSourceIPv4Address"]; ok {
				if srcIP, ok := postNATSrc.(string); ok && srcIP != "" {
					clientIP = srcIP
				}
			}

			timestamp = record.FlowStartMilliseconds
			if timestamp == 0 {
				timestamp = p.calculateAbsoluteTime(record.RawFields, "flowStartSysUpTime", "systemInitTimeMilliseconds")
			}
		} else {
			dnsServerIP = record.SourceIPv4Address
			if dnsServerIP == "" {
				dnsServerIP = record.SourceIPv6Address
			}
			clientIP = record.DestinationIPv4Address
			if clientIP == "" {
				clientIP = record.DestinationIPv6Address
			}

			if postNATDest, ok := record.RawFields["postNATDestinationIPv4Address"]; ok {
				if destIP, ok := postNATDest.(string); ok && destIP != "" {
					clientIP = destIP
				}
			}

			timestamp = record.FlowEndMilliseconds
			if timestamp == 0 {
				timestamp = p.calculateAbsoluteTime(record.RawFields, "flowEndSysUpTime", "systemInitTimeMilliseconds")
			}
		}

		if dnsServerIP == "" {
			continue
		}

		if _, exists := dnsServerStats[dnsServerIP]; !exists {
			dnsServerStats[dnsServerIP] = &DNSStats{
				ServerIP:    dnsServerIP,
				MinResponse: ^uint64(0),
			}
		}

		stats := dnsServerStats[dnsServerIP]

		if isDNSQuery {
			stats.QueryCount++
			stats.QueryBytes += record.OctetDeltaCount
		} else {
			stats.ResponseCount++
			stats.ResponseBytes += record.OctetDeltaCount
		}

		// log.Printf("[DNSQualityMetric DEBUG] Flow DNS detectado - Type: %s, DNS: %s, Client: %s",
		// 	map[bool]string{true: "QUERY", false: "RESPONSE"}[isDNSQuery], dnsServerIP, clientIP)
		// log.Printf("[DNSQualityMetric DEBUG]   FlowStartMilliseconds: %d", record.FlowStartMilliseconds)
		// log.Printf("[DNSQualityMetric DEBUG]   FlowEndMilliseconds: %d", record.FlowEndMilliseconds)
		// log.Printf("[DNSQualityMetric DEBUG]   RawFields: %+v", record.RawFields)

		// if timestamp > 0 && clientIP != "" {
		// 	flowType := "QUERY"
		// 	if !isDNSQuery {
		// 		flowType = "RESPONSE"
		// 	}
		// 	log.Printf("[DNSQualityMetric DEBUG] %s - DNS: %s, Client: %s, Timestamp: %d, FlowStart: %d, FlowEnd: %d",
		// 		flowType, dnsServerIP, clientIP, timestamp, record.FlowStartMilliseconds, record.FlowEndMilliseconds)
		// }

		if timestamp > 0 && clientIP != "" {
			dnsFlows = append(dnsFlows, DNSFlow{
				ServerIP:  dnsServerIP,
				ClientIP:  clientIP,
				Timestamp: timestamp,
				IsQuery:   isDNSQuery,
			})
		}
	}

	//log.Printf("[DNSQualityMetric DEBUG] Total de flows DNS coletados: %d", len(dnsFlows))

	if len(dnsServerStats) == 0 {
		return nil
	}

	// for _, stats := range dnsServerStats {
	// 	log.Printf("[DNSQualityMetric DEBUG] Stats para %s - ResponseTimeCount: %d, TotalResponseTime: %d, Under50ms: %d",
	// 		stats.ServerIP, stats.ResponseTimeCount, stats.TotalResponseTime, stats.Under50ms)

	// 	dnsServerID, err := p.ensureDNSServer(stats.ServerIP)
	// 	if err != nil {
	// 		log.Printf("[DNSQualityMetric] Erro ao registrar servidor DNS %s: %v", stats.ServerIP, err)
	// 		continue
	// 	}

	// 	if err := p.saveMetrics(router, decoded.SrcIP, dnsServerID, stats); err != nil {
	// 		log.Printf("[DNSQualityMetric] Erro ao salvar métricas para DNS %s: %v", stats.ServerIP, err)
	// 	}
	// }

	return nil
}

func (p *DNSQualityMetricProcessor) calculateAbsoluteTime(rawFields map[string]interface{}, sysUpTimeField, systemInitField string) uint64 {
	systemInitTime := uint64(0)
	if val, ok := rawFields[systemInitField]; ok {
		switch v := val.(type) {
		case uint64:
			systemInitTime = v
		case float64:
			systemInitTime = uint64(v)
		}
	}

	sysUpTime := uint64(0)
	if val, ok := rawFields[sysUpTimeField]; ok {
		switch v := val.(type) {
		case uint64:
			sysUpTime = v
		case float64:
			sysUpTime = uint64(v)
		}
	}

	if systemInitTime > 0 && sysUpTime > 0 {
		absoluteTime := systemInitTime + sysUpTime
		// log.Printf("[DNSQualityMetric DEBUG] Timestamp calculado: systemInit=%d + sysUpTime=%d = %d",
		// 	systemInitTime, sysUpTime, absoluteTime)
		return absoluteTime
	}

	return 0
}

func (p *DNSQualityMetricProcessor) ensureDNSServer(ipAddress string) (primitive.ObjectID, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := primitive.NewDateTimeFromTime(time.Now())

	filter := bson.M{"ipAddress": ipAddress}
	update := bson.M{
		"$set": bson.M{
			"lastSeen":  now,
			"updatedAt": now,
		},
		"$setOnInsert": bson.M{
			"ipAddress": ipAddress,
			"firstSeen": now,
			"createdAt": now,
		},
		"$inc": bson.M{
			"totalQueries": 1,
		},
	}

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	var server DNSServer
	err := p.serversCollection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&server)
	if err != nil {
		return primitive.NilObjectID, err
	}

	return server.ID, nil
}

func (p *DNSQualityMetricProcessor) saveMetrics(router *models.Roteador, routerIP string,
	dnsServerID primitive.ObjectID, stats *DNSStats) error {

	now := time.Now()
	timestampMinute := now.Truncate(5 * time.Minute)
	nowDateTime := primitive.NewDateTimeFromTime(now)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"routerIp":    routerIP,
		"dnsServerIp": stats.ServerIP,
		"timestamp":   primitive.NewDateTimeFromTime(timestampMinute),
	}

	timeout := uint64(0)
	if stats.QueryCount > stats.ResponseCount {
		timeout = stats.QueryCount - stats.ResponseCount
	}

	update := bson.M{
		"$inc": bson.M{
			"totalQueries":        stats.QueryCount,
			"totalResponses":      stats.ResponseCount,
			"queryBytes":          stats.QueryBytes,
			"responseBytes":       stats.ResponseBytes,
			"totalBytes":          stats.QueryBytes + stats.ResponseBytes,
			"totalResponseTime":   stats.TotalResponseTime,
			"responsesUnder50ms":  stats.Under50ms,
			"responses50to100ms":  stats.Between50And100ms,
			"responses100to500ms": stats.Between100And500ms,
			"responsesOver500ms":  stats.Over500ms,
		},
		"$set": bson.M{
			"updatedAt":    nowDateTime,
			"timeoutCount": timeout,
		},
		"$setOnInsert": bson.M{
			"routerIp":    routerIP,
			"dnsServerIp": stats.ServerIP,
			"dnsServerId": dnsServerID,
			"timestamp":   primitive.NewDateTimeFromTime(timestampMinute),
			"createdAt":   nowDateTime,
		},
	}

	if stats.MinResponse != ^uint64(0) {
		update["$min"] = bson.M{"minResponseTime": stats.MinResponse}
	}
	if stats.MaxResponse > 0 {
		update["$max"] = bson.M{"maxResponseTime": stats.MaxResponse}
	}

	if router != nil {
		update["$setOnInsert"].(bson.M)["routerId"] = router.ID
	}

	opts := options.Update().SetUpsert(true)
	result, err := p.metricsCollection.UpdateOne(ctx, filter, update, opts)

	if err != nil {
		return err
	}

	if result.ModifiedCount > 0 || result.UpsertedCount > 0 {
		p.updateQualityMetrics(ctx, filter)
	}

	return nil
}

func (p *DNSQualityMetricProcessor) updateQualityMetrics(ctx context.Context, filter bson.M) {
	var metric DNSQualityMetric
	err := p.metricsCollection.FindOne(ctx, filter).Decode(&metric)
	if err != nil {
		return
	}

	var avgResponseTime float64
	totalResponses := metric.ResponsesUnder50ms + metric.Responses50to100ms +
		metric.Responses100to500ms + metric.ResponsesOver500ms

	if totalResponses > 0 {
		avgResponseTime = float64(metric.TotalResponseTime) / float64(totalResponses)
	}

	var successRate float64
	if metric.TotalQueries > 0 {
		successRate = float64(metric.TotalResponses) / float64(metric.TotalQueries) * 100
	}

	var timeoutPercentage float64
	if metric.TotalQueries > 0 {
		timeoutPercentage = float64(metric.TimeoutCount) / float64(metric.TotalQueries) * 100
	}

	update := bson.M{
		"$set": bson.M{
			"avgResponseTime":   avgResponseTime,
			"successRate":       successRate,
			"timeoutPercentage": timeoutPercentage,
		},
	}

	p.metricsCollection.UpdateOne(ctx, filter, update)
}
