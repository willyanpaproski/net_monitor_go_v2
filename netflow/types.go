package netflow

import "time"

type PacketMessage struct {
	Raw      []byte    `json:"raw"`
	SrcIP    string    `json:"srcIp"`
	SrcPort  int       `json:"srcPort"`
	Received time.Time `json:"received"`
}

type IPFIXHeader struct {
	Version           uint16 `json:"version"`
	Length            uint16 `json:"length"`
	ExportTime        uint32 `json:"exportTime"`
	SequenceNumber    uint32 `json:"sequenceNumber"`
	ObservationDomain uint32 `json:"observationDomain"`
}

type IPFIXMessage struct {
	Header   IPFIXHeader `json:"header"`
	FlowSets []FlowSet   `json:"flowSets"`
}

type FlowSet struct {
	FlowSetID uint16 `json:"flowSetId"`
	Length    uint16 `json:"length"`
	Payload   []byte `json:"payload"`
}

type Template struct {
	TemplateID uint16          `json:"templateId"`
	FieldCount uint16          `json:"fieldCount"`
	Fields     []TemplateField `json:"fields"`
}

type TemplateField struct {
	FieldID       uint16 `json:"fieldId"`
	FieldLength   uint16 `json:"fieldLength"`
	EnterpriseNum uint32 `json:"enterpriseNum,omitempty"`
	FieldName     string `json:"fieldName"`
}

type FlowRecord struct {
	TemplateID               uint16                 `json:"templateId"`
	SourceIPv4Address        string                 `json:"sourceIPv4Address,omitempty"`
	DestinationIPv4Address   string                 `json:"destinationIPv4Address,omitempty"`
	SourceIPv6Address        string                 `json:"sourceIPv6Address,omitempty"`
	DestinationIPv6Address   string                 `json:"destinationIPv6Address,omitempty"`
	SourceTransportPort      uint16                 `json:"sourceTransportPort,omitempty"`
	DestinationTransportPort uint16                 `json:"destinationTransportPort,omitempty"`
	ProtocolIdentifier       uint8                  `json:"protocolIdentifier,omitempty"`
	OctetDeltaCount          uint64                 `json:"octetDeltaCount,omitempty"`
	PacketDeltaCount         uint64                 `json:"packetDeltaCount,omitempty"`
	FlowStartMilliseconds    uint64                 `json:"flowStartMilliseconds,omitempty"`
	FlowEndMilliseconds      uint64                 `json:"flowEndMilliseconds,omitempty"`
	IngressInterface         uint32                 `json:"ingressInterface,omitempty"`
	EgressInterface          uint32                 `json:"egressInterface,omitempty"`
	IPClassOfService         uint8                  `json:"ipClassOfService,omitempty"`
	FlowDirection            uint8                  `json:"flowDirection,omitempty"`
	IPVersion                uint8                  `json:"ipVersion,omitempty"`
	RawFields                map[string]interface{} `json:"rawFields,omitempty"`
}

type DecodedIPFIXMessage struct {
	SrcIP       string       `json:"srcIp"`
	SrcPort     int          `json:"srcPort"`
	Received    time.Time    `json:"received"`
	Header      IPFIXHeader  `json:"header"`
	Templates   []Template   `json:"templates"`
	FlowRecords []FlowRecord `json:"flowRecords"`
}
