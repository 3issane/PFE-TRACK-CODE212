package com.pfetrack.backendpfe.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findFirstByEmailAndCodeAndUsedFalseAndExpiresAtAfter(String email, String code, Instant now);
    void deleteByExpiresAtBefore(Instant now);
}
