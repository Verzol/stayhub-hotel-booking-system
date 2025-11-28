package com.verzol.stayhub.module.message.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "is_read", columnDefinition = "boolean default false")
    private Boolean isRead;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
