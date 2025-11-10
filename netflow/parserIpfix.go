package netflow

import (
	"encoding/binary"
	"errors"
)

func ParseIPFIX(b []byte) (*IPFIXMessage, error) {
	if len(b) < 16 {
		return nil, errors.New("buffer menor que header IPFIX (16 bytes)")
	}
	header := IPFIXHeader{
		Version:           binary.BigEndian.Uint16(b[0:2]),
		Length:            binary.BigEndian.Uint16(b[2:4]),
		ExportTime:        binary.BigEndian.Uint32(b[4:8]),
		SequenceNumber:    binary.BigEndian.Uint32(b[8:12]),
		ObservationDomain: binary.BigEndian.Uint32(b[12:16]),
	}

	msg := &IPFIXMessage{Header: header, FlowSets: []FlowSet{}}
	totalLen := int(header.Length)
	if totalLen == 0 || totalLen > len(b) {
		totalLen = len(b)
	}
	offset := 16
	for offset+4 <= totalLen {
		flowSetID := binary.BigEndian.Uint16(b[offset : offset+2])
		flowSetLen := binary.BigEndian.Uint16(b[offset+2 : offset+4])
		if flowSetLen == 0 {
			break
		}
		if offset+int(flowSetLen) > totalLen {
			fs := FlowSet{
				FlowSetID: flowSetID,
				Length:    uint16(totalLen - offset),
				Payload:   append([]byte{}, b[offset:totalLen]...),
			}
			msg.FlowSets = append(msg.FlowSets, fs)
			break
		}
		fs := FlowSet{
			FlowSetID: flowSetID,
			Length:    flowSetLen,
			Payload:   append([]byte{}, b[offset+4:offset+int(flowSetLen)]...),
		}
		msg.FlowSets = append(msg.FlowSets, fs)
		offset += int(flowSetLen)
	}
	return msg, nil
}
