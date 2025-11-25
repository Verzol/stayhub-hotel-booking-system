package com.verzol.stayhub.module.user.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.common.ApiResponse;
import com.verzol.stayhub.module.user.dto.ChangeRoleRequest;
import com.verzol.stayhub.module.user.dto.UserListResponse;
import com.verzol.stayhub.module.user.dto.UserProfileResponse;
import com.verzol.stayhub.module.user.service.UserService;

import jakarta.validation.Valid;

/**
 * Controller for Admin-only user management operations.
 * All endpoints require ADMIN role.
 * 
 * @author StayHub Team
 * @version 1.0
 * @since 2025-11-25
 */
@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/v1/admin/users
     * Retrieves a list of all users in the system.
     * 
     * @return List of users with basic information
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserListResponse>>> getAllUsers() {
        List<UserListResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(
            ApiResponse.success(users, "Users retrieved successfully")
        );
    }

    /**
     * GET /api/v1/admin/users/{userId}
     * Retrieves detailed information about a specific user.
     * 
     * @param userId ID of the user to retrieve
     * @return User profile details
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long userId) {
        UserProfileResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(
            ApiResponse.success(user, "User details retrieved successfully")
        );
    }

    /**
     * PATCH /api/v1/admin/users/{userId}/toggle-status
     * Toggles the enabled/disabled status of a user account.
     * Prevents admin from disabling their own account.
     * 
     * @param userId ID of the user to toggle
     * @param authentication Current authenticated user
     * @return Success message
     */
    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(
            @PathVariable Long userId,
            Authentication authentication) {
        userService.toggleUserStatus(userId, authentication.getName());
        
        return ResponseEntity.ok(
            ApiResponse.success("Status toggled", "User status updated successfully")
        );
    }

    /**
     * PATCH /api/v1/admin/users/{userId}/change-role
     * Changes the role of a user.
     * Prevents admin from changing their own role.
     * 
     * @param userId ID of the user to update
     * @param request New role information
     * @param authentication Current authenticated user
     * @return Success message
     */
    @PatchMapping("/{userId}/change-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> changeUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody ChangeRoleRequest request,
            Authentication authentication) {
        userService.changeUserRole(userId, request.getRole(), authentication.getName());
        
        return ResponseEntity.ok(
            ApiResponse.success("Role changed to " + request.getRole(), "User role updated successfully")
        );
    }

    /**
     * DELETE /api/v1/admin/users/{userId}
     * Soft deletes a user by disabling their account.
     * Prevents admin from deleting their own account.
     * 
     * @param userId ID of the user to delete
     * @param authentication Current authenticated user
     * @return Success message
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        userService.deleteUser(userId, authentication.getName());
        
        return ResponseEntity.ok(
            ApiResponse.success("User has been disabled", "User deleted successfully")
        );
    }
}
