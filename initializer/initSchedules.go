package initializer

import (
	"net_monitor/db"
	models "net_monitor/models"
	repository "net_monitor/repository"
	services "net_monitor/services"
	mikrotik "net_monitor/snmp/mikrotik"
	mikrotikScheduler "net_monitor/snmp/mikrotik/Schedules"
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

	mikrotikTemperatureScheduler := mikrotikScheduler.NewTemperatureScheduler(routerRepo, mikrotikCollector)

	schedulerManager.Register(mikrotikMemoryScheduler)
	schedulerManager.Register(mikrotikAverageMemoryCalculatorScheduler)
	schedulerManager.Register(mikrotikCpuScheduler)
	schedulerManager.Register(mikrotikAverageCpuCalculatorScheduler)
	schedulerManager.Register(mikrotikDiskScheduler)
	schedulerManager.Register(mikrotikAverageDiskCalculatorScheduler)
	schedulerManager.Register(mikrotikTemperatureScheduler)

	return schedulerManager
}
