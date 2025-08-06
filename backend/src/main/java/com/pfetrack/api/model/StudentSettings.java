package com.pfetrack.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Notification Settings
    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "grade_notifications")
    private Boolean gradeNotifications = true;

    @Column(name = "deadline_reminders")
    private Boolean deadlineReminders = true;

    @Column(name = "meeting_reminders")
    private Boolean meetingReminders = true;

    @Column(name = "announcement_notifications")
    private Boolean announcementNotifications = true;

    @Column(name = "sms_notifications")
    private Boolean smsNotifications = false;

    @Column(name = "assignment_notifications")
    private Boolean assignmentNotifications = true;

    @Column(name = "event_notifications")
    private Boolean eventNotifications = true;

    // Privacy Settings
    @Column(name = "profile_visibility")
    private String profileVisibility = "public"; // "public", "private", "friends"

    @Column(name = "show_email")
    private Boolean showEmail = false;

    @Column(name = "show_phone")
    private Boolean showPhone = false;

    @Column(name = "allow_messages")
    private Boolean allowMessages = true;

    @Column(name = "show_online_status")
    private Boolean showOnlineStatus = true;

    // Appearance Settings
    @Column(name = "theme")
    private String theme = "system"; // "light", "dark", "system"

    @Column(name = "language")
    private String language = "en"; // "en", "fr", "ar"

    @Column(name = "font_size")
    private String fontSize = "medium"; // "small", "medium", "large"

    @Column(name = "compact_mode")
    private Boolean compactMode = false;

    @Column(name = "animations_enabled")
    private Boolean animationsEnabled = true;

    // Academic Settings
    @Column(name = "default_calendar_view")
    private String defaultCalendarView = "month"; // "month", "week", "day"

    @Column(name = "grade_display_format")
    private String gradeDisplayFormat = "percentage"; // "percentage", "letter", "points"

    @Column(name = "auto_save_reports")
    private Boolean autoSaveReports = true;

    @Column(name = "reminder_advance_days")
    private Integer reminderAdvanceDays = 3;

    // Dashboard Settings
    @Column(name = "dashboard_layout")
    private String dashboardLayout = "default"; // "default", "compact", "detailed"

    @Column(name = "show_recent_activities")
    private Boolean showRecentActivities = true;

    @Column(name = "show_upcoming_deadlines")
    private Boolean showUpcomingDeadlines = true;

    @Column(name = "show_grade_summary")
    private Boolean showGradeSummary = true;

    @Column(name = "show_weekends")
    private Boolean showWeekends = true;

    @Column(name = "auto_sync_calendar")
    private Boolean autoSyncCalendar = true;

    @Column(name = "show_upcoming_events")
    private Boolean showUpcomingEvents = true;

    @Column(name = "show_recent_grades")
    private Boolean showRecentGrades = true;

    @Column(name = "show_progress_charts")
    private Boolean showProgressCharts = true;

    @Column(name = "show_achievements")
    private Boolean showAchievements = true;

    @Column(name = "show_grades")
    private Boolean showGrades = true;

    @Column(name = "allow_messaging")
    private Boolean allowMessaging = true;

    @Column(name = "timezone")
    private String timezone = "UTC";

    @Column(name = "date_format")
    private String dateFormat = "MM/DD/YYYY";

    @Column(name = "time_format")
    private String timeFormat = "12-hour";

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
}