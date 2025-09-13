package com.pfetrack.backendpfe.config;

import com.pfetrack.backendpfe.user.*;
import com.pfetrack.backendpfe.report.Report;
import com.pfetrack.backendpfe.report.ReportRepository;
import com.pfetrack.backendpfe.topic.Topic;
import com.pfetrack.backendpfe.topic.TopicRepository;
import com.pfetrack.backendpfe.topic.StudentTopic;
import com.pfetrack.backendpfe.topic.StudentTopicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(StudentRepository studentRepo,
                               AdminRepository adminRepo,
                               ProfessorRepository professorRepo,
                               TopicRepository topicRepo,
                               StudentTopicRepository studentTopicRepo,
                               ReportRepository reportRepo,
                               PasswordEncoder encoder) {
        return args -> {
            if (studentRepo.count() == 0) {
                studentRepo.save(Student.builder()
                        .firstName("Abdellah")
                        .lastName("Aissane")
                        .email("abdobyaiss004@gmail.com")
                        .password(encoder.encode("password"))
                        .build());
            }

            if (adminRepo.count() == 0) {
                adminRepo.save(Admin.builder()
                        .firstName("Adam")
                        .lastName("Admin")
                        .email("admin@example.com")
                        .password(encoder.encode("password"))
                        .build());
            }

            if (professorRepo.count() == 0) {
                professorRepo.save(Professor.builder()
                        .firstName("Paul")
                        .lastName("Professor")
                        .email("prof@example.com")
                        .password(encoder.encode("password"))
                        .build());
            }

        // Create a sample topic & assignment, then a sample report if none exist under new model
        if (reportRepo.count() == 0) {
        var student = studentRepo.findByEmail("student@example.com").orElse(null);
        var professor = professorRepo.findByEmail("prof@example.com").orElse(null);
        if (student != null && professor != null) {
            // Ensure at least one topic for professor
            Topic topic = topicRepo.findAll().stream().findFirst().orElseGet(() ->
                topicRepo.save(Topic.builder()
                    .title("Sample Topic")
                    .description("Sample seeded topic for initial data")
                    .creator(professor)
                    .build())
            );

            // Ensure student-topic assignment
            StudentTopic studentTopic = studentTopicRepo.findByStudent_Id(student.getId())
                .stream().findFirst().orElseGet(() ->
                    studentTopicRepo.save(StudentTopic.builder()
                        .student(student)
                        .topic(topic)
                        .build())
                );

            reportRepo.save(Report.builder()
                .title("Initial Proposal")
                .type("Proposal")
                .status("SUBMITTED")
                .fileName("initial_proposal.pdf")
                .size(1024L)
                .studentTopic(studentTopic)
                .feedback("Looks good. Add methodology section.")
                .build());
        }
        }
        };
    }
}
