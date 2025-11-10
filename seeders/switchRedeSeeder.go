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

func SwitchRedeSeeder(
	repo *repository.MongoRepository[models.SwitchRede],
	switchRedeService services.SwitchRedeService,
) {
	integracoes := []models.SwitchRedeIntegracaoType{models.SwitchCiscoCatalist, models.SwitchHuawei}

	log.Printf("Switch seeder initializated: %v", time.Now())

	for i := 0; i <= 50; i++ {
		randomNum := rand.Intn(2)

		switchRede := &models.SwitchRede{
			Active:         true,
			Integration:    integracoes[randomNum],
			Name:           fmt.Sprintf("Switch-%d", i),
			Description:    fmt.Sprintf("Switch automático número %d", i),
			AccessUser:     fmt.Sprintf("admin%d", i),
			AccessPassword: "senha123",
			IPAddress:      fmt.Sprintf("192.168.1.%d", i),
			SnmpCommunity:  "public",
			SnmpPort:       "161",
		}
		err := switchRedeService.Create(switchRede)
		if err != nil {
			log.Fatalf("Error creating router %s: %v\n", switchRede.Name, err)
		} else {
			log.Printf("Router %s created successfully", switchRede.Name)
		}
	}

	log.Printf("Switch seeder finished: %v", time.Now())
}
