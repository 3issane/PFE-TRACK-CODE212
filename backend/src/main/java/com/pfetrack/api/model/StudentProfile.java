package com.pfetrack.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 20)
    @Column(name = "student_id")
    private String studentId;

    @Size(max = 100)
    private String department;

    @Size(max = 50)
    @Column(name = "academic_year")
    private String academicYear;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Column(name = "expected_graduation")
    private LocalDate expectedGraduation;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "credits_completed")
    private Integer creditsCompleted;

    @Column(name = "total_credits_required")
    private Integer totalCreditsRequired;

    @Size(max = 20)
    private String phone;

    @Size(max = 200)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Size(max = 500)
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Size(max = 100)
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Size(max = 20)
    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

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

    public double getProgressPercentage() {
        if (totalCreditsRequired == null || totalCreditsRequired == 0) {
            return 0.0;
        }
        return (creditsCompleted != null ? creditsCompleted : 0) * 100.0 / totalCreditsRequired;
    }
}