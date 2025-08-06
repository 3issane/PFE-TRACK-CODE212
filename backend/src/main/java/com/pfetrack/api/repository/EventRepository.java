package com.pfetrack.api.repository;

import com.pfetrack.api.model.Event;
import com.pfetrack.api.model.User;
import com.pfetrack.api.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByStudent(User student);
    
    List<Event> findByTopic(Topic topic);
    
    List<Event> findByType(String type);
    
    List<Event> findByStatus(String status);
    
    List<Event> findByEventDate(LocalDate eventDate);
    
    List<Event> findByStudentAndType(User student, String type);
    
    List<Event> findByStudentAndStatus(User student, String status);
    
    List<Event> findByStudentAndEventDate(User student, LocalDate eventDate);
    
    @Query("SELECT e FROM Event e WHERE e.student = :student AND e.eventDate >= :startDate AND e.eventDate <= :endDate")
    List<Event> findByStudentAndDateRange(@Param("student") User student, 
                                         @Param("startDate") LocalDate startDate, 
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM Event e WHERE (e.student = :student OR e.isPublic = true) AND e.eventDate >= :startDate AND e.eventDate <= :endDate")
    List<Event> findByStudentOrPublicAndDateRange(@Param("student") User student, 
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM Event e WHERE (e.student = :student OR e.isPublic = true) AND e.eventDate >= CURRENT_DATE ORDER BY e.eventDate ASC, e.eventTime ASC")
    List<Event> findUpcomingEventsByStudentOrPublic(@Param("student") User student);
    
    @Query("SELECT e FROM Event e WHERE e.student = :student AND e.eventDate >= CURRENT_DATE ORDER BY e.eventDate ASC, e.eventTime ASC")
    List<Event> findUpcomingEventsByStudent(@Param("student") User student);
    
    @Query("SELECT e FROM Event e WHERE (e.student = :student OR e.isPublic = true) AND " +
           "(:type IS NULL OR e.type = :type) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "e.eventDate >= :startDate AND e.eventDate <= :endDate " +
           "ORDER BY e.eventDate ASC, e.eventTime ASC")
    List<Event> findEventsWithFilters(@Param("student") User student,
                                     @Param("type") String type,
                                     @Param("status") String status,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND e.eventDate >= CURRENT_DATE ORDER BY e.eventDate ASC, e.eventTime ASC")
    List<Event> findPublicUpcomingEvents();
    
    @Query("SELECT e FROM Event e WHERE e.eventDate = CURRENT_DATE AND e.reminderSent = false")
    List<Event> findTodayEventsWithoutReminder();
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.student = :student AND e.type = :type AND e.eventDate >= CURRENT_DATE")
    long countUpcomingEventsByStudentAndType(@Param("student") User student, @Param("type") String type);
}