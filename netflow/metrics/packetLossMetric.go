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

type PacketLossMetric struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	RouterID             primitive.ObjectID `bson:"routerId,omitempty" json:"routerId,omitempty"`
	RouterIP             string             `bson:"routerIp" json:"routerIp"`
	Timestamp            primitive.DateTime `bson:"timestamp" json:"timestamp"`
	DroppedPackets       uint64             `bson:"droppedPackets" json:"droppedPackets"`
	DroppedOctets        uint64             `bson:"droppedOctets" json:"droppedOctets"`
	TotalPacketsReceived uint64             `bson:"totalPacketsReceived" json:"totalPacketsReceived"`
	TotalOctetsReceived  uint64             `bson:"totalOctetsReceived" json:"totalOctetsReceived"`
	PacketLossPercentage float64            `bson:"packetLossPercentage" json:"packetLossPercentage"`
	CreatedAt            primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt            primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}

type PacketLossMetricProcessor struct {
	collection *mongo.Collection
}

func NewPacketLossMetricProcessor() *PacketLossMetricProcessor {
	ctx := netflow.GetMetricContext()
	if ctx == nil || ctx.DB == nil {
		log.Printf("[PacketLossMetric] Aviso: MetricContext não inicializado")
		return &PacketLossMetricProcessor{}
	}

	processor := &PacketLossMetricProcessor{
		collection: ctx.DB.Collection("packet_loss_metrics"),
	}

	return processor
}

func (p *PacketLossMetricProcessor) Name() string {
	return "packet_loss_analyzer"
}

func (p *PacketLossMetricProcessor) Process(router *models.Roteador, decoded *netflow.DecodedIPFIXMessage) error {
	if len(decoded.FlowRecords) == 0 {
		return nil
	}

	var droppedPackets, droppedOctets uint64
	var totalPackets, totalOctets uint64

	for _, record := range decoded.FlowRecords {
		totalPackets += record.PacketDeltaCount
		totalOctets += record.OctetDeltaCount

		if val, ok := record.RawFields["droppedPacketDeltaCount"]; ok {
			if v, ok := val.(uint64); ok {
				droppedPackets += v
			}
		}
		if val, ok := record.RawFields["droppedOctetDeltaCount"]; ok {
			if v, ok := val.(uint64); ok {
				droppedOctets += v
			}
		}
	}

	if droppedPackets == 0 && droppedOctets == 0 {
		return nil
	}

	if p.collection == nil {
		return p.logPacketLossStats(router, decoded.SrcIP, droppedPackets, droppedOctets, totalPackets, totalOctets)
	}

	return p.saveMetrics(router, decoded.SrcIP, droppedPackets, droppedOctets, totalPackets, totalOctets)
}

func (p *PacketLossMetricProcessor) saveMetrics(router *models.Roteador, srcIP string,
	droppedPackets, droppedOctets, totalPackets, totalOctets uint64) error {

	now := time.Now()
	timestampMinute := now.Truncate(5 * time.Minute)
	nowDateTime := primitive.NewDateTimeFromTime(now)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"routerIp":  srcIP,
		"timestamp": primitive.NewDateTimeFromTime(timestampMinute),
	}

	update := bson.M{
		"$inc": bson.M{
			"droppedPackets":       droppedPackets,
			"droppedOctets":        droppedOctets,
			"totalPacketsReceived": totalPackets,
			"totalOctetsReceived":  totalOctets,
		},
		"$set": bson.M{
			"updatedAt": nowDateTime,
		},
		"$setOnInsert": bson.M{
			"routerIp":  srcIP,
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
		log.Printf("[PacketLossMetric] Erro ao salvar métrica: %v", err)
		return err
	}

	if result.ModifiedCount > 0 || result.UpsertedCount > 0 {
		p.updateLossPercentages(ctx, filter)
	}

	return nil
}

func (p *PacketLossMetricProcessor) updateLossPercentages(ctx context.Context, filter bson.M) {
	var metric PacketLossMetric
	err := p.collection.FindOne(ctx, filter).Decode(&metric)
	if err != nil {
		return
	}

	var packetLossPct float64
	totalExpectedPackets := metric.TotalPacketsReceived + metric.DroppedPackets
	if totalExpectedPackets > 0 {
		packetLossPct = float64(metric.DroppedPackets) / float64(totalExpectedPackets) * 100
	}

	update := bson.M{
		"$set": bson.M{
			"packetLossPercentage": packetLossPct,
		},
	}

	p.collection.UpdateOne(ctx, filter, update)
}

func (p *PacketLossMetricProcessor) logPacketLossStats(router *models.Roteador, srcIP string,
	droppedPackets, droppedOctets, totalPackets, totalOctets uint64) error {

	routerName := "Desconhecido"
	if router != nil {
		routerName = router.Name
	}

	log.Printf("════════════════════════════════════════════════════════════")
	log.Printf("[PacketLossMetric] Perda de Pacotes na Rede - Router: %s (%s)", routerName, srcIP)
	log.Printf("────────────────────────────────────────────────────────────")
	log.Printf("  Pacotes perdidos:    %d", droppedPackets)
	log.Printf("  Bytes perdidos:      %d (%.2f MB)", droppedOctets, float64(droppedOctets)/(1024*1024))

	totalExpectedPackets := totalPackets + droppedPackets
	if totalExpectedPackets > 0 {
		lossPct := float64(droppedPackets) / float64(totalExpectedPackets) * 100
		log.Printf("  Taxa de perda:       %.4f%%", lossPct)
	}

	log.Printf("  Total processado:    %d pacotes (%.2f MB)",
		totalPackets, float64(totalOctets)/(1024*1024))
	log.Printf("════════════════════════════════════════════════════════════\n")

	return nil
}
