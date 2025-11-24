package com.verzol.stayhub.module.auth.dto;

import com.verzol.stayhub.module.user.entity.Gender;
import com.verzol.stayhub.module.user.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Full name must contain only letters and spaces")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)")
    private String password;

    private Role role;

    private Gender gender;

    @Pattern(regexp = "^\\d{10,11}$", message = "Phone number must be 10-11 digits")
    private String phoneNumber;

    private String address;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private java.time.LocalDate dateOfBirth;

    public RegisterRequest() {}

    public RegisterRequest(String fullName, String email, String password, Role role, Gender gender, String phoneNumber, String address, java.time.LocalDate dateOfBirth) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public java.time.LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(java.time.LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
}
