package netflow

import (
	"encoding/json"
	"log"
	models "net_monitor/models"
)

type MikrotikMetricService struct{}

func NewMikrotikMetricService() *MikrotikMetricService {
	return &MikrotikMetricService{}
}

func (m *MikrotikMetricService) Process(router *models.Roteador, decoded *DecodedIPFIXMessage) error {
	if router != nil {
		log.Printf("[MikrotikMetricService] Processando IPFIX do roteador %s (%s). Seq=%d ObsDomain=%d FlowRecords=%d",
			router.Name, router.IPAddress, decoded.Header.SequenceNumber, decoded.Header.ObservationDomain, len(decoded.FlowRecords))
	} else {
		log.Printf("[MikrotikMetricService] Processando IPFIX de roteador desconhecido. ObsDomain=%d FlowRecords=%d",
			decoded.Header.ObservationDomain, len(decoded.FlowRecords))
	}

	for idx, record := range decoded.FlowRecords {
		log.Printf("────────────────────────────────────────────────────────────")
		log.Printf("[MikrotikMetricService] Flow %d completo:", idx)

		jsonData, err := json.MarshalIndent(record, "  ", "  ")
		if err != nil {
			log.Printf("Erro ao serializar record: %v", err)
			continue
		}

		log.Printf("  %s", jsonData)

		srcIP := record.SourceIPv4Address
		if srcIP == "" {
			srcIP = record.SourceIPv6Address
		}
		dstIP := record.DestinationIPv4Address
		if dstIP == "" {
			dstIP = record.DestinationIPv6Address
		}

		log.Printf("Resumo: Src %s:%d → Dst %s:%d | Proto=%d | Bytes=%d | Packets=%d",
			srcIP,
			record.SourceTransportPort,
			dstIP,
			record.DestinationTransportPort,
			record.ProtocolIdentifier,
			record.OctetDeltaCount,
			record.PacketDeltaCount)
	}

	return nil
}
