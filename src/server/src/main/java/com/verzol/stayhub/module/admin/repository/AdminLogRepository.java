package com.verzol.stayhub.module.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.admin.entity.AdminLog;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
}
