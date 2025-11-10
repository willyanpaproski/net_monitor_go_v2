package services

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"net_monitor/config"
	"net_monitor/interfaces"
	models "net_monitor/models"
	"net_monitor/websocket"
)

type DeviceType string

const (
	DeviceTypeRouter DeviceType = "router"
	DeviceTypeOLT    DeviceType = "olt"
	DeviceTypeSwitch DeviceType = "switch"
)

type NetworkDevice interface {
	GetID() string
	GetName() string
	GetIntegration() string
	GetIPAddress() string
	GetSnmpCommunity() string
	GetSnmpPort() string
	GetAccessUser() string
	GetAccessPassword() string
	IsActive() bool
}

type RouterAdapter struct {
	Router models.Roteador
}

func (r RouterAdapter) GetID() string             { return r.Router.ID.Hex() }
func (r RouterAdapter) GetName() string           { return r.Router.Name }
func (r RouterAdapter) GetIntegration() string    { return string(r.Router.Integration) }
func (r RouterAdapter) GetIPAddress() string      { return r.Router.IPAddress }
func (r RouterAdapter) GetSnmpCommunity() string  { return r.Router.SnmpCommunity }
func (r RouterAdapter) GetSnmpPort() string       { return r.Router.SnmpPort }
func (r RouterAdapter) GetAccessUser() string     { return r.Router.AccessUser }
func (r RouterAdapter) GetAccessPassword() string { return r.Router.AccessPassword }
func (r RouterAdapter) IsActive() bool            { return r.Router.Active }

type OLTAdapter struct {
	OLT models.TransmissorFibra
}

func (o OLTAdapter) GetID() string             { return o.OLT.ID.Hex() }
func (o OLTAdapter) GetName() string           { return o.OLT.Name }
func (o OLTAdapter) GetIntegration() string    { return string(o.OLT.Integration) }
func (o OLTAdapter) GetIPAddress() string      { return o.OLT.IPAddress }
func (o OLTAdapter) GetSnmpCommunity() string  { return o.OLT.SnmpCommunity }
func (o OLTAdapter) GetSnmpPort() string       { return o.OLT.SnmpPort }
func (o OLTAdapter) GetAccessUser() string     { return o.OLT.AccessUser }
func (o OLTAdapter) GetAccessPassword() string { return o.OLT.AccessPassword }
func (o OLTAdapter) IsActive() bool            { return o.OLT.Active }

type SwitchAdapter struct {
	Switch models.SwitchRede
}

func (s SwitchAdapter) GetID() string             { return s.Switch.ID.Hex() }
func (s SwitchAdapter) GetName() string           { return s.Switch.Name }
func (s SwitchAdapter) GetIntegration() string    { return string(s.Switch.Integration) }
func (s SwitchAdapter) GetIPAddress() string      { return s.Switch.IPAddress }
func (s SwitchAdapter) GetSnmpCommunity() string  { return s.Switch.SnmpCommunity }
func (s SwitchAdapter) GetSnmpPort() string       { return s.Switch.SnmpPort }
func (s SwitchAdapter) GetAccessUser() string     { return s.Switch.AccessUser }
func (s SwitchAdapter) GetAccessPassword() string { return s.Switch.AccessPassword }
func (s SwitchAdapter) IsActive() bool            { return s.Switch.Active }

type DeviceService interface {
	GetByID(id string) (NetworkDevice, DeviceType, error)
}

type UnifiedDeviceService struct {
	roteadorService         RoteadorService
	transmissorFibraService TransmissorFibraService
	switchRedeService       SwitchRedeService
}

func NewUnifiedDeviceService(
	roteadorService RoteadorService,
	transmissorFibraService TransmissorFibraService,
	switchRedeService SwitchRedeService,
) *UnifiedDeviceService {
	return &UnifiedDeviceService{
		roteadorService:         roteadorService,
		transmissorFibraService: transmissorFibraService,
		switchRedeService:       switchRedeService,
	}
}

func (u *UnifiedDeviceService) GetByID(id string) (NetworkDevice, DeviceType, error) {
	if router, err := u.roteadorService.GetById(id); err == nil {
		return RouterAdapter{Router: *router}, DeviceTypeRouter, nil
	}

	if olt, err := u.transmissorFibraService.GetById(id); err == nil {
		return OLTAdapter{OLT: *olt}, DeviceTypeOLT, nil
	}

	if sw, err := u.switchRedeService.GetById(id); err == nil {
		return SwitchAdapter{Switch: *sw}, DeviceTypeSwitch, nil
	}

	return nil, "", fmt.Errorf("dispositivo não encontrado: %s", id)
}

type SNMPService struct {
	hub            *websocket.Hub
	deviceService  DeviceService
	collectors     map[string]interfaces.SNMPCollector
	activeChannels map[string]*DeviceCollection
	mu             sync.RWMutex
}

type DeviceCollection struct {
	DeviceID   string
	Device     NetworkDevice
	DeviceType DeviceType
	Collector  interfaces.SNMPCollector
	Metrics    map[string]*MetricCollection
	IsRunning  bool
	StopCh     chan struct{}
}

type MetricCollection struct {
	Name       string
	Config     config.MetricConfig
	LastValue  interface{}
	LastUpdate time.Time
	Ticker     *time.Ticker
	CollectFn  func() (interface{}, error)
}

type SNMPMetricMessage struct {
	DeviceID   string      `json:"device_id"`
	DeviceName string      `json:"device_name"`
	DeviceType string      `json:"device_type"`
	Vendor     string      `json:"vendor"`
	Metric     string      `json:"metric"`
	Value      interface{} `json:"value"`
	Timestamp  time.Time   `json:"timestamp"`
	Error      string      `json:"error,omitempty"`
}

func NewSNMPService(hub *websocket.Hub, deviceService DeviceService) *SNMPService {
	return &SNMPService{
		hub:            hub,
		deviceService:  deviceService,
		collectors:     make(map[string]interfaces.SNMPCollector),
		activeChannels: make(map[string]*DeviceCollection),
	}
}

func (s *SNMPService) RegisterCollector(collector interfaces.SNMPCollector) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.collectors[collector.GetVendor()] = collector
	s.hub.RegisterCollector(collector)
}

func (s *SNMPService) getMetricConfigs(vendor string) []config.MetricConfig {
	if configs, exists := config.VendorMetricMappings[vendor]; exists {
		return configs
	}

	log.Printf("Vendor %s não encontrado, usando configuração padrão", vendor)
	return config.DefaultMetricMappings
}

func (s *SNMPService) StartCollectionWithConfig(deviceID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if collection, exists := s.activeChannels[deviceID]; exists && collection.IsRunning {
		log.Printf("Coleta já ativa para dispositivo %s", deviceID)
		return nil
	}

	device, deviceType, err := s.deviceService.GetByID(deviceID)
	if err != nil {
		return err
	}

	integration := device.GetIntegration()
	collector, exists := s.collectors[integration]
	if !exists {
		log.Printf("Collector não encontrado para vendor: %s", integration)
		return fmt.Errorf("collector não encontrado para vendor: %s", integration)
	}

	configs := s.getMetricConfigs(integration)

	collection := &DeviceCollection{
		DeviceID:   deviceID,
		Device:     device,
		DeviceType: deviceType,
		Collector:  collector,
		Metrics:    make(map[string]*MetricCollection),
		IsRunning:  true,
		StopCh:     make(chan struct{}),
	}

	router := s.convertToRoteador(device)

	for _, config := range configs {
		metric := &MetricCollection{
			Name:   config.Name,
			Config: config,
		}

		metric.CollectFn = s.createGenericCollectFunction(collector, router, config)
		collection.Metrics[config.Name] = metric
	}

	s.activeChannels[deviceID] = collection

	go s.startMetricCollections(collection)

	log.Printf("Coleta multi-intervalo iniciada para %s %s (%s) com %d métricas",
		deviceType, device.GetName(), integration, len(configs))

	return nil
}

func (s *SNMPService) StartCollection(deviceID string) error {
	return s.StartCollectionWithConfig(deviceID)
}

func (s *SNMPService) StopCollection(deviceID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if collection, exists := s.activeChannels[deviceID]; exists && collection.IsRunning {
		close(collection.StopCh)
		collection.IsRunning = false

		for _, metric := range collection.Metrics {
			if metric.Ticker != nil {
				metric.Ticker.Stop()
			}
		}

		delete(s.activeChannels, deviceID)
		log.Printf("Coleta multi-intervalo interrompida para dispositivo %s", deviceID)
	}
}

func (s *SNMPService) convertToRoteador(device NetworkDevice) models.Roteador {
	return models.Roteador{
		Name:           device.GetName(),
		IPAddress:      device.GetIPAddress(),
		SnmpCommunity:  device.GetSnmpCommunity(),
		SnmpPort:       device.GetSnmpPort(),
		AccessUser:     device.GetAccessUser(),
		AccessPassword: device.GetAccessPassword(),
		Active:         device.IsActive(),
		Integration:    models.RoteadorIntegracaoType(device.GetIntegration()),
	}
}

func (s *SNMPService) createGenericCollectFunction(
	collector interfaces.SNMPCollector,
	router models.Roteador,
	metricConfig config.MetricConfig,
) func() (interface{}, error) {

	return func() (interface{}, error) {
		if extendedCollector, ok := collector.(interfaces.ExtendedSNMPCollector); ok {
			value, err := extendedCollector.CollectMetric(router, metricConfig.Name)
			if err == nil && value != nil {
				return value, nil
			}
			log.Printf("Collector estendido falhou para %s, tentando fallback: %v", metricConfig.Name, err)
		}

		data, err := collector.Collect(router)
		if err != nil {
			return nil, err
		}

		if value, exists := data[metricConfig.DataKey]; exists && value != nil {
			return value, nil
		}

		for _, fallbackKey := range metricConfig.FallbackKeys {
			if value, exists := data[fallbackKey]; exists && value != nil {
				log.Printf("Usando chave de fallback '%s' para métrica '%s'", fallbackKey, metricConfig.Name)
				return value, nil
			}
		}

		if metricConfig.Required {
			return nil, fmt.Errorf("métrica obrigatória '%s' não encontrada (tentativas: %s, %v)",
				metricConfig.Name, metricConfig.DataKey, metricConfig.FallbackKeys)
		}

		log.Printf("Métrica opcional '%s' não encontrada para %s", metricConfig.Name, router.Name)
		return nil, nil
	}
}

func (s *SNMPService) startMetricCollections(collection *DeviceCollection) {
	var wg sync.WaitGroup

	for metricName, metric := range collection.Metrics {
		wg.Add(1)
		go func(name string, m *MetricCollection) {
			defer wg.Done()
			s.collectMetricData(collection, name, m)
		}(metricName, metric)
	}

	wg.Wait()
}

func (s *SNMPService) collectMetricData(collection *DeviceCollection, metricName string, metric *MetricCollection) {
	s.performMetricCollection(collection, metricName, metric)

	metric.Ticker = time.NewTicker(metric.Config.Interval)
	defer metric.Ticker.Stop()

	for {
		select {
		case <-collection.StopCh:
			return

		case <-metric.Ticker.C:
			s.performMetricCollection(collection, metricName, metric)
		}
	}
}

func (s *SNMPService) performMetricCollection(collection *DeviceCollection, metricName string, metric *MetricCollection) {
	value, err := metric.CollectFn()

	message := SNMPMetricMessage{
		DeviceID:   collection.DeviceID,
		DeviceName: collection.Device.GetName(),
		DeviceType: string(collection.DeviceType),
		Vendor:     collection.Device.GetIntegration(),
		Metric:     metricName,
		Value:      value,
		Timestamp:  time.Now(),
	}

	if err != nil {
		message.Error = err.Error()
		log.Printf("Erro na coleta da métrica %s para %s: %v", metricName, collection.Device.GetName(), err)
	} else if value != nil {
		metric.LastValue = value
		metric.LastUpdate = message.Timestamp
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Printf("Erro ao serializar métrica %s: %v", metricName, err)
		return
	}

	s.hub.Broadcast(jsonData)
}

func (s *SNMPService) GetActiveCollections() []map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var collections []map[string]interface{}

	for deviceID, collection := range s.activeChannels {
		if collection.IsRunning {
			metrics := make([]string, 0, len(collection.Metrics))
			for metricName := range collection.Metrics {
				metrics = append(metrics, metricName)
			}

			collections = append(collections, map[string]interface{}{
				"device_id":   deviceID,
				"device_name": collection.Device.GetName(),
				"device_type": string(collection.DeviceType),
				"vendor":      collection.Device.GetIntegration(),
				"metrics":     metrics,
				"is_running":  collection.IsRunning,
			})
		}
	}

	return collections
}

func (s *SNMPService) IsCollectionActive(deviceID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if collection, exists := s.activeChannels[deviceID]; exists {
		return collection.IsRunning
	}

	return false
}
