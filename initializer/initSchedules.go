package initializer

import (
	models "net_monitor/models"
	repository "net_monitor/repository"
	mikrotik "net_monitor/snmp/Mikrotik"
	mikrotikScheduler "net_monitor/snmp/Mikrotik/Schedules"
	services "net_monitor/services"
	"net_monitor/db"
)

func InitSchedules() *services.SchedulerManager {
	schedulerManager := services.NewSchedulerManager()

	routerCollection := db.GetCollection("roteador")
	routerRepo := repository.NewMongoRepository[models.Roteador](routerCollection)

	mikrotikCollector := mikrotik.NewMikrotikCollector()

	mikrotikMemoryScheduler := mikrotikScheduler.NewMemoryScheduler(routerRepo, mikrotikCollector)
	mikrotikAverageMemoryCalculatorScheduler := mikrotikScheduler.NewAverageMemoryCalculatorScheduler(routerRepo)

	mikrotikCpuScheduler := mikrotikScheduler.NewCPUScheduler(routerRepo, mikrotikCollector)
	mikrotikAverageCpuCalculatorScheduler := mikrotikScheduler.NewAverageCpuCalculatorScheduler(routerRepo)

	mikrotikDiskScheduler := mikrotikScheduler.NewDiskScheduler(routerRepo, mikrotikCollector)
	mikrotikAverageDiskCalculatorScheduler := mikrotikScheduler.NewAverageDiskCalculatorScheduler(routerRepo)

	schedulerManager.Register(mikrotikMemoryScheduler)
	schedulerManager.Register(mikrotikAverageMemoryCalculatorScheduler)
	schedulerManager.Register(mikrotikCpuScheduler)
	schedulerManager.Register(mikrotikAverageCpuCalculatorScheduler)
	schedulerManager.Register(mikrotikDiskScheduler)
	schedulerManager.Register(mikrotikAverageDiskCalculatorScheduler)

	return schedulerManager
}
