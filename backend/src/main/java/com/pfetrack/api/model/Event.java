package com.pfetrack.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    @Size(max = 50)
    private String type; // "exam", "pfe", "meeting", "deadline", "presentation"

    @Size(max = 200)
    private String location;

    @Size(max = 20)
    private String status; // "scheduled", "upcoming", "completed", "cancelled"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "is_public")
    private Boolean isPublic = false; // Whether the event is visible to all students

    @Column(name = "created_by")
    private String createdBy; // "system", "admin", "student"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "scheduled";
        }
        if (isPublic == null) {
            isPublic = false;
        }
        if (reminderSent == null) {
            reminderSent = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isUpcoming() {
        LocalDateTime eventDateTime = LocalDateTime.of(eventDate, eventTime != null ? eventTime : LocalTime.MIDNIGHT);
        return eventDateTime.isAfter(LocalDateTime.now());
    }

    public boolean isToday() {
        return eventDate.equals(LocalDate.now());
    }

    public long getDaysUntil() {
        return LocalDate.now().until(eventDate).getDays();
    }
}