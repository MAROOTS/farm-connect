package com.agriconnect.farm.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "farm_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmTask {

    @Id
    private String id;

    @Indexed
    private String farmId;

    @Indexed
    private String farmerId;

    private String cropId;

    private String title;

    private String description;

    private TaskPriority priority;

    private TaskStatus status;

    private LocalDate dueDate;

    private LocalDate completedDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}