package com.verzol.stayhub.module.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

public class BookingDTOs {

    @Data
    public static class BookingRequest {
        private Long roomId;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer guests;
        private String guestName;
        private String guestEmail;
        private String guestPhone;
        private String couponCode;
        private String note;
    }

    @Data
    public static class BookingResponse {
        private Long id;
        private Long roomId;
        private String roomName;
        private Long hotelId;
        private String hotelName;
        private String roomImage;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer guests;
        private BigDecimal totalPrice;
        private String status;
        private LocalDateTime lockedUntil;
        private String paymentUrl;
        private String couponCode;
        private String note;
        private String guestName;
        private String guestEmail;
        private String guestPhone;
        
        // New fields for enhanced booking management
        private LocalDateTime checkedInAt;
        private LocalDateTime checkedOutAt;
        private LocalDateTime cancelledAt;
        private String cancellationReason;
        private String cancelledBy;
        private BigDecimal refundAmount;
        private String cancellationPolicy;
        private String cancellationPolicyDescription; // Human-readable policy description
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class PriceCalculationResponse {
        private BigDecimal originalPrice;
        private BigDecimal discountAmount;
        private BigDecimal serviceFee; // Optional, can be 0 for now
        private BigDecimal finalPrice;
        private String appliedCouponCode;
    }

    // Host-specific booking response with additional information
    @Data
    public static class HostBookingResponse {
        private Long id;
        private Long userId;
        private String guestName;
        private String guestEmail;
        private String guestPhone;
        private Long roomId;
        private String roomName;
        private Long hotelId;
        private String hotelName;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer guests;
        private BigDecimal totalPrice;
        private String status;
        private String note;
        private LocalDateTime checkedInAt;
        private LocalDateTime checkedOutAt;
        private LocalDateTime cancelledAt;
        private String cancellationReason;
        private BigDecimal refundAmount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // Cancellation request
    @Data
    public static class CancellationRequest {
        private String reason; // Optional cancellation reason
    }

    // Cancellation response with refund information
    @Data
    public static class CancellationResponse {
        private Long bookingId;
        private String status;
        private BigDecimal totalPrice;
        private BigDecimal refundAmount;
        private BigDecimal cancellationFee;
        private String cancellationPolicy;
        private String cancellationPolicyDescription;
        private LocalDateTime cancelledAt;
        private String message; // Human-readable message
    }

    // Analytics Response - optimized DTO for analytics dashboard
    @Data
    public static class AnalyticsResponse {
        private BigDecimal revenue; // Total revenue from completed bookings
        private Integer bookingsCount; // Total bookings count
        private Double occupancyRate; // Percentage of completed bookings
        private Double cancellationRate; // Percentage of cancelled bookings
        private BigDecimal avgBookingValue; // Average booking value
        private java.util.List<MonthlyRevenue> revenueByMonth; // Revenue by month (last 6 months)
        private java.util.Map<String, Integer> statusDistribution; // Count by status
    }

    // Monthly Revenue DTO
    @Data
    public static class MonthlyRevenue {
        private String month; // Month name (e.g., "Tháng 1")
        private BigDecimal revenue; // Revenue for that month
    }

    // Earnings Response - optimized DTO for earnings dashboard
    @Data
    public static class EarningsResponse {
        private BigDecimal totalEarnings; // Total earnings from completed bookings
        private Integer completedCount; // Count of completed bookings
        private BigDecimal avgBookingValue; // Average booking value
        private java.util.Map<Long, BigDecimal> earningsByHotel; // Earnings grouped by hotel ID
        private java.util.List<MonthlyEarnings> earningsByMonth; // Earnings by month
        private java.util.List<RecentTransaction> recentTransactions; // Recent completed bookings (limit 10)
    }

    // Monthly Earnings DTO
    @Data
    public static class MonthlyEarnings {
        private String monthKey; // Format: "YYYY-MM"
        private String monthName; // Human-readable (e.g., "Tháng 1, 2024")
        private BigDecimal earnings; // Earnings for that month
    }

    // Recent Transaction DTO
    @Data
    public static class RecentTransaction {
        private Long bookingId;
        private String hotelName;
        private String guestName;
        private LocalDate checkoutDate;
        private BigDecimal amount;
    }
}
