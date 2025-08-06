package com.pfetrack.api.repository;

import com.pfetrack.api.model.TopicApplication;
import com.pfetrack.api.model.User;
import com.pfetrack.api.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicApplicationRepository extends JpaRepository<TopicApplication, Long> {
    
    List<TopicApplication> findByStudent(User student);
    
    List<TopicApplication> findByTopic(Topic topic);
    
    List<TopicApplication> findByStatus(String status);
    
    List<TopicApplication> findByStudentAndStatus(User student, String status);
    
    List<TopicApplication> findByTopicAndStatus(Topic topic, String status);
    
    Optional<TopicApplication> findByStudentAndTopic(User student, Topic topic);
    
    boolean existsByStudentAndTopic(User student, Topic topic);
    
    long countByTopicAndStatus(Topic topic, String status);
}