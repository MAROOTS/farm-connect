package com.agriconnect.farm.dto;

import com.agriconnect.farm.document.CropStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CropRequest {

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    @NotBlank(message = "Crop name is required")
    private String cropName;

    private String variety;

    @NotNull(message = "Planted area is required")
    private Double plantedAreaAcres;

    @NotNull(message = "Planting date is required")
    private LocalDate plantingDate;

    private LocalDate expectedHarvestDate;

    private Double expectedYieldKg;

    private String notes;

    private CropStatus status = CropStatus.PLANTED;
}