package com.verzol.stayhub.module.booking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.PriceCalculationResponse;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.service.BookingService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping("/preview")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.calculatePrice(request));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.createPendingBooking(request, user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        Booking booking = bookingService.getBooking(id);
        return ResponseEntity.ok(bookingService.mapToResponse(booking));
    }
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmBooking(@PathVariable Long id) {
        bookingService.confirmBooking(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }
}
