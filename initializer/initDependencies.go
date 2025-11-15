package initializer

import (
	"log"
	controllers "net_monitor/controllers"
	middlewares "net_monitor/middlewares"
	models "net_monitor/models"
	netflow "net_monitor/netflow"
	"net_monitor/netflow/metrics"
	repository "net_monitor/repository"
	routes "net_monitor/routes"
	mikrotik "net_monitor/snmp/mikrotik"
	thinkolt "net_monitor/snmp/think"
	"net_monitor/snmp/tplinkp7000"
	"net_monitor/snmp/trap/handlers"
	"time"

	"net_monitor/config"
	"net_monitor/db"
	services "net_monitor/services"
	utils "net_monitor/utils"
	"net_monitor/websocket"
	"os"

	"github.com/gin-gonic/gin"
)

func InitDependencies(router *gin.Engine) {
	requestLogCollection := db.GetCollection("requestLogs")
	requestLogRepo := repository.NewMongoRepository[models.RequestLog](requestLogCollection)
	requestLogService := services.NewRequestLogService(requestLogRepo)

	router.Use(middlewares.RequestLoggerMiddleware(requestLogService))

	userCollection := db.GetCollection("user")
	userRepo := repository.NewMongoRepository[models.User](userCollection)
	userService := services.NewUserService(userRepo)

	oauthConfig := config.NewAuthConfig()
	jwtManager := utils.NewJWTManager(oauthConfig.JWTSecret)

	oauthRepoCollection := db.GetCollection("oauth_providers")
	oauthRepo := repository.NewMongoRepository[models.OAuthProvider](oauthRepoCollection)

	refreshTokensCollection := db.GetCollection("refresh_tokens")
	refreshTokenRepo := repository.NewMongoRepository[models.RefreshToken](refreshTokensCollection)

	authService := services.NewAuthService(userRepo, oauthRepo, refreshTokenRepo, userService, jwtManager, oauthConfig)
	authController := controllers.NewAuthController(authService)

	routes.SetupAuthRoutes(router, authController)

	userController := controllers.NewUserController(userService)
	routes.SetupUserRoutes(router, userController, authService)

	hub := websocket.NewHub(authService)
	go hub.Run()

	roteadorCollection := db.GetCollection("roteador")
	roteadorRepo := repository.NewMongoRepository[models.Roteador](roteadorCollection)
	routerService := services.NewRoteadorService(roteadorRepo)

	transmissorFibraCollection := db.GetCollection("transmissorFibra")
	transmissorFibraRepo := repository.NewMongoRepository[models.TransmissorFibra](transmissorFibraCollection)
	transmitterService := services.NewTransmissorFibraService(transmissorFibraRepo)

	switchRedeCollection := db.GetCollection("switchRede")
	switchRedeRepo := repository.NewMongoRepository[models.SwitchRede](switchRedeCollection)
	networkSwitchService := services.NewSwitchRedeService(switchRedeRepo)

	unifiedDeviceService := services.NewUnifiedDeviceService(
		routerService,
		transmitterService,
		networkSwitchService,
	)

	trapPort := os.Getenv("SNMP_TRAP_PORT")
	if trapPort == "" {
		trapPort = "162"
	}

	trapService := services.NewTrapService(hub, unifiedDeviceService, trapPort)
	mikrotikTrapHandler := handlers.NewMikrotikTrapHandler()
	thinkOltTrapHandler := handlers.NewThinkOltTrapHandler()
	trapService.RegisterTrapHandler(mikrotikTrapHandler)
	trapService.RegisterTrapHandler(thinkOltTrapHandler)

	go func() {
		if err := trapService.Start(); err != nil {
			log.Printf("Error starting SNMP trap service: %v", err)
		} else {
			log.Printf("SNMP trap service started on port %s", trapPort)
		}
	}()

	go func() {
		time.Sleep(2 * time.Second)

		routers, _ := routerService.GetAll()
		for _, router := range routers {
			if router.Active {
				device := services.RouterAdapter{Router: router}
				trapService.RegisterDevice(device, services.DeviceTypeRouter)
			}
		}

		transmitters, _ := transmitterService.GetAll()
		for _, transmitter := range transmitters {
			if transmitter.Active {
				device := services.OLTAdapter{OLT: transmitter}
				trapService.RegisterDevice(device, services.DeviceTypeOLT)
			}
		}

		networkSwitches, _ := networkSwitchService.GetAll()
		for _, networkSwitch := range networkSwitches {
			if networkSwitch.Active {
				device := services.SwitchAdapter{Switch: networkSwitch}
				trapService.RegisterDevice(device, services.DeviceTypeSwitch)
			}
		}
	}()

	roteadorController := controllers.NewRoteadorController(routerService, *trapService)
	roteadorController.TrapService = trapService
	routes.SetupRoteadorRoutes(router, roteadorController, authService)

	transmissorFibraController := controllers.NewTransmissorFibraController(transmitterService, *trapService)
	routes.SetupTransmissorFibraRoutes(router, transmissorFibraController, authService)

	switchRedeController := controllers.NewSwitchRedeController(networkSwitchService, *trapService)
	routes.SetupSwitchRedeRoutes(router, switchRedeController, authService)

	ipVersionMetricsCollection := db.GetCollection("ip_version_metrics")
	ipVersionMetricsRepo := repository.NewMongoRepository[metrics.IPVersionMetric](ipVersionMetricsCollection)
	ipVersionMetricsService := services.NewIPVersionMetricService(ipVersionMetricsRepo)
	ipVersionMetricsController := controllers.NewIPVersionMetricController(ipVersionMetricsService, routerService)
	routes.SetupIPVersionMetricRoutes(router, ipVersionMetricsController, authService)

	snmpService := services.NewSNMPService(hub, unifiedDeviceService)

	mikrotikCollector := mikrotik.NewMikrotikCollector()
	snmpService.RegisterCollector(mikrotikCollector)

	thinkCollector := thinkolt.NewThinkCollector()
	snmpService.RegisterCollector(thinkCollector)

	tpLinkP7000Collector := tplinkp7000.NewTpLinkP7000Collector()
	snmpService.RegisterCollector(tpLinkP7000Collector)

	routes.SetupWebSocketRoutes(router, hub, snmpService)

	logCollection := db.GetCollection("log")
	logRepo := repository.NewMongoRepository[models.Log](logCollection)
	logService := services.NewLogService(logRepo)
	logController := controllers.NewLogController(logService)
	routes.SetupLogRoutes(router, logController, authService)

	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		log.Println("Undefined RABBITMQ_URL. Using default: amqp://guest:guest@localhost:5672/")
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}

	rawRabbit, err := netflow.NewRabbitMQ(rabbitURL, "ipfix_raw_packets")
	if err != nil {
		log.Printf("Error connecting to RabbitMQ for raw packets: %v", err)
		return
	}
	log.Println("RabbitMQ Connected - Queue: ipfix_raw_packets")

	decodedRabbit, err := netflow.NewRabbitMQ(rabbitURL, "ipfix_decoded_packets")
	if err != nil {
		log.Printf("Error connecting to RabbitMQ for decoded packets: %v", err)
		rawRabbit.Close()
		return
	}
	log.Println("RabbitMQ Connected - Queue: ipfix_decoded_packets")

	netflow.InitializeMetrics(db.GetDatabase(), roteadorRepo)
	log.Println("MetricContext inicializado com MongoDB e RouterRepository")

	netflow.RegisterMetricProcessor(metrics.NewIPVersionMetricProcessor())

	log.Println("Processadores de Métricas Registrados:")
	for _, processor := range netflow.GetMetricProcessors() {
		log.Printf("  ✓ %s", processor.Name())
	}

	listen := netflow.GetListenAddr()
	if err := netflow.StartListener(rawRabbit, listen); err != nil {
		log.Printf("Error starting IPFIX listener: %v", err)
		rawRabbit.Close()
		decodedRabbit.Close()
		return
	}
	log.Printf("IPFIX Listener iniciado started: %s", listen)

	decoderWorkers := 2
	if err := netflow.StartDecoderWorkers(rawRabbit, decodedRabbit, decoderWorkers); err != nil {
		log.Printf("Error starting decoder workers: %v", err)
		rawRabbit.Close()
		decodedRabbit.Close()
		return
	}
	log.Printf("%d Decoder Workers Started", decoderWorkers)

	metricWorkers := 4
	if err := netflow.StartMetricWorkers(decodedRabbit, *roteadorRepo, metricWorkers); err != nil {
		log.Printf("Error starting metric workers: %v", err)
		rawRabbit.Close()
		decodedRabbit.Close()
		return
	}
	log.Printf("%d Metric Workers Started", metricWorkers)
}
