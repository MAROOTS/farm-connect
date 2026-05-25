package com.agriconnect.farm.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "crops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Crop {

    @Id
    private String id;

    @Indexed
    private String farmId;

    @Indexed
    private String farmerId;

    private String cropName;

    private String variety;

    private Double plantedAreaAcres;

    private LocalDate plantingDate;

    private LocalDate expectedHarvestDate;

    private CropStatus status;

    private String notes;

    private Double expectedYieldKg;

    private Double actualYieldKg;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}