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

type IPVersionMetric struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	RouterID       primitive.ObjectID `bson:"routerId,omitempty" json:"routerId,omitempty"`
	RouterIP       string             `bson:"routerIp" json:"routerIp"`
	Timestamp      primitive.DateTime `bson:"timestamp" json:"timestamp"`
	IPv4FlowCount  uint64             `bson:"ipv4FlowCount" json:"ipv4FlowCount"`
	IPv6FlowCount  uint64             `bson:"ipv6FlowCount" json:"ipv6FlowCount"`
	IPv4Bytes      uint64             `bson:"ipv4Bytes" json:"ipv4Bytes"`
	IPv6Bytes      uint64             `bson:"ipv6Bytes" json:"ipv6Bytes"`
	IPv4Packets    uint64             `bson:"ipv4Packets" json:"ipv4Packets"`
	IPv6Packets    uint64             `bson:"ipv6Packets" json:"ipv6Packets"`
	IPv4Percentage float64            `bson:"ipv4Percentage" json:"ipv4Percentage"`
	IPv6Percentage float64            `bson:"ipv6Percentage" json:"ipv6Percentage"`
	CreatedAt      primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt      primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}

type IPVersionMetricProcessor struct {
	collection *mongo.Collection
}

func NewIPVersionMetricProcessor() *IPVersionMetricProcessor {
	ctx := netflow.GetMetricContext()
	if ctx == nil || ctx.DB == nil {
		log.Printf("[IPVersionMetric] Aviso: MetricContext não inicializado")
		return &IPVersionMetricProcessor{}
	}

	return &IPVersionMetricProcessor{
		collection: ctx.DB.Collection("ip_version_metrics"),
	}
}

func (p *IPVersionMetricProcessor) Name() string {
	return "ip_version_analyzer"
}

func (p *IPVersionMetricProcessor) Process(router *models.Roteador, decoded *netflow.DecodedIPFIXMessage) error {
	if len(decoded.FlowRecords) == 0 {
		return nil
	}

	var ipv4Count, ipv6Count uint64
	var ipv4Bytes, ipv6Bytes uint64
	var ipv4Packets, ipv6Packets uint64

	for _, record := range decoded.FlowRecords {
		isIPv4 := record.SourceIPv4Address != "" && record.DestinationIPv4Address != ""
		isIPv6 := record.SourceIPv6Address != "" && record.DestinationIPv6Address != ""

		if isIPv4 {
			ipv4Count++
			ipv4Bytes += record.OctetDeltaCount
			ipv4Packets += record.PacketDeltaCount
		} else if isIPv6 {
			ipv6Count++
			ipv6Bytes += record.OctetDeltaCount
			ipv6Packets += record.PacketDeltaCount
		}
	}

	if ipv4Count == 0 && ipv6Count == 0 {
		return nil
	}

	if p.collection == nil {
		return p.logIPVersionStats(router, decoded.SrcIP, ipv4Count, ipv6Count, ipv4Bytes, ipv6Bytes)
	}

	now := time.Now()
	timestampMinute := now.Truncate(5 * time.Minute)
	nowDateTime := primitive.NewDateTimeFromTime(now)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"routerIp":  decoded.SrcIP,
		"timestamp": primitive.NewDateTimeFromTime(timestampMinute),
	}

	update := bson.M{
		"$inc": bson.M{
			"ipv4FlowCount": ipv4Count,
			"ipv6FlowCount": ipv6Count,
			"ipv4Bytes":     ipv4Bytes,
			"ipv6Bytes":     ipv6Bytes,
			"ipv4Packets":   ipv4Packets,
			"ipv6Packets":   ipv6Packets,
		},
		"$set": bson.M{
			"updatedAt": nowDateTime,
		},
		"$setOnInsert": bson.M{
			"routerIp":  decoded.SrcIP,
			"timestamp": primitive.NewDateTimeFromTime(timestampMinute),
			"createdAt": nowDateTime,
		},
	}

	if router != nil {
		update["$setOnInsert"].(bson.M)["routerId"] = router.ID
	}

	opts := options.Update().SetUpsert(true)
	result, err := p.collection.UpdateOne(ctx, filter, update, opts)

	if err != nil {
		log.Printf("[IPVersionMetric] Erro ao salvar métrica: %v", err)
		return err
	}

	if result.ModifiedCount > 0 || result.UpsertedCount > 0 {
		p.updatePercentages(ctx, filter)
	}

	return nil
}

func (p *IPVersionMetricProcessor) updatePercentages(ctx context.Context, filter bson.M) {
	var metric IPVersionMetric
	err := p.collection.FindOne(ctx, filter).Decode(&metric)
	if err != nil {
		return
	}

	totalFlows := metric.IPv4FlowCount + metric.IPv6FlowCount
	if totalFlows == 0 {
		return
	}

	ipv4Pct := float64(metric.IPv4FlowCount) / float64(totalFlows) * 100
	ipv6Pct := float64(metric.IPv6FlowCount) / float64(totalFlows) * 100

	update := bson.M{
		"$set": bson.M{
			"ipv4Percentage": ipv4Pct,
			"ipv6Percentage": ipv6Pct,
		},
	}

	p.collection.UpdateOne(ctx, filter, update)
}

func (p *IPVersionMetricProcessor) logIPVersionStats(router *models.Roteador, srcIP string, ipv4Count, ipv6Count, ipv4Bytes, ipv6Bytes uint64) error {
	routerName := "Desconhecido"
	if router != nil {
		routerName = router.Name
	}

	totalFlows := ipv4Count + ipv6Count
	if totalFlows == 0 {
		return nil
	}

	ipv4Pct := float64(ipv4Count) / float64(totalFlows) * 100
	ipv6Pct := float64(ipv6Count) / float64(totalFlows) * 100

	log.Printf("════════════════════════════════════════════════════════════")
	log.Printf("[IPVersionMetric] Uso de IPv4 vs IPv6 - Router: %s (%s)", routerName, srcIP)
	log.Printf("────────────────────────────────────────────────────────────")
	log.Printf("  IPv4:")
	log.Printf("    Flows:      %d (%.2f%%)", ipv4Count, ipv4Pct)
	log.Printf("    Bytes:      %d (%.2f MB)", ipv4Bytes, float64(ipv4Bytes)/(1024*1024))
	log.Printf("  IPv6:")
	log.Printf("    Flows:      %d (%.2f%%)", ipv6Count, ipv6Pct)
	log.Printf("    Bytes:      %d (%.2f MB)", ipv6Bytes, float64(ipv6Bytes)/(1024*1024))
	log.Printf("════════════════════════════════════════════════════════════\n")

	return nil
}
