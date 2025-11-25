package com.verzol.stayhub.module.auth.dto;

import com.verzol.stayhub.module.user.entity.Role;

public class AuthenticationResponse {
    private String token;
    private String fullName;
    private Role role;
    private Long id;

    public AuthenticationResponse() {}

    public AuthenticationResponse(String token, String fullName, Role role, Long id) {
        this.token = token;
        this.fullName = fullName;
        this.role = role;
        this.id = id;
    }

    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
