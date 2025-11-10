package Seeders

import (
	"fmt"
	"log"
	"math/rand"
	models "net_monitor/models"
	repository "net_monitor/repository"
	services "net_monitor/services"
	"time"
)

func RoteadorSeeder(
	repo *repository.MongoRepository[models.Roteador],
	roteadorService services.RoteadorService,
) {
	integracoes := []models.RoteadorIntegracaoType{models.RoteadorMikrotik, models.RoteadorCisco, models.RoteadorJuniper}

	log.Printf("Roteador seeder initializated: %v", time.Now())

	for i := 1; i <= 50; i++ {
		randomNum := rand.Intn(3)

		roteador := &models.Roteador{
			Active:         true,
			Integration:    integracoes[randomNum],
			Name:           fmt.Sprintf("Roteador-%d", i),
			Description:    fmt.Sprintf("Roteador automático número %d", i),
			AccessUser:     fmt.Sprintf("admin%d", i),
			AccessPassword: "senha123",
			IPAddress:      fmt.Sprintf("192.168.1.%d", i),
			SnmpCommunity:  "public",
			SnmpPort:       "161",
		}
		err := roteadorService.Create(roteador)
		if err != nil {
			log.Fatalf("Error creating router %s: %v\n", roteador.Name, err)
		} else {
			log.Printf("Router %s created successfully", roteador.Name)
		}
	}

	log.Printf("Roteador seeder finished: %v", time.Now())
}
