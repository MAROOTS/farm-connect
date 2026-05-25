package com.agriconnect.farm.dto;

import com.agriconnect.farm.document.TaskPriority;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    private String cropId;

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}