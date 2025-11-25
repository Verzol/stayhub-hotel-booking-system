package com.verzol.stayhub.module.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.exception.ForbiddenException;
import com.verzol.stayhub.module.user.dto.ChangePasswordRequest;
import com.verzol.stayhub.module.user.dto.UpdateProfileRequest;
import com.verzol.stayhub.module.user.dto.UserListResponse;
import com.verzol.stayhub.module.user.dto.UserProfileResponse;
import com.verzol.stayhub.module.user.entity.Role;
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

    // ==================== ADMIN OPERATIONS ====================

    /**
     * Retrieves all users in the system.
     * Admin only operation.
     * 
     * @return List of all users
     */
    public List<UserListResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserListResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a user by ID.
     * Admin only operation.
     * 
     * @param userId User ID
     * @return User profile
     */
    public UserProfileResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToUserProfileResponse(user);
    }

    /**
     * Toggles the enabled/disabled status of a user account.
     * Admin only operation.
     * Prevents admin from disabling their own account.
     * 
     * @param userId User ID
     * @param currentUserEmail Email of the admin performing the action
     */
    public void toggleUserStatus(Long userId, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent admin from disabling their own account
        if (user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("You cannot disable your own account");
        }
        
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    /**
     * Changes the role of a user.
     * Admin only operation.
     * Prevents admin from changing their own role.
     * 
     * @param userId User ID
     * @param newRole New role to assign
     * @param currentUserEmail Email of the admin performing the action
     */
    public void changeUserRole(Long userId, Role newRole, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent admin from changing their own role
        if (user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("You cannot change your own role");
        }
        
        user.setRole(newRole);
        userRepository.save(user);
    }

    /**
     * Deletes a user from the system (soft delete by disabling).
     * Admin only operation.
     * Prevents admin from deleting their own account.
     * 
     * @param userId User ID
     * @param currentUserEmail Email of the admin performing the action
     */
    public void deleteUser(Long userId, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent admin from deleting their own account
        if (user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("You cannot delete your own account");
        }
        
        // Soft delete: disable the account
        user.setEnabled(false);
        userRepository.save(user);
    }

    /**
     * Checks if a user has ADMIN role.
     * 
     * @param user User entity
     * @return true if user is admin, false otherwise
     */
    public boolean isAdmin(User user) {
        return user != null && user.getRole() == Role.ADMIN;
    }

    // ==================== HELPER METHODS ====================

    /**
     * Maps User entity to UserListResponse DTO.
     */
    private UserListResponse mapToUserListResponse(User user) {
        return UserListResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Maps User entity to UserProfileResponse DTO.
     */
    private UserProfileResponse mapToUserProfileResponse(User user) {
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
}
