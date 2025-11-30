package com.verzol.stayhub.module.review.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.verzol.stayhub.common.service.FileStorageService;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.enums.BookingStatus;
import com.verzol.stayhub.module.booking.repository.BookingRepository;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.repository.RoomRepository;
import com.verzol.stayhub.module.review.entity.Review;
import com.verzol.stayhub.module.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Review createReview(Long userId, Long bookingId, Integer rating, String comment, List<String> photoUrls) {
        // Check if booking exists and is completed
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!BookingStatus.COMPLETED.toString().equals(booking.getStatus())) {
            throw new RuntimeException("Can only review completed bookings");
        }

        // Check if review already exists
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new RuntimeException("Review already exists for this booking");
        }

        // Check if user owns the booking
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only review your own bookings");
        }

        // Get hotel ID from room
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Long hotelId = room.getHotelId();

        // Convert photo URLs to JSON string for JSONB storage
        String imagesJson = null;
        if (photoUrls != null && !photoUrls.isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(photoUrls);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize images", e);
            }
        }

        // Use native query to properly cast string to JSONB for PostgreSQL
        String sql = "INSERT INTO reviews (booking_id, user_id, hotel_id, rating, comment, images, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, " + 
                     (imagesJson != null && !imagesJson.trim().isEmpty() ? "?::jsonb" : "NULL") + 
                     ", ?)";
        
        Query insertQuery = entityManager.createNativeQuery(sql);
        insertQuery.setParameter(1, bookingId);
        insertQuery.setParameter(2, userId);
        insertQuery.setParameter(3, hotelId);
        insertQuery.setParameter(4, rating);
        insertQuery.setParameter(5, comment);
        int paramIndex = 6;
        if (imagesJson != null && !imagesJson.trim().isEmpty()) {
            insertQuery.setParameter(paramIndex++, imagesJson); // Cast to JSONB using ::jsonb
        }
        insertQuery.setParameter(paramIndex, java.time.LocalDateTime.now());
        
        insertQuery.executeUpdate();
        entityManager.flush();
        
        // Fetch the saved review
        return reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Failed to create review"));
    }

    public List<Review> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }

    public Review getReviewByBooking(Long bookingId) {
        return reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public List<String> uploadPhotos(MultipartFile[] files) {
        return List.of(files).stream()
                .map(file -> {
                    String filename = fileStorageService.store(file);
                    return "/uploads/" + filename;
                })
                .collect(Collectors.toList());
    }
}

