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

type InterfaceMetric struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	RouterID        primitive.ObjectID `bson:"routerId" json:"routerId"`
	RouterIP        string             `bson:"routerIp" json:"routerIp"`
	InterfaceID     uint32             `bson:"interfaceId" json:"interfaceId"`
	InterfaceType   string             `bson:"interfaceType" json:"interfaceType"`
	Timestamp       primitive.DateTime `bson:"timestamp" json:"timestamp"`
	TotalBytes      uint64             `bson:"totalBytes" json:"totalBytes"`
	TotalPackets    uint64             `bson:"totalPackets" json:"totalPackets"`
	TotalFlows      uint64             `bson:"totalFlows" json:"totalFlows"`
	UniqueSourceIPs int                `bson:"uniqueSourceIps" json:"uniqueSourceIps"`
	UniqueDestIPs   int                `bson:"uniqueDestIps" json:"uniqueDestIps"`
	CreatedAt       primitive.DateTime `bson:"createdAt" json:"createdAt"`
}

type InterfaceMetricProcessor struct {
	collection *mongo.Collection
}

type interfaceKey struct {
	id            uint32
	interfaceType string
}

type interfaceStats struct {
	bytes     uint64
	packets   uint64
	flows     uint64
	sourceIPs map[string]bool
	destIPs   map[string]bool
}

func NewInterfaceMetricProcessor() *InterfaceMetricProcessor {
	ctx := netflow.GetMetricContext()
	if ctx == nil || ctx.DB == nil {
		log.Printf("[InterfaceMetric] Aviso: MetricContext não inicializado")
		return &InterfaceMetricProcessor{}
	}

	return &InterfaceMetricProcessor{
		collection: ctx.DB.Collection("interface_metrics"),
	}
}

func (i *InterfaceMetricProcessor) Name() string {
	return "interface_analyzer"
}

func (i *InterfaceMetricProcessor) Process(router *models.Roteador, decoded *netflow.DecodedIPFIXMessage) error {
	if len(decoded.FlowRecords) == 0 {
		return nil
	}

	interfaceData := make(map[interfaceKey]*interfaceStats)

	for _, record := range decoded.FlowRecords {
		if record.IngressInterface > 0 {
			key := interfaceKey{
				id:            record.IngressInterface,
				interfaceType: "ingress",
			}

			if interfaceData[key] == nil {
				interfaceData[key] = &interfaceStats{
					sourceIPs: make(map[string]bool),
					destIPs:   make(map[string]bool),
				}
			}

			stats := interfaceData[key]
			stats.bytes += record.OctetDeltaCount
			stats.packets += record.PacketDeltaCount
			stats.flows++

			srcIP := record.SourceIPv4Address
			if srcIP == "" {
				srcIP = record.SourceIPv6Address
			}
			if srcIP != "" {
				stats.sourceIPs[srcIP] = true
			}

			dstIP := record.DestinationIPv4Address
			if dstIP == "" {
				dstIP = record.DestinationIPv6Address
			}
			if dstIP != "" {
				stats.destIPs[dstIP] = true
			}
		}

		if record.EgressInterface > 0 {
			key := interfaceKey{
				id:            record.EgressInterface,
				interfaceType: "egress",
			}

			if interfaceData[key] == nil {
				interfaceData[key] = &interfaceStats{
					sourceIPs: make(map[string]bool),
					destIPs:   make(map[string]bool),
				}
			}

			stats := interfaceData[key]
			stats.bytes += record.OctetDeltaCount
			stats.packets += record.PacketDeltaCount
			stats.flows++

			srcIP := record.SourceIPv4Address
			if srcIP == "" {
				srcIP = record.SourceIPv6Address
			}
			if srcIP != "" {
				stats.sourceIPs[srcIP] = true
			}

			dstIP := record.DestinationIPv4Address
			if dstIP == "" {
				dstIP = record.DestinationIPv6Address
			}
			if dstIP != "" {
				stats.destIPs[dstIP] = true
			}
		}
	}

	if i.collection == nil {
		log.Printf("[InterfaceMetric] Collection não disponível, pulando persistência")
		return i.logInterfaceStats(router, decoded.SrcIP, interfaceData)
	}

	now := primitive.NewDateTimeFromTime(time.Now())

	for key, stats := range interfaceData {
		metric := InterfaceMetric{
			InterfaceID:     key.id,
			InterfaceType:   key.interfaceType,
			Timestamp:       now,
			TotalBytes:      stats.bytes,
			TotalPackets:    stats.packets,
			TotalFlows:      stats.flows,
			UniqueSourceIPs: len(stats.sourceIPs),
			UniqueDestIPs:   len(stats.destIPs),
			RouterIP:        decoded.SrcIP,
			CreatedAt:       now,
		}

		if router != nil {
			metric.RouterID = router.ID
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		filter := bson.M{
			"routerIp":      decoded.SrcIP,
			"interfaceId":   key.id,
			"interfaceType": key.interfaceType,
			"timestamp": bson.M{
				"$gte": primitive.NewDateTimeFromTime(time.Now().Truncate(time.Minute)),
			},
		}

		update := bson.M{
			"$inc": bson.M{
				"totalBytes":   stats.bytes,
				"totalPackets": stats.packets,
				"totalFlows":   stats.flows,
			},
			"$set": bson.M{
				"uniqueSourceIps": len(stats.sourceIPs),
				"uniqueDestIps":   len(stats.destIPs),
			},
			"$setOnInsert": bson.M{
				"routerId":      metric.RouterID,
				"routerIp":      metric.RouterIP,
				"interfaceId":   metric.InterfaceID,
				"interfaceType": metric.InterfaceType,
				"timestamp":     metric.Timestamp,
				"createdAt":     metric.CreatedAt,
			},
		}

		opts := options.Update().SetUpsert(true)
		_, err := i.collection.UpdateOne(ctx, filter, update, opts)
		cancel()

		if err != nil {
			log.Printf("[InterfaceMetric] Erro ao salvar métrica: %v", err)
		}
	}

	return i.logInterfaceStats(router, decoded.SrcIP, interfaceData)
}

func (i *InterfaceMetricProcessor) logInterfaceStats(router *models.Roteador, srcIP string, stats map[interfaceKey]*interfaceStats) error {
	routerName := "Desconhecido"
	if router != nil {
		routerName = router.Name
	}

	log.Printf("════════════════════════════════════════════════════════════")
	log.Printf("[InterfaceMetric] Análise de Interfaces - Router: %s (%s)", routerName, srcIP)
	log.Printf("────────────────────────────────────────────────────────────")

	for key, stat := range stats {
		log.Printf("  Interface %d (%s):", key.id, key.interfaceType)
		log.Printf("    Flows:         %d", stat.flows)
		log.Printf("    Bytes:         %d (%.2f MB)", stat.bytes, float64(stat.bytes)/(1024*1024))
		log.Printf("    Pacotes:       %d", stat.packets)
		log.Printf("    IPs Origem:    %d únicos", len(stat.sourceIPs))
		log.Printf("    IPs Destino:   %d únicos", len(stat.destIPs))
		log.Printf("  ────────────────────────────────────────────────────────")
	}

	log.Printf("════════════════════════════════════════════════════════════\n")
	return nil
}
