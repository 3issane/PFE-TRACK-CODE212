package com.pfetrack.api.repository;

import com.pfetrack.api.model.StudentSettings;
import com.pfetrack.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSettingsRepository extends JpaRepository<StudentSettings, Long> {
    
    Optional<StudentSettings> findByUser(User user);
    
    Optional<StudentSettings> findByUserId(Long userId);
    
    List<StudentSettings> findByTheme(String theme);
    
    List<StudentSettings> findByLanguage(String language);
    
    @Query("SELECT ss FROM StudentSettings ss WHERE ss.emailNotifications = true")
    List<StudentSettings> findUsersWithEmailNotificationsEnabled();
    
    @Query("SELECT ss FROM StudentSettings ss WHERE ss.pushNotifications = true")
    List<StudentSettings> findUsersWithPushNotificationsEnabled();
    
    @Query("SELECT ss FROM StudentSettings ss WHERE ss.gradeNotifications = true")
    List<StudentSettings> findUsersWithGradeNotificationsEnabled();
    
    @Query("SELECT ss FROM StudentSettings ss WHERE ss.deadlineReminders = true")
    List<StudentSettings> findUsersWithDeadlineRemindersEnabled();
    
    @Query("SELECT COUNT(ss) FROM StudentSettings ss WHERE ss.theme = :theme")
    Long countByTheme(@Param("theme") String theme);
    
    @Query("SELECT COUNT(ss) FROM StudentSettings ss WHERE ss.language = :language")
    Long countByLanguage(@Param("language") String language);
    
    @Query("SELECT ss FROM StudentSettings ss WHERE " +
           "(:theme IS NULL OR ss.theme = :theme) AND " +
           "(:language IS NULL OR ss.language = :language) AND " +
           "(:emailNotifications IS NULL OR ss.emailNotifications = :emailNotifications)")
    List<StudentSettings> findSettingsWithFilters(@Param("theme") String theme,
                                                 @Param("language") String language,
                                                 @Param("emailNotifications") Boolean emailNotifications);
}