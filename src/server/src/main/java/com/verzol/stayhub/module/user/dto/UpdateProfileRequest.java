package com.verzol.stayhub.module.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.verzol.stayhub.module.user.entity.Gender;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private Gender gender;

    @Pattern(regexp = "^\\d{10,11}$", message = "Phone number must be 10-11 digits")
    private String phoneNumber;

    private String address;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private java.time.LocalDate dateOfBirth;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, Gender gender, String phoneNumber, String address, java.time.LocalDate dateOfBirth) {
        this.fullName = fullName;
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
