// marketplace-service/src/main/java/com/agriconnect/marketplace/event/OrderEvent.java

package com.agriconnect.marketplace.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String orderId;
    private String listingId;
    private String buyerId;
    private String buyerPhone;
    private Double quantity;
    private BigDecimal totalAmount;
    private String status;           // ORDER_PLACED, ORDER_CONFIRMED, ORDER_CANCELLED
    private LocalDateTime timestamp;
}