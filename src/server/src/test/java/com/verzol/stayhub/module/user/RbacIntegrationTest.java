package com.verzol.stayhub.module.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.verzol.stayhub.module.user.dto.ChangeRoleRequest;
import com.verzol.stayhub.module.user.entity.Role;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

/**
 * Integration tests for Role-Based Access Control (RBAC).
 * Tests authorization rules for different user roles (ADMIN, HOST, CUSTOMER).
 * 
 * @author StayHub Team
 * @version 1.0
 * @since 2025-11-25
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test user for operations
        testUser = new User();
        testUser.setEmail("testuser@stayhub.com");
        testUser.setPassword("encodedPassword");
        testUser.setFullName("Test User");
        testUser.setRole(Role.CUSTOMER);
        testUser.setEnabled(true);
        testUser.setEmailVerified(true);
        testUser = userRepository.save(testUser);
    }

    // ==================== ADMIN TESTS ====================

    @Test
    @DisplayName("ADMIN can access all users endpoint")
    @WithMockUser(roles = "ADMIN")
    void testAdminCanAccessAllUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN can get user by ID")
    @WithMockUser(roles = "ADMIN")
    void testAdminCanGetUserById() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/" + testUser.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("testuser@stayhub.com"));
    }

    @Test
    @DisplayName("ADMIN can toggle user status")
    @WithMockUser(username = "admin@stayhub.com", roles = "ADMIN")
    void testAdminCanToggleUserStatus() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/" + testUser.getId() + "/toggle-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN can change user role")
    @WithMockUser(username = "admin@stayhub.com", roles = "ADMIN")
    void testAdminCanChangeUserRole() throws Exception {
        ChangeRoleRequest request = new ChangeRoleRequest();
        request.setRole(Role.HOST);

        mockMvc.perform(patch("/api/v1/admin/users/" + testUser.getId() + "/change-role")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN can delete user")
    @WithMockUser(username = "admin@stayhub.com", roles = "ADMIN")
    void testAdminCanDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/users/" + testUser.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ==================== HOST TESTS ====================

    @Test
    @DisplayName("HOST cannot access admin endpoints")
    @WithMockUser(roles = "HOST")
    void testHostCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("HOST cannot toggle user status")
    @WithMockUser(roles = "HOST")
    void testHostCannotToggleUserStatus() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/" + testUser.getId() + "/toggle-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // ==================== CUSTOMER TESTS ====================

    @Test
    @DisplayName("CUSTOMER cannot access admin endpoints")
    @WithMockUser(roles = "CUSTOMER")
    void testCustomerCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CUSTOMER cannot change user role")
    @WithMockUser(roles = "CUSTOMER")
    void testCustomerCannotChangeUserRole() throws Exception {
        ChangeRoleRequest request = new ChangeRoleRequest();
        request.setRole(Role.HOST);

        mockMvc.perform(patch("/api/v1/admin/users/" + testUser.getId() + "/change-role")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CUSTOMER cannot delete user")
    @WithMockUser(roles = "CUSTOMER")
    void testCustomerCannotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/users/" + testUser.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // ==================== UNAUTHENTICATED TESTS ====================

    @Test
    @DisplayName("Unauthenticated user cannot access admin endpoints")
    void testUnauthenticatedUserCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authenticated user can access their own profile")
    @WithMockUser(username = "testuser@stayhub.com", roles = "CUSTOMER")
    void testAuthenticatedUserCanAccessOwnProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
