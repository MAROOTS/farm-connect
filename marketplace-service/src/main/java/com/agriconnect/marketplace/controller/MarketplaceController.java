
package com.agriconnect.marketplace.controller;

import com.agriconnect.common.exception.AgriConnectException;
import com.agriconnect.marketplace.dto.*;
import com.agriconnect.marketplace.entity.*;
import com.agriconnect.marketplace.repository.ListingRepository;
import com.agriconnect.marketplace.repository.OrderRepository;
import com.agriconnect.marketplace.service.MarketplaceService;
import com.agriconnect.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<Listing>> createListing(
            @Valid @RequestBody ListingRequest request,
            @RequestHeader("X-User-Id") String farmerId,
            @RequestHeader("X-User-Name") String farmerName,
            @RequestHeader("X-User-Email") String farmerEmail) {

        Listing listing = marketplaceService.createListing(
                request, farmerId,farmerName, farmerEmail);
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
            @RequestHeader("X-User-Id") String buyerId,
            @RequestHeader("X-User-Email") String buyerEmail
    ) {

        Order order = marketplaceService.placeOrder(request, buyerId, buyerEmail);
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

    @GetMapping("/admin/all-listings")
    public ResponseEntity<ApiResponse<List<Listing>>> adminGetAllListings() {
        return ResponseEntity.ok(ApiResponse.success(
                "All listings", listingRepository.findAll()));
    }

    @GetMapping("/admin/all-orders")
    public ResponseEntity<ApiResponse<List<Order>>> adminGetAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(
                "All orders", orderRepository.findAll()));
    }

    @PatchMapping("/admin/listings/{id}/status")
    public ResponseEntity<ApiResponse<Listing>> adminUpdateListingStatus(
            @PathVariable UUID id,
            @RequestParam ListingStatus status) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new AgriConnectException(
                        "Listing not found", HttpStatus.NOT_FOUND));
        listing.setStatus(status);
        listingRepository.save(listing);
        return ResponseEntity.ok(ApiResponse.success("Status updated", listing));
    }

    @DeleteMapping("/admin/listings/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteListing(
            @PathVariable UUID id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new AgriConnectException(
                        "Listing not found", HttpStatus.NOT_FOUND));
        listing.setStatus(ListingStatus.DELETED);
        listingRepository.save(listing);
        return ResponseEntity.ok(ApiResponse.success(
                "Listing removed", null));
    }

    @PatchMapping("/admin/orders/{id}/status")
    public ResponseEntity<ApiResponse<Order>> adminUpdateOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AgriConnectException(
                        "Order not found", HttpStatus.NOT_FOUND));
        order.setStatus(status);
        orderRepository.save(order);
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated", order));
    }
}