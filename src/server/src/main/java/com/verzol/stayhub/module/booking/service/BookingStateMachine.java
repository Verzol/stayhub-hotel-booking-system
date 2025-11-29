package com.verzol.stayhub.module.booking.service;

import org.springframework.stereotype.Service;

import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.enums.BookingStatus;

import java.time.LocalDateTime;

/**
 * Service quản lý State Machine cho Booking
 * Quản lý các transitions hợp lệ giữa các trạng thái
 */
@Service
public class BookingStateMachine {

    /**
     * Kiểm tra xem transition từ status hiện tại sang status mới có hợp lệ không
     */
    public boolean isValidTransition(String currentStatus, String newStatus) {
        if (currentStatus == null || newStatus == null) {
            return false;
        }

        BookingStatus current = parseStatus(currentStatus);
        BookingStatus newStatusEnum = parseStatus(newStatus);

        if (current == null || newStatusEnum == null) {
            return false;
        }

        return isValidTransition(current, newStatusEnum);
    }

    /**
     * Validate và thực hiện transition
     * Throw RuntimeException nếu transition không hợp lệ
     */
    public void validateTransition(String currentStatus, String newStatus) {
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException(
                String.format("Cannot transition from %s to %s", currentStatus, newStatus)
            );
        }
    }

    /**
     * Kiểm tra transition giữa các enum
     */
    private boolean isValidTransition(BookingStatus current, BookingStatus target) {
        return switch (current) {
            case PENDING -> target == BookingStatus.CONFIRMED || target == BookingStatus.CANCELLED;
            case CONFIRMED -> target == BookingStatus.CHECKED_IN || target == BookingStatus.CANCELLED;
            case CHECKED_IN -> target == BookingStatus.COMPLETED || target == BookingStatus.CANCELLED;
            case COMPLETED -> false; // COMPLETED is terminal state
            case CANCELLED -> false; // CANCELLED is terminal state
        };
    }

    /**
     * Chuyển booking sang trạng thái mới với validation
     */
    public void transitionTo(Booking booking, String newStatus) {
        validateTransition(booking.getStatus(), newStatus);
        booking.setStatus(newStatus);

        // Set timestamps khi chuyển sang các trạng thái cụ thể
        LocalDateTime now = LocalDateTime.now();
        BookingStatus status = parseStatus(newStatus);

        if (status != null) {
            switch (status) {
                case CHECKED_IN -> booking.setCheckedInAt(now);
                case COMPLETED -> booking.setCheckedOutAt(now);
                case CANCELLED -> booking.setCancelledAt(now);
                default -> {
                    // No timestamp needed
                }
            }
        }
    }

    /**
     * Parse string status sang enum, trả về null nếu không hợp lệ
     */
    private BookingStatus parseStatus(String status) {
        if (status == null) {
            return null;
        }
        try {
            return BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Kiểm tra xem booking có thể hủy được không
     */
    public boolean canBeCancelled(String status) {
        BookingStatus bookingStatus = parseStatus(status);
        if (bookingStatus == null) {
            return false;
        }
        return bookingStatus != BookingStatus.COMPLETED && 
               bookingStatus != BookingStatus.CANCELLED;
    }

    /**
     * Kiểm tra xem booking có thể check-in được không
     */
    public boolean canCheckIn(String status) {
        return BookingStatus.CONFIRMED.name().equals(status);
    }

    /**
     * Kiểm tra xem booking có thể check-out được không
     */
    public boolean canCheckOut(String status) {
        return BookingStatus.CHECKED_IN.name().equals(status);
    }
}
