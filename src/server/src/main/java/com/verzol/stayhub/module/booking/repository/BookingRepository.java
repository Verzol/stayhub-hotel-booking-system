package com.verzol.stayhub.module.booking.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.verzol.stayhub.module.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.lockedUntil < :now")
    List<Booking> findExpiredPendingBookings(LocalDateTime now);

    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.roomId = :roomId " +
           "AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)) " +
           "AND (b.status != 'PENDING' OR b.lockedUntil > :now)")
    List<Booking> findOverlappingBookings(@Param("roomId") Long roomId, 
                                          @Param("checkIn") LocalDate checkIn, 
                                          @Param("checkOut") LocalDate checkOut,
                                          @Param("now") LocalDateTime now);

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
    
    // Find bookings for multiple hotels (by owner ID through hotels)
    @Query("SELECT b FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId")
    List<Booking> findByOwnerId(@Param("ownerId") Long ownerId);

    // ========== Aggregated queries for dashboard (OPTIMIZED) ==========
    
    /**
     * Count total bookings for owner (optimized - no data loading)
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId")
    Long countByOwnerId(@Param("ownerId") Long ownerId);
    
    /**
     * Count confirmed bookings for owner (optimized)
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')")
    Long countConfirmedByOwnerId(@Param("ownerId") Long ownerId);
    
    /**
     * Count upcoming bookings for owner (optimized)
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "AND b.checkInDate >= :today")
    Long countUpcomingByOwnerId(@Param("ownerId") Long ownerId, @Param("today") LocalDate today);
    
    /**
     * Count pending check-ins for owner (optimized)
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status = 'CONFIRMED' " +
           "AND b.checkInDate <= :today")
    Long countPendingCheckInsByOwnerId(@Param("ownerId") Long ownerId, @Param("today") LocalDate today);
    
    /**
     * Count pending check-outs for owner (optimized)
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status = 'CHECKED_IN' " +
           "AND b.checkOutDate <= :today")
    Long countPendingCheckOutsByOwnerId(@Param("ownerId") Long ownerId, @Param("today") LocalDate today);
    
    /**
     * Sum total revenue from completed bookings (optimized)
     */
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status = 'COMPLETED'")
    BigDecimal sumTotalRevenueByOwnerId(@Param("ownerId") Long ownerId);
    
    /**
     * Sum revenue for this month (optimized)
     */
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status = 'COMPLETED' " +
           "AND b.checkedOutAt >= :startOfMonth")
    BigDecimal sumRevenueThisMonthByOwnerId(@Param("ownerId") Long ownerId, @Param("startOfMonth") LocalDateTime startOfMonth);
    
    /**
     * Sum revenue for last month (optimized)
     */
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
           "JOIN com.verzol.stayhub.module.room.entity.Room r ON b.roomId = r.id " +
           "JOIN com.verzol.stayhub.module.hotel.entity.Hotel h ON r.hotelId = h.id " +
           "WHERE h.ownerId = :ownerId AND b.status = 'COMPLETED' " +
           "AND b.checkedOutAt >= :startOfLastMonth AND b.checkedOutAt <= :endOfLastMonth")
    BigDecimal sumRevenueLastMonthByOwnerId(@Param("ownerId") Long ownerId, 
                                           @Param("startOfLastMonth") LocalDateTime startOfLastMonth,
                                           @Param("endOfLastMonth") LocalDateTime endOfLastMonth);
    
    /**
     * Get recent bookings (last 5) for owner (optimized - only loads 5 records)
     * Using native query with LIMIT for better performance
     */
    @Query(value = "SELECT b.* FROM bookings b " +
           "INNER JOIN rooms r ON b.room_id = r.id " +
           "INNER JOIN hotels h ON r.hotel_id = h.id " +
           "WHERE h.owner_id = :ownerId " +
           "ORDER BY b.created_at DESC LIMIT 5", 
           nativeQuery = true)
    List<Booking> findRecentBookingsByOwnerId(@Param("ownerId") Long ownerId);

    List<Booking> findByRoomId(Long roomId);
}
