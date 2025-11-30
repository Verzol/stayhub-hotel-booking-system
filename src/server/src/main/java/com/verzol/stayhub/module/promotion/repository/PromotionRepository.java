package com.verzol.stayhub.module.promotion.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.verzol.stayhub.module.promotion.entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
    
    /**
     * Find all active promotions that are currently valid
     * (isActive = true AND current time is between startDate and endDate)
     */
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND :now >= p.startDate AND :now <= p.endDate " +
           "AND (p.maxUsage IS NULL OR p.currentUsage IS NULL OR p.currentUsage < p.maxUsage)")
    List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);
}
