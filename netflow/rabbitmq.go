package netflow

import (
	"encoding/json"
	"log"

	"github.com/streadway/amqp"
)

type RabbitMQ struct {
	Conn    *amqp.Connection
	Channel *amqp.Channel
	Queue   amqp.Queue
}

func NewRabbitMQ(amqpURL, queueName string) (*RabbitMQ, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, err
	}
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}
	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}
	if err := ch.Qos(1, 0, false); err != nil {
		log.Printf("Warning: failed setting QoS: %v", err)
	}
	return &RabbitMQ{
		Conn:    conn,
		Channel: ch,
		Queue:   q,
	}, nil
}

func (r *RabbitMQ) PublishPacket(msg PacketMessage) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return r.Channel.Publish(
		"",
		r.Queue.Name,
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         body,
		},
	)
}

func (r *RabbitMQ) PublishDecodedIPFIX(msg DecodedIPFIXMessage) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return r.Channel.Publish(
		"",
		r.Queue.Name,
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         body,
		},
	)
}

func (r *RabbitMQ) Consume() (<-chan amqp.Delivery, error) {
	return r.Channel.Consume(
		r.Queue.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
}

func (r *RabbitMQ) Close() {
	if r.Channel != nil {
		r.Channel.Close()
	}
	if r.Conn != nil {
		r.Conn.Close()
	}
}
