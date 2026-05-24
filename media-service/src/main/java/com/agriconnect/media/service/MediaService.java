package com.agriconnect.media.service;

import com.agriconnect.common.exception.AgriConnectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final S3Client s3Client;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);
        ensureBucketExists();

        String extension = getExtension(file.getOriginalFilename());
        String objectKey = folder + "/" + UUID.randomUUID() + "." + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromBytes(file.getBytes()));

            String imageUrl = minioEndpoint + "/" + bucketName + "/" + objectKey;
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage());
            throw new AgriConnectException(
                    "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            String objectKey = imageUrl
                    .replace(minioEndpoint + "/" + bucketName + "/", "");

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build());

            log.info("Image deleted: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete image: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AgriConnectException(
                    "File is empty", HttpStatus.BAD_REQUEST);
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new AgriConnectException(
                    "Only JPEG, PNG and WebP images are allowed",
                    HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > 10 * 1024 * 1024) {  // 10MB
            throw new AgriConnectException(
                    "Image size must not exceed 10MB",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(bucketName).build());
            log.info("Created MinIO bucket: {}", bucketName);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}