package com.verzol.stayhub.module.booking.enums;

/**
 * Chính sách hủy phòng
 * FLEXIBLE: Hoàn tiền 100% nếu hủy trước 1 ngày check-in
 * MODERATE: Hoàn tiền 50% nếu hủy trước 5 ngày check-in
 * STRICT: Không hoàn tiền nếu hủy sau khi đặt phòng
 */
public enum CancellationPolicy {
    FLEXIBLE,
    MODERATE,
    STRICT
}
