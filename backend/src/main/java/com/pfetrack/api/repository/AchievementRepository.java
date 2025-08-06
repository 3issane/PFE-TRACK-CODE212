package com.pfetrack.api.repository;

import com.pfetrack.api.model.Achievement;
import com.pfetrack.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    List<Achievement> findByStudent(User student);
    
    List<Achievement> findByStudentId(Long studentId);
    
    List<Achievement> findByType(String type);
    
    List<Achievement> findByCategory(String category);
    
    List<Achievement> findByStatus(String status);
    
    List<Achievement> findByStudentAndType(User student, String type);
    
    List<Achievement> findByStudentAndStatus(User student, String status);
    
    List<Achievement> findByStudentAndIsPublic(User student, Boolean isPublic);
    
    List<Achievement> findByStudentOrderByAchievementDateDesc(User student);
    
    List<Achievement> findByStudentAndTypeOrderByAchievementDateDesc(User student, String type);
    
    List<Achievement> findByStudentAndCategoryOrderByAchievementDateDesc(User student, String category);
    
    List<Achievement> findByTypeOrderByAchievementDateDesc(String type);
    
    List<Achievement> findByCategoryOrderByAchievementDateDesc(String category);
    
    @Query("SELECT a FROM Achievement a WHERE a.student = :student AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:isPublic IS NULL OR a.isPublic = :isPublic)")
    List<Achievement> findAchievementsWithFilters(@Param("student") User student,
                                                 @Param("type") String type,
                                                 @Param("status") String status,
                                                 @Param("category") String category,
                                                 @Param("isPublic") Boolean isPublic);
    
    @Query("SELECT a FROM Achievement a WHERE a.student = :student AND a.achievementDate >= :startDate ORDER BY a.achievementDate DESC")
    List<Achievement> findRecentAchievements(@Param("student") User student, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT a FROM Achievement a WHERE a.student = :student ORDER BY a.achievementDate DESC")
    List<Achievement> findRecentAchievementsByStudent(@Param("student") User student);
    
    @Query("SELECT a FROM Achievement a WHERE a.student = :student AND a.status = 'Verified' ORDER BY a.achievementDate DESC")
    List<Achievement> findVerifiedAchievementsByStudent(@Param("student") User student);
    
    @Query("SELECT SUM(a.pointsAwarded) FROM Achievement a WHERE a.student = :student AND a.status = 'Verified'")
    Integer getTotalPointsByStudent(@Param("student") User student);
    
    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.student = :student AND a.type = :type AND a.status = 'Verified'")
    Long countByStudentAndType(@Param("student") User student, @Param("type") String type);
    
    @Query("SELECT a FROM Achievement a WHERE a.achievementDate BETWEEN :startDate AND :endDate")
    List<Achievement> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Achievement a WHERE a.expiryDate IS NOT NULL AND a.expiryDate < :currentDate")
    List<Achievement> findExpiredAchievements(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT a FROM Achievement a WHERE " +
           "a.title LIKE %:keyword% OR " +
           "a.description LIKE %:keyword% OR " +
           "a.issuingOrganization LIKE %:keyword% OR " +
           "a.category LIKE %:keyword%")
    List<Achievement> searchAchievements(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT a.type FROM Achievement a ORDER BY a.type")
    List<String> findAllTypes();
    
    @Query("SELECT DISTINCT a.category FROM Achievement a ORDER BY a.category")
    List<String> findAllCategories();
    
    @Query("SELECT a FROM Achievement a WHERE a.isPublic = true AND a.status = 'Verified' ORDER BY a.achievementDate DESC")
    List<Achievement> findPublicAchievements();
}