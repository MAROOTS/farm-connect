package com.agriconnect.media.controller;

import com.agriconnect.media.service.MediaService;
import com.agriconnect.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    // POST /api/media/upload/listing
    @PostMapping(value = "/upload/listing",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadListingImage(
            @RequestParam("file") MultipartFile file) {

        String imageUrl = mediaService.uploadImage(file, "listings");
        return ResponseEntity.ok(ApiResponse.success(
                "Image uploaded successfully",
                Map.of("imageUrl", imageUrl)));
    }

    // POST /api/media/upload/farm
    @PostMapping(value = "/upload/farm",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFarmImage(
            @RequestParam("file") MultipartFile file) {

        String imageUrl = mediaService.uploadImage(file, "farms");
        return ResponseEntity.ok(ApiResponse.success(
                "Image uploaded successfully",
                Map.of("imageUrl", imageUrl)));
    }

    // DELETE /api/media?url=http://...
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam("url") String imageUrl) {

        mediaService.deleteImage(imageUrl);
        return ResponseEntity.ok(
                ApiResponse.success("Image deleted", null));
    }
}