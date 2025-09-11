package com.pfetrack.backendpfe.report;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
	// via studentTopic.student.email
	List<Report> findByStudentTopic_Student_Email(String email);
	// via studentTopic.topic.creator.email (supervisor)
	List<Report> findByStudentTopic_Topic_Creator_Email(String email);
}
