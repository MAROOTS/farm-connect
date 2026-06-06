package com.agriconnect.advisory.service;

import com.agriconnect.advisory.dto.WeatherResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {
    private final WebClient.Builder webClientBuilder;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url}")
    private String baseUrl;

    @Value("${weather.api.cache-ttl-minutes}")
    private int cacheTtlMinutes;

    private static final String CACHE_PREFIX = "weather:";

    public WeatherResponse getWeatherByCity(String city) {
        String cacheKey = CACHE_PREFIX + city.toLowerCase().replace(" ", "_");
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                log.debug("Weather cache hit for: {}", city);
                return objectMapper.readValue(cached, WeatherResponse.class);
            } catch (Exception e) {
                log.warn("Failed to deserialize cached weather, fetching fresh");
            }
        }
        WeatherResponse response = webClientBuilder.build()
                .get()
                .uri(baseUrl + "/weather?q={city}&appid={key}&units=metric",
                        city, apiKey)
                .retrieve()
                .bodyToMono(WeatherResponse.class)
                .block();
        try {
            if (response != null) {
                redisTemplate.opsForValue().set(
                        cacheKey,
                        objectMapper.writeValueAsString(response),
                        Duration.ofMinutes(cacheTtlMinutes));
                log.info("Weather fetched and cached for: {}", city);
            }
        } catch (Exception e) {
            log.error("Failed to cache weather response: {}", e.getMessage());
        }

        return response;
    }

    public WeatherResponse getWeatherByCoords(double lat, double lon) {
        String cacheKey = CACHE_PREFIX + lat + "_" + lon;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, WeatherResponse.class);
            } catch (Exception ignored) {}
        }
        WeatherResponse response = webClientBuilder.build()
                .get()
                .uri(baseUrl + "/weather?lat={lat}&lon={lon}&appid={key}&units=metric",
                        lat, lon, apiKey)
                .retrieve()
                .bodyToMono(WeatherResponse.class)
                .block();
        try {
            if (response != null) {
                redisTemplate.opsForValue().set(
                        cacheKey,
                        objectMapper.writeValueAsString(response),
                        Duration.ofMinutes(cacheTtlMinutes));
            }
        } catch (Exception e) {
            log.error("Failed to cache weather responses: {}", e.getMessage());
        }

        return response;
    }
}
