package mikrotiksnmpcollectors

import (
	"fmt"
	"net_monitor/interfaces"
	snmp "net_monitor/snmp"
	Utils "net_monitor/utils"
	"strings"

	"github.com/gosnmp/gosnmp"
)

type Vlan struct {
	Index       string   `json:"index"`
	Name        string   `json:"name"`
	Type        int      `json:"type"`
	MacAddress  string   `json:"mac_address,omitempty"`
	IPAddress   []string `json:"ip_address,omitempty"`
	AdminStatus int      `json:"admin_status"` // 1=up, 2=down, 3=testing
	OperStatus  int      `json:"oper_status"`  // 1=up, 2=down, 3=testing, 4=unknown, 5=dormant, 6=notPresent, 7=lowerLayerDown
}

func GetVlanIPs(goSnmp *gosnmp.GoSNMP) (map[string][]string, error) {
	baseOid := "1.3.6.1.2.1.4.20.1.2"
	results, err := snmp.GetTreeOidsBulk(goSnmp, baseOid)
	if err != nil {
		return nil, err
	}
	vlanIPs := make(map[string][]string)
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
			vlanIPs[ifIndexStr] = append(vlanIPs[ifIndexStr], ipStr)
		}
	}
	return vlanIPs, nil
}

func CollectMikrotikVlans(goSnmp *gosnmp.GoSNMP, device interfaces.NetworkDevice) ([]Vlan, error) {
	baseOidName := "1.3.6.1.2.1.31.1.1.1.1"     // ifName
	baseOidType := "1.3.6.1.2.1.2.2.1.3"        // ifType
	baseOidMac := "1.3.6.1.2.1.2.2.1.6"         // ifPhysAddress
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

	vlanIPs, err := GetVlanIPs(goSnmp)
	if err != nil {
		vlanIPs = make(map[string][]string)
	}

	vlans := make([]Vlan, 0)

	for index, nameResult := range namesMap {
		typeResult, exists := typesMap[index]
		if !exists {
			continue
		}
		ifType, err := typeResult.IntValue()
		if err != nil {
			continue
		}

		if !snmp.IsVlan(ifType) {
			continue
		}

		vlan := Vlan{
			Index: index,
			Name:  nameResult.StringValue(),
			Type:  ifType,
		}

		// MAC
		if macResult, hasMac := macsMap[index]; hasMac {
			if macBytes, ok := macResult.Value.([]byte); ok {
				vlan.MacAddress = Utils.FormatMacAddress(macBytes)
			}
		}

		// IPs
		if ips, hasIPs := vlanIPs[index]; hasIPs {
			vlan.IPAddress = ips
		}

		// Admin Status
		if adminStatusResult, hasAdminStatus := adminStatusMap[index]; hasAdminStatus {
			if adminStatus, err := adminStatusResult.IntValue(); err == nil {
				vlan.AdminStatus = adminStatus
			}
		}

		// Oper Status
		if operStatusResult, hasOperStatus := operStatusMap[index]; hasOperStatus {
			if operStatus, err := operStatusResult.IntValue(); err == nil {
				vlan.OperStatus = operStatus
			}
		}

		vlans = append(vlans, vlan)
	}

	return vlans, nil
}
