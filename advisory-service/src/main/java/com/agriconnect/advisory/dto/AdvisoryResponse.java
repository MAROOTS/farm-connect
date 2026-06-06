package com.agriconnect.advisory.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AdvisoryResponse {

    private String location;
    private WeatherSummary weather;
    private List<String> farmingTips;
    private String overallAdvice;
    private String alertLevel;
}