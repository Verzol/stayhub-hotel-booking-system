package com.verzol.stayhub.module.promotion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.promotion.entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
}
