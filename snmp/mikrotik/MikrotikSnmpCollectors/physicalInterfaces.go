package mikrotiksnmpcollectors

import (
	"fmt"
	"net_monitor/interfaces"
	snmp "net_monitor/snmp"
	Utils "net_monitor/utils"
	"strings"

	"github.com/gosnmp/gosnmp"
)

type PhysicalInterface struct {
	Index       string   `json:"index"`
	Name        string   `json:"name"`
	Type        int      `json:"type"`
	MacAddress  string   `json:"mac_address,omitempty"`
	IPAddress   []string `json:"ip_address,omitempty"`
	AdminStatus int      `json:"admin_status"` // 1=up, 2=down, 3=testing
	OperStatus  int      `json:"oper_status"`  // 1=up, 2=down, 3=testing, 4=unknown, 5=dormant, 6=notPresent, 7=lowerLayerDown
}

func GetInterfaceIPs(goSnmp *gosnmp.GoSNMP) (map[string][]string, error) {
	baseOid := "1.3.6.1.2.1.4.20.1.2"
	results, err := snmp.GetTreeOidsBulk(goSnmp, baseOid)
	if err != nil {
		return nil, err
	}

	interfaceIPs := make(map[string][]string)
	for _, result := range results {
		oid := result.OID
		if len(oid) > 0 && oid[0] == '.' {
			oid = oid[1:]
		}

		if strings.HasPrefix(oid, baseOid+".") {
			ipStr := strings.TrimPrefix(oid, baseOid+".")
			ifIndex, err := result.IntValue()
			if err != nil {
				continue
			}
			ifIndexStr := fmt.Sprintf("%d", ifIndex)
			interfaceIPs[ifIndexStr] = append(interfaceIPs[ifIndexStr], ipStr)
		}
	}

	return interfaceIPs, nil
}

func CollectMikrotikPhysicalInterfaces(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) ([]PhysicalInterface, error) {
	baseOidName := "1.3.6.1.2.1.2.2.1.2"
	baseOidType := "1.3.6.1.2.1.2.2.1.3"
	baseOidMac := "1.3.6.1.2.1.2.2.1.6"
	baseOidAdminStatus := "1.3.6.1.2.1.2.2.1.7" // ifAdminStatus
	baseOidOperStatus := "1.3.6.1.2.1.2.2.1.8"  // ifOperStatus

	namesMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOidName, true)
	if err != nil {
		return nil, err
	}

	typesMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOidType, true)
	if err != nil {
		return nil, err
	}

	macsMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOidMac, true)
	if err != nil {
		return nil, err
	}

	adminStatusMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOidAdminStatus, true)
	if err != nil {
		return nil, err
	}

	operStatusMap, err := snmp.GetTreeAsIndexMap(goSnmp, baseOidOperStatus, true)
	if err != nil {
		return nil, err
	}

	interfaceIPs, err := GetInterfaceIPs(goSnmp)
	if err != nil {
		interfaceIPs = make(map[string][]string)
	}

	interfaces := make([]PhysicalInterface, 0)

	for index, nameResult := range namesMap {
		typeResult, exists := typesMap[index]
		if !exists {
			continue
		}

		ifType, err := typeResult.IntValue()
		if err != nil {
			continue
		}

		if !snmp.IsPhysicalInterface(ifType) {
			continue
		}

		iface := PhysicalInterface{
			Index: index,
			Name:  nameResult.StringValue(),
			Type:  ifType,
		}

		if macResult, hasMac := macsMap[index]; hasMac {
			if macBytes, ok := macResult.Value.([]byte); ok {
				iface.MacAddress = Utils.FormatMacAddress(macBytes)
			}
		}

		if ips, hasIPs := interfaceIPs[index]; hasIPs {
			iface.IPAddress = ips
		}

		if adminStatusResult, hasAdminStatus := adminStatusMap[index]; hasAdminStatus {
			if adminStatus, err := adminStatusResult.IntValue(); err == nil {
				iface.AdminStatus = adminStatus
			}
		}

		if operStatusResult, hasOperStatus := operStatusMap[index]; hasOperStatus {
			if operStatus, err := operStatusResult.IntValue(); err == nil {
				iface.OperStatus = operStatus
			}
		}

		interfaces = append(interfaces, iface)
	}

	return interfaces, nil
}
