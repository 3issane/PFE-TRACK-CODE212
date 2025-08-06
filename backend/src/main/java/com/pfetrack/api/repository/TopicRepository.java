package com.pfetrack.api.repository;

import com.pfetrack.api.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    List<Topic> findByStatus(String status);
    
    List<Topic> findByDepartment(String department);
    
    List<Topic> findByType(String type);
    
    List<Topic> findBySupervisor(String supervisor);
    
    @Query("SELECT t FROM Topic t WHERE t.title LIKE %:keyword% OR t.description LIKE %:keyword% OR t.supervisor LIKE %:keyword%")
    List<Topic> findByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT t FROM Topic t WHERE t.status = 'Available' AND t.currentStudents < t.maxStudents")
    List<Topic> findAvailableTopics();
    
    @Query("SELECT t FROM Topic t WHERE " +
           "(:keyword IS NULL OR t.title LIKE %:keyword% OR t.description LIKE %:keyword% OR t.supervisor LIKE %:keyword%) AND " +
           "(:department IS NULL OR t.department = :department) AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:status IS NULL OR t.status = :status)")
    List<Topic> findTopicsWithFilters(@Param("keyword") String keyword,
                                     @Param("department") String department,
                                     @Param("type") String type,
                                     @Param("status") String status);
}