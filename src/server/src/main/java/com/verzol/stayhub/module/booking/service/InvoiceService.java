package com.verzol.stayhub.module.booking.service;

import org.springframework.stereotype.Service;

import com.verzol.stayhub.module.booking.entity.Booking;
import com.verzol.stayhub.module.hotel.entity.Hotel;
import com.verzol.stayhub.module.room.entity.Room;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * Service để generate invoice/confirmation document cho booking
 * Hiện tại generate HTML, có thể mở rộng sang PDF sau
 */
@Service
public class InvoiceService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Generate HTML invoice for booking
     */
    public String generateInvoiceHtml(Booking booking, Room room, Hotel hotel, String guestName) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='vi'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Hóa đơn đặt phòng #").append(booking.getId()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }");
        html.append(".header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }");
        html.append(".header h1 { color: #2563eb; margin: 0; }");
        html.append(".invoice-info { margin-bottom: 30px; }");
        html.append(".invoice-info p { margin: 5px 0; }");
        html.append(".details-section { margin: 30px 0; }");
        html.append(".details-section h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append("table th, table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }");
        html.append("table th { background-color: #f3f4f6; font-weight: bold; }");
        html.append(".total-row { font-weight: bold; font-size: 1.1em; background-color: #eff6ff; }");
        html.append(".footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>HÓA ĐƠN ĐẶT PHÒNG</h1>");
        html.append("<p style='color: #6b7280;'>StayHub - Hệ thống đặt phòng khách sạn</p>");
        html.append("</div>");
        
        // Invoice Info
        html.append("<div class='invoice-info'>");
        html.append("<p><strong>Mã đặt phòng:</strong> #").append(booking.getId()).append("</p>");
        html.append("<p><strong>Ngày đặt:</strong> ").append(
            booking.getCreatedAt() != null 
                ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "N/A"
        ).append("</p>");
        html.append("<p><strong>Trạng thái:</strong> ").append(getStatusText(booking.getStatus())).append("</p>");
        html.append("</div>");
        
        // Guest Information
        html.append("<div class='details-section'>");
        html.append("<h2>Thông tin khách hàng</h2>");
        html.append("<p><strong>Họ tên:</strong> ").append(guestName != null ? guestName : "N/A").append("</p>");
        if (booking.getGuestEmail() != null) {
            html.append("<p><strong>Email:</strong> ").append(booking.getGuestEmail()).append("</p>");
        }
        if (booking.getGuestPhone() != null) {
            html.append("<p><strong>Điện thoại:</strong> ").append(booking.getGuestPhone()).append("</p>");
        }
        html.append("</div>");
        
        // Booking Details
        html.append("<div class='details-section'>");
        html.append("<h2>Chi tiết đặt phòng</h2>");
        html.append("<p><strong>Khách sạn:</strong> ").append(hotel.getName()).append("</p>");
        html.append("<p><strong>Địa chỉ:</strong> ").append(hotel.getAddress()).append(", ").append(hotel.getCity()).append("</p>");
        html.append("<p><strong>Loại phòng:</strong> ").append(room.getName()).append("</p>");
        html.append("<p><strong>Số khách:</strong> ").append(booking.getGuests()).append(" người</p>");
        html.append("<p><strong>Ngày nhận phòng:</strong> ").append(booking.getCheckInDate().format(DATE_FORMATTER)).append("</p>");
        html.append("<p><strong>Ngày trả phòng:</strong> ").append(booking.getCheckOutDate().format(DATE_FORMATTER)).append("</p>");
        html.append("</div>");
        
        // Pricing Details
        html.append("<div class='details-section'>");
        html.append("<h2>Chi tiết thanh toán</h2>");
        html.append("<table>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Mô tả</th>");
        html.append("<th style='text-align: right;'>Số tiền</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        // Calculate nights
        long nights = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        BigDecimal pricePerNight = room.getBasePrice();
        BigDecimal subtotal = pricePerNight.multiply(BigDecimal.valueOf(nights));
        
        html.append("<tr>");
        html.append("<td>").append(room.getName()).append(" - ").append(nights).append(" đêm</td>");
        html.append("<td style='text-align: right;'>").append(formatVND(subtotal)).append("</td>");
        html.append("</tr>");
        
        if (booking.getCouponCode() != null && booking.getCouponCode().isEmpty() == false) {
            BigDecimal discount = subtotal.subtract(booking.getTotalPrice());
            html.append("<tr>");
            html.append("<td>Giảm giá (Mã: ").append(booking.getCouponCode()).append(")</td>");
            html.append("<td style='text-align: right; color: #dc2626;'>-").append(formatVND(discount)).append("</td>");
            html.append("</tr>");
        }
        
        html.append("<tr class='total-row'>");
        html.append("<td><strong>Tổng cộng</strong></td>");
        html.append("<td style='text-align: right;'><strong>").append(formatVND(booking.getTotalPrice())).append("</strong></td>");
        html.append("</tr>");
        
        html.append("</tbody>");
        html.append("</table>");
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Cảm ơn bạn đã sử dụng dịch vụ của StayHub!</p>");
        html.append("<p>Mọi thắc mắc vui lòng liên hệ: support@stayhub.com</p>");
        html.append("</div>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    private String getStatusText(String status) {
        if (status == null) return "N/A";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ thanh toán";
            case "CONFIRMED" -> "Đã xác nhận";
            case "CHECKED_IN" -> "Đã nhận phòng";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }

    private String formatVND(BigDecimal amount) {
        if (amount == null) return "0 VNĐ";
        return String.format("%,d VNĐ", amount.longValue());
    }
}
