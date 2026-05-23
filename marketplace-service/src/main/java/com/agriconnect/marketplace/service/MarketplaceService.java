package com.agriconnect.marketplace.service;

import com.agriconnect.marketplace.dto.*;
import com.agriconnect.marketplace.entity.*;
import com.agriconnect.marketplace.event.OrderEvent;
import com.agriconnect.marketplace.event.OrderEventPublisher;
import com.agriconnect.marketplace.repository.*;
import com.agriconnect.common.exception.AgriConnectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final SmsOtpService smsOtpService;
    private final OrderEventPublisher orderEventPublisher;



    public Listing createListing(ListingRequest request,
                                 String farmerId, String farmerName) {
        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .pricePerUnit(request.getPricePerUnit())
                .unit(request.getUnit())
                .quantityAvailable(request.getQuantityAvailable())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .farmerId(farmerId)
                .farmerName(farmerName)
                .status(ListingStatus.ACTIVE)
                .build();

        return listingRepository.save(listing);
    }

    public List<Listing> getActiveListings() {
        return listingRepository.findByStatus(ListingStatus.ACTIVE);
    }

    public List<Listing> getListingsByCategory(String category) {
        return listingRepository.findByCategoryAndStatus(
                category, ListingStatus.ACTIVE);
    }

    public List<Listing> getMyListings(String farmerId) {
        return listingRepository.findByFarmerIdAndStatus(
                farmerId, ListingStatus.ACTIVE);
    }


    @Transactional
    public Order placeOrder(OrderRequest request, String buyerId) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new AgriConnectException(
                        "Listing not found", HttpStatus.NOT_FOUND));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new AgriConnectException(
                    "Listing is no longer available", HttpStatus.BAD_REQUEST);
        }

        if (listing.getQuantityAvailable() < request.getQuantity()) {
            throw new AgriConnectException(
                    "Insufficient quantity available", HttpStatus.BAD_REQUEST);
        }

        BigDecimal total = listing.getPricePerUnit()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = Order.builder()
                .listingId(listing.getId())
                .buyerId(buyerId)
                .buyerPhone(request.getBuyerPhone())
                .quantity(request.getQuantity())
                .totalAmount(total)
                .status(OrderStatus.PENDING_PAYMENT)
                .build();

        order = orderRepository.save(order);

        smsOtpService.sendPaymentOtp(
                order.getId().toString(), request.getBuyerPhone());

        orderEventPublisher.publish(OrderEvent.builder()
                .orderId(order.getId().toString())
                .listingId(listing.getId().toString())
                .buyerId(buyerId)
                .buyerPhone(request.getBuyerPhone())
                .quantity(request.getQuantity())
                .totalAmount(total)
                .status("ORDER_PLACED")
                .timestamp(LocalDateTime.now())
                .build());

        return order;
    }

    @Transactional
    public Order verifyPayment(PaymentVerifyRequest request) {
        Order order = orderRepository.findById(
                        UUID.fromString(request.getOrderId()))
                .orElseThrow(() -> new AgriConnectException(
                        "Order not found", HttpStatus.NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new AgriConnectException(
                    "Order is not awaiting payment", HttpStatus.BAD_REQUEST);
        }

        boolean valid = smsOtpService.verifyPaymentOtp(
                request.getOrderId(), request.getOtp());

        if (!valid) {
            throw new AgriConnectException(
                    "Invalid or expired payment code", HttpStatus.UNAUTHORIZED);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order = orderRepository.save(order);

        // Reduce listing quantity
        Listing listing = listingRepository.findById(order.getListingId())
                .orElseThrow();
        listing.setQuantityAvailable(
                listing.getQuantityAvailable() - order.getQuantity());
        if (listing.getQuantityAvailable() <= 0) {
            listing.setStatus(ListingStatus.SOLD_OUT);
        }
        listingRepository.save(listing);

        // Notify other services via Kafka
        orderEventPublisher.publish(OrderEvent.builder()
                .orderId(order.getId().toString())
                .listingId(order.getListingId().toString())
                .buyerId(order.getBuyerId())
                .totalAmount(order.getTotalAmount())
                .status("ORDER_CONFIRMED")
                .timestamp(LocalDateTime.now())
                .build());

        return order;
    }

    public List<Order> getMyOrders(String buyerId) {
        return orderRepository.findByBuyerId(buyerId);
    }
}