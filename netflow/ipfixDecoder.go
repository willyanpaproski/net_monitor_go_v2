package netflow

import (
	"encoding/binary"
	"fmt"
	"net"
	"unicode"
)

var ipfixFieldNames = map[uint16]string{
	1:   "octetDeltaCount",
	2:   "packetDeltaCount",
	4:   "protocolIdentifier",
	5:   "ipClassOfService",
	6:   "tcpControlBits",
	7:   "sourceTransportPort",
	8:   "sourceIPv4Address",
	9:   "sourceIPv4PrefixLength",
	10:  "ingressInterface",
	11:  "destinationTransportPort",
	12:  "destinationIPv4Address",
	13:  "destinationIPv4PrefixLength",
	14:  "egressInterface",
	15:  "ipNextHopIPv4Address",
	16:  "bgpSourceAsNumber",
	17:  "bgpDestinationAsNumber",
	21:  "flowEndSysUpTime",
	22:  "flowStartSysUpTime",
	27:  "sourceIPv6Address",
	28:  "destinationIPv6Address",
	29:  "sourceIPv6PrefixLength",
	30:  "destinationIPv6PrefixLength",
	31:  "flowLabelIPv6",
	33:  "igmpType",
	56:  "sourceMacAddress",
	57:  "postDestinationMacAddress",
	60:  "ipVersion",
	61:  "flowDirection",
	62:  "ipNextHopIPv6Address",
	80:  "destinationMacAddress",
	81:  "postSourceMacAddress",
	85:  "octetTotalCount",
	86:  "packetTotalCount",
	136: "flowEndReason",
	148: "flowId",
	150: "flowStartSeconds",
	151: "flowEndSeconds",
	152: "flowStartMilliseconds",
	153: "flowEndMilliseconds",
	154: "flowStartMicroseconds",
	155: "flowEndMicroseconds",
	160: "systemInitTimeMilliseconds",
	176: "icmpTypeIPv4",
	177: "icmpCodeIPv4",
	178: "icmpTypeIPv6",
	179: "icmpCodeIPv6",
	184: "tcpSequenceNumber",
	185: "tcpAcknowledgementNumber",
	186: "tcpWindowSize",
	189: "ipHeaderLength",
	192: "ipTTL",
	205: "udpMessageLength",
	206: "isMulticast",
	224: "ipTotalLength",
	225: "postNATSourceIPv4Address",
	227: "postNAPTSourceTransportPort",
	226: "postNATDestinationIPv4Address",
	228: "postNAPTDestinationTransportPort",
}

type TemplateCache struct {
	templates map[uint32]map[uint16]*Template
}

func NewTemplateCache() *TemplateCache {
	return &TemplateCache{
		templates: make(map[uint32]map[uint16]*Template),
	}
}

func (tc *TemplateCache) AddTemplate(obsDomain uint32, template *Template) {
	if tc.templates[obsDomain] == nil {
		tc.templates[obsDomain] = make(map[uint16]*Template)
	}
	tc.templates[obsDomain][template.TemplateID] = template
}

func (tc *TemplateCache) GetTemplate(obsDomain uint32, templateID uint16) *Template {
	if domainTemplates, ok := tc.templates[obsDomain]; ok {
		return domainTemplates[templateID]
	}
	return nil
}

func DecodeIPFIX(msg *IPFIXMessage, cache *TemplateCache) *DecodedIPFIXMessage {
	decoded := &DecodedIPFIXMessage{
		Header:      msg.Header,
		Templates:   []Template{},
		FlowRecords: []FlowRecord{},
	}

	for _, fs := range msg.FlowSets {
		if fs.FlowSetID == 2 {
			templates := parseTemplateFlowSet(fs.Payload)
			for _, tmpl := range templates {
				cache.AddTemplate(msg.Header.ObservationDomain, &tmpl)
				decoded.Templates = append(decoded.Templates, tmpl)
			}
		} else if fs.FlowSetID >= 256 {
			template := cache.GetTemplate(msg.Header.ObservationDomain, fs.FlowSetID)
			if template != nil {
				records := parseDataFlowSet(fs.Payload, template)
				decoded.FlowRecords = append(decoded.FlowRecords, records...)
			}
		}
	}

	return decoded
}

func parseTemplateFlowSet(payload []byte) []Template {
	templates := []Template{}
	offset := 0

	for offset+4 <= len(payload) {
		templateID := binary.BigEndian.Uint16(payload[offset : offset+2])
		fieldCount := binary.BigEndian.Uint16(payload[offset+2 : offset+4])
		offset += 4

		template := Template{
			TemplateID: templateID,
			FieldCount: fieldCount,
			Fields:     []TemplateField{},
		}

		for i := 0; i < int(fieldCount) && offset+4 <= len(payload); i++ {
			fieldID := binary.BigEndian.Uint16(payload[offset : offset+2])
			fieldLength := binary.BigEndian.Uint16(payload[offset+2 : offset+4])
			offset += 4

			field := TemplateField{
				FieldID:     fieldID & 0x7FFF,
				FieldLength: fieldLength,
				FieldName:   getFieldName(fieldID & 0x7FFF),
			}

			if fieldID&0x8000 != 0 && offset+4 <= len(payload) {
				field.EnterpriseNum = binary.BigEndian.Uint32(payload[offset : offset+4])
				offset += 4
			}

			template.Fields = append(template.Fields, field)
		}

		templates = append(templates, template)
	}

	return templates
}

func parseDataFlowSet(payload []byte, template *Template) []FlowRecord {
	records := []FlowRecord{}
	offset := 0

	recordSize := 0
	for _, field := range template.Fields {
		recordSize += int(field.FieldLength)
	}

	if recordSize == 0 {
		return records
	}

	for offset+recordSize <= len(payload) {
		record := FlowRecord{
			TemplateID: template.TemplateID,
			RawFields:  make(map[string]interface{}),
		}

		fieldOffset := offset
		for _, field := range template.Fields {
			fieldData := payload[fieldOffset : fieldOffset+int(field.FieldLength)]
			fieldOffset += int(field.FieldLength)
			decodeField(&record, field.FieldID, field.FieldName, fieldData)
		}

		records = append(records, record)
		offset += recordSize
	}

	return records
}

func decodeField(record *FlowRecord, fieldID uint16, fieldName string, data []byte) {
	switch fieldID {
	case 1:
		record.OctetDeltaCount = readUintN(data)
	case 2:
		record.PacketDeltaCount = readUintN(data)
	case 4:
		record.ProtocolIdentifier = data[0]
	case 5:
		record.IPClassOfService = data[0]
	// case 6:
	// 	record.RawFields[fieldName] = binary.BigEndian.Uint16(data)
	case 7:
		record.SourceTransportPort = binary.BigEndian.Uint16(data)
	case 8:
		record.SourceIPv4Address = decodeIPv4(data)
	case 10:
		record.IngressInterface = binary.BigEndian.Uint32(data)
	case 11:
		record.DestinationTransportPort = binary.BigEndian.Uint16(data)
	case 12:
		record.DestinationIPv4Address = decodeIPv4(data)
	case 14:
		record.EgressInterface = binary.BigEndian.Uint32(data)
	case 15:
		record.RawFields[fieldName] = decodeIPv4(data)
	case 27:
		record.SourceIPv6Address = decodeIPv6(data)
	case 28:
		record.DestinationIPv6Address = decodeIPv6(data)
	case 29:
		record.RawFields[fieldName] = data[0]
	case 30:
		record.RawFields[fieldName] = data[0]
	case 31:
		record.RawFields[fieldName] = binary.BigEndian.Uint32(data)
	case 33:
		record.RawFields[fieldName] = data[0]
	case 56:
		record.RawFields[fieldName] = decodeMacAddress(data)
	case 57:
		record.RawFields[fieldName] = decodeMacAddress(data)
	case 60:
		record.IPVersion = data[0]
	case 61:
		record.FlowDirection = data[0]
	case 62:
		record.RawFields[fieldName] = decodeIPv6(data)
	case 80:
		record.RawFields[fieldName] = decodeMacAddress(data)
	case 81:
		record.RawFields[fieldName] = decodeMacAddress(data)
	case 152:
		record.FlowStartMilliseconds = readUintN(data)
	case 153:
		record.FlowEndMilliseconds = readUintN(data)
	case 160:
		record.RawFields[fieldName] = readUintN(data)
	case 176:
		record.RawFields[fieldName] = data[0]
	case 177:
		record.RawFields[fieldName] = data[0]
	case 178:
		record.RawFields[fieldName] = data[0]
	case 179:
		record.RawFields[fieldName] = data[0]
	case 184:
		record.RawFields[fieldName] = binary.BigEndian.Uint32(data)
	case 185:
		record.RawFields[fieldName] = binary.BigEndian.Uint32(data)
	case 186:
		record.RawFields[fieldName] = binary.BigEndian.Uint16(data)
	case 189:
		record.RawFields[fieldName] = data[0]
	case 192:
		record.RawFields[fieldName] = data[0]
	case 205:
		record.RawFields[fieldName] = binary.BigEndian.Uint16(data)
	case 206:
		record.RawFields[fieldName] = data[0]
	case 224:
		record.RawFields[fieldName] = binary.BigEndian.Uint64(data)
	case 225:
		record.RawFields[fieldName] = decodeIPv4(data)
	case 226:
		record.RawFields[fieldName] = decodeIPv4(data)
	case 227:
		record.RawFields[fieldName] = binary.BigEndian.Uint16(data)
	case 228:
		record.RawFields[fieldName] = binary.BigEndian.Uint16(data)
	default:
		if len(data) <= 8 {
			val := readUintN(data)
			record.RawFields[fieldName] = val
		} else if isPrintable(data) {
			record.RawFields[fieldName] = string(data)
		} else {
			record.RawFields[fieldName] = fmt.Sprintf("%x", data)
		}
	}
}

func decodeIPv4(data []byte) string {
	if len(data) != 4 {
		return ""
	}
	return net.IP(data).String()
}

func decodeIPv6(data []byte) string {
	if len(data) != 16 {
		return ""
	}
	return net.IP(data).String()
}

func decodeMacAddress(data []byte) string {
	if len(data) != 6 {
		return ""
	}
	return fmt.Sprintf("%02x:%02x:%02x:%02x:%02x:%02x",
		data[0], data[1], data[2], data[3], data[4], data[5])
}

func isPrintable(data []byte) bool {
	for _, b := range data {
		if !unicode.IsPrint(rune(b)) && b != 0 {
			return false
		}
	}
	return true
}

func readUintN(data []byte) uint64 {
	switch len(data) {
	case 1:
		return uint64(data[0])
	case 2:
		return uint64(binary.BigEndian.Uint16(data))
	case 4:
		return uint64(binary.BigEndian.Uint32(data))
	case 8:
		return binary.BigEndian.Uint64(data)
	default:
		if len(data) <= 8 {
			padded := make([]byte, 8)
			copy(padded[8-len(data):], data)
			return binary.BigEndian.Uint64(padded)
		}
		return 0
	}
}

func getFieldName(fieldID uint16) string {
	if name, ok := ipfixFieldNames[fieldID]; ok {
		return name
	}
	return fmt.Sprintf("field_%d", fieldID)
}
