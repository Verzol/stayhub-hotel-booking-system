package com.verzol.stayhub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.verzol.stayhub.common.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabledException(DisabledException ex) {
        return new ResponseEntity<>(
            ApiResponse.error("Account is disabled. Please verify your email.", HttpStatus.FORBIDDEN.value()),
            HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(
            ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST.value()),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        return new ResponseEntity<>(
            ApiResponse.error("Incorrect email or password.", HttpStatus.UNAUTHORIZED.value()),
            HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Invalid input provided.");
        
        return new ResponseEntity<>(
            ApiResponse.error(errorMessage, HttpStatus.BAD_REQUEST.value()),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) { // Keep for server logs
        // Keep for server logs
        return new ResponseEntity<>(
            ApiResponse.error("An unexpected error occurred. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR.value()),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
