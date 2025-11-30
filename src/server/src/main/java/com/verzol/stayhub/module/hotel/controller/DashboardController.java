package com.verzol.stayhub.module.hotel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.hotel.dto.DashboardDTOs.DashboardSummaryResponse;
import com.verzol.stayhub.module.hotel.dto.DashboardDTOs.RecentBooking;
import com.verzol.stayhub.module.hotel.service.DashboardService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Controller for Host Dashboard
 * Optimized endpoints for fast dashboard loading
 */
@RestController
@RequestMapping("/api/host/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOST')")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    /**
     * Get dashboard summary - all stats in one optimized request
     * GET /api/host/dashboard/summary
     * 
     * Returns:
     * - Hotel stats (total hotels, total rooms)
     * - Booking stats (total, confirmed, upcoming, pending check-ins/check-outs)
     * - Revenue stats (total, this month, last month, change %)
     * - Recent bookings (last 5) - lazy loaded separately for faster initial load
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(user.getId());
        return ResponseEntity.ok(summary);
    }

    /**
     * Get recent bookings separately (for lazy loading)
     * GET /api/host/dashboard/recent-bookings
     * 
     * This endpoint can be called after initial dashboard load for progressive loading
     */
    @GetMapping("/recent-bookings")
    public ResponseEntity<List<RecentBooking>> getRecentBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<RecentBooking> recentBookings = dashboardService.getRecentBookings(user.getId());
        return ResponseEntity.ok(recentBookings);
    }
}
