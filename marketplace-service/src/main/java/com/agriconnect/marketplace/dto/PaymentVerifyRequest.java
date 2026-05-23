package com.agriconnect.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentVerifyRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "OTP is required")
    private String otp;
}