package com.agriconnect.marketplace.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    private static final String TOPIC = "order-events";

    public void publish(OrderEvent event) {
        kafkaTemplate.send(TOPIC, event.getOrderId(), event);
        log.info("Order event published: {} for order {}",
                event.getStatus(), event.getOrderId());
    }
}