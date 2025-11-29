package com.verzol.stayhub.module.payment.controller;

import com.verzol.stayhub.module.booking.service.BookingService;
import com.verzol.stayhub.module.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;

    @GetMapping("/create_url")
    public ResponseEntity<String> createPaymentUrl(@RequestParam Long bookingId) {
        var booking = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(paymentService.createPaymentUrl(bookingId, booking.getTotalPrice()));
    }

    @GetMapping("/ipn")
    public ResponseEntity<String> handleIpn(@RequestParam Map<String, String> params) {
        try {
            paymentService.processPaymentCallback(params);
            return ResponseEntity.ok("Payment processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment processing failed: " + e.getMessage());
        }
    }
}
