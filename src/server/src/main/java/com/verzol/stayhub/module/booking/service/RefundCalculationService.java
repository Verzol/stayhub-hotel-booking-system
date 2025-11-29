package com.verzol.stayhub.module.booking.service;

import org.springframework.stereotype.Service;

import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.enums.CancellationPolicy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service tính toán số tiền hoàn lại khi hủy booking
 */
@Service
public class RefundCalculationService {

    /**
     * Tính toán số tiền hoàn lại dựa trên chính sách hủy và thời điểm hủy
     * 
     * @param booking Booking bị hủy
     * @param cancellationDate Ngày hủy (thường là ngày hiện tại)
     * @return Số tiền được hoàn lại (0 nếu không được hoàn)
     */
    public BigDecimal calculateRefund(Booking booking, LocalDate cancellationDate) {
        if (booking == null || booking.getTotalPrice() == null) {
            return BigDecimal.ZERO;
        }

        String policyStr = booking.getCancellationPolicy();
        if (policyStr == null || policyStr.isEmpty()) {
            policyStr = "MODERATE"; // Default policy
        }

        CancellationPolicy policy;
        try {
            policy = CancellationPolicy.valueOf(policyStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            policy = CancellationPolicy.MODERATE; // Default to MODERATE
        }

        LocalDate checkInDate = booking.getCheckInDate();
        if (checkInDate == null || cancellationDate == null) {
            return BigDecimal.ZERO;
        }

        long daysUntilCheckIn = ChronoUnit.DAYS.between(cancellationDate, checkInDate);

        BigDecimal totalPrice = booking.getTotalPrice();
        BigDecimal refundAmount = BigDecimal.ZERO;

        switch (policy) {
            case FLEXIBLE:
                // Hoàn tiền 100% nếu hủy trước 1 ngày check-in
                if (daysUntilCheckIn >= 1) {
                    refundAmount = totalPrice;
                }
                break;

            case MODERATE:
                // Hoàn tiền 50% nếu hủy trước 5 ngày check-in
                // Hoàn tiền 100% nếu hủy trước 14 ngày check-in
                if (daysUntilCheckIn >= 14) {
                    refundAmount = totalPrice;
                } else if (daysUntilCheckIn >= 5) {
                    refundAmount = totalPrice.multiply(BigDecimal.valueOf(0.5));
                }
                break;

            case STRICT:
                // Hoàn tiền 50% nếu hủy trước 7 ngày check-in
                // Không hoàn tiền nếu hủy trong vòng 7 ngày
                if (daysUntilCheckIn >= 7) {
                    refundAmount = totalPrice.multiply(BigDecimal.valueOf(0.5));
                }
                break;
        }

        // Đảm bảo refund không vượt quá total price
        if (refundAmount.compareTo(totalPrice) > 0) {
            refundAmount = totalPrice;
        }

        // Đảm bảo refund không âm
        if (refundAmount.compareTo(BigDecimal.ZERO) < 0) {
            refundAmount = BigDecimal.ZERO;
        }

        return refundAmount;
    }

    /**
     * Tính toán số tiền phí hủy (totalPrice - refundAmount)
     */
    public BigDecimal calculateCancellationFee(Booking booking, LocalDate cancellationDate) {
        BigDecimal refundAmount = calculateRefund(booking, cancellationDate);
        BigDecimal totalPrice = booking.getTotalPrice();
        
        if (totalPrice == null) {
            return BigDecimal.ZERO;
        }

        return totalPrice.subtract(refundAmount);
    }

    /**
     * Lấy thông tin chi tiết về chính sách hủy (để hiển thị cho user)
     */
    public String getPolicyDescription(String policyStr) {
        if (policyStr == null || policyStr.isEmpty()) {
            policyStr = "MODERATE";
        }

        CancellationPolicy policy;
        try {
            policy = CancellationPolicy.valueOf(policyStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            policy = CancellationPolicy.MODERATE;
        }

        return switch (policy) {
            case FLEXIBLE -> "Linh hoạt: Hoàn tiền 100% nếu hủy trước 1 ngày check-in";
            case MODERATE -> "Vừa phải: Hoàn tiền 100% trước 14 ngày, 50% trước 5 ngày check-in";
            case STRICT -> "Nghiêm ngặt: Hoàn tiền 50% nếu hủy trước 7 ngày check-in";
        };
    }
}
