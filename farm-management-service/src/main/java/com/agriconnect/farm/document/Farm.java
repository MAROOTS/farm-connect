package com.agriconnect.farm.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "farms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Farm {

    @Id
    private String id;

    @Indexed(unique = true)
    private String farmerId;

    private String farmerName;

    private String farmName;

    private String location;

    private Double sizeInAcres;

    private String farmImageUrl;

    private String soilType;

    private List<String> cropTypes;

    private FarmStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}