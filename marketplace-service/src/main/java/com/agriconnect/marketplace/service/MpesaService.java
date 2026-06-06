package com.agriconnect.marketplace.service;

import com.agriconnect.common.exception.AgriConnectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MpesaService {

    private final RestTemplate restTemplate;

    @Value("${mpesa.consumer-key}")
    private String consumerKey;

    @Value("${mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${mpesa.shortcode}")
    private String shortcode;

    @Value("${mpesa.passkey}")
    private String passkey;

    @Value("${mpesa.callback-url}")
    private String callbackUrl;

    @Value("${mpesa.auth-url}")
    private String authUrl;

    @Value("${mpesa.stk-push-url}")
    private String stkPushUrl;

    public String getAccessToken() {
        String credentials = consumerKey + ":" + consumerSecret;
        String encoded = Base64.getEncoder().encodeToString(
                credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    authUrl, HttpMethod.GET, entity, Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("access_token")) {
                return (String) body.get("access_token");
            }
            throw new AgriConnectException(
                    "Failed to get M-Pesa access token",
                    HttpStatus.SERVICE_UNAVAILABLE);
        } catch (Exception e) {
            log.error("M-Pesa auth failed: {}", e.getMessage());
            throw new AgriConnectException(
                    "M-Pesa service unavailable",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }


    private String generatePassword(String timestamp) {
        String raw = shortcode + passkey + timestamp;
        return Base64.getEncoder().encodeToString(
                raw.getBytes(StandardCharsets.UTF_8));
    }
    private String getTimestamp() {
        return LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    public Map<String, Object> initiateSTKPush(
            String phone, double amount, String orderId) {

        String token     = getAccessToken();
        String timestamp = getTimestamp();
        String password  = generatePassword(timestamp);

        String normalizedPhone = normalizePhone(phone);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> body = new HashMap<>();
        body.put("BusinessShortCode", shortcode);
        body.put("Password", password);
        body.put("Timestamp", timestamp);
        body.put("TransactionType", "CustomerPayBillOnline");
        body.put("Amount", (int) Math.ceil(amount)); // M-Pesa needs integer
        body.put("PartyA", normalizedPhone);
        body.put("PartyB", shortcode);
        body.put("PhoneNumber", normalizedPhone);
        body.put("CallBackURL", callbackUrl);
        body.put("AccountReference", "AgriConnect-" +
                orderId.substring(0, 8).toUpperCase());
        body.put("TransactionDesc",
                "Payment for AgriConnect order " +
                        orderId.substring(0, 8).toUpperCase());

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    stkPushUrl, HttpMethod.POST, request, Map.class);

            Map<String, Object> responseBody = response.getBody();
            log.info("STK Push initiated for order {}: {}",
                    orderId, responseBody);
            return responseBody;

        } catch (Exception e) {
            log.error("STK Push failed for order {}: {}",
                    orderId, e.getMessage());
            throw new AgriConnectException(
                    "Failed to initiate M-Pesa payment",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private String normalizePhone(String phone) {
        // Remove spaces, dashes
        phone = phone.replaceAll("[\\s\\-()]", "");

        // Convert +254XXXXXXXXX or 0XXXXXXXXX to 254XXXXXXXXX
        if (phone.startsWith("+254")) {
            return phone.substring(1);
        } else if (phone.startsWith("0")) {
            return "254" + phone.substring(1);
        } else if (phone.startsWith("254")) {
            return phone;
        }
        return phone;
    }
}