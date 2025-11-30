package com.verzol.stayhub.module.message.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.verzol.stayhub.module.message.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get conversation between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Count unread messages for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("userId") Long userId);

    // Get all conversation partners for a user
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.receiverId ELSE m.senderId END " +
           "FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findConversationPartners(@Param("userId") Long userId);
}

