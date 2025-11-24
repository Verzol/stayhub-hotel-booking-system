package com.verzol.stayhub.module.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.common.ApiResponse;
import com.verzol.stayhub.module.auth.dto.AuthenticationRequest;
import com.verzol.stayhub.module.auth.dto.AuthenticationResponse;
import com.verzol.stayhub.module.auth.dto.CheckEmailRequest;
import com.verzol.stayhub.module.auth.dto.CheckEmailResponse;
import com.verzol.stayhub.module.auth.dto.RegisterRequest;
import com.verzol.stayhub.module.auth.dto.ResetPasswordRequest;
import com.verzol.stayhub.module.auth.service.AuthenticationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationService service;

    // Constructor Injection
    public AuthController(AuthenticationService service) {
        this.service = service;
    }

    /**
     * Endpoint to check if an email is already registered.
     */
    @PostMapping("/check-email")
    public ResponseEntity<ApiResponse<CheckEmailResponse>> checkEmail(@RequestBody @Valid CheckEmailRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.checkEmail(request)));
    }

    /**
     * Endpoint to register a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.register(request)));
    }

    /**
     * Endpoint to authenticate a user and return a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.authenticate(request)));
    }

    /**
     * Endpoint to initiate the forgot password process.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody @Valid CheckEmailRequest request) {
        service.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent"));
    }

    /**
     * Endpoint to reset the password using a token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        service.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    /**
     * Endpoint to send a verification email to the user.
     */
    @PostMapping("/send-verification-email")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody @Valid CheckEmailRequest request) {
        service.sendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Verification email sent"));
    }

    /**
     * Endpoint to verify a user's email using a token.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        service.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }
}