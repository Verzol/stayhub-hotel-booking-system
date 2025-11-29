package com.verzol.stayhub.module.booking.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.PriceCalculationResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.HostBookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationResponse;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.repository.BookingRepository;
import com.verzol.stayhub.module.booking.service.BookingStateMachine;
import com.verzol.stayhub.module.booking.service.RefundCalculationService;
import com.verzol.stayhub.module.promotion.entity.Promotion;
import com.verzol.stayhub.module.promotion.repository.PromotionRepository;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.repository.RoomRepository;
import com.verzol.stayhub.module.room.service.RoomService;
import com.verzol.stayhub.module.auth.service.EmailService;
import com.verzol.stayhub.module.user.repository.UserRepository;
import com.verzol.stayhub.module.hotel.entity.Hotel;

import org.springframework.beans.factory.annotation.Value;

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
    private final RefundCalculationService refundCalculationService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

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
                    .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

            if (promotion.getIsActive() && 
                LocalDateTime.now().isAfter(promotion.getStartDate()) && 
                LocalDateTime.now().isBefore(promotion.getEndDate())) {
                
                // Check max usage limit
                if (promotion.getMaxUsage() != null && promotion.getCurrentUsage() != null) {
                    if (promotion.getCurrentUsage() >= promotion.getMaxUsage()) {
                        throw new RuntimeException("Coupon code has reached maximum usage limit");
                    }
                }
                
                BigDecimal discount = originalPrice.multiply(BigDecimal.valueOf(promotion.getDiscountPercent()))
                        .divide(BigDecimal.valueOf(100));
                
                if (promotion.getMaxDiscountAmount() != null && discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                    discount = promotion.getMaxDiscountAmount();
                }
                
                discountAmount = discount;
                appliedCoupon = promotion.getCode();
            }
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
        // 1. Check room availability
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Check for overlapping bookings (excluding cancelled)
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
            request.getRoomId(), 
            request.getCheckInDate(), 
            request.getCheckOutDate()
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
        booking.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        
        // Set default cancellation policy (can be overridden by room/hotel settings in the future)
        booking.setCancellationPolicy("MODERATE");

        Booking savedBooking = bookingRepository.save(booking);

        // 3. Return Response
        BookingResponse response = new BookingResponse();
        response.setId(savedBooking.getId());
        response.setRoomId(savedBooking.getRoomId());
        response.setCheckInDate(savedBooking.getCheckInDate());
        response.setCheckOutDate(savedBooking.getCheckOutDate());
        response.setGuests(savedBooking.getGuests());
        response.setTotalPrice(savedBooking.getTotalPrice());
        response.setStatus(savedBooking.getStatus());
        response.setLockedUntil(savedBooking.getLockedUntil());
        
        return response;
    }

    @Transactional
    public void confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not pending");
        }

        // Reserve room dates
        try {
            roomService.reserveDates(booking.getRoomId(), bookingId, 
                booking.getCheckInDate(), booking.getCheckOutDate());
        } catch (Exception e) {
            throw new RuntimeException("Failed to reserve room: " + e.getMessage());
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
            booking.setStatus("CANCELLED");
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
        
        return bookings.stream()
                .map(this::mapToHostResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming bookings for a hotel
     */
    public List<HostBookingResponse> getUpcomingBookings(Long hotelId) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByHotelId(hotelId, LocalDate.now());
        return bookings.stream()
                .map(this::mapToHostResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending check-ins for a hotel
     */
    public List<HostBookingResponse> getPendingCheckIns(Long hotelId) {
        List<Booking> bookings = bookingRepository.findPendingCheckInsByHotelId(hotelId, LocalDate.now());
        return bookings.stream()
                .map(this::mapToHostResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending check-outs for a hotel
     */
    public List<HostBookingResponse> getPendingCheckOuts(Long hotelId) {
        List<Booking> bookings = bookingRepository.findPendingCheckOutsByHotelId(hotelId, LocalDate.now());
        return bookings.stream()
                .map(this::mapToHostResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map booking to HostBookingResponse
     */
    private HostBookingResponse mapToHostResponse(Booking booking) {
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
        
        // Populate Room and Hotel details
        roomRepository.findById(booking.getRoomId()).ifPresent(room -> {
            response.setRoomName(room.getName());
            response.setHotelId(room.getHotelId());
            
            if (room.getHotelId() != null) {
                hotelRepository.findById(room.getHotelId()).ifPresent(hotel -> {
                    response.setHotelName(hotel.getName());
                });
            }
        });
        
        return response;
    }
}
