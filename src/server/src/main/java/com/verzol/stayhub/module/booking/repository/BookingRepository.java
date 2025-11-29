package com.verzol.stayhub.module.booking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.verzol.stayhub.module.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.lockedUntil < :now")
    List<Booking> findExpiredPendingBookings(LocalDateTime now);

    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.roomId = :roomId AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    List<Booking> findOverlappingBookings(Long roomId, java.time.LocalDate checkIn, java.time.LocalDate checkOut);
}
