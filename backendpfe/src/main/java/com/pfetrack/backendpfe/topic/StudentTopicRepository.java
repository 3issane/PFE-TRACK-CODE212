package com.pfetrack.backendpfe.topic;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentTopicRepository extends JpaRepository<StudentTopic, Long> {
	List<StudentTopic> findByTopicId(Long topicId);

	// Find all topic assignments for a student (we expect max 1 logically)
	List<StudentTopic> findByStudent_Id(Long studentId);

	boolean existsByStudent_Id(Long studentId);

	List<StudentTopic> findByStudent_Email(String email);
}
