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

func TransmissorFibraSeeder(
	repo *repository.MongoRepository[models.TransmissorFibra],
	transmissorFibraService services.TransmissorFibraService,
) {
	integracoes := []models.TransmissorFibraIntegracaoType{models.OltHuawei, models.OltZTE, models.OltDatacom}

	log.Printf("Transmissor fibra seeder initializated: %v", time.Now())

	for i := 0; i <= 50; i++ {
		randomNum := rand.Intn(3)

		transmissorFibra := &models.TransmissorFibra{
			Active:         true,
			Integration:    integracoes[randomNum],
			Name:           fmt.Sprintf("Transmissor-%d", i),
			Description:    fmt.Sprintf("Transmissor automático número %d", i),
			AccessUser:     fmt.Sprintf("admin%d", i),
			AccessPassword: "senha123",
			IPAddress:      fmt.Sprintf("192.168.1.%d", i),
			SnmpCommunity:  "public",
			SnmpPort:       "161",
		}
		err := transmissorFibraService.Create(transmissorFibra)
		if err != nil {
			log.Fatalf("Error creating router %s: %v\n", transmissorFibra.Name, err)
		} else {
			log.Printf("Router %s created successfully", transmissorFibra.Name)
		}
	}

	log.Printf("Transmissor fibra seeder finished: %v", time.Now())
}
