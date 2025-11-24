package com.verzol.stayhub.module.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.user.dto.ChangePasswordRequest;
import com.verzol.stayhub.module.user.dto.UpdateProfileRequest;
import com.verzol.stayhub.module.user.dto.UserProfileResponse;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     */
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getGender(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getAvatarUrl(),
            user.getDateOfBirth(),
            user.getEmailVerified()
        );
    }

    /**
     * Updates the user's profile information.
     * - Allows updating full name, gender, phone number, address, and date of birth.
     * - Checks for phone number uniqueness if changed.
     */
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getPhoneNumber() != null) {
            // Check if phone number is taken by another user
            if (!request.getPhoneNumber().isEmpty() && 
                !request.getPhoneNumber().equals(user.getPhoneNumber()) && 
                userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Phone number already exists");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        User updatedUser = userRepository.save(user);

        return new UserProfileResponse(
            updatedUser.getId(),
            updatedUser.getEmail(),
            updatedUser.getFullName(),
            updatedUser.getRole(),
            updatedUser.getGender(),
            updatedUser.getPhoneNumber(),
            updatedUser.getAddress(),
            updatedUser.getAvatarUrl(),
            updatedUser.getDateOfBirth(),
            updatedUser.getEmailVerified()
        );
    }

    /**
     * Changes the user's password.
     * - Verifies the current password.
     * - Ensures the new password is different from the old one.
     * - Confirms the new password matches the confirmation password.
     */
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Check if current password is correct
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong current password");
        }

        // 2. Check if new password is the same as old password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the old password");
        }

        // 3. Check if new password matches confirmation
        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new RuntimeException("Password confirmation does not match");
        }

        // 4. Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
