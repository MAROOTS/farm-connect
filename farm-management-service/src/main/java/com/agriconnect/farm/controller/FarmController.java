package com.agriconnect.farm.controller;

import com.agriconnect.common.dto.ApiResponse;
import com.agriconnect.farm.document.*;
import com.agriconnect.farm.dto.*;
import com.agriconnect.farm.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;
    @PostMapping
    public ResponseEntity<ApiResponse<Farm>> registerFarm(
            @Valid @RequestBody FarmRequest request,
            @RequestHeader("X-User-Id") String farmerId,
            @RequestHeader("X-User-Email") String farmerName) {

        Farm farm = farmService.registerFarm(request, farmerId, farmerName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Farm registered", farm));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Farm>> getMyFarm(
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(
                ApiResponse.success("Farm details", farmService.getMyFarm(farmerId)));
    }

    @PutMapping("/my")
    public ResponseEntity<ApiResponse<Farm>> updateFarm(
            @Valid @RequestBody FarmRequest request,
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Farm updated", farmService.updateFarm(request, farmerId)));
    }
    @PostMapping("/crops")
    public ResponseEntity<ApiResponse<Crop>> addCrop(
            @Valid @RequestBody CropRequest request,
            @RequestHeader("X-User-Id") String farmerId) {

        Crop crop = farmService.addCrop(request, farmerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Crop added", crop));
    }

    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<List<Crop>>> getMyCrops(
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your crops", farmService.getMyCrops(farmerId)));
    }

    @PatchMapping("/crops/{cropId}/status")
    public ResponseEntity<ApiResponse<Crop>> updateCropStatus(
            @PathVariable String cropId,
            @RequestParam CropStatus status,
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Crop status updated",
                farmService.updateCropStatus(cropId, status, farmerId)));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<FarmTask>> createTask(
            @Valid @RequestBody TaskRequest request,
            @RequestHeader("X-User-Id") String farmerId) {

        FarmTask task = farmService.createTask(request, farmerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", task));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<FarmTask>>> getMyTasks(
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your tasks", farmService.getMyTasks(farmerId)));
    }

    @GetMapping("/tasks/overdue")
    public ResponseEntity<ApiResponse<List<FarmTask>>> getOverdueTasks(
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Overdue tasks", farmService.getOverdueTasks(farmerId)));
    }

    @PatchMapping("/tasks/{taskId}/complete")
    public ResponseEntity<ApiResponse<FarmTask>> completeTask(
            @PathVariable String taskId,
            @RequestHeader("X-User-Id") String farmerId) {

        return ResponseEntity.ok(ApiResponse.success(
                "Task marked as complete",
                farmService.completeTask(taskId, farmerId)));
    }
}