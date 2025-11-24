package com.verzol.stayhub.module.auth.service;

import java.time.LocalDateTime;
import java.util.UUID;

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

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

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

        // Tạo user thủ công thay vì dùng Builder
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        
        // Email Verification Logic REMOVED - Auto enable
        user.setEnabled(true);
        user.setEmailVerified(false);

        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getFullName());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getFullName());
    }

    public void sendVerificationEmail(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email already verified");
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        repository.save(user);

        String verifyLink = "http://localhost:3000/verify-email?token=" + token;
        emailService.sendEmail(user.getEmail(), "Verify your email",
                "Click the link to verify your email: <a href=\"" + verifyLink + "\">Verify Email</a>");
    }

    public void verifyEmail(String token) {
        User user = repository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        repository.save(user);
    }

    /**
     * Initiates the forgot password flow.
     * - Generates a reset token valid for 24 hours.
     * - Sends an email with the reset link.
     */
    public void forgotPassword(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24));
        
        repository.save(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Reset Password",
                "Click the link to reset your password: <a href=\"" + resetLink + "\">Reset Password</a>");
    }

    /**
     * Resets the user's password using a valid token.
     * - Validates token and expiry.
     * - Updates the password (encoded).
     * - Clears the reset token.
     */
    public void resetPassword(String token, String newPassword) {
        User user = repository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        repository.save(user);
    }
}