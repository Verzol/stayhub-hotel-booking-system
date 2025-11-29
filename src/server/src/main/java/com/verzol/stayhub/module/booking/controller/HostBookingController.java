package com.verzol.stayhub.module.booking.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.booking.dto.BookingDTOs.HostBookingResponse;
import com.verzol.stayhub.module.booking.service.BookingService;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Controller cho các chức năng quản lý booking của Host
 */
@RestController
@RequestMapping("/api/host/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOST')")
public class HostBookingController {

    private final BookingService bookingService;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    /**
     * Lấy tất cả bookings của một hotel
     * GET /api/host/bookings?hotelId=1&status=CONFIRMED&startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping
    public ResponseEntity<List<HostBookingResponse>> getHotelBookings(
            @RequestParam Long hotelId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view bookings for this hotel");
        }
        
        return ResponseEntity.ok(bookingService.getHostBookings(hotelId, status, startDate, endDate));
    }

    /**
     * Lấy danh sách bookings sắp tới của một hotel
     * GET /api/host/bookings/{hotelId}/upcoming
     */
    @GetMapping("/{hotelId}/upcoming")
    public ResponseEntity<List<HostBookingResponse>> getUpcomingBookings(
            @PathVariable Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view bookings for this hotel");
        }
        
        return ResponseEntity.ok(bookingService.getUpcomingBookings(hotelId));
    }

    /**
     * Lấy danh sách bookings đang chờ check-in
     * GET /api/host/bookings/{hotelId}/pending-checkins
     */
    @GetMapping("/{hotelId}/pending-checkins")
    public ResponseEntity<List<HostBookingResponse>> getPendingCheckIns(
            @PathVariable Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view bookings for this hotel");
        }
        
        return ResponseEntity.ok(bookingService.getPendingCheckIns(hotelId));
    }

    /**
     * Lấy danh sách bookings đang chờ check-out
     * GET /api/host/bookings/{hotelId}/pending-checkouts
     */
    @GetMapping("/{hotelId}/pending-checkouts")
    public ResponseEntity<List<HostBookingResponse>> getPendingCheckOuts(
            @PathVariable Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view bookings for this hotel");
        }
        
        return ResponseEntity.ok(bookingService.getPendingCheckOuts(hotelId));
    }

    /**
     * Check-in guest
     * POST /api/host/bookings/{bookingId}/checkin?hotelId=1
     */
    @PostMapping("/{bookingId}/checkin")
    public ResponseEntity<Void> checkIn(
            @PathVariable Long bookingId,
            @RequestParam Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to manage bookings for this hotel");
        }
        
        bookingService.checkIn(bookingId, hotelId);
        return ResponseEntity.ok().build();
    }

    /**
     * Check-out guest
     * POST /api/host/bookings/{bookingId}/checkout?hotelId=1
     */
    @PostMapping("/{bookingId}/checkout")
    public ResponseEntity<Void> checkOut(
            @PathVariable Long bookingId,
            @RequestParam Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Verify hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hotel.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to manage bookings for this hotel");
        }
        
        bookingService.checkOut(bookingId, hotelId);
        return ResponseEntity.ok().build();
    }
}
