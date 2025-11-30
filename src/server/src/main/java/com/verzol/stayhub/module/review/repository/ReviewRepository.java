package com.verzol.stayhub.module.review.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.verzol.stayhub.module.review.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    
    Optional<Review> findByBookingId(Long bookingId);
    
    boolean existsByBookingId(Long bookingId);
}

