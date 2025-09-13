package com.pfetrack.backendpfe.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String defaultFrom;

    public void sendPasswordCode(String to, String code) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            if (defaultFrom != null && !defaultFrom.isBlank()) msg.setFrom(defaultFrom);
            msg.setSubject("Password Reset Code");
            msg.setText("Your password reset code is: " + code + "\nIt expires in 10 minutes." );
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send password code email to {}", to, e);
        }
    }
}
