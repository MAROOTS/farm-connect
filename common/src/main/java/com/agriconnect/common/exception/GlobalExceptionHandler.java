
package com.agriconnect.common.exception;

import com.agriconnect.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AgriConnectException.class)
    public ResponseEntity<ApiResponse<Void>> handleAgriConnectException(
            AgriConnectException ex) {

        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity
                .internalServerError()
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}