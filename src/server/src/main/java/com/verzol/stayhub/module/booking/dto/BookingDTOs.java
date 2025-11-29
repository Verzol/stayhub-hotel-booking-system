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
}
