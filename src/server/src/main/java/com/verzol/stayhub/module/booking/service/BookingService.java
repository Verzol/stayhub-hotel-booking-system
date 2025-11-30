package com.verzol.stayhub.module.booking.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.auth.service.EmailService;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.AnalyticsResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.EarningsResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.HostBookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.MonthlyEarnings;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.MonthlyRevenue;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.PriceCalculationResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.RecentTransaction;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.repository.BookingRepository;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.promotion.entity.Promotion;
import com.verzol.stayhub.module.promotion.repository.PromotionRepository;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.repository.RoomRepository;
import com.verzol.stayhub.module.room.service.RoomService;
import com.verzol.stayhub.module.user.repository.UserRepository;
import com.verzol.stayhub.module.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final PromotionRepository promotionRepository;
    private final com.verzol.stayhub.module.hotel.repository.HotelRepository hotelRepository;
    private final RoomService roomService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final BookingStateMachine stateMachine;
    private final NotificationService notificationService;
    private final RefundCalculationService refundCalculationService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.booking.payment-hold-duration:200}")
    private int paymentHoldDurationMinutes;

    public PriceCalculationResponse calculatePrice(BookingRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) || request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights < 1) nights = 1;

        BigDecimal originalPrice = room.getBasePrice().multiply(BigDecimal.valueOf(nights));
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Promotion promotion = promotionRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ"));

            // Check if promotion is active
            if (promotion.getIsActive() == null || !promotion.getIsActive()) {
                throw new RuntimeException("Mã giảm giá không còn hiệu lực");
            }

            // Check if promotion is within valid time period
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startDate = promotion.getStartDate();
            LocalDateTime endDate = promotion.getEndDate();
            
            // Format dates for error messages (DD/MM/YYYY format)
            java.time.format.DateTimeFormatter dateFormatter = 
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            java.time.format.DateTimeFormatter timeFormatter = 
                java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            
            // Validate time period - simple comparison
            // If now is before startDate, promotion hasn't started yet
            if (now.isBefore(startDate)) {
                String formattedDate = startDate.toLocalDate().format(dateFormatter);
                String formattedTime = startDate.toLocalTime().format(timeFormatter);
                throw new RuntimeException("Mã giảm giá chưa có hiệu lực. Thời gian hiệu lực bắt đầu: " + 
                    formattedDate + " lúc " + formattedTime);
            }
            
            // If now is after endDate, promotion has expired
            if (now.isAfter(endDate)) {
                String formattedDate = endDate.toLocalDate().format(dateFormatter);
                String formattedTime = endDate.toLocalTime().format(timeFormatter);
                throw new RuntimeException("Mã giảm giá đã hết hạn. Thời gian hiệu lực kết thúc: " + 
                    formattedDate + " lúc " + formattedTime);
            }

            // Check if promotion applies to this hotel (if promotion has hotelId)
            if (promotion.getHotelId() != null && !promotion.getHotelId().equals(room.getHotelId())) {
                throw new RuntimeException("Mã giảm giá không áp dụng cho khách sạn này");
            }
                
            // Check max usage limit
            if (promotion.getMaxUsage() != null && promotion.getCurrentUsage() != null) {
                if (promotion.getCurrentUsage() >= promotion.getMaxUsage()) {
                    throw new RuntimeException("Mã giảm giá đã đạt giới hạn sử dụng");
                }
            }
            
            // Calculate discount
            BigDecimal discount = originalPrice.multiply(BigDecimal.valueOf(promotion.getDiscountPercent()))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            
            // Apply max discount amount limit if exists
            if (promotion.getMaxDiscountAmount() != null && discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                discount = promotion.getMaxDiscountAmount();
            }
            
            discountAmount = discount;
            appliedCoupon = promotion.getCode();
        }

        BigDecimal finalPrice = originalPrice.subtract(discountAmount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) finalPrice = BigDecimal.ZERO;

        PriceCalculationResponse response = new PriceCalculationResponse();
        response.setOriginalPrice(originalPrice);
        response.setDiscountAmount(discountAmount);
        response.setServiceFee(BigDecimal.ZERO);
        response.setFinalPrice(finalPrice);
        response.setAppliedCouponCode(appliedCoupon);

        return response;
    }

    @Transactional
    public BookingResponse createPendingBooking(BookingRequest request, Long userId) {
        // 1. Check room exists
        if (!roomRepository.existsById(request.getRoomId())) {
            throw new RuntimeException("Room not found");
        }
        
        // Clean up expired PENDING bookings first to free up rooms
        // This ensures expired bookings don't block new bookings
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(LocalDateTime.now());
        for (Booking expiredBooking : expiredBookings) {
            try {
                roomService.cancelReservation(expiredBooking.getId());
            } catch (Exception e) {
                // Log but don't fail - room might already be released
                System.err.println("Failed to release room for expired booking " + expiredBooking.getId() + ": " + e.getMessage());
            }
            
            expiredBooking.setStatus("CANCELLED");
            expiredBooking.setCancelledAt(LocalDateTime.now());
            expiredBooking.setCancelledBy("SYSTEM");
            expiredBooking.setCancellationReason("Booking expired - payment not completed within time limit");
            bookingRepository.save(expiredBooking);
        }
        
        // Check for overlapping bookings (excluding cancelled and expired PENDING bookings)
        // This includes only valid PENDING (non-expired temporary holds) and CONFIRMED bookings
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
            request.getRoomId(), 
            request.getCheckInDate(), 
            request.getCheckOutDate(),
            LocalDateTime.now() // Exclude expired PENDING bookings
        );
        
        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Room is not available for the selected dates");
        }
        
        // 2. Calculate Price
        PriceCalculationResponse price = calculatePrice(request);

        // 3. Create Booking
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setRoomId(request.getRoomId());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setGuests(request.getGuests());
        booking.setTotalPrice(price.getFinalPrice());
        booking.setStatus("PENDING");
        booking.setCouponCode(price.getAppliedCouponCode());
        booking.setNote(request.getNote());
        booking.setGuestName(request.getGuestName());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setGuestPhone(request.getGuestPhone());
        // Set lock time based on configuration (default 20 minutes, like Booking.com/Agoda)
        booking.setLockedUntil(LocalDateTime.now().plusMinutes(paymentHoldDurationMinutes));
        
        // Set default cancellation policy (can be overridden by room/hotel settings in the future)
        booking.setCancellationPolicy("MODERATE");

        Booking savedBooking = bookingRepository.save(booking);

        // Reserve room immediately with temporary hold (like major booking sites)
        // This prevents double booking during payment process
        try {
            roomService.reserveDatesTemporary(savedBooking.getRoomId(), savedBooking.getId(), 
                savedBooking.getCheckInDate(), savedBooking.getCheckOutDate(),
                savedBooking.getLockedUntil());
        } catch (Exception e) {
            // If reservation fails, rollback the booking
            bookingRepository.delete(savedBooking);
            throw new RuntimeException("Room is no longer available: " + e.getMessage());
        }

        // 3. Return Response
        BookingResponse response = new BookingResponse();
        response.setId(savedBooking.getId());
        response.setRoomId(savedBooking.getRoomId());
        response.setCheckInDate(savedBooking.getCheckInDate());
        response.setCheckOutDate(savedBooking.getCheckOutDate());
        response.setGuests(savedBooking.getGuests());
        response.setTotalPrice(savedBooking.getTotalPrice());
        response.setStatus(savedBooking.getStatus());
        response.setLockedUntil(savedBooking.getLockedUntil()); // Include lockedUntil for countdown timer
        response.setCouponCode(savedBooking.getCouponCode());
        response.setNote(savedBooking.getNote());
        response.setGuestName(savedBooking.getGuestName());
        response.setGuestEmail(savedBooking.getGuestEmail());
        response.setGuestPhone(savedBooking.getGuestPhone());
        
        // Log for debugging
        System.out.println("Created booking ID: " + savedBooking.getId() + ", lockedUntil: " + savedBooking.getLockedUntil());
        
        return response;
    }

    @Transactional
    public void confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not pending");
        }

        // Confirm room reservation (convert from temporary hold to permanent booking)
        // Room was already reserved temporarily when booking was created
        try {
            roomService.reserveDates(booking.getRoomId(), bookingId, 
                booking.getCheckInDate(), booking.getCheckOutDate());
        } catch (Exception e) {
            throw new RuntimeException("Failed to confirm room reservation: " + e.getMessage());
        }

        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
        
        // Update promotion usage if applicable
        if (booking.getCouponCode() != null) {
            promotionRepository.findByCode(booking.getCouponCode()).ifPresent(p -> {
                if (p.getCurrentUsage() == null) {
                    p.setCurrentUsage(0);
                }
                p.setCurrentUsage(p.getCurrentUsage() + 1);
                promotionRepository.save(p);
            });
        }

        // Send notification to guest
        try {
            Room room = roomRepository.findById(booking.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            Hotel hotel = hotelRepository.findById(room.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            
            String message = String.format("Đặt phòng #%d tại %s đã được xác nhận thành công!", 
                    booking.getId(), hotel.getName());
            notificationService.sendNotification(
                    booking.getUserId(),
                    "Đặt phòng thành công",
                    message,
                    "BOOKING"
            );
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation notification: " + e.getMessage());
        }

        // Send invoice email
        try {
            Room room = roomRepository.findById(booking.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            Hotel hotel = hotelRepository.findById(room.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            
            String guestEmail = booking.getGuestEmail() != null && !booking.getGuestEmail().isEmpty()
                    ? booking.getGuestEmail()
                    : userRepository.findById(booking.getUserId())
                            .map(user -> user.getEmail())
                            .orElse(null);
            
            String guestName = booking.getGuestName() != null && !booking.getGuestName().isEmpty()
                    ? booking.getGuestName()
                    : userRepository.findById(booking.getUserId())
                            .map(user -> user.getFullName())
                            .orElse("Khách hàng");
            
            if (guestEmail != null) {
                // Format price as VND
                String formattedPrice = String.format("%,d VNĐ", booking.getTotalPrice().longValue());
                
                emailService.sendInvoiceEmail(
                    guestEmail,
                    guestName,
                    booking.getId().toString(),
                    hotel.getName(),
                    room.getName(),
                    booking.getCheckInDate().toString(),
                    booking.getCheckOutDate().toString(),
                    booking.getGuests(),
                    formattedPrice,
                    booking.getCouponCode(),
                    frontendUrl
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the booking confirmation
            System.err.println("Failed to send invoice email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cancelExpiredBookings() {
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(LocalDateTime.now());
        for (Booking booking : expiredBookings) {
            // Release room reservation if booking expires
            try {
                roomService.cancelReservation(booking.getId());
            } catch (Exception e) {
                System.err.println("Failed to release room for expired booking " + booking.getId() + ": " + e.getMessage());
            }
            
            booking.setStatus("CANCELLED");
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancelledBy("SYSTEM");
            booking.setCancellationReason("Booking expired - payment not completed within time limit");
            bookingRepository.save(booking);
        }
    }
    
    public Booking getBooking(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::mapToResponse).toList();
    }

    public BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setRoomId(booking.getRoomId());
        response.setCheckInDate(booking.getCheckInDate());
        response.setCheckOutDate(booking.getCheckOutDate());
        response.setGuests(booking.getGuests());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus());
        response.setLockedUntil(booking.getLockedUntil());
        response.setCouponCode(booking.getCouponCode());
        response.setNote(booking.getNote());
        response.setGuestName(booking.getGuestName());
        response.setGuestEmail(booking.getGuestEmail());
        response.setGuestPhone(booking.getGuestPhone());
        
        // New fields
        response.setCheckedInAt(booking.getCheckedInAt());
        response.setCheckedOutAt(booking.getCheckedOutAt());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCancelledBy(booking.getCancelledBy());
        response.setRefundAmount(booking.getRefundAmount());
        response.setCancellationPolicy(booking.getCancellationPolicy());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
        // Set cancellation policy description
        if (booking.getCancellationPolicy() != null) {
            response.setCancellationPolicyDescription(
                refundCalculationService.getPolicyDescription(booking.getCancellationPolicy())
            );
        }
        
        // Populate Room and Hotel details
        roomRepository.findById(booking.getRoomId()).ifPresent(room -> {
            response.setRoomName(room.getName());
            if (room.getImages() != null && !room.getImages().isEmpty()) {
                response.setRoomImage(room.getImages().get(0).getUrl());
            }
            
            // Fetch Hotel details
            if (room.getHotelId() != null) {
                response.setHotelId(room.getHotelId());
                hotelRepository.findById(room.getHotelId()).ifPresent(hotel -> {
                    response.setHotelName(hotel.getName());
                });
            }
        });
        
        return response;
    }

    /**
     * Cancel booking - Guest can cancel their own booking
     */
    @Transactional
    public CancellationResponse cancelBooking(Long bookingId, Long userId, CancellationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        
        // Check if booking can be cancelled
        if (!stateMachine.canBeCancelled(booking.getStatus())) {
            throw new RuntimeException("This booking cannot be cancelled");
        }
        
        // Calculate refund
        LocalDate cancellationDate = LocalDate.now();
        BigDecimal refundAmount = refundCalculationService.calculateRefund(booking, cancellationDate);
        BigDecimal cancellationFee = refundCalculationService.calculateCancellationFee(booking, cancellationDate);
        
        // Update booking
        booking.setRefundAmount(refundAmount);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledBy("GUEST");
        
        // Transition to CANCELLED status
        stateMachine.transitionTo(booking, "CANCELLED");
        
        // Release room availability
        try {
            roomService.cancelReservation(bookingId);
        } catch (Exception e) {
            // Log error but don't fail the cancellation
            System.err.println("Failed to release room availability: " + e.getMessage());
        }
        
        bookingRepository.save(booking);
        
        // Send notification to guest if cancelled by host
        if ("HOST".equals(booking.getCancelledBy())) {
            try {
                Room room = roomRepository.findById(booking.getRoomId())
                        .orElseThrow(() -> new RuntimeException("Room not found"));
                Hotel hotel = hotelRepository.findById(room.getHotelId())
                        .orElseThrow(() -> new RuntimeException("Hotel not found"));
                
                String message = String.format("Đặt phòng #%d tại %s đã bị hủy bởi chủ khách sạn.", 
                        booking.getId(), hotel.getName());
                notificationService.sendNotification(
                        booking.getUserId(),
                        "Đặt phòng bị hủy",
                        message,
                        "BOOKING"
                );
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification: " + e.getMessage());
            }
        }
        
        // Build response
        CancellationResponse response = new CancellationResponse();
        response.setBookingId(booking.getId());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setRefundAmount(refundAmount);
        response.setCancellationFee(cancellationFee);
        response.setCancellationPolicy(booking.getCancellationPolicy());
        response.setCancellationPolicyDescription(
            refundCalculationService.getPolicyDescription(booking.getCancellationPolicy())
        );
        response.setCancelledAt(booking.getCancelledAt());
        
        if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            response.setMessage(String.format(
                "Booking cancelled. You will be refunded %s VNĐ within 5-7 business days.",
                String.format("%,d", refundAmount.longValue())
            ));
        } else {
            response.setMessage("Booking cancelled. No refund available based on cancellation policy.");
        }
        
        return response;
    }

    /**
     * Check-in guest - Host can check in guests
     */
    @Transactional
    public void checkIn(Long bookingId, Long hotelId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify hotel ownership through room
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (!room.getHotelId().equals(hotelId)) {
            throw new RuntimeException("This booking does not belong to your hotel");
        }
        
        // Check if booking can be checked in
        if (!stateMachine.canCheckIn(booking.getStatus())) {
            throw new RuntimeException("This booking cannot be checked in. Current status: " + booking.getStatus());
        }
        
        // Transition to CHECKED_IN
        stateMachine.transitionTo(booking, "CHECKED_IN");
        bookingRepository.save(booking);
    }

    /**
     * Check-out guest - Host can check out guests
     */
    @Transactional
    public void checkOut(Long bookingId, Long hotelId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify hotel ownership through room
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (!room.getHotelId().equals(hotelId)) {
            throw new RuntimeException("This booking does not belong to your hotel");
        }
        
        // Check if booking can be checked out
        if (!stateMachine.canCheckOut(booking.getStatus())) {
            throw new RuntimeException("This booking cannot be checked out. Current status: " + booking.getStatus());
        }
        
        // Transition to COMPLETED
        stateMachine.transitionTo(booking, "COMPLETED");
        bookingRepository.save(booking);
    }

    /**
     * Get bookings for a hotel - Host can view all bookings for their hotels
     * Optimized with batch loading to avoid N+1 queries
     */
    public List<HostBookingResponse> getHostBookings(Long hotelId, String status, LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;
        
        if (status != null && !status.isEmpty()) {
            bookings = bookingRepository.findByHotelIdAndStatus(hotelId, status);
        } else if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByHotelIdAndCheckInDateBetween(hotelId, startDate, endDate);
        } else {
            bookings = bookingRepository.findByHotelId(hotelId);
        }
        
        // Batch load rooms and hotels to avoid N+1 queries
        return mapToHostResponseBatch(bookings);
    }

    /**
     * Get upcoming bookings for a hotel
     */
    public List<HostBookingResponse> getUpcomingBookings(Long hotelId) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByHotelId(hotelId, LocalDate.now());
        return mapToHostResponseBatch(bookings);
    }

    /**
     * Get pending check-ins for a hotel
     */
    public List<HostBookingResponse> getPendingCheckIns(Long hotelId) {
        List<Booking> bookings = bookingRepository.findPendingCheckInsByHotelId(hotelId, LocalDate.now());
        return mapToHostResponseBatch(bookings);
    }

    /**
     * Get pending check-outs for a hotel
     */
    public List<HostBookingResponse> getPendingCheckOuts(Long hotelId) {
        List<Booking> bookings = bookingRepository.findPendingCheckOutsByHotelId(hotelId, LocalDate.now());
        return mapToHostResponseBatch(bookings);
    }

    /**
     * Get all bookings for all hotels owned by a host (for dashboard)
     * Optimized: Single query instead of N queries
     */
    public List<HostBookingResponse> getAllHostBookings(Long ownerId) {
        // Single query to get all bookings for all hotels of the host
        List<Booking> bookings = bookingRepository.findByOwnerId(ownerId);
        
        // Batch load rooms and hotels to avoid N+1 queries
        return mapToHostResponseBatch(bookings);
    }

    /**
     * Map bookings to HostBookingResponse with batch loading (optimized - avoids N+1 queries)
     */
    private List<HostBookingResponse> mapToHostResponseBatch(List<Booking> bookings) {
        if (bookings.isEmpty()) {
            return List.of();
        }
        
        // Collect unique room IDs
        List<Long> roomIds = bookings.stream()
                .map(Booking::getRoomId)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all rooms in one query
        List<com.verzol.stayhub.module.room.entity.Room> rooms = roomRepository.findAllById(roomIds);
        java.util.Map<Long, com.verzol.stayhub.module.room.entity.Room> roomMap = rooms.stream()
                .collect(Collectors.toMap(com.verzol.stayhub.module.room.entity.Room::getId, r -> r));
        
        // Collect unique hotel IDs
        List<Long> hotelIds = rooms.stream()
                .map(com.verzol.stayhub.module.room.entity.Room::getHotelId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Batch load all hotels in one query
        List<Hotel> hotels = hotelRepository.findAllById(hotelIds);
        java.util.Map<Long, Hotel> hotelMap = hotels.stream()
                .collect(Collectors.toMap(Hotel::getId, h -> h));
        
        // Map bookings using batch-loaded data
        return bookings.stream()
                .map(booking -> {
                    HostBookingResponse response = new HostBookingResponse();
                    response.setId(booking.getId());
                    response.setUserId(booking.getUserId());
                    response.setGuestName(booking.getGuestName());
                    response.setGuestEmail(booking.getGuestEmail());
                    response.setGuestPhone(booking.getGuestPhone());
                    response.setRoomId(booking.getRoomId());
                    response.setCheckInDate(booking.getCheckInDate());
                    response.setCheckOutDate(booking.getCheckOutDate());
                    response.setGuests(booking.getGuests());
                    response.setTotalPrice(booking.getTotalPrice());
                    response.setStatus(booking.getStatus());
                    response.setNote(booking.getNote());
                    response.setCheckedInAt(booking.getCheckedInAt());
                    response.setCheckedOutAt(booking.getCheckedOutAt());
                    response.setCancelledAt(booking.getCancelledAt());
                    response.setCancellationReason(booking.getCancellationReason());
                    response.setRefundAmount(booking.getRefundAmount());
                    response.setCreatedAt(booking.getCreatedAt());
                    response.setUpdatedAt(booking.getUpdatedAt());
                    
                    // Use batch-loaded data
                    com.verzol.stayhub.module.room.entity.Room room = roomMap.get(booking.getRoomId());
                    if (room != null) {
                        response.setRoomName(room.getName());
                        response.setHotelId(room.getHotelId());
                        
                        Hotel hotel = hotelMap.get(room.getHotelId());
                        if (hotel != null) {
                            response.setHotelName(hotel.getName());
                        }
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Map booking to HostBookingResponse (single booking - for backward compatibility)
     */
    private HostBookingResponse mapToHostResponse(Booking booking) {
        return mapToHostResponseBatch(List.of(booking)).get(0);
    }

    /**
     * Get analytics for a hotel or all hotels owned by a host
     * Optimized: Calculates analytics directly from filtered bookings
     * 
     * @param ownerId The host owner ID
     * @param hotelId Optional hotel ID filter (null = all hotels)
     * @param startDate Start date filter (null = no filter)
     * @param endDate End date filter (null = no filter)
     * @return AnalyticsResponse with pre-calculated metrics
     */
    public AnalyticsResponse getAnalytics(Long ownerId, Long hotelId, LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;
        
        if (hotelId != null) {
            // Verify hotel ownership
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (!hotel.getOwnerId().equals(ownerId)) {
                throw new RuntimeException("You don't have permission to view analytics for this hotel");
            }
            
            // Get bookings for specific hotel with optional date filter
            if (startDate != null && endDate != null) {
                bookings = bookingRepository.findByHotelIdAndCheckInDateBetween(hotelId, startDate, endDate);
            } else {
                bookings = bookingRepository.findByHotelId(hotelId);
            }
        } else {
            // Get bookings for all hotels owned by the host
            bookings = bookingRepository.findByOwnerId(ownerId);
            
            // Apply date filter if provided
            if (startDate != null && endDate != null) {
                bookings = bookings.stream()
                        .filter(b -> {
                            LocalDate checkIn = b.getCheckInDate();
                            return checkIn != null && !checkIn.isBefore(startDate) && !checkIn.isAfter(endDate);
                        })
                        .collect(Collectors.toList());
            }
        }
        
        return calculateAnalytics(bookings);
    }

    /**
     * Calculate analytics from bookings list
     */
    private AnalyticsResponse calculateAnalytics(List<Booking> bookings) {
        AnalyticsResponse response = new AnalyticsResponse();
        
        if (bookings.isEmpty()) {
            response.setRevenue(BigDecimal.ZERO);
            response.setBookingsCount(0);
            response.setOccupancyRate(0.0);
            response.setCancellationRate(0.0);
            response.setAvgBookingValue(BigDecimal.ZERO);
            response.setRevenueByMonth(List.of());
            response.setStatusDistribution(java.util.Map.of());
            return response;
        }
        
        // Filter bookings by status
        List<Booking> completed = bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.toList());
        List<Booking> cancelled = bookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()))
                .collect(Collectors.toList());
        
        // Calculate revenue
        BigDecimal revenue = completed.stream()
                .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setRevenue(revenue);
        
        // Calculate counts
        int bookingsCount = bookings.size();
        response.setBookingsCount(bookingsCount);
        
        // Calculate rates
        double occupancyRate = bookingsCount > 0 ? (completed.size() * 100.0 / bookingsCount) : 0.0;
        double cancellationRate = bookingsCount > 0 ? (cancelled.size() * 100.0 / bookingsCount) : 0.0;
        response.setOccupancyRate(occupancyRate);
        response.setCancellationRate(cancellationRate);
        
        // Calculate average booking value
        BigDecimal avgBookingValue = !completed.isEmpty() 
                ? revenue.divide(BigDecimal.valueOf(completed.size()), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        response.setAvgBookingValue(avgBookingValue);
        
        // Calculate revenue by month (last 6 months)
        List<MonthlyRevenue> revenueByMonth = new java.util.ArrayList<>();
        java.time.LocalDate now = java.time.LocalDate.now();
        java.util.Map<String, BigDecimal> monthRevenueMap = new java.util.HashMap<>();
        
        for (Booking booking : completed) {
            if (booking.getCheckedOutAt() != null) {
                java.time.LocalDate checkoutDate = booking.getCheckedOutAt().toLocalDate();
                // Only include last 6 months
                java.time.Period period = java.time.Period.between(checkoutDate, now);
                int monthsDiff = period.getYears() * 12 + period.getMonths();
                
                if (monthsDiff >= 0 && monthsDiff < 6) {
                    String monthKey = checkoutDate.getYear() + "-" + String.format("%02d", checkoutDate.getMonthValue());
                    monthRevenueMap.merge(monthKey, 
                            booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO,
                            BigDecimal::add);
                }
            }
        }
        
        // Generate last 6 months with revenue
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate monthDate = now.minusMonths(i);
            String monthKey = monthDate.getYear() + "-" + String.format("%02d", monthDate.getMonthValue());
            String monthName = monthDate.getMonth().getDisplayName(
                    java.time.format.TextStyle.SHORT, 
                    java.util.Locale.forLanguageTag("vi-VN"));
            
                    MonthlyRevenue monthlyRevenue = new MonthlyRevenue();
            monthlyRevenue.setMonth(monthName);
            monthlyRevenue.setRevenue(monthRevenueMap.getOrDefault(monthKey, BigDecimal.ZERO));
            revenueByMonth.add(monthlyRevenue);
        }
        response.setRevenueByMonth(revenueByMonth);
        
        // Status distribution
        java.util.Map<String, Integer> statusDistribution = bookings.stream()
                .collect(Collectors.groupingBy(
                        Booking::getStatus,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        response.setStatusDistribution(statusDistribution);
        
        return response;
    }

    /**
     * Get earnings for a hotel or all hotels owned by a host
     * Optimized: Calculates earnings directly from filtered bookings
     * 
     * @param ownerId The host owner ID
     * @param hotelId Optional hotel ID filter (null = all hotels)
     * @param startDate Start date filter (required for date range)
     * @param endDate End date filter (required for date range)
     * @return EarningsResponse with pre-calculated metrics
     */
    public EarningsResponse getEarnings(Long ownerId, Long hotelId, LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;
        
        if (hotelId != null) {
            // Verify hotel ownership
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (!hotel.getOwnerId().equals(ownerId)) {
                throw new RuntimeException("You don't have permission to view earnings for this hotel");
            }
            
            // Get bookings for specific hotel with date filter
            if (startDate != null && endDate != null) {
                bookings = bookingRepository.findByHotelIdAndCheckInDateBetween(hotelId, startDate, endDate);
            } else {
                bookings = bookingRepository.findByHotelId(hotelId);
            }
        } else {
            // Get bookings for all hotels owned by the host
            bookings = bookingRepository.findByOwnerId(ownerId);
            
            // Apply date filter if provided
            if (startDate != null && endDate != null) {
                bookings = bookings.stream()
                        .filter(b -> {
                            LocalDate checkIn = b.getCheckInDate();
                            return checkIn != null && !checkIn.isBefore(startDate) && !checkIn.isAfter(endDate);
                        })
                        .collect(Collectors.toList());
            }
        }
        
        return calculateEarnings(bookings);
    }

    /**
     * Calculate earnings from bookings list
     */
    private EarningsResponse calculateEarnings(List<Booking> bookings) {
        EarningsResponse response = new EarningsResponse();
        
        // Filter only completed bookings
        List<Booking> completed = bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.toList());
        
        if (completed.isEmpty()) {
            response.setTotalEarnings(BigDecimal.ZERO);
            response.setCompletedCount(0);
            response.setAvgBookingValue(BigDecimal.ZERO);
            response.setEarningsByHotel(java.util.Map.of());
            response.setEarningsByMonth(List.of());
            response.setRecentTransactions(List.of());
            return response;
        }
        
        // Batch load rooms and hotels for earnings calculation
        List<Long> roomIds = completed.stream()
                .map(Booking::getRoomId)
                .distinct()
                .collect(Collectors.toList());
        List<com.verzol.stayhub.module.room.entity.Room> rooms = roomRepository.findAllById(roomIds);
        java.util.Map<Long, com.verzol.stayhub.module.room.entity.Room> roomMap = rooms.stream()
                .collect(Collectors.toMap(com.verzol.stayhub.module.room.entity.Room::getId, r -> r));
        
        List<Long> hotelIds = rooms.stream()
                .map(com.verzol.stayhub.module.room.entity.Room::getHotelId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        List<Hotel> hotels = hotelRepository.findAllById(hotelIds);
        java.util.Map<Long, Hotel> hotelMap = hotels.stream()
                .collect(Collectors.toMap(Hotel::getId, h -> h));
        
        // Calculate total earnings
        BigDecimal totalEarnings = completed.stream()
                .map(b -> b.getTotalPrice() != null ? b.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalEarnings(totalEarnings);
        response.setCompletedCount(completed.size());
        
        // Calculate average booking value
        BigDecimal avgBookingValue = !completed.isEmpty()
                ? totalEarnings.divide(BigDecimal.valueOf(completed.size()), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        response.setAvgBookingValue(avgBookingValue);
        
        // Group earnings by hotel
        java.util.Map<Long, BigDecimal> earningsByHotel = new java.util.HashMap<>();
        for (Booking booking : completed) {
            com.verzol.stayhub.module.room.entity.Room room = roomMap.get(booking.getRoomId());
            if (room != null && room.getHotelId() != null) {
                BigDecimal price = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
                earningsByHotel.merge(room.getHotelId(), price, BigDecimal::add);
            }
        }
        response.setEarningsByHotel(earningsByHotel);
        
        // Group earnings by month
        java.util.Map<String, BigDecimal> monthEarningsMap = new java.util.HashMap<>();
        for (Booking booking : completed) {
            if (booking.getCheckedOutAt() != null) {
                java.time.LocalDate checkoutDate = booking.getCheckedOutAt().toLocalDate();
                String monthKey = checkoutDate.getYear() + "-" + String.format("%02d", checkoutDate.getMonthValue());
                BigDecimal price = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
                monthEarningsMap.merge(monthKey, price, BigDecimal::add);
            }
        }
        
        // Convert to MonthlyEarnings list
        List<MonthlyEarnings> earningsByMonth = monthEarningsMap.entrySet().stream()
                .map(entry -> {
                    MonthlyEarnings monthlyEarnings = new MonthlyEarnings();
                    monthlyEarnings.setMonthKey(entry.getKey());
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    java.time.LocalDate monthDate = java.time.LocalDate.of(year, month, 1);
                    String monthName = monthDate.getMonth().getDisplayName(
                            java.time.format.TextStyle.FULL, 
                            java.util.Locale.forLanguageTag("vi-VN")) + ", " + year;
                    monthlyEarnings.setMonthName(monthName);
                    monthlyEarnings.setEarnings(entry.getValue());
                    return monthlyEarnings;
                })
                .sorted((a, b) -> {
                    if (a.getMonthKey() == null || b.getMonthKey() == null) return 0;
                    return a.getMonthKey().compareTo(b.getMonthKey());
                })
                .collect(Collectors.toList());
        response.setEarningsByMonth(earningsByMonth);
        
        // Recent transactions (last 10, sorted by checkout date descending)
        List<RecentTransaction> recentTransactions = completed.stream()
                .filter(b -> b.getCheckedOutAt() != null)
                .sorted((a, b) -> b.getCheckedOutAt().compareTo(a.getCheckedOutAt()))
                .limit(10)
                .map(booking -> {
                    RecentTransaction transaction = new RecentTransaction();
                    transaction.setBookingId(booking.getId());
                    
                    com.verzol.stayhub.module.room.entity.Room room = roomMap.get(booking.getRoomId());
                    if (room != null) {
                        Hotel hotel = hotelMap.get(room.getHotelId());
                        transaction.setHotelName(hotel != null ? hotel.getName() : "-");
                    } else {
                        transaction.setHotelName("-");
                    }
                    
                    transaction.setGuestName(booking.getGuestName() != null ? booking.getGuestName() : "N/A");
                    transaction.setCheckoutDate(booking.getCheckedOutAt().toLocalDate());
                    transaction.setAmount(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO);
                    return transaction;
                })
                .collect(Collectors.toList());
        response.setRecentTransactions(recentTransactions);
        
        return response;
    }
}
