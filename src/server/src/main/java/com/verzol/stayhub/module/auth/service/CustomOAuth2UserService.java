package com.verzol.stayhub.module.auth.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.verzol.stayhub.module.user.entity.Role;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        userRepository.findByEmail(email).orElseGet(() -> {
            // Create new user
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name != null ? name : "Unknown");
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
            newUser.setRole(Role.CUSTOMER);
            newUser.setEnabled(true);
            newUser.setEmailVerified(true); // OAuth2 emails are trusted
            return userRepository.save(newUser);
        });

        // Update existing user if needed (e.g. name changed)
        // For now, we just return the user
        
        return oAuth2User;
    }
}
