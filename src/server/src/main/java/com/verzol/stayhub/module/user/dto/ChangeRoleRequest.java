package com.verzol.stayhub.module.user.dto;

import com.verzol.stayhub.module.user.entity.Role;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for changing user role.
 * Only accessible by ADMIN users.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRoleRequest {
    
    @NotNull(message = "Role is required")
    private Role role;
}
