package com.verzol.stayhub.module.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.verzol.stayhub.module.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetPasswordToken(String token);
}
