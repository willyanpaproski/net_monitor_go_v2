package netflow

import (
	"encoding/json"
	"log"
)

func StartDecoderWorkers(rawRabbit *RabbitMQ, decodedRabbit *RabbitMQ, workerCount int) error {
	deliveries, err := rawRabbit.Consume()
	if err != nil {
		return err
	}

	cache := NewTemplateCache()

	for i := 0; i < workerCount; i++ {
		go func(workerId int) {
			log.Printf("Decoder worker %d iniciado", workerId)
			for d := range deliveries {
				var pm PacketMessage
				if err := json.Unmarshal(d.Body, &pm); err != nil {
					log.Printf("decoder worker %d erro unmarshal msg: %v", workerId, err)
					d.Nack(false, false)
					continue
				}

				ipfix, err := ParseIPFIX(pm.Raw)
				if err != nil {
					log.Printf("decoder worker %d parse IPFIX falhou: %v", workerId, err)
					d.Ack(false)
					continue
				}

				decoded := DecodeIPFIX(ipfix, cache)
				decoded.SrcIP = pm.SrcIP
				decoded.SrcPort = pm.SrcPort
				decoded.Received = pm.Received

				if err := decodedRabbit.PublishDecodedIPFIX(*decoded); err != nil {
					log.Printf("decoder worker %d erro publicando IPFIX decodificado: %v", workerId, err)
					d.Nack(false, true)
					continue
				}

				d.Ack(false)
			}
		}(i)
	}

	return nil
}
