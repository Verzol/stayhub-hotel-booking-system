package com.verzol.stayhub.module.message.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.message.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
