package com.verzol.stayhub.module.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.verzol.stayhub.module.user.entity.Gender;
import com.verzol.stayhub.module.user.entity.Role;

public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Gender gender;
    private String phoneNumber;
    private String address;
    private String avatarUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private java.time.LocalDate dateOfBirth;
    
    private Boolean emailVerified;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String email, String fullName, Role role, Gender gender, String phoneNumber, String address, String avatarUrl, java.time.LocalDate dateOfBirth, Boolean emailVerified) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.avatarUrl = avatarUrl;
        this.dateOfBirth = dateOfBirth;
        this.emailVerified = emailVerified;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public java.time.LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(java.time.LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
