
package com.agriconnect.marketplace.controller;

import com.agriconnect.marketplace.dto.*;
import com.agriconnect.marketplace.entity.*;
import com.agriconnect.marketplace.service.MarketplaceService;
import com.agriconnect.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<Listing>> createListing(
            @Valid @RequestBody ListingRequest request,
            @RequestHeader("X-User-Id") String farmerId,
            @RequestHeader("X-User-Email") String farmerEmail) {

        Listing listing = marketplaceService.createListing(
                request, farmerId, farmerEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Listing created", listing));
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<Listing>>> getListings(
            @RequestParam(required = false) String category) {

        List<Listing> listings = category != null
                ? marketplaceService.getListingsByCategory(category)
                : marketplaceService.getActiveListings();

        return ResponseEntity.ok(
                ApiResponse.success("Listings fetched", listings));
    }

    @GetMapping("/listings/my")
    public ResponseEntity<ApiResponse<List<Listing>>> getMyListings(
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your listings", marketplaceService.getMyListings(farmerId)));
    }


    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<Order>> placeOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader("X-User-Id") String buyerId) {

        Order order = marketplaceService.placeOrder(request, buyerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Order placed. Check your phone for the payment code.", order));
    }

    @PostMapping("/orders/verify-payment")
    public ResponseEntity<ApiResponse<Order>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        Order order = marketplaceService.verifyPayment(request);
        return ResponseEntity.ok(
                ApiResponse.success("Payment verified. Order confirmed!", order));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(
            @RequestHeader("X-User-Id") String buyerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your orders", marketplaceService.getMyOrders(buyerId)));
    }
}