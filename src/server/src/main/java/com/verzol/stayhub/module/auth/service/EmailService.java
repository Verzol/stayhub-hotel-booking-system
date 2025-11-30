package com.verzol.stayhub.module.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String content) {
        // Log email for development/testing purposes
        logger.info("========== EMAIL SENDING ==========");
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Content: {}", content);
        logger.info("===================================");

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(content, true); // true indicates HTML
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("noreply@stayhub.com"); // You might want to make this configurable
            
            try {
                mailSender.send(mimeMessage);
            } catch (Exception e) {
                logger.warn("WARNING: Could not send actual email. Check application.properties settings. {}", e.getMessage());
                // Do not throw exception here to allow dev testing via console logs
            }
        } catch (MessagingException e) {
            throw new IllegalStateException("Failed to create email message", e);
        }
    }

    @Async
    public void sendOtpEmail(String to, String subject, String otp) {
        String actionType = subject.toLowerCase().contains("reset") ? "reset your password" : "verify your account";
        
        String content = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>StayHub OTP</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); padding: 30px 20px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
                    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
                    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
                    .message { margin-bottom: 25px; color: #4b5563; }
                    .otp-box { background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-label { font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
                    .otp-code { font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 6px; margin: 0; font-family: 'Courier New', monospace; }
                    .expiry { font-size: 13px; color: #ef4444; margin-top: 10px; font-weight: 500; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                    .footer p { margin: 5px 0; }
                    .social-links { margin-top: 10px; }
                    .social-links a { color: #2563eb; text-decoration: none; margin: 0 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>StayHub</h1>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello,</div>
                        <p class="message">We received a request to <strong>%s</strong>. Please use the verification code below to complete this process:</p>
                        
                        <div class="otp-box">
                            <div class="otp-label">Your Verification Code</div>
                            <div class="otp-code">%s</div>
                            <div class="expiry">Valid for 15 minutes</div>
                        </div>
                        
                        <p class="message">If you did not request this code, please ignore this email. Your account remains secure.</p>
                        <br>
                        <p style="margin: 0; color: #4b5563;">Best regards,<br><strong style="color: #111827;">The StayHub Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 StayHub Inc. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """, actionType, otp);
            
        sendEmail(to, subject, content);
    }

    @Async
    public void sendInvoiceEmail(String to, String guestName, String bookingId, 
                                 String hotelName, String roomName, 
                                 String checkIn, String checkOut, 
                                 Integer guests, String totalPrice, 
                                 String couponCode, String frontendUrl) {
        String discountText = couponCode != null && !couponCode.isEmpty() 
            ? String.format("""
                <tr>
                    <td style="padding: 10px 0; color: #059669; font-weight: 600;">Giảm giá (%s)</td>
                    <td style="padding: 10px 0; text-align: right; color: #059669; font-weight: 600;">Đã áp dụng</td>
                </tr>
                """, couponCode)
            : "";

        String content = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Hóa đơn đặt phòng - StayHub</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); padding: 30px 20px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
                    .header .subtitle { color: #ffffff; opacity: 0.9; margin-top: 5px; font-size: 14px; }
                    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
                    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
                    .booking-info { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; }
                    .booking-info h2 { margin: 0 0 15px 0; font-size: 20px; color: #111827; }
                    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-row:last-child { border-bottom: none; }
                    .info-label { color: #6b7280; font-size: 14px; }
                    .info-value { color: #111827; font-weight: 600; font-size: 14px; }
                    .invoice-table { width: 100%%; border-collapse: collapse; margin: 25px 0; }
                    .invoice-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
                    .invoice-table td:last-child { text-align: right; }
                    .total-row { border-top: 2px solid #111827; border-bottom: 2px solid #111827; font-weight: 800; font-size: 18px; }
                    .total-row td { padding: 15px 0; color: #111827; }
                    .button-container { text-align: center; margin: 30px 0; }
                    .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5); letter-spacing: 0.5px; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                    .footer p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>StayHub</h1>
                        <div class="subtitle">Hóa đơn xác nhận đặt phòng</div>
                    </div>
                    <div class="content">
                        <div class="greeting">Xin chào %s,</div>
                        <p style="margin-bottom: 20px; color: #4b5563;">Cảm ơn bạn đã đặt phòng qua StayHub! Đặt phòng của bạn đã được xác nhận và thanh toán thành công.</p>
                        
                        <div class="booking-info">
                            <h2>Thông tin đặt phòng</h2>
                            <div class="info-row">
                                <span class="info-label">Mã đặt phòng:</span>
                                <span class="info-value">#%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Khách sạn:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Nhận phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Trả phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Số khách:</span>
                                <span class="info-value">%d khách</span>
                            </div>
                        </div>

                        <table class="invoice-table">
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Tổng tiền phòng</td>
                                <td style="padding: 10px 0; text-align: right; color: #111827; font-weight: 600;">%s</td>
                            </tr>
                            %s
                            <tr class="total-row">
                                <td>Tổng cộng</td>
                                <td>%s</td>
                            </tr>
                        </table>

                        <div class="button-container">
                            <a href="%s/booking/%s" class="button">Xem chi tiết đặt phòng</a>
                        </div>

                        <p style="margin-top: 30px; color: #4b5563; font-size: 14px;">
                            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.
                        </p>
                        <br>
                        <p style="margin: 0; color: #4b5563;">Trân trọng,<br><strong style="color: #111827;">Đội ngũ StayHub</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 StayHub Inc. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            guestName, bookingId, hotelName, roomName, checkIn, checkOut, guests, 
            totalPrice, discountText, totalPrice, frontendUrl, bookingId);
        
        sendEmail(to, "Hóa đơn xác nhận đặt phòng #" + bookingId, content);
    }
}
