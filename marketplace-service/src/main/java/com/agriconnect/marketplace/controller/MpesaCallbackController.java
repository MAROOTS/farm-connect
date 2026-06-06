package com.agriconnect.marketplace.controller;

import com.agriconnect.marketplace.entity.OrderStatus;
import com.agriconnect.marketplace.event.OrderEvent;
import com.agriconnect.marketplace.event.OrderEventPublisher;
import com.agriconnect.marketplace.repository.ListingRepository;
import com.agriconnect.marketplace.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/marketplace/mpesa")
@RequiredArgsConstructor
public class MpesaCallbackController {

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final OrderEventPublisher orderEventPublisher;

    @PostMapping("/callback")
    public ResponseEntity<Map<String, String>> handleCallback(
            @RequestBody Map<String, Object> payload) {

        log.info("M-Pesa callback received: {}", payload);

        try {
            // Extract callback data
            Map<String, Object> body =
                    (Map<String, Object>) payload.get("Body");
            Map<String, Object> stkCallback =
                    (Map<String, Object>) body.get("stkCallback");

            int resultCode = (int) stkCallback.get("ResultCode");
            String checkoutRequestId =
                    (String) stkCallback.get("CheckoutRequestID");

            if (resultCode == 0) {
                Map<String, Object> callbackMetadata =
                        (Map<String, Object>) stkCallback.get("CallbackMetadata");

                String mpesaReceiptNumber = null;
                Double amount = null;
                String phoneNumber = null;

                if (callbackMetadata != null) {
                    java.util.List<Map<String, Object>> items =
                            (java.util.List<Map<String, Object>>)
                                    callbackMetadata.get("Item");

                    for (Map<String, Object> item : items) {
                        String name = (String) item.get("Name");
                        Object value = item.get("Value");
                        switch (name) {
                            case "MpesaReceiptNumber" ->
                                    mpesaReceiptNumber = (String) value;
                            case "Amount" ->
                                    amount = ((Number) value).doubleValue();
                            case "PhoneNumber" ->
                                    phoneNumber = String.valueOf(value);
                        }
                    }
                }

                // Find order by checkoutRequestId stored in Redis
                // or by amount + phone matching
                log.info("Payment successful — Receipt: {} Amount: {} Phone: {}",
                        mpesaReceiptNumber, amount, phoneNumber);

                // Find and confirm the pending order for this phone
                confirmPendingOrder(phoneNumber, amount, mpesaReceiptNumber);

            } else {
                // Payment failed or cancelled
                String resultDesc =
                        (String) stkCallback.get("ResultDesc");
                log.warn("M-Pesa payment failed: {}", resultDesc);
            }

        } catch (Exception e) {
            log.error("Error processing M-Pesa callback: {}",
                    e.getMessage());
        }

        // Always return success to Safaricom
        return ResponseEntity.ok(Map.of("ResultCode", "0",
                "ResultDesc", "Accepted"));
    }

    private void confirmPendingOrder(String phone,
                                     Double amount, String receiptNumber) {
        try {
            // Normalize phone for matching
            String normalizedPhone = phone;
            if (phone != null && phone.startsWith("254")) {
                normalizedPhone = "+" + phone;
            }

            final String finalPhone = normalizedPhone;

            orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() == OrderStatus.PENDING_PAYMENT)
                    .filter(o -> {
                        String p = o.getBuyerPhone()
                                .replaceAll("[\\s\\-()]", "");
                        return p.equals(finalPhone) ||
                                p.equals(phone) ||
                                p.replace("+", "").equals(phone);
                    })
                    .findFirst()
                    .ifPresent(order -> {
                        order.setStatus(OrderStatus.CONFIRMED);
                        orderRepository.save(order);

                        // Update listing quantity
                        listingRepository.findById(order.getListingId())
                                .ifPresent(listing -> {
                                    listing.setQuantityAvailable(
                                            listing.getQuantityAvailable()
                                                    - order.getQuantity());
                                    listingRepository.save(listing);
                                });

                        // Publish Kafka event
                        orderEventPublisher.publish(OrderEvent.builder()
                                .orderId(order.getId().toString())
                                .listingId(order.getListingId().toString())
                                .buyerId(order.getBuyerId())
                                .totalAmount(order.getTotalAmount())
                                .status("ORDER_CONFIRMED")
                                .timestamp(LocalDateTime.now())
                                .build());

                        log.info("Order {} confirmed via M-Pesa receipt {}",
                                order.getId(), receiptNumber);
                    });

        } catch (Exception e) {
            log.error("Failed to confirm order: {}", e.getMessage());
        }
    }
}