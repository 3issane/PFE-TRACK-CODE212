package com.pfetrack.api.repository;

import com.pfetrack.api.model.StudentProfile;
import com.pfetrack.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    
    Optional<StudentProfile> findByUser(User user);
    
    Optional<StudentProfile> findByUserId(Long userId);
    
    Optional<StudentProfile> findByStudentId(String studentId);
    
    List<StudentProfile> findByDepartment(String department);
    
    List<StudentProfile> findByAcademicYear(String academicYear);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE sp.gpa >= :minGpa")
    List<StudentProfile> findByGpaGreaterThanEqual(@Param("minGpa") Double minGpa);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE sp.creditsCompleted >= :minCredits")
    List<StudentProfile> findByCreditsCompletedGreaterThanEqual(@Param("minCredits") Integer minCredits);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE " +
           "(:department IS NULL OR sp.department = :department) AND " +
           "(:academicYear IS NULL OR sp.academicYear = :academicYear) AND " +
           "(:minGpa IS NULL OR sp.gpa >= :minGpa)")
    List<StudentProfile> findProfilesWithFilters(@Param("department") String department,
                                                @Param("academicYear") String academicYear,
                                                @Param("minGpa") Double minGpa);
    
    @Query("SELECT AVG(sp.gpa) FROM StudentProfile sp WHERE sp.department = :department")
    Double getAverageGpaByDepartment(@Param("department") String department);
    
    @Query("SELECT COUNT(sp) FROM StudentProfile sp WHERE sp.department = :department")
    Long countByDepartment(@Param("department") String department);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE " +
           "sp.user.firstName LIKE %:keyword% OR " +
           "sp.user.lastName LIKE %:keyword% OR " +
           "sp.studentId LIKE %:keyword% OR " +
           "sp.department LIKE %:keyword%")
    List<StudentProfile> searchProfiles(@Param("keyword") String keyword);
}