package com.verzol.stayhub.module.review.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.verzol.stayhub.module.review.entity.Review;
import com.verzol.stayhub.module.review.service.ReviewService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping("/upload-photos")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'HOST', 'ADMIN')")
    public ResponseEntity<List<String>> uploadPhotos(@RequestPart("files") MultipartFile[] files) {
        List<String> photoUrls = reviewService.uploadPhotos(files);
        return ResponseEntity.ok(photoUrls);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'HOST', 'ADMIN')")
    public ResponseEntity<Review> createReview(@RequestBody CreateReviewRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewService.createReview(
                user.getId(),
                request.getBookingId(),
                request.getRating(),
                request.getComment(),
                request.getPhotoUrls()
        );

        return ResponseEntity.ok(review);
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Review>> getReviewsByHotel(@PathVariable Long hotelId) {
        List<Review> reviews = reviewService.getReviewsByHotel(hotelId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Review> getReviewByBooking(@PathVariable Long bookingId) {
        Review review = reviewService.getReviewByBooking(bookingId);
        return ResponseEntity.ok(review);
    }

    // Inner class for request
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateReviewRequest {
        private Long bookingId;
        private Integer rating;
        private String comment;
        private List<String> photoUrls;
    }
}

