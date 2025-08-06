package com.pfetrack.api.repository;

import com.pfetrack.api.model.Project;
import com.pfetrack.api.model.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {
    
    List<ProjectMilestone> findByProject(Project project);
    
    List<ProjectMilestone> findByProjectId(Long projectId);
    
    List<ProjectMilestone> findByStatus(String status);
    
    List<ProjectMilestone> findByPriority(String priority);
    
    List<ProjectMilestone> findByProjectAndStatus(Project project, String status);
    
    List<ProjectMilestone> findByProjectOrderByOrderIndexAsc(Project project);
    
    List<ProjectMilestone> findByProjectOrderByDueDateAsc(Project project);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.project = :project AND " +
           "(:status IS NULL OR pm.status = :status) AND " +
           "(:priority IS NULL OR pm.priority = :priority)")
    List<ProjectMilestone> findMilestonesWithFilters(@Param("project") Project project,
                                                    @Param("status") String status,
                                                    @Param("priority") String priority);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.dueDate < :currentDate AND pm.status != 'Completed'")
    List<ProjectMilestone> findOverdueMilestones(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.dueDate BETWEEN :startDate AND :endDate")
    List<ProjectMilestone> findMilestonesDueSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.project.student.id = :studentId AND pm.dueDate BETWEEN :startDate AND :endDate")
    List<ProjectMilestone> findByStudentAndDateRange(@Param("studentId") Long studentId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);
    
    @Query("SELECT AVG(pm.progressPercentage) FROM ProjectMilestone pm WHERE pm.project = :project")
    Double getAverageProgressByProject(@Param("project") Project project);
    
    @Query("SELECT COUNT(pm) FROM ProjectMilestone pm WHERE pm.project = :project AND pm.status = 'Completed'")
    Long countCompletedMilestonesByProject(@Param("project") Project project);
    
    @Query("SELECT COUNT(pm) FROM ProjectMilestone pm WHERE pm.project = :project")
    Long countTotalMilestonesByProject(@Param("project") Project project);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.project = :project AND pm.status = 'In Progress'")
    List<ProjectMilestone> findInProgressMilestonesByProject(@Param("project") Project project);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.project = :project AND pm.status = 'Pending' ORDER BY pm.dueDate ASC")
    List<ProjectMilestone> findUpcomingMilestonesByProject(@Param("project") Project project);
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE " +
           "pm.title LIKE %:keyword% OR " +
           "pm.description LIKE %:keyword%")
    List<ProjectMilestone> searchMilestones(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT pm.status FROM ProjectMilestone pm ORDER BY pm.status")
    List<String> findAllStatuses();
    
    @Query("SELECT DISTINCT pm.priority FROM ProjectMilestone pm ORDER BY pm.priority")
    List<String> findAllPriorities();
    
    @Query("SELECT pm FROM ProjectMilestone pm WHERE pm.project.student.id = :studentId AND pm.status != 'Completed' ORDER BY pm.dueDate ASC")
    List<ProjectMilestone> findUpcomingMilestonesByStudent(@Param("studentId") Long studentId);
}