package snmp

import (
	"fmt"
	"net_monitor/interfaces"
	models "net_monitor/models"
	"strconv"

	"github.com/gosnmp/gosnmp"
)

type SNMPCollector interface {
	Collect(roteador models.Roteador) (map[string]interface{}, error)
}

type WalkResult struct {
	OID   string
	Value interface{}
}

func IsPPP(ifType int) bool {
	pppTypes := map[int]bool{
		23: true, //PPP
	}
	return pppTypes[ifType]
}

func IsVlan(ifType int) bool {
	vlanTypes := map[int]bool{
		135: true, //l2vlan
		136: true, //l3ipvlan
		137: true, //l3ipxvlan
		222: true, //ciscoISLvlan
	}
	return vlanTypes[ifType]
}

func IsPhysicalInterface(ifType int) bool {
	physicalTypes := map[int]bool{
		1:   true, // other
		6:   true, // ethernet-csmacd
		26:  true, //ethernet3Mbit
		62:  true, // fast ethernet
		69:  true, // fastEtherFX
		117: true, // gigabitEthernet
	}
	return physicalTypes[ifType]
}

func (w WalkResult) StringValue() string {
	switch v := w.Value.(type) {
	case []byte:
		return string(v)
	case string:
		return v
	case int:
		return strconv.Itoa(v)
	case uint:
		return strconv.FormatUint(uint64(v), 10)
	case uint32:
		return strconv.FormatUint(uint64(v), 10)
	case uint64:
		return strconv.FormatUint(v, 10)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func (w WalkResult) IntValue() (int, error) {
	switch v := w.Value.(type) {
	case int:
		return v, nil
	case uint:
		return int(v), nil
	case uint32:
		return int(v), nil
	case uint64:
		return int(v), nil
	case []byte:
		return strconv.Atoi(string(v))
	case string:
		return strconv.Atoi(v)
	default:
		return 0, fmt.Errorf("cannot convert %T to int", v)
	}
}

func (w WalkResult) GetIndex(baseOid string) string {
	oid := w.OID
	if len(oid) > 0 && oid[0] == '.' {
		oid = oid[1:]
	}

	base := baseOid
	if len(base) > 0 && base[0] == '.' {
		base = base[1:]
	}

	if len(oid) > len(base) {
		if oid[:len(base)] == base {
			if len(oid) > len(base) && oid[len(base)] == '.' {
				return oid[len(base)+1:]
			}
		}
	}

	return ""
}

func GetTreeOids(snmp *gosnmp.GoSNMP, baseOid string) ([]WalkResult, error) {
	var results []WalkResult

	err := snmp.Walk(baseOid, func(pdu gosnmp.SnmpPDU) error {
		results = append(results, WalkResult{
			OID:   pdu.Name,
			Value: pdu.Value,
		})
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("error walking OID tree: %v", err)
	}

	return results, nil
}

func GetTreeOidsBulk(snmp *gosnmp.GoSNMP, baseOid string) ([]WalkResult, error) {
	var results []WalkResult

	err := snmp.BulkWalk(baseOid, func(pdu gosnmp.SnmpPDU) error {
		results = append(results, WalkResult{
			OID:   pdu.Name,
			Value: pdu.Value,
		})
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("error bulk walking OID tree: %v", err)
	}

	return results, nil
}

func GetTreeAsMap(snmp *gosnmp.GoSNMP, baseOid string, useBulk bool) (map[string]WalkResult, error) {
	var results []WalkResult
	var err error

	if useBulk {
		results, err = GetTreeOidsBulk(snmp, baseOid)
	} else {
		results, err = GetTreeOids(snmp, baseOid)
	}

	if err != nil {
		return nil, err
	}

	resultMap := make(map[string]WalkResult, len(results))
	for _, result := range results {
		resultMap[result.OID] = result
	}

	return resultMap, nil
}

func GetTreeAsIndexMap(snmp *gosnmp.GoSNMP, baseOid string, useBulk bool) (map[string]WalkResult, error) {
	var results []WalkResult
	var err error

	if useBulk {
		results, err = GetTreeOidsBulk(snmp, baseOid)
	} else {
		results, err = GetTreeOids(snmp, baseOid)
	}

	if err != nil {
		return nil, err
	}

	indexMap := make(map[string]WalkResult, len(results))
	for _, result := range results {
		index := result.GetIndex(baseOid)
		if index != "" {
			indexMap[index] = result
		}
	}

	return indexMap, nil
}

func GetTimeTicksOid(snmp *gosnmp.GoSNMP, oid string, resource string, device interfaces.NetworkDevice) (string, error) {
	result, err := snmp.Get([]string{oid})
	if err != nil {
		return "", err
	}
	if len(result.Variables) == 0 {
		return "", fmt.Errorf("No result for %v of %v:%v", resource, device.GetName(), device.GetIPAddress())
	}
	value := result.Variables[0].Value
	switch v := value.(type) {
	case uint32:
		totalSeconds := v / 100
		days := totalSeconds / 86400
		hours := (totalSeconds % 86400) / 3600
		minutes := (totalSeconds % 3600) / 60
		seconds := totalSeconds % 60
		var formatted string
		if days > 0 {
			formatted = fmt.Sprintf("%dd %02dh %02dm %02ds", days, hours, minutes, seconds)
		} else {
			formatted = fmt.Sprintf("%02dh %02dm %02ds", hours, minutes, seconds)
		}
		return formatted, nil
	default:
		return "", fmt.Errorf("Invalid type for TimeTicks (%T) for %v of %v:%v", value, resource, device.GetName(), device.GetIPAddress())
	}
}

func GetIntOid(snmp *gosnmp.GoSNMP, oid string, resource string, device interfaces.NetworkDevice) (int, error) {
	result, err := snmp.Get([]string{oid})
	if err != nil {
		return 0, err
	}
	if len(result.Variables) != 0 {
		value := result.Variables[0].Value
		switch v := value.(type) {
		case []byte:
			str := string(v)
			num, err := strconv.Atoi(str)
			if err != nil {
				return 0, fmt.Errorf("Error parsing value to int %v", err)
			}
			return num, nil
		case int:
			return v, nil
		default:
			return 0, fmt.Errorf("Invalid type for %v of %v:%v", resource, device.GetName(), device.GetIPAddress())
		}
	}
	return 0, fmt.Errorf("Error collecting %v for %v:%v", resource, device.GetName(), device.GetIPAddress())
}

func GetStringOid(snmp *gosnmp.GoSNMP, oid string, resource string, device interfaces.NetworkDevice) (string, error) {
	result, err := snmp.Get([]string{oid})
	if err != nil {
		return "", err
	}
	if len(result.Variables) != 0 {
		value := result.Variables[0].Value
		switch v := value.(type) {
		case []byte:
			return string(v), nil
		case string:
			return v, nil
		default:
			return "", fmt.Errorf("Invalid type for %v of %v:%v", resource, device.GetName(), device.GetIPAddress())
		}
	}
	return "", fmt.Errorf("Error collecting %v for %v:%v", resource, device.GetName(), device.GetIPAddress())
}
