package com.verzol.stayhub.module.notification.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.notification.entity.Notification;
import com.verzol.stayhub.module.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification sendNotification(Long userId, String title, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification sendNotification(Long userId, String title, String message, String type, Long relatedUserId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedUserId(relatedUserId)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification sendNotification(Long userId, String message, Notification.NotificationType type) {
        String title = getTitleForType(type);
        return sendNotification(userId, title, message, type.name());
    }

    private String getTitleForType(Notification.NotificationType type) {
        return switch (type) {
            case BOOKING -> "Thông báo đặt phòng";
            case CHAT -> "Tin nhắn mới";
            case SYSTEM -> "Thông báo hệ thống";
        };
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}

