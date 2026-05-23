// user-auth-service/src/main/java/com/agriconnect/auth/controller/AuthController.java

package com.agriconnect.auth.controller;

import com.agriconnect.auth.dto.*;
import com.agriconnect.auth.service.AuthService;
import com.agriconnect.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
}