package com.agriconnect.advisory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeatherSummary {
    private Double temperatureCelsius;
    private Double humidity;
    private Double windSpeedMs;
    private String condition;
    private String description;
    private Double rainfallMm;
}