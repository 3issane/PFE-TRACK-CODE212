package com.pfetrack.api.controller;

import com.pfetrack.api.model.StudentSettings;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.StudentSettingsRepository;
import com.pfetrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student-settings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentSettingsController {

    @Autowired
    private StudentSettingsRepository studentSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentSettings>> getAllSettings() {
        try {
            List<StudentSettings> settings = studentSettingsRepository.findAll();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-settings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentSettings> getMySettings(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<StudentSettings> settingsOpt = studentSettingsRepository.findByUser(userOpt.get());
            
            if (settingsOpt.isPresent()) {
                return ResponseEntity.ok(settingsOpt.get());
            } else {
                // Create default settings if none exist
                StudentSettings defaultSettings = createDefaultSettings(userOpt.get());
                StudentSettings savedSettings = studentSettingsRepository.save(defaultSettings);
                return ResponseEntity.ok(savedSettings);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentSettings> createSettings(@RequestBody StudentSettings settings, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            
            // Check if settings already exist
            Optional<StudentSettings> existingSettings = studentSettingsRepository.findByUser(user);
            if (existingSettings.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            settings.setUser(user);
            StudentSettings savedSettings = studentSettingsRepository.save(settings);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSettings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/my-settings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentSettings> updateMySettings(@RequestBody StudentSettings settingsDetails, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<StudentSettings> settingsOpt = studentSettingsRepository.findByUser(userOpt.get());
            
            StudentSettings settings;
            if (settingsOpt.isPresent()) {
                settings = settingsOpt.get();
            } else {
                // Create new settings if none exist
                settings = createDefaultSettings(userOpt.get());
            }
            
            // Update notification settings
            if (settingsDetails.getEmailNotifications() != null) settings.setEmailNotifications(settingsDetails.getEmailNotifications());
            if (settingsDetails.getPushNotifications() != null) settings.setPushNotifications(settingsDetails.getPushNotifications());
            if (settingsDetails.getSmsNotifications() != null) settings.setSmsNotifications(settingsDetails.getSmsNotifications());
            if (settingsDetails.getGradeNotifications() != null) settings.setGradeNotifications(settingsDetails.getGradeNotifications());
            if (settingsDetails.getAssignmentNotifications() != null) settings.setAssignmentNotifications(settingsDetails.getAssignmentNotifications());
            if (settingsDetails.getEventNotifications() != null) settings.setEventNotifications(settingsDetails.getEventNotifications());
            if (settingsDetails.getAnnouncementNotifications() != null) settings.setAnnouncementNotifications(settingsDetails.getAnnouncementNotifications());
            
            // Update privacy settings
            if (settingsDetails.getProfileVisibility() != null) settings.setProfileVisibility(settingsDetails.getProfileVisibility());
            if (settingsDetails.getShowEmail() != null) settings.setShowEmail(settingsDetails.getShowEmail());
            if (settingsDetails.getShowPhone() != null) settings.setShowPhone(settingsDetails.getShowPhone());
            if (settingsDetails.getShowGrades() != null) settings.setShowGrades(settingsDetails.getShowGrades());
            if (settingsDetails.getAllowMessaging() != null) settings.setAllowMessaging(settingsDetails.getAllowMessaging());
            
            // Update appearance settings
            if (settingsDetails.getTheme() != null) settings.setTheme(settingsDetails.getTheme());
            if (settingsDetails.getLanguage() != null) settings.setLanguage(settingsDetails.getLanguage());
            if (settingsDetails.getTimezone() != null) settings.setTimezone(settingsDetails.getTimezone());
            if (settingsDetails.getDateFormat() != null) settings.setDateFormat(settingsDetails.getDateFormat());
            if (settingsDetails.getTimeFormat() != null) settings.setTimeFormat(settingsDetails.getTimeFormat());
            
            // Update academic settings
            if (settingsDetails.getDefaultCalendarView() != null) settings.setDefaultCalendarView(settingsDetails.getDefaultCalendarView());
            if (settingsDetails.getShowWeekends() != null) settings.setShowWeekends(settingsDetails.getShowWeekends());
            if (settingsDetails.getAutoSyncCalendar() != null) settings.setAutoSyncCalendar(settingsDetails.getAutoSyncCalendar());
            if (settingsDetails.getGradeDisplayFormat() != null) settings.setGradeDisplayFormat(settingsDetails.getGradeDisplayFormat());
            
            // Update dashboard settings
            if (settingsDetails.getShowUpcomingEvents() != null) settings.setShowUpcomingEvents(settingsDetails.getShowUpcomingEvents());
            if (settingsDetails.getShowRecentGrades() != null) settings.setShowRecentGrades(settingsDetails.getShowRecentGrades());
            if (settingsDetails.getShowProgressCharts() != null) settings.setShowProgressCharts(settingsDetails.getShowProgressCharts());
            if (settingsDetails.getShowAchievements() != null) settings.setShowAchievements(settingsDetails.getShowAchievements());
            if (settingsDetails.getDashboardLayout() != null) settings.setDashboardLayout(settingsDetails.getDashboardLayout());
            
            StudentSettings updatedSettings = studentSettingsRepository.save(settings);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/my-settings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteMySettings(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<StudentSettings> settingsOpt = studentSettingsRepository.findByUser(userOpt.get());
            
            if (settingsOpt.isPresent()) {
                studentSettingsRepository.delete(settingsOpt.get());
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/my-settings/reset")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentSettings> resetToDefaults(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Delete existing settings
            Optional<StudentSettings> existingSettings = studentSettingsRepository.findByUser(user);
            if (existingSettings.isPresent()) {
                studentSettingsRepository.delete(existingSettings.get());
            }
            
            // Create new default settings
            StudentSettings defaultSettings = createDefaultSettings(user);
            StudentSettings savedSettings = studentSettingsRepository.save(defaultSettings);
            
            return ResponseEntity.ok(savedSettings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/theme/{theme}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentSettings>> getSettingsByTheme(@PathVariable String theme) {
        try {
            List<StudentSettings> settings = studentSettingsRepository.findByTheme(theme);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/language/{language}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentSettings>> getSettingsByLanguage(@PathVariable String language) {
        try {
            List<StudentSettings> settings = studentSettingsRepository.findByLanguage(language);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private StudentSettings createDefaultSettings(User user) {
        StudentSettings settings = new StudentSettings();
        settings.setUser(user);
        
        // Default notification settings
        settings.setEmailNotifications(true);
        settings.setPushNotifications(true);
        settings.setSmsNotifications(false);
        settings.setGradeNotifications(true);
        settings.setAssignmentNotifications(true);
        settings.setEventNotifications(true);
        settings.setAnnouncementNotifications(true);
        
        // Default privacy settings
        settings.setProfileVisibility("Public");
        settings.setShowEmail(false);
        settings.setShowPhone(false);
        settings.setShowGrades(false);
        settings.setAllowMessaging(true);
        
        // Default appearance settings
        settings.setTheme("Light");
        settings.setLanguage("English");
        settings.setTimezone("UTC");
        settings.setDateFormat("MM/DD/YYYY");
        settings.setTimeFormat("12-hour");
        
        // Default academic settings
        settings.setDefaultCalendarView("Month");
        settings.setShowWeekends(true);
        settings.setAutoSyncCalendar(true);
        settings.setGradeDisplayFormat("Letter");
        
        // Default dashboard settings
        settings.setShowUpcomingEvents(true);
        settings.setShowRecentGrades(true);
        settings.setShowProgressCharts(true);
        settings.setShowAchievements(true);
        settings.setDashboardLayout("Grid");
        
        return settings;
    }
}