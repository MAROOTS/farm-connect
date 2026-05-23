package com.agriconnect.auth.service;

import com.agriconnect.auth.dto.AuthResponse;
import com.agriconnect.auth.dto.OtpRequest;
import com.agriconnect.auth.dto.OtpVerifyRequest;
import com.agriconnect.auth.dto.RegisterRequest;
import com.agriconnect.auth.entity.User;
import com.agriconnect.auth.repository.UserRepository;
import com.agriconnect.auth.security.JwtUtil;
import com.agriconnect.common.exception.AgriConnectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AgriConnectException("Email already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AgriConnectException(
                    "Phone number already registered", HttpStatus.CONFLICT);
        }
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .verified(false)
                .build();

        userRepository.save(user);
        String otp = otpService.generateAndStore(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp, request.getFullName());

        return "Registration successful. Check your email for the verification code.";
    }
    public String requestLoginOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AgriConnectException(
                        "No account found with this email", HttpStatus.NOT_FOUND));

        if (!user.isActive()) {
            throw new AgriConnectException(
                    "Account is deactivated", HttpStatus.FORBIDDEN);
        }

        String otp = otpService.generateAndStore(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otp, user.getFullName());

        return "Login code sent to your email.";
    }
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AgriConnectException(
                        "No account found with this email", HttpStatus.NOT_FOUND));

        boolean valid = otpService.verify(request.getEmail(), request.getOtp());
        if (!valid) {
            throw new AgriConnectException(
                    "Invalid or expired OTP", HttpStatus.UNAUTHORIZED);
        }
        // Mark email as verified on first login
        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }
        String token = jwtUtil.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
