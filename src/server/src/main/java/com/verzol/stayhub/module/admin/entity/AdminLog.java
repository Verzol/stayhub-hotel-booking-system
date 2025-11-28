package com.verzol.stayhub.module.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(nullable = false)
    private String action;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(columnDefinition = "jsonb")
    private String details;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
