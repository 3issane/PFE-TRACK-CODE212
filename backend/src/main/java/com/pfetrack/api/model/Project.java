package com.pfetrack.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    private String supervisor;

    @Size(max = 100)
    @Column(name = "co_supervisor")
    private String coSupervisor;

    @Size(max = 100)
    private String department;

    @Size(max = 50)
    private String type; // "PFE", "Stage", "Research", "Development"

    @Size(max = 20)
    private String status; // "Active", "Completed", "Suspended", "Cancelled"

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;

    @Column(name = "current_phase")
    @Size(max = 100)
    private String currentPhase; // "Planning", "Development", "Testing", "Documentation", "Presentation"

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(columnDefinition = "TEXT")
    private String methodology;

    @Column(name = "expected_outcomes", columnDefinition = "TEXT")
    private String expectedOutcomes;

    @Column(name = "current_challenges", columnDefinition = "TEXT")
    private String currentChallenges;

    @Column(name = "next_steps", columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "final_grade")
    private Double finalGrade;

    @Column(name = "supervisor_feedback", columnDefinition = "TEXT")
    private String supervisorFeedback;

    @Column(name = "presentation_date")
    private LocalDate presentationDate;

    @Size(max = 500)
    @Column(name = "repository_url")
    private String repositoryUrl;

    @Size(max = 500)
    @Column(name = "documentation_url")
    private String documentationUrl;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProjectMilestone> milestones = new ArrayList<>();

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

    public boolean isActive() {
        return "Active".equals(status);
    }

    public boolean isOverdue() {
        return expectedCompletionDate != null && expectedCompletionDate.isBefore(LocalDate.now()) && !"Completed".equals(status);
    }

    public long getDaysRemaining() {
        if (expectedCompletionDate == null) {
            return 0;
        }
        return LocalDate.now().until(expectedCompletionDate).getDays();
    }
}