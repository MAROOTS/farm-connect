package com.agriconnect.auth.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;
}