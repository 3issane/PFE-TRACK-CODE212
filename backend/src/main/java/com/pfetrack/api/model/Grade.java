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
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @NotBlank
    @Size(max = 100)
    @Column(name = "subject_name")
    private String subjectName;

    @Size(max = 20)
    @Column(name = "subject_code")
    private String subjectCode;

    @Column(name = "grade_value")
    private Double gradeValue;

    @Size(max = 5)
    @Column(name = "letter_grade")
    private String letterGrade; // A+, A, B+, B, etc.

    @Column(name = "credits")
    private Integer credits;

    @Size(max = 20)
    private String semester;

    @Size(max = 10)
    @Column(name = "academic_year")
    private String academicYear;

    @Size(max = 50)
    @Column(name = "evaluation_type")
    private String evaluationType; // "Exam", "Project", "Assignment", "Final", "Midterm"

    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;

    @Column(name = "max_score")
    private Double maxScore;

    @Column(name = "obtained_score")
    private Double obtainedScore;

    @Size(max = 100)
    private String professor;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Size(max = 20)
    private String status; // "Final", "Provisional", "Under Review"

    @Column(name = "is_published")
    private Boolean isPublished = false;

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

    public double getPercentage() {
        if (maxScore == null || maxScore == 0) {
            return 0.0;
        }
        return (obtainedScore != null ? obtainedScore : 0) * 100.0 / maxScore;
    }

    public boolean isPassing() {
        return gradeValue != null && gradeValue >= 10.0; // Assuming 10/20 is passing
    }
}