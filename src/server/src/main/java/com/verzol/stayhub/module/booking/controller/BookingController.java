package com.verzol.stayhub.module.booking.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.BookingResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationRequest;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.CancellationResponse;
import com.verzol.stayhub.module.booking.dto.BookingDTOs.PriceCalculationResponse;
import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.booking.service.BookingService;
import com.verzol.stayhub.module.booking.service.InvoiceService;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.hotel.repository.HotelRepository;
import com.verzol.stayhub.module.room.entity.Room;
import com.verzol.stayhub.module.room.repository.RoomRepository;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    @PostMapping("/preview")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.calculatePrice(request));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Double check: Host cannot create bookings (only manage)
        if ("HOST".equalsIgnoreCase(user.getRole().name())) {
            throw new RuntimeException("Hosts cannot create bookings. They can only manage their properties.");
        }
        
        return ResponseEntity.ok(bookingService.createPendingBooking(request, user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        Booking booking = bookingService.getBooking(id);
        return ResponseEntity.ok(bookingService.mapToResponse(booking));
    }
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CUSTOMER')") // Only CUSTOMER can confirm bookings
    public ResponseEntity<Void> confirmBooking(@PathVariable Long id) {
        bookingService.confirmBooking(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Double check: Host cannot view guest bookings
        if ("HOST".equalsIgnoreCase(user.getRole().name())) {
            throw new RuntimeException("Hosts cannot view guest bookings. Please use the Host Dashboard to manage your property bookings.");
        }
        
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    /**
     * Cancel booking - Guest can cancel their own booking
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CancellationResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancellationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Double check: Host cannot cancel guest bookings from this endpoint
        if ("HOST".equalsIgnoreCase(user.getRole().name())) {
            throw new RuntimeException("Hosts cannot cancel bookings from here. Please use the Host Dashboard to manage bookings.");
        }
        
        if (request == null) {
            request = new CancellationRequest();
        }
        
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId(), request));
    }

    /**
     * Download invoice/confirmation as HTML
     * GET /api/bookings/{id}/invoice
     */
    @GetMapping("/{id}/invoice")
    public ResponseEntity<String> downloadInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Booking booking = bookingService.getBooking(id);
        
        // Verify ownership
        if (!booking.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only view invoices for your own bookings");
        }
        
        Room room = roomRepository.findById(booking.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        String guestName = booking.getGuestName() != null && !booking.getGuestName().isEmpty()
                ? booking.getGuestName()
                : user.getFullName();
        
        String invoiceHtml = invoiceService.generateInvoiceHtml(booking, room, hotel, guestName);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.setContentDispositionFormData("attachment", "invoice_" + booking.getId() + ".html");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(invoiceHtml);
    }
}
