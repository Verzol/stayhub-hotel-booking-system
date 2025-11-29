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
    }

    @Data
    public static class PriceCalculationResponse {
        private BigDecimal originalPrice;
        private BigDecimal discountAmount;
        private BigDecimal serviceFee; // Optional, can be 0 for now
        private BigDecimal finalPrice;
        private String appliedCouponCode;
    }
}
