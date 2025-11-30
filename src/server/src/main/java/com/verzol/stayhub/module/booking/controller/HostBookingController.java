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

import com.verzol.stayhub.module.booking.dto.BookingDTOs.AnalyticsResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.EarningsResponse;
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

    /**
     * Get all bookings for all hotels owned by the host (for dashboard)
     * GET /api/host/bookings/all
     * This endpoint returns all bookings across all hotels in one request (much faster than multiple requests)
     */
    @GetMapping("/all")
    public ResponseEntity<List<HostBookingResponse>> getAllBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(bookingService.getAllHostBookings(user.getId()));
    }

    /**
     * Get analytics for host's hotels
     * GET /api/host/bookings/analytics?hotelId=1&startDate=2024-01-01&endDate=2024-12-31
     * Optimized: Pre-calculated analytics from filtered bookings
     */
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(required = false) Long hotelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (hotelId != null) {
            // Verify hotel ownership
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (!hotel.getOwnerId().equals(user.getId())) {
                throw new RuntimeException("You don't have permission to view analytics for this hotel");
            }
        }
        
        return ResponseEntity.ok(bookingService.getAnalytics(user.getId(), hotelId, startDate, endDate));
    }

    /**
     * Get earnings for host's hotels
     * GET /api/host/bookings/earnings?hotelId=1&startDate=2024-01-01&endDate=2024-12-31
     * Optimized: Pre-calculated earnings from filtered bookings
     */
    @GetMapping("/earnings")
    public ResponseEntity<EarningsResponse> getEarnings(
            @RequestParam(required = false) Long hotelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (hotelId != null) {
            // Verify hotel ownership
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (!hotel.getOwnerId().equals(user.getId())) {
                throw new RuntimeException("You don't have permission to view earnings for this hotel");
            }
        }
        
        return ResponseEntity.ok(bookingService.getEarnings(user.getId(), hotelId, startDate, endDate));
    }
}
