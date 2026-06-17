package com.agriconnect.marketplace.controller;

import com.agriconnect.common.dto.ApiResponse;
import com.agriconnect.marketplace.dto.ReviewRequest;
import com.agriconnect.marketplace.entity.Review;
import com.agriconnect.marketplace.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody ReviewRequest request,
            @RequestHeader("X-User-Id") String buyerId) {
        Review review = reviewService.createReview(request, buyerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted", review));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>>
    getFarmerRating(@PathVariable String farmerId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rating fetched",
                reviewService.getFarmerRatingSummary(farmerId)));
    }

    @GetMapping("/order/{orderId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> reviewExists(
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Checked", reviewService.reviewExists(orderId)));
    }
}