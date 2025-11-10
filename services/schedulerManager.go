package services

import (
	"log"
	"net_monitor/interfaces"
	"sync"
)

type SchedulerManager struct {
	schedulers []interfaces.Scheduler
	wg         sync.WaitGroup
}

func NewSchedulerManager() *SchedulerManager {
	return &SchedulerManager{
		schedulers: make([]interfaces.Scheduler, 0),
	}
}

func (sm *SchedulerManager) Register(scheduler interfaces.Scheduler) {
	sm.schedulers = append(sm.schedulers, scheduler)
}

func (sm *SchedulerManager) StartAll() {
	log.Printf("Iniciando %d scheduler(s)...", len(sm.schedulers))

	for _, scheduler := range sm.schedulers {
		sm.wg.Add(1)
		go func(s interfaces.Scheduler) {
			defer sm.wg.Done()
			s.Start()
		}(scheduler)
	}

	log.Println("Todos os schedulers foram iniciados")
}

func (sm *SchedulerManager) StopAll() {
	log.Println("Parando todos os schedulers...")

	for _, scheduler := range sm.schedulers {
		scheduler.Stop()
	}

	sm.wg.Wait()
	log.Println("Todos os schedulers foram parados")
}

func (sm *SchedulerManager) Count() int {
	return len(sm.schedulers)
}
