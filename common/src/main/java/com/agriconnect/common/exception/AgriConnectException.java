
package com.agriconnect.common.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class AgriConnectException extends RuntimeException {

    private final HttpStatus status;

    public AgriConnectException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}