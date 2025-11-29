package com.verzol.stayhub.module.booking.enums;

public enum BookingStatus {
    PENDING,      // Chờ thanh toán
    CONFIRMED,    // Đã thanh toán/Host xác nhận
    CHECKED_IN,   // Đang ở
    COMPLETED,    // Đã trả phòng
    CANCELLED     // Đã hủy
}
