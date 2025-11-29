package com.verzol.stayhub.module.booking.repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.verzol.stayhub.module.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.lockedUntil < :now")
    List<Booking> findExpiredPendingBookings(LocalDateTime now);

    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.roomId = :roomId AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
    List<Booking> findOverlappingBookings(Long roomId, LocalDate checkIn, LocalDate checkOut);

    // Host queries: Find bookings by hotel through room
    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId")
    List<Booking> findByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId AND b.status = :status")
    List<Booking> findByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") String status);

    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId AND b.checkInDate >= :startDate AND b.checkInDate <= :endDate")
    List<Booking> findByHotelIdAndCheckInDateBetween(
        @Param("hotelId") Long hotelId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId AND b.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "AND b.checkInDate >= :today ORDER BY b.checkInDate ASC")
    List<Booking> findUpcomingBookingsByHotelId(@Param("hotelId") Long hotelId, @Param("today") LocalDate today);

    // Find bookings that can be checked in today or in the past (but not yet checked in)
    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId AND b.status = 'CONFIRMED' " +
           "AND b.checkInDate <= :today")
    List<Booking> findPendingCheckInsByHotelId(@Param("hotelId") Long hotelId, @Param("today") LocalDate today);

    // Find bookings that can be checked out (currently checked in and check-out date has arrived)
    @Query("SELECT b FROM Booking b JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "WHERE r.hotelId = :hotelId AND b.status = 'CHECKED_IN' " +
           "AND b.checkOutDate <= :today")
    List<Booking> findPendingCheckOutsByHotelId(@Param("hotelId") Long hotelId, @Param("today") LocalDate today);
}
