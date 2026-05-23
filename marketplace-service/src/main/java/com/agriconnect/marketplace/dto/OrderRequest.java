package com.agriconnect.marketplace.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderRequest {

    @NotNull(message = "Listing ID is required")
    private UUID listingId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Double quantity;

    @NotBlank(message = "Phone number is required")
    private String buyerPhone;
}