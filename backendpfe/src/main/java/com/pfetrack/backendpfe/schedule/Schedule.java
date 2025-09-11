package com.pfetrack.backendpfe.schedule;

import com.pfetrack.backendpfe.topic.StudentTopic;
import com.pfetrack.backendpfe.user.Professor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ScheduleType type; // LECTURE, PFE_PRESENTATION, EXAM

    @Column(name = "date", nullable = false)
    private LocalDate date; // Specific calendar date

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    private String location;

    // Relation to student_topic: a schedule can be linked to a student_topic (e.g., presentation for a topic assignment)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_topic_id")
    private StudentTopic studentTopic; // optional

    // Professor responsible for this schedule entry
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private Professor professor; // optional association to professor table

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
