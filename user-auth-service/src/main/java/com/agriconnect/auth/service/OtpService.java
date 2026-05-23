package com.agriconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redisTemplate;

    @Value("${otp.expiry-minutes}")
    private int expiryMinutes;

    @Value("${otp.length}")
    private int otpLength;

    private static final String OTP_PREFIX = "otp:";
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateAndStore(String email){
        String otp = generateOtp();
        String key = OTP_PREFIX + email.toLowerCase();
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(expiryMinutes));
        log.info("OTP stored for email: {} (expires in {} mins)", email, expiryMinutes);
        return otp;
    }

    public boolean verify(String email, String submittedOtp){
        String key = OTP_PREFIX + email.toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if(storedOtp == null){
            log.warn("OTP not found or expired for email: {}", email);
            return false;
        }
        if (!storedOtp.equals(submittedOtp)) {
            log.warn("OTP does not match stored for email: {}", email);
            return false;
        }
        redisTemplate.delete(key);
        log.warn("Invalid OTP attempt for email: {}", email);
        return true;
    }

    private String generateOtp(){
        int bound = (int) Math.pow(10, otpLength);
        int otp = secureRandom.nextInt(bound);
        return String.format("%0" + otpLength + "d", otp);
    }
}
