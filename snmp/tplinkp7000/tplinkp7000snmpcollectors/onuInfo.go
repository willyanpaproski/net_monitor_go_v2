package tplinkp7000snmpcollectors

import (
	"fmt"
	"net_monitor/interfaces"
	"net_monitor/snmp"

	"github.com/gosnmp/gosnmp"
)

func CollectOnuInfo(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) ([]snmp.OnuInfo, error) {
	baseSerialNumberOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.3"
	baseOnuOnlineStatusOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.11"
	baseLastDownCauseOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.38"
	baseRXPowerOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.24"
	baseTxPowerOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.22"
	baseBiasCurrentOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.26"
	baseVoltageOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.27"
	baseTemperatureOid := "1.3.6.1.4.1.11863.6.100.1.7.2.1.28"

	onus := make([]snmp.OnuInfo, 0)

	serialNumberMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseSerialNumberOid, true)
	if err != nil {
		return nil, err
	}

	onlineStatusMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOnuOnlineStatusOid, true)
	if err != nil {
		return nil, err
	}

	lastDownCauseMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseLastDownCauseOid, true)
	if err != nil {
		return nil, err
	}

	rxPowerMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseRXPowerOid, true)
	if err != nil {
		return nil, err
	}

	txPowerMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseTxPowerOid, true)
	if err != nil {
		return nil, err
	}

	biasCurrentMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseBiasCurrentOid, true)
	if err != nil {
		return nil, err
	}

	voltageMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseVoltageOid, true)
	if err != nil {
		return nil, err
	}

	temperatureMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseTemperatureOid, true)
	if err != nil {
		return nil, err
	}

	for index, snResult := range serialNumberMap {
		onu := snmp.OnuInfo{
			Index:        index,
			SerialNumber: snResult.StringValue(),
		}

		if onlineStatusResult, hasOnlineStatus := onlineStatusMap[index]; hasOnlineStatus {
			if onlineStatus, err := onlineStatusResult.IntValue(); err == nil {
				onu.OnlineStatus = onlineStatus
			}
		}

		if lastDownCauseResult, hasLastDownCause := lastDownCauseMap[index]; hasLastDownCause {
			if lastDownCauseResult.StringValue() == "--" {
				onu.LastDownCause = ""
			} else {
				onu.LastDownCause = lastDownCauseResult.StringValue()
			}
		}

		if rxPowerResult, hasRxPowerResult := rxPowerMap[index]; hasRxPowerResult {
			if rxPower, err := rxPowerResult.IntValue(); err == nil {
				onu.RXPower = float64(rxPower)
			}
		}

		if txPowerResult, hasTxPowerResult := txPowerMap[index]; hasTxPowerResult {
			if txPower, err := txPowerResult.IntValue(); err == nil {
				onu.TXPower = float64(txPower) / 100.0
			}
		}

		if biasCurrentResult, hasBiasCurrentResult := biasCurrentMap[index]; hasBiasCurrentResult {
			if biasCurrent, err := biasCurrentResult.IntValue(); err == nil {
				onu.BiasCurrent = float64(biasCurrent)
			}
		}

		if voltageResult, hasVoltageResult := voltageMap[index]; hasVoltageResult {
			if voltage, err := voltageResult.IntValue(); err == nil {
				onu.Voltage = float64(voltage) / 1000
			}
		}

		if temperatureResult, hasTemperatureResult := temperatureMap[index]; hasTemperatureResult {
			if temperature, err := temperatureResult.IntValue(); err == nil {
				onu.Temperature = float64(temperature)
			}
		}

		onus = append(onus, onu)
	}

	fmt.Println(onus)
	return onus, nil
}
