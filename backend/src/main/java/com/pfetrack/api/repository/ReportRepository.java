package com.pfetrack.api.repository;

import com.pfetrack.api.model.Report;
import com.pfetrack.api.model.User;
import com.pfetrack.api.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByStudent(User student);
    
    List<Report> findByTopic(Topic topic);
    
    List<Report> findByStatus(String status);
    
    List<Report> findByType(String type);
    
    List<Report> findByStudentAndStatus(User student, String status);
    
    List<Report> findByStudentAndType(User student, String type);
    
    @Query("SELECT r FROM Report r WHERE r.student = :student AND " +
           "(:keyword IS NULL OR r.title LIKE %:keyword% OR r.description LIKE %:keyword%) AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Report> findReportsWithFilters(@Param("student") User student,
                                       @Param("keyword") String keyword,
                                       @Param("type") String type,
                                       @Param("status") String status);
    
    @Query("SELECT r FROM Report r WHERE " +
           "(:keyword IS NULL OR r.title LIKE %:keyword% OR r.description LIKE %:keyword%) AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Report> findAllReportsWithFilters(@Param("keyword") String keyword,
                                          @Param("type") String type,
                                          @Param("status") String status);
}