package com.verzol.stayhub.module.notification.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.notification.entity.Notification;
import com.verzol.stayhub.module.notification.service.NotificationService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * Lightweight endpoint to check if there are new notifications
     * Returns true if unread count has changed or new notifications exist
     */
    @GetMapping("/check-update")
    public ResponseEntity<CheckUpdateResponse> checkUpdate(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long unreadCount = notificationService.getUnreadCount(user.getId());
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        
        // Get last notification timestamp
        String lastNotificationTime = notifications.isEmpty() 
            ? null 
            : notifications.get(0).getCreatedAt().toString();

        return ResponseEntity.ok(new CheckUpdateResponse(true, unreadCount, lastNotificationTime));
    }

    // Response DTO
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class CheckUpdateResponse {
        private boolean hasUpdate;
        private Long unreadCount;
        private String lastNotificationTime;
    }
}

