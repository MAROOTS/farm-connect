package com.agriconnect.auth.controller;

import com.agriconnect.auth.entity.User;
import com.agriconnect.auth.entity.UserRole;
import com.agriconnect.auth.repository.UserRepository;
import com.agriconnect.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success("Users fetched",
                        userRepository.findAll()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        List<User> all = userRepository.findAll();
        long farmers   = all.stream()
                .filter(u -> u.getRole() == UserRole.FARMER).count();
        long buyers    = all.stream()
                .filter(u -> u.getRole() == UserRole.BUYER).count();
        long suppliers = all.stream()
                .filter(u -> u.getRole() == UserRole.SUPPLIER).count();
        long verified  = all.stream()
                .filter(User::isVerified).count();
        long active    = all.stream()
                .filter(User::isActive).count();

        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
                Map.of(
                        "totalUsers",  all.size(),
                        "farmers",     farmers,
                        "buyers",      buyers,
                        "suppliers",   suppliers,
                        "verified",    verified,
                        "active",      active
                )));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<ApiResponse<User>> toggleActive(
            @PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                "User status updated", user));
    }
}