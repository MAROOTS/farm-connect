package com.agriconnect.marketplace.service;

import com.agriconnect.common.exception.AgriConnectException;
import com.agriconnect.marketplace.dto.ReviewRequest;
import com.agriconnect.marketplace.entity.*;
import com.agriconnect.marketplace.repository.ListingRepository;
import com.agriconnect.marketplace.repository.OrderRepository;
import com.agriconnect.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository   reviewRepository;
    private final OrderRepository    orderRepository;
    private final ListingRepository  listingRepository;

    public Review createReview(ReviewRequest request, String buyerId) {

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AgriConnectException(
                    "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST);
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AgriConnectException(
                        "Order not found", HttpStatus.NOT_FOUND));

        if (!order.getBuyerId().equals(buyerId)) {
            throw new AgriConnectException(
                    "You can only review your own orders",
                    HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new AgriConnectException(
                    "You can only review orders after delivery",
                    HttpStatus.BAD_REQUEST);
        }

        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new AgriConnectException(
                    "You have already reviewed this order",
                    HttpStatus.BAD_REQUEST);
        }

        Listing listing = listingRepository.findById(order.getListingId())
                .orElseThrow(() -> new AgriConnectException(
                        "Listing not found", HttpStatus.NOT_FOUND));

        Review review = Review.builder()
                .orderId(order.getId())
                .listingId(listing.getId())
                .farmerId(listing.getFarmerId())
                .buyerId(buyerId)
                .rating(request.getRating())
                .build();

        return reviewRepository.save(review);
    }

    public Map<String, Object> getFarmerRatingSummary(String farmerId) {
        Double avg = reviewRepository.findAverageRatingByFarmerId(farmerId);
        long count = reviewRepository.countByFarmerId(farmerId);
        return Map.of(
                "averageRating", avg != null
                        ? Math.round(avg * 10) / 10.0 : 0,
                "totalReviews", count
        );
    }

    public boolean reviewExists(UUID orderId) {
        return reviewRepository.existsByOrderId(orderId);
    }
}