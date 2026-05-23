package com.agriconnect.marketplace.service;

import com.africastalking.AfricasTalking;
import com.africastalking.SmsService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
public class SmsOtpService {

    private final StringRedisTemplate redisTemplate;
    private SmsService smsService;

    @Value("${africastalking.username}")
    private String username;

    @Value("${africastalking.api-key}")
    private String apiKey;

    @Value("${africastalking.sender-id}")
    private String senderId;

    @Value("${otp.expiry-minutes}")
    private int expiryMinutes;

    @Value("${otp.length}")
    private int otpLength;

    private static final String OTP_PREFIX = "payment_otp:";
    private final SecureRandom secureRandom = new SecureRandom();

    public SmsOtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void init() {
        AfricasTalking.initialize(username, apiKey);
        smsService = AfricasTalking.getService(AfricasTalking.SERVICE_SMS);
        log.info("Africa's Talking SMS service initialized (sandbox: {})",
                username.equals("sandbox"));
    }

    public void sendPaymentOtp(String orderId, String phoneNumber) {
        String otp = generateOtp();
        String key = OTP_PREFIX + orderId;

        // Store in Redis with TTL
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(expiryMinutes));

        String message = String.format(
                "AgriConnect: Your payment verification code for order #%s is %s. " +
                        "Valid for %d minutes. Do not share this code.",
                orderId.substring(0, 8).toUpperCase(), otp, expiryMinutes
        );

        try {
            smsService.send(message, new String[]{ phoneNumber }, false);
            log.info("Payment OTP sent to {} for order {}", phoneNumber, orderId);
        } catch (Exception e) {
            log.error("Failed to send SMS OTP to {}: {}", phoneNumber, e.getMessage());
            // Clean up Redis entry if SMS failed
            redisTemplate.delete(key);
            throw new RuntimeException("Failed to send payment verification SMS");
        }
    }

    public boolean verifyPaymentOtp(String orderId, String submittedOtp) {
        String key = OTP_PREFIX + orderId;
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            log.warn("Payment OTP expired or not found for order: {}", orderId);
            return false;
        }

        if (!storedOtp.equals(submittedOtp)) {
            log.warn("Invalid payment OTP for order: {}", orderId);
            return false;
        }

        redisTemplate.delete(key);   // consumed — one-time use
        log.info("Payment OTP verified for order: {}", orderId);
        return true;
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, otpLength);
        return String.format("%0" + otpLength + "d",
                secureRandom.nextInt(bound));
    }
}