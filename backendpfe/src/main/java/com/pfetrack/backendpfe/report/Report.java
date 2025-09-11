package com.pfetrack.backendpfe.report;

import com.pfetrack.backendpfe.topic.StudentTopic;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String type;

    @CreationTimestamp
    @Column(name = "submission_date", nullable = false, updatable = false)
    private Instant submissionDate;

    private String status; // e.g., SUBMITTED, PENDING_REVIEW, APPROVED, REJECTED

    private Double grade; // optional

    private Long size; // bytes

    @Column(length = 4000)
    private String feedback;

    // Link to the student_topic assignment (which itself links to student and topic/professor)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_topic_id", nullable = false)
    private StudentTopic studentTopic;

    private String fileName;
}
