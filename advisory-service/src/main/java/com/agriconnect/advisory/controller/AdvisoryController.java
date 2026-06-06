package com.agriconnect.advisory.controller;

import com.agriconnect.advisory.dto.AdvisoryResponse;
import com.agriconnect.advisory.service.AdvisoryService;
import com.agriconnect.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/advisory")
@RequiredArgsConstructor
public class AdvisoryController {

    private final AdvisoryService advisoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdvisoryResponse>> getAdvisoryByCity(
            @RequestParam String city) {

        AdvisoryResponse advisory = advisoryService.getAdvisoryByCity(city);
        return ResponseEntity.ok(
                ApiResponse.success("Advisory fetched", advisory));
    }

    @GetMapping("/coords")
    public ResponseEntity<ApiResponse<AdvisoryResponse>> getAdvisoryByCoords(
            @RequestParam double lat,
            @RequestParam double lon) {

        AdvisoryResponse advisory = advisoryService.getAdvisoryByCoords(lat, lon);
        return ResponseEntity.ok(
                ApiResponse.success("Advisory fetched", advisory));
    }
}