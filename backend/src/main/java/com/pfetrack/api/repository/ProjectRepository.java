package com.pfetrack.api.repository;

import com.pfetrack.api.model.Project;
import com.pfetrack.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByStudent(User student);
    
    Optional<Project> findByStudentAndStatus(User student, String status);
    
    List<Project> findByStatus(String status);
    
    List<Project> findByType(String type);
    
    List<Project> findByDepartment(String department);
    
    List<Project> findBySupervisor(String supervisor);
    
    List<Project> findByCurrentPhase(String currentPhase);
    
    @Query("SELECT p FROM Project p WHERE p.student = :student AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:currentPhase IS NULL OR p.currentPhase = :currentPhase)")
    List<Project> findProjectsWithFilters(@Param("student") User student,
                                         @Param("status") String status,
                                         @Param("type") String type,
                                         @Param("currentPhase") String currentPhase);
    
    @Query("SELECT p FROM Project p WHERE p.status = 'Active' AND p.expectedCompletionDate < :currentDate")
    List<Project> findOverdueProjects(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT p FROM Project p WHERE p.status = 'Active' AND p.expectedCompletionDate BETWEEN :startDate AND :endDate")
    List<Project> findProjectsDueSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT AVG(p.progressPercentage) FROM Project p WHERE p.status = 'Active'")
    Double getAverageProgressPercentage();
    
    @Query("SELECT AVG(p.progressPercentage) FROM Project p WHERE p.department = :department AND p.status = 'Active'")
    Double getAverageProgressByDepartment(@Param("department") String department);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.department = :department")
    Long countByDepartment(@Param("department") String department);
    
    @Query("SELECT p FROM Project p WHERE p.startDate BETWEEN :startDate AND :endDate")
    List<Project> findByStartDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Project p WHERE p.endDate BETWEEN :startDate AND :endDate")
    List<Project> findByEndDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Project p WHERE " +
           "p.title LIKE %:keyword% OR " +
           "p.description LIKE %:keyword% OR " +
           "p.supervisor LIKE %:keyword% OR " +
           "p.department LIKE %:keyword%")
    List<Project> searchProjects(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p.currentPhase FROM Project p WHERE p.status = 'Active' ORDER BY p.currentPhase")
    List<String> findAllActivePhases();
    
    @Query("SELECT DISTINCT p.department FROM Project p ORDER BY p.department")
    List<String> findAllDepartments();
    
    @Query("SELECT p FROM Project p WHERE p.student = :student AND p.status = 'Active'")
    Optional<Project> findActiveProjectByStudent(@Param("student") User student);
    
    @Query("SELECT p FROM Project p WHERE p.presentationDate = :date")
    List<Project> findByPresentationDate(@Param("date") LocalDate date);
    
    @Query("SELECT p FROM Project p WHERE p.finalGrade IS NOT NULL ORDER BY p.finalGrade DESC")
    List<Project> findCompletedProjectsOrderByGrade();
}