package com.verzol.stayhub.module.auth.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.verzol.stayhub.config.JwtService;
import com.verzol.stayhub.module.auth.dto.AuthenticationRequest;
import com.verzol.stayhub.module.auth.dto.AuthenticationResponse;
import com.verzol.stayhub.module.auth.dto.CheckEmailRequest;
import com.verzol.stayhub.module.auth.dto.CheckEmailResponse;
import com.verzol.stayhub.module.auth.dto.RegisterRequest;
import com.verzol.stayhub.module.user.entity.Role;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;
import com.verzol.stayhub.util.OtpUtil;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // Constructor Injection
    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager,
                                 EmailService emailService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public CheckEmailResponse checkEmail(CheckEmailRequest request) {
        boolean exists = repository.existsByEmail(request.getEmail());
        return new CheckEmailResponse(exists);
    }

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty() && repository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number is already in use.");
        }

        // Create user manually instead of Builder
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        
        // Email Verification Logic
        user.setEnabled(false);
        user.setEmailVerified(false);

        repository.save(user);
        
        sendVerificationEmail(user.getEmail());
        
        return new AuthenticationResponse(null, user.getFullName(), user.getRole(), user.getId());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getFullName(), user.getRole(), user.getId());
    }

    public void sendVerificationEmail(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email already verified");
        }

        String otp = OtpUtil.generateOtp();
        user.setVerificationToken(otp);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusMinutes(15));
        repository.save(user);

        emailService.sendOtpEmail(user.getEmail(), "Verify your email", otp);
    }

    public void verifyEmail(String email, String otp) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        user.setEnabled(true); // Enable user after verification
        repository.save(user);
    }

    /**
     * Initiates the forgot password flow.
     * - Generates a reset OTP valid for 15 minutes.
     * - Sends an email with the OTP.
     */
    public void forgotPassword(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = OtpUtil.generateOtp();
        user.setResetPasswordToken(otp);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        
        repository.save(user);

        emailService.sendOtpEmail(user.getEmail(), "Reset Password OTP", otp);
    }

    /**
     * Resets the user's password using a valid OTP.
     * - Validates OTP and expiry.
     * - Updates the password (encoded).
     * - Clears the reset token.
     */
    public void resetPassword(String email, String otp, String newPassword) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResetPasswordToken() == null || !user.getResetPasswordToken().equals(otp)) {
            throw new RuntimeException("Invalid reset code");
        }

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset code expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        repository.save(user);
    }
}