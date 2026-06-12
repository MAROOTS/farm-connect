package com.agriconnect.notification.consumer;

import com.agriconnect.notification.dto.OrderEvent;
import com.agriconnect.notification.service.EmailNotificationService;
import com.agriconnect.notification.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final EmailNotificationService emailService;
    private final EmailTemplateService     templates;

    @KafkaListener(
            topics = "order-events",
            groupId = "notification-group"
    )
    public void handleOrderEvent(OrderEvent event) {
        log.info("Notification received: {} for order {}",
                event.getStatus(), event.getOrderId());

        try {
            switch (event.getStatus()) {
                case "ORDER_PLACED"    -> handleOrderPlaced(event);
                case "ORDER_CONFIRMED" -> handleOrderConfirmed(event);
                default -> log.debug(
                        "No notification configured for: {}",
                        event.getStatus());
            }
        } catch (Exception e) {
            log.error("Failed to process notification for order {}: {}",
                    event.getOrderId(), e.getMessage());
        }
    }

    private void handleOrderPlaced(OrderEvent event) {


        if (event.getBuyerEmail() != null) {
            emailService.send(
                    event.getBuyerEmail(),
                    "Your order has been placed — AgriConnect",
                    templates.buyerOrderPlaced(
                            event.getBuyerEmail(),
                            event.getOrderId(),
                            event.getListingTitle() != null
                                    ? event.getListingTitle() : "Farm produce",
                            event.getQuantity(),
                            event.getTotalAmount(),
                            event.getFarmerName() != null
                                    ? event.getFarmerName() : "AgriConnect farmer"
                    )
            );
            log.info("Buyer notified (order placed): {}",
                    event.getBuyerEmail());
        }

        // Email farmer — new order alert
        if (event.getFarmerEmail() != null) {
            emailService.send(
                    event.getFarmerEmail(),
                    "New order on your listing — AgriConnect",
                    templates.farmerNewOrder(
                            event.getFarmerName() != null
                                    ? event.getFarmerName() : "Farmer",
                            event.getOrderId(),
                            event.getListingTitle() != null
                                    ? event.getListingTitle() : "Farm produce",
                            event.getQuantity(),
                            event.getTotalAmount(),
                            event.getBuyerPhone()
                    )
            );
            log.info("Farmer notified (new order): {}",
                    event.getFarmerEmail());
        }
    }

    private void handleOrderConfirmed(OrderEvent event) {

        // Email buyer — payment confirmed
        if (event.getBuyerEmail() != null) {
            emailService.send(
                    event.getBuyerEmail(),
                    "Payment confirmed — AgriConnect",
                    templates.buyerOrderConfirmed(
                            event.getBuyerEmail(),
                            event.getOrderId(),
                            event.getListingTitle() != null
                                    ? event.getListingTitle() : "Farm produce",
                            event.getQuantity(),
                            event.getTotalAmount(),
                            event.getFarmerName() != null
                                    ? event.getFarmerName() : "AgriConnect farmer"
                    )
            );
            log.info("Buyer notified (order confirmed): {}",
                    event.getBuyerEmail());
        }
        // Email farmer — payment received
        if (event.getFarmerEmail() != null) {
            emailService.send(
                    event.getFarmerEmail(),
                    "Payment received — AgriConnect",
                    templates.farmerPaymentReceived(
                            event.getFarmerName() != null
                                    ? event.getFarmerName() : "Farmer",
                            event.getOrderId(),
                            event.getListingTitle() != null
                                    ? event.getListingTitle() : "Farm produce",
                            event.getQuantity(),
                            event.getTotalAmount(),
                            event.getBuyerPhone()
                    )
            );
            log.info("Farmer notified (payment received): {}",
                    event.getFarmerEmail());
        }
    }
}