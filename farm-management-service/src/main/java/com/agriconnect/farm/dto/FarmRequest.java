package com.agriconnect.farm.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class FarmRequest {

    @NotBlank(message = "Farm name is required")
    private String farmName;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Farm size is required")
    @Min(value = 0, message = "Farm size must be positive")
    private Double sizeInAcres;

    private String farmImageUrl;

    private String soilType;

    private List<String> cropTypes;
}