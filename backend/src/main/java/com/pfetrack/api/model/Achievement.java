package com.pfetrack.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 50)
    private String type; // "Academic", "Research", "Competition", "Publication", "Award", "Certification"

    @Size(max = 100)
    @Column(name = "issuing_organization")
    private String issuingOrganization;

    @Column(name = "achievement_date")
    private LocalDate achievementDate;

    @Size(max = 500)
    @Column(name = "certificate_url")
    private String certificateUrl;

    @Size(max = 500)
    @Column(name = "verification_url")
    private String verificationUrl;

    @Size(max = 20)
    private String status; // "Verified", "Pending", "Rejected"

    @Column(name = "points_awarded")
    private Integer pointsAwarded;

    @Size(max = 20)
    private String category; // "Dean's List", "Honor Roll", "Research", "Leadership", etc.

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "additional_details", columnDefinition = "TEXT")
    private String additionalDetails;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    public boolean isRecent() {
        return achievementDate != null && achievementDate.isAfter(LocalDate.now().minusMonths(6));
    }
}