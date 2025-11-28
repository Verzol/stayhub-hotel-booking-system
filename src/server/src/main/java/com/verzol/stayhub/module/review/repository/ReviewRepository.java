package com.verzol.stayhub.module.review.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.verzol.stayhub.module.review.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
