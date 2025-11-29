package com.verzol.stayhub.module.payment.service;

import com.verzol.stayhub.module.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingService bookingService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public String createPaymentUrl(Long bookingId, BigDecimal amount) {
        // Mock Payment URL for now
        // In real implementation, this would call VNPay or Stripe API
        return frontendUrl + "/payment/success?bookingId=" + bookingId + "&amount=" + amount + "&status=SUCCESS";
    }

    public void processPaymentCallback(Map<String, String> params) {
        String status = params.get("status");
        if ("SUCCESS".equals(status)) {
            Long bookingId = Long.parseLong(params.get("bookingId"));
            bookingService.confirmBooking(bookingId);
        } else {
            throw new RuntimeException("Payment failed");
        }
    }
}
