package netflow

import (
	"fmt"
	"log"
	"net"
	"os"
	"time"
)

func StartListener(rabbit *RabbitMQ, listenAddr string) error {
	udpAddr, err := net.ResolveUDPAddr("udp", listenAddr)
	if err != nil {
		return err
	}
	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		return err
	}
	log.Printf("IPFIX listener iniciado em %s", listenAddr)
	go func() {
		defer conn.Close()
		buf := make([]byte, 65535)
		for {
			n, addr, err := conn.ReadFromUDP(buf)
			if err != nil {
				log.Printf("Erro lendo UDP: %v", err)
				continue
			}
			payload := make([]byte, n)
			copy(payload, buf[:n])
			srcPort := 0
			if addr != nil {
				srcPort = addr.Port
			}
			msg := PacketMessage{
				Raw:      payload,
				SrcIP:    addr.IP.String(),
				SrcPort:  srcPort,
				Received: time.Now(),
			}
			if err := rabbit.PublishPacket(msg); err != nil {
				log.Printf("Erro publicando no rabbit: %v", err)
			} else {
				//log.Printf("Packet recebido de %s:%d - tamanho %d publicado na fila", msg.SrcIP, msg.SrcPort, len(payload))
			}
		}
	}()
	return nil
}

func GetListenAddr() string {
	ip := os.Getenv("IPFIX_LISTEN")
	port := os.Getenv("IPFIX_PORT")
	if ip == "" {
		ip = "0.0.0.0"
	}
	if port == "" {
		port = "4739"
	}
	return fmt.Sprintf("%s:%s", ip, port)
}
