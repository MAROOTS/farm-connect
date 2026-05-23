
package com.agriconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Async
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your AgriConnect Login Code");
            helper.setText(buildEmailBody(fullName, otp), true);

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailBody(String fullName, String otp) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #2e7d32;">AgriConnect</h2>
                    <p>Hello <strong>%s</strong>,</p>
                    <p>Use the code below to log in to your AgriConnect account.
                       This code expires in <strong>5 minutes</strong>.</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #1b5e20; text-align: center; padding: 20px 0;">
                        %s
                    </div>
                    <p style="color: #888; font-size: 13px;">
                        If you did not request this, please ignore this email.
                    </p>
                </div>
                """.formatted(fullName, otp);
    }
}