package com.agriconnect.advisory.service;

import com.agriconnect.advisory.dto.*;
import com.agriconnect.common.exception.AgriConnectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdvisoryService {

    private final WeatherService weatherService;

    public AdvisoryResponse getAdvisoryByCity(String city) {
        WeatherResponse weather = weatherService.getWeatherByCity(city);
        if (weather == null) {
            throw new AgriConnectException(
                    "Could not fetch weather for: " + city,
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
        return buildAdvisory(weather);
    }

    public AdvisoryResponse getAdvisoryByCoords(double lat, double lon) {
        WeatherResponse weather = weatherService.getWeatherByCoords(lat, lon);
        if (weather == null) {
            throw new AgriConnectException(
                    "Could not fetch weather for given coordinates",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
        return buildAdvisory(weather);
    }

    private AdvisoryResponse buildAdvisory(WeatherResponse weather) {
        double temp = weather.getMain().getTemp();
        double humidity = weather.getMain().getHumidity();
        double windSpeed = weather.getWind() != null
                ? weather.getWind().getSpeed() : 0;
        double rainfall = weather.getRain() != null
                && weather.getRain().getLastHour() != null
                ? weather.getRain().getLastHour() : 0;

        String condition = weather.getWeather() != null
                && !weather.getWeather().isEmpty()
                ? weather.getWeather().getFirst().getMain() : "Clear";

        List<String> tips = generateTips(temp, humidity, windSpeed,
                rainfall, condition);
        String alertLevel = determineAlertLevel(temp, windSpeed, rainfall);
        String overallAdvice = generateOverallAdvice(alertLevel, condition);

        WeatherSummary summary = WeatherSummary.builder()
                .temperatureCelsius(temp)
                .humidity(humidity)
                .windSpeedMs(windSpeed)
                .condition(condition)
                .description(weather.getWeather() != null
                        && !weather.getWeather().isEmpty()
                        ? weather.getWeather().getFirst().getDescription() : "")
                .rainfallMm(rainfall)
                .build();

        return AdvisoryResponse.builder()
                .location(weather.getName())
                .weather(summary)
                .farmingTips(tips)
                .overallAdvice(overallAdvice)
                .alertLevel(alertLevel)
                .build();
    }

    private List<String> generateTips(double temp, double humidity,
                                      double windSpeed, double rainfall, String condition) {

        List<String> tips = new ArrayList<>();

        if (temp > 35) {
            tips.add("Very high temperature — increase irrigation frequency " +
                    "and water crops in early morning or evening.");
            tips.add("Consider shade nets for sensitive crops like tomatoes " +
                    "and leafy vegetables.");
        } else if (temp > 28) {
            tips.add("Warm conditions — ensure consistent soil moisture. " +
                    "Good for maize and beans.");
        } else if (temp < 15) {
            tips.add("Cool temperatures — ideal for cabbages, kales, " +
                    "and spinach. Protect seedlings from cold stress.");
        } else {
            tips.add("Temperatures are ideal for most crops. " +
                    "Good day for planting or transplanting.");
        }

        if (humidity > 80) {
            tips.add("High humidity — risk of fungal diseases. " +
                    "Inspect crops for blight and apply fungicide if needed.");
            tips.add("Ensure proper spacing between plants for air circulation.");
        } else if (humidity < 30) {
            tips.add("Low humidity — increase watering. " +
                    "Mulch around crops to retain soil moisture.");
        }

        if (rainfall > 20) {
            tips.add("Heavy rainfall recorded — check drainage channels " +
                    "and avoid waterlogging. Postpone any spraying activities.");
        } else if (rainfall > 5) {
            tips.add("Light rain received — you may reduce irrigation today. " +
                    "Good time to apply fertilizer after rain.");
        } else if (condition.equals("Rain") || condition.equals("Drizzle")) {
            tips.add("Rain expected — delay pesticide or fertilizer application " +
                    "to avoid runoff.");
        } else {
            tips.add("No significant rainfall — maintain your regular " +
                    "irrigation schedule.");
        }
        if (windSpeed > 10) {
            tips.add("Strong winds — avoid spraying pesticides or herbicides " +
                    "as drift may damage non-target crops.");
        }

        return tips;
    }

    private String determineAlertLevel(double temp,
                                       double windSpeed, double rainfall) {
        if (temp > 38 || windSpeed > 15 || rainfall > 50) return "WARNING";
        if (temp > 33 || windSpeed > 10 || rainfall > 20) return "CAUTION";
        return "NORMAL";
    }

    private String generateOverallAdvice(String alertLevel, String condition) {
        return switch (alertLevel) {
            case "WARNING" -> "Extreme weather conditions detected. " +
                    "Protect crops and livestock. Avoid heavy fieldwork today.";
            case "CAUTION" -> "Challenging conditions expected. " +
                    "Monitor crops closely and take precautionary measures.";
            default -> "Weather conditions are favorable for normal " +
                    "farming activities today.";
        };
    }
}