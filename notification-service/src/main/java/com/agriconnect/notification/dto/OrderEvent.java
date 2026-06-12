package com.agriconnect.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderEvent {
    private String orderId;
    private String listingId;
    private String buyerId;
    private String buyerPhone;
    private Double quantity;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime timestamp;

    private String buyerEmail;
    private String farmerEmail;
    private String listingTitle;
    private String farmerName;
}