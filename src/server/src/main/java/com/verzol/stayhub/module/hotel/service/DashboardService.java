package com.verzol.stayhub.module.hotel.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.repository.BookingRepository;
import com.verzol.stayhub.module.hotel.dto.DashboardDTOs.DashboardSummaryResponse;
import com.verzol.stayhub.module.hotel.dto.DashboardDTOs.RecentBooking;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.repository.RoomRepository;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for dashboard summary - optimized for fast loading
 * All stats calculated in one transaction with optimized queries
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Get dashboard summary for a host
     * Optimized: Single transaction, aggregated queries, minimal data fetching
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long ownerId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);
        
        // Get all hotels for owner (optimized query)
        List<Hotel> hotels = hotelRepository.findByOwnerId(ownerId);
        List<Long> hotelIds = hotels.stream()
            .map(Hotel::getId)
            .filter(id -> id != null)
            .collect(Collectors.toList());
        
        if (hotelIds.isEmpty()) {
            return createEmptySummary();
        }
        
        // Get hotel count
        int totalHotels = hotelIds.size();
        
        // Get room count (single aggregated query)
        int totalRooms = roomRepository.countByHotelIdIn(hotelIds);
        
        // ========== OPTIMIZED: Use aggregated queries instead of loading all bookings ==========
        // These queries run much faster as they only return counts/sums, not full objects
        
        // Get booking counts using aggregated queries (much faster than loading all bookings)
        Long totalBookings = bookingRepository.countByOwnerId(ownerId);
        Long confirmedBookings = bookingRepository.countConfirmedByOwnerId(ownerId);
        Long upcomingBookings = bookingRepository.countUpcomingByOwnerId(ownerId, today);
        Long pendingCheckIns = bookingRepository.countPendingCheckInsByOwnerId(ownerId, today);
        Long pendingCheckOuts = bookingRepository.countPendingCheckOutsByOwnerId(ownerId, today);
        
        // Get revenue using aggregated SUM queries (much faster)
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenueByOwnerId(ownerId);
        
        LocalDateTime startOfMonthDT = startOfMonth.atStartOfDay();
        BigDecimal thisMonthRevenue = bookingRepository.sumRevenueThisMonthByOwnerId(ownerId, startOfMonthDT);
        
        LocalDateTime startOfLastMonthDT = startOfLastMonth.atStartOfDay();
        LocalDateTime endOfLastMonthDT = endOfLastMonth.atTime(23, 59, 59);
        BigDecimal lastMonthRevenue = bookingRepository.sumRevenueLastMonthByOwnerId(ownerId, startOfLastMonthDT, endOfLastMonthDT);
        
        // Calculate revenue change percentage
        double revenueChangePercent = 0.0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal change = thisMonthRevenue.subtract(lastMonthRevenue);
            revenueChangePercent = change.divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        } else if (thisMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueChangePercent = 100.0; // 100% increase from 0
        }
        
        // Only load recent bookings (5 records) - much faster than loading all!
        // This runs asynchronously to not block stats calculation
        List<Booking> recentBookingsList = bookingRepository.findRecentBookingsByOwnerId(ownerId);
        
        // Batch load rooms and hotels for recent bookings (only 5 records - fast!)
        List<RecentBooking> recentBookings = mapToRecentBookings(recentBookingsList);
        
        // Build response
        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setTotalHotels(totalHotels);
        response.setTotalRooms(totalRooms);
        response.setTotalBookings(totalBookings.intValue());
        response.setConfirmedBookings(confirmedBookings.intValue());
        response.setUpcomingBookings(upcomingBookings.intValue());
        response.setPendingCheckIns(pendingCheckIns.intValue());
        response.setPendingCheckOuts(pendingCheckOuts.intValue());
        response.setTotalRevenue(totalRevenue);
        response.setThisMonthRevenue(thisMonthRevenue);
        response.setLastMonthRevenue(lastMonthRevenue);
        response.setRevenueChangePercent(revenueChangePercent);
        response.setRecentBookings(recentBookings);
        
        return response;
    }
    
    /**
     * Get recent bookings for a host (last 5)
     * Optimized: Uses native query with LIMIT for better performance
     */
    @Transactional(readOnly = true)
    public List<RecentBooking> getRecentBookings(Long ownerId) {
        List<Booking> recentBookingsList = bookingRepository.findRecentBookingsByOwnerId(ownerId);
        return mapToRecentBookings(recentBookingsList);
    }
    
    /**
     * Map bookings to RecentBooking with batch loading (optimized - avoids N+1 queries)
     */
    private List<RecentBooking> mapToRecentBookings(List<Booking> bookings) {
        if (bookings.isEmpty()) {
            return List.of();
        }
        
        // Collect unique room IDs
        List<Long> roomIds = bookings.stream()
                .map(Booking::getRoomId)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all rooms in one query
        List<Room> rooms = roomRepository.findAllById(roomIds);
        java.util.Map<Long, Room> roomMap = rooms.stream()
                .collect(Collectors.toMap(Room::getId, r -> r));
        
        // Collect unique hotel IDs
        List<Long> hotelIds = rooms.stream()
                .map(Room::getHotelId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all hotels in one query
        List<Hotel> hotels = hotelRepository.findAllById(hotelIds);
        java.util.Map<Long, Hotel> hotelMap = hotels.stream()
                .collect(Collectors.toMap(Hotel::getId, h -> h));
        
        // Collect unique user IDs for guest names
        List<Long> userIds = bookings.stream()
                .map(Booking::getUserId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all users in one query
        List<User> users = userRepository.findAllById(userIds);
        java.util.Map<Long, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        // Map bookings using batch-loaded data
        return bookings.stream()
                .map(booking -> {
                    RecentBooking rb = new RecentBooking();
                    rb.setId(booking.getId());
                    rb.setStatus(booking.getStatus());
                    rb.setTotalPrice(booking.getTotalPrice());
                    rb.setCheckInDate(booking.getCheckInDate());
                    
                    // Use batch-loaded data
                    Room room = roomMap.get(booking.getRoomId());
                    if (room != null) {
                        rb.setRoomName(room.getName());
                        
                        Hotel hotel = hotelMap.get(room.getHotelId());
                        if (hotel != null) {
                            rb.setHotelName(hotel.getName());
                        }
                    } else {
                        rb.setRoomName("Room #" + booking.getRoomId());
                        rb.setHotelName("Hotel");
                    }
                    
                    // Get guest name
                    User user = userMap.get(booking.getUserId());
                    if (user != null) {
                        rb.setGuestName(user.getFullName() != null ? user.getFullName() : 
                                       (booking.getGuestName() != null ? booking.getGuestName() : "Guest"));
                    } else {
                        rb.setGuestName(booking.getGuestName() != null ? booking.getGuestName() : "Guest");
                    }
                    
                    return rb;
                })
                .collect(Collectors.toList());
    }
    
    private DashboardSummaryResponse createEmptySummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setTotalHotels(0);
        response.setTotalRooms(0);
        response.setTotalBookings(0);
        response.setConfirmedBookings(0);
        response.setUpcomingBookings(0);
        response.setPendingCheckIns(0);
        response.setPendingCheckOuts(0);
        response.setTotalRevenue(BigDecimal.ZERO);
        response.setThisMonthRevenue(BigDecimal.ZERO);
        response.setLastMonthRevenue(BigDecimal.ZERO);
        response.setRevenueChangePercent(0.0);
        response.setRecentBookings(List.of());
        return response;
    }
}

