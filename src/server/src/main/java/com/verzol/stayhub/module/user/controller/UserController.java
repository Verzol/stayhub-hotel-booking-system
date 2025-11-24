package com.verzol.stayhub.module.user.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.user.dto.ChangePasswordRequest;
import com.verzol.stayhub.module.user.dto.UpdateProfileRequest;
import com.verzol.stayhub.module.user.dto.UserProfileResponse;
import com.verzol.stayhub.module.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    /**
     * Updates the profile of the currently authenticated user.
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Principal principal,
            @RequestBody @Valid UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    /**
     * Changes the password of the currently authenticated user.
     */
    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok().build();
    }
}
