package com.agriconnect.auth.controller;

import com.agriconnect.auth.dto.*;
import com.agriconnect.auth.entity.User;
import com.agriconnect.auth.repository.UserRepository;
import com.agriconnect.auth.service.AuthService;
import com.agriconnect.common.dto.ApiResponse;
import com.agriconnect.common.exception.AgriConnectException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    // POST /api/auth/otp/request  — returning users request login OTP
    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<String>> requestOtp(
            @Valid @RequestBody OtpRequest request) {

        String message = authService.requestLoginOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    // POST /api/auth/otp/verify  — verify OTP and get JWT
    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request) {

        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response));
    }

    @GetMapping("/users/{id}/public")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicProfile(
            @PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AgriConnectException(
                        "User not found", HttpStatus.NOT_FOUND));

        Map<String, Object> profile = Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt()
        );
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched", profile));
    }
}