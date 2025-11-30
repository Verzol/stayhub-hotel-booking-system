package com.verzol.stayhub.module.hotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

public class DashboardDTOs {

    /**
     * Dashboard Summary Response - All stats in one response
     * Optimized for fast dashboard loading
     */
    @Data
    public static class DashboardSummaryResponse {
        // Hotel stats
        private Integer totalHotels;
        private Integer totalRooms;
        
        // Booking stats
        private Integer totalBookings;
        private Integer confirmedBookings;
        private Integer upcomingBookings;
        private Integer pendingCheckIns;
        private Integer pendingCheckOuts;
        
        // Revenue stats
        private BigDecimal totalRevenue;
        private BigDecimal thisMonthRevenue;
        private BigDecimal lastMonthRevenue;
        private Double revenueChangePercent; // Percentage change from last month
        
        // Recent bookings (last 5)
        private List<RecentBooking> recentBookings;
    }
    
    @Data
    public static class RecentBooking {
        private Long id;
        private String roomName;
        private String hotelName;
        private String guestName;
        private LocalDate checkInDate;
        private BigDecimal totalPrice;
        private String status;
    }
}

