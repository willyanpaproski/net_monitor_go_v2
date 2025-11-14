package netflow

import (
	"encoding/json"
	"log"
	models "net_monitor/models"
	repository "net_monitor/repository"

	"go.mongodb.org/mongo-driver/bson"
)

func StartMetricWorkers(decodedRabbit *RabbitMQ, routerRepo repository.MongoRepository[models.Roteador], workerCount int) error {
	deliveries, err := decodedRabbit.Consume()
	if err != nil {
		return err
	}

	processors := GetMetricProcessors()
	if len(processors) == 0 {
		log.Printf("AVISO: Nenhum processador de métrica registrado!")
	} else {
		//log.Printf("Processadores de métricas registrados:")
		for _, p := range processors {
			log.Printf("  - %s", p.Name())
		}
	}

	for i := 0; i < workerCount; i++ {
		go func(workerId int) {
			//log.Printf("Metric worker %d iniciado com %d processadores", workerId, len(processors))

			for d := range deliveries {
				var dm DecodedIPFIXMessage
				if err := json.Unmarshal(d.Body, &dm); err != nil {
					//log.Printf("metric worker %d erro unmarshal msg: %v", workerId, err)
					d.Nack(false, false)
					continue
				}

				var roteador *models.Roteador
				routers, err := routerRepo.GetByFilter(bson.M{"ipAddress": dm.SrcIP})
				if err != nil {
					//log.Printf("metric worker %d erro buscando roteador: %v", workerId, err)
				}

				if len(routers) > 0 {
					roteador = &routers[0]
					// log.Printf("metric worker %d roteador encontrado: %s (%s) - %d flows",
					// 	workerId, roteador.Name, roteador.IPAddress, len(dm.FlowRecords))
				} else {
					roteador = nil
					// log.Printf("metric worker %d nenhum roteador encontrado para IP %s - %d flows",
					// 	workerId, dm.SrcIP, len(dm.FlowRecords))
				}

				hasError := false
				for _, processor := range processors {
					if err := processor.Process(roteador, &dm); err != nil {
						// log.Printf("metric worker %d erro no processador '%s': %v",
						// 	workerId, processor.Name(), err)
						hasError = true
					}
				}

				if hasError {
					d.Nack(false, true)
				} else {
					d.Ack(false)
				}
			}
		}(i)
	}

	return nil
}
