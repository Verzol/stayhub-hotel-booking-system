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
}
