package com.agriconnect.farm.service;

import com.agriconnect.common.exception.AgriConnectException;
import com.agriconnect.farm.document.*;
import com.agriconnect.farm.dto.*;
import com.agriconnect.farm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final FarmTaskRepository taskRepository;

    public Farm registerFarm(FarmRequest request,
                             String farmerId, String farmerName) {
        if (farmRepository.existsByFarmerId(farmerId)) {
            throw new AgriConnectException(
                    "Farm already registered for this account",
                    HttpStatus.CONFLICT);
        }

        Farm farm = Farm.builder()
                .farmerId(farmerId)
                .farmerName(farmerName)
                .farmName(request.getFarmName())
                .location(request.getLocation())
                .sizeInAcres(request.getSizeInAcres())
                .farmImageUrl(request.getFarmImageUrl())
                .soilType(request.getSoilType())
                .cropTypes(request.getCropTypes())
                .status(FarmStatus.ACTIVE)
                .build();

        return farmRepository.save(farm);
    }

    public Farm getMyFarm(String farmerId) {
        return farmRepository.findByFarmerId(farmerId)
                .orElseThrow(() -> new AgriConnectException(
                        "No farm found. Please register your farm first.",
                        HttpStatus.NOT_FOUND));
    }

    public Farm updateFarm(FarmRequest request, String farmerId) {
        Farm farm = getMyFarm(farmerId);
        farm.setFarmName(request.getFarmName());
        farm.setLocation(request.getLocation());
        farm.setSizeInAcres(request.getSizeInAcres());
        farm.setSoilType(request.getSoilType());
        farm.setCropTypes(request.getCropTypes());
        if (request.getFarmImageUrl() != null) {
            farm.setFarmImageUrl(request.getFarmImageUrl());
        }
        return farmRepository.save(farm);
    }

    public Crop addCrop(CropRequest request, String farmerId) {
        // Verify farm belongs to this farmer
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new AgriConnectException(
                        "Farm not found", HttpStatus.NOT_FOUND));

        if (!farm.getFarmerId().equals(farmerId)) {
            throw new AgriConnectException(
                    "Unauthorized — this farm does not belong to you",
                    HttpStatus.FORBIDDEN);
        }

        Crop crop = Crop.builder()
                .farmId(request.getFarmId())
                .farmerId(farmerId)
                .cropName(request.getCropName())
                .variety(request.getVariety())
                .plantedAreaAcres(request.getPlantedAreaAcres())
                .plantingDate(request.getPlantingDate())
                .expectedHarvestDate(request.getExpectedHarvestDate())
                .expectedYieldKg(request.getExpectedYieldKg())
                .notes(request.getNotes())
                .status(request.getStatus())
                .build();

        return cropRepository.save(crop);
    }

    public List<Crop> getMyCrops(String farmerId) {
        return cropRepository.findByFarmerId(farmerId);
    }

    public List<Crop> getActiveCrops(String farmerId) {
        return cropRepository.findByFarmerIdAndStatus(
                farmerId, CropStatus.GROWING);
    }

    public Crop updateCropStatus(String cropId,
                                 CropStatus status, String farmerId) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new AgriConnectException(
                        "Crop not found", HttpStatus.NOT_FOUND));

        if (!crop.getFarmerId().equals(farmerId)) {
            throw new AgriConnectException(
                    "Unauthorized", HttpStatus.FORBIDDEN);
        }

        crop.setStatus(status);

        // Record actual harvest date if marking as harvested
        if (status == CropStatus.HARVESTED) {
            log.info("Crop {} marked as harvested by farmer {}",
                    cropId, farmerId);
        }

        return cropRepository.save(crop);
    }


    public FarmTask createTask(TaskRequest request, String farmerId) {
        FarmTask task = FarmTask.builder()
                .farmId(request.getFarmId())
                .farmerId(farmerId)
                .cropId(request.getCropId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .status(TaskStatus.PENDING)
                .build();

        return taskRepository.save(task);
    }

    public List<FarmTask> getMyTasks(String farmerId) {
        return taskRepository.findByFarmerId(farmerId);
    }

    public List<FarmTask> getOverdueTasks(String farmerId) {
        return taskRepository
                .findByFarmerIdAndDueDateBeforeAndStatusNot(
                        farmerId, LocalDate.now(), TaskStatus.COMPLETED);
    }

    public FarmTask completeTask(String taskId, String farmerId) {
        FarmTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AgriConnectException(
                        "Task not found", HttpStatus.NOT_FOUND));

        if (!task.getFarmerId().equals(farmerId)) {
            throw new AgriConnectException(
                    "Unauthorized", HttpStatus.FORBIDDEN);
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedDate(LocalDate.now());
        return taskRepository.save(task);
    }
}