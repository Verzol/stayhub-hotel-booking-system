package com.verzol.stayhub.module.message.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.message.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
