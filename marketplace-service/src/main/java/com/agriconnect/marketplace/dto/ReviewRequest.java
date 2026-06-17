package com.agriconnect.marketplace.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ReviewRequest {
    private UUID orderId;
    private int rating;
}