package com.pfetrack.api.config;

import com.pfetrack.api.model.*;
import com.pfetrack.api.repository.*;
import com.pfetrack.api.model.Event;
import com.pfetrack.api.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        if (roleRepository.count() == 0) {
            Role studentRole = new Role(ERole.ROLE_STUDENT);
            Role adminRole = new Role(ERole.ROLE_ADMIN);
            Role supervisorRole = new Role(ERole.ROLE_SUPERVISOR);

            roleRepository.save(studentRole);
            roleRepository.save(adminRole);
            roleRepository.save(supervisorRole);
        }

        // Initialize admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setUsername("admin");
            admin.setEmail("admin@pfetrack.com");
            admin.setPassword(passwordEncoder.encode("admin123"));

            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow());
            admin.setRoles(adminRoles);

            userRepository.save(admin);
        }

        // Initialize student user
        if (!userRepository.existsByUsername("student")) {
            User student = new User();
            student.setFirstName("John");
            student.setLastName("Doe");
            student.setUsername("student");
            student.setEmail("student@pfetrack.com");
            student.setPassword(passwordEncoder.encode("student123"));

            Set<Role> studentRoles = new HashSet<>();
            studentRoles.add(roleRepository.findByName(ERole.ROLE_STUDENT).orElseThrow());
            student.setRoles(studentRoles);

            userRepository.save(student);
        }

        // Initialize supervisor user
        if (!userRepository.existsByUsername("supervisor")) {
            User supervisor = new User();
            supervisor.setFirstName("Jane");
            supervisor.setLastName("Smith");
            supervisor.setUsername("supervisor");
            supervisor.setEmail("supervisor@pfetrack.com");
            supervisor.setPassword(passwordEncoder.encode("supervisor123"));

            Set<Role> supervisorRoles = new HashSet<>();
            supervisorRoles.add(roleRepository.findByName(ERole.ROLE_SUPERVISOR).orElseThrow());
            supervisor.setRoles(supervisorRoles);

            userRepository.save(supervisor);
        }

        // Initialize sample topics
        if (topicRepository.count() == 0) {
            Topic topic1 = new Topic();
            topic1.setTitle("Machine Learning for Predictive Analytics");
            topic1.setDescription("Develop a machine learning model to predict customer behavior and market trends using historical data. This project involves data preprocessing, feature engineering, model selection, and performance evaluation.");
            topic1.setSupervisor("Dr. Ahmed Ben Ali");
            topic1.setDepartment("Computer Science");
            topic1.setType("Research");
            topic1.setStatus("Available");
            topic1.setMaxStudents(2);
            topic1.setCurrentStudents(0);
            topicRepository.save(topic1);

            Topic topic2 = new Topic();
            topic2.setTitle("IoT-Based Smart Home Automation System");
            topic2.setDescription("Design and implement a comprehensive smart home automation system using IoT devices, sensors, and mobile applications. Focus on energy efficiency and user experience.");
            topic2.setSupervisor("Prof. Fatma Gharbi");
            topic2.setDepartment("Electrical Engineering");
            topic2.setType("Development");
            topic2.setStatus("Available");
            topic2.setMaxStudents(1);
            topic2.setCurrentStudents(0);
            topicRepository.save(topic2);

            Topic topic3 = new Topic();
            topic3.setTitle("Blockchain-Based Supply Chain Management");
            topic3.setDescription("Develop a blockchain solution for transparent and secure supply chain tracking. Implement smart contracts and create a user-friendly interface for stakeholders.");
            topic3.setSupervisor("Dr. Mohamed Trabelsi");
            topic3.setDepartment("Information Systems");
            topic3.setType("Development");
            topic3.setStatus("Available");
            topic3.setMaxStudents(1);
            topic3.setCurrentStudents(0);
            topicRepository.save(topic3);

            Topic topic4 = new Topic();
            topic4.setTitle("Cybersecurity Risk Assessment Framework");
            topic4.setDescription("Create a comprehensive framework for assessing cybersecurity risks in enterprise environments. Include threat modeling, vulnerability assessment, and risk mitigation strategies.");
            topic4.setSupervisor("Dr. Sami Khedher");
            topic4.setDepartment("Cybersecurity");
            topic4.setType("Research");
            topic4.setStatus("Taken");
            topic4.setMaxStudents(1);
            topic4.setCurrentStudents(1);
            topicRepository.save(topic4);

            Topic topic5 = new Topic();
            topic5.setTitle("Mobile Health Application for Chronic Disease Management");
            topic5.setDescription("Develop a mobile application that helps patients manage chronic diseases through medication reminders, symptom tracking, and healthcare provider communication.");
            topic5.setSupervisor("Dr. Leila Jemni");
            topic5.setDepartment("Software Engineering");
            topic5.setType("Development");
            topic5.setStatus("Available");
            topic5.setMaxStudents(2);
            topic5.setCurrentStudents(0);
            topicRepository.save(topic5);
        }

        // Initialize sample reports for the student user
        User student = userRepository.findByUsername("student").orElse(null);
        if (student != null && reportRepository.count() == 0) {
            Report report1 = new Report();
            report1.setTitle("Weekly Progress Report - Week 1");
            report1.setDescription("Initial project setup and literature review completed. Started working on the project requirements analysis.");
            report1.setType("Weekly");
            report1.setStatus("Submitted");
            report1.setStudent(student);
            report1.setSubmittedAt(LocalDateTime.now().minusDays(7));
            reportRepository.save(report1);

            Report report2 = new Report();
            report2.setTitle("Monthly Progress Report - Month 1");
            report2.setDescription("Completed the initial phase of the project including system design and architecture planning. Ready to move to implementation phase.");
            report2.setType("Monthly");
            report2.setStatus("Reviewed");
            report2.setStudent(student);
            report2.setSubmittedAt(LocalDateTime.now().minusDays(14));
            report2.setReviewedAt(LocalDateTime.now().minusDays(10));
            report2.setReviewerComments("Good progress. Make sure to focus on the implementation details in the next phase.");
            report2.setGrade(85.0);
            reportRepository.save(report2);

            Report report3 = new Report();
            report3.setTitle("Draft Final Report");
            report3.setDescription("Draft version of the final project report including methodology, implementation details, and preliminary results.");
            report3.setType("Final");
            report3.setStatus("Draft");
            report3.setStudent(student);
            reportRepository.save(report3);
        }

        // Initialize sample events for the student user
        if (student != null && eventRepository.count() == 0) {
            Event event1 = new Event();
            event1.setTitle("Mid-term Exam - Database Systems");
            event1.setDescription("Database Systems Mid-term Examination covering SQL, normalization, and transaction management.");
            event1.setEventDate(LocalDate.now().plusDays(15));
            event1.setEventTime(LocalTime.of(9, 0));
            event1.setType("exam");
            event1.setLocation("Room A101");
            event1.setStatus("upcoming");
            event1.setStudent(student);
            event1.setCreatedBy("system");
            eventRepository.save(event1);

            Event event2 = new Event();
            event2.setTitle("PFE Progress Presentation");
            event2.setDescription("Present your project progress to the committee and receive feedback.");
            event2.setEventDate(LocalDate.now().plusDays(20));
            event2.setEventTime(LocalTime.of(14, 0));
            event2.setType("pfe");
            event2.setLocation("Conference Room B");
            event2.setStatus("upcoming");
            event2.setStudent(student);
            event2.setCreatedBy("system");
            eventRepository.save(event2);

            Event event3 = new Event();
            event3.setTitle("Supervisor Meeting");
            event3.setDescription("Weekly progress discussion with Prof. Ahmed Khouani.");
            event3.setEventDate(LocalDate.now().plusDays(3));
            event3.setEventTime(LocalTime.of(10, 30));
            event3.setType("meeting");
            event3.setLocation("Office 205");
            event3.setStatus("upcoming");
            event3.setStudent(student);
            event3.setCreatedBy("system");
            eventRepository.save(event3);

            Event event4 = new Event();
            event4.setTitle("Final Report Submission Deadline");
            event4.setDescription("Submit your final PFE report through the online portal.");
            event4.setEventDate(LocalDate.now().plusDays(60));
            event4.setEventTime(LocalTime.of(23, 59));
            event4.setType("pfe");
            event4.setLocation("Online Portal");
            event4.setStatus("upcoming");
            event4.setStudent(student);
            event4.setCreatedBy("system");
            eventRepository.save(event4);

            Event event5 = new Event();
            event5.setTitle("Thesis Defense");
            event5.setDescription("Final thesis defense presentation in front of the jury.");
            event5.setEventDate(LocalDate.now().plusDays(85));
            event5.setEventTime(LocalTime.of(9, 0));
            event5.setType("pfe");
            event5.setLocation("Amphitheater A");
            event5.setStatus("scheduled");
            event5.setStudent(student);
            event5.setCreatedBy("system");
            eventRepository.save(event5);

            Event event6 = new Event();
            event6.setTitle("Software Engineering Final Exam");
            event6.setDescription("Comprehensive final exam covering software development methodologies and practices.");
            event6.setEventDate(LocalDate.now().plusDays(25));
            event6.setEventTime(LocalTime.of(8, 0));
            event6.setType("exam");
            event6.setLocation("Room C203");
            event6.setStatus("upcoming");
            event6.setStudent(student);
            event6.setCreatedBy("system");
            eventRepository.save(event6);

            // Create some public events
            Event publicEvent1 = new Event();
            publicEvent1.setTitle("PFE Orientation Session");
            publicEvent1.setDescription("General orientation session for all PFE students about project guidelines and expectations.");
            publicEvent1.setEventDate(LocalDate.now().plusDays(7));
            publicEvent1.setEventTime(LocalTime.of(15, 0));
            publicEvent1.setType("pfe");
            publicEvent1.setLocation("Main Auditorium");
            publicEvent1.setStatus("upcoming");
            publicEvent1.setIsPublic(true);
            publicEvent1.setCreatedBy("admin");
            eventRepository.save(publicEvent1);

            Event publicEvent2 = new Event();
            publicEvent2.setTitle("Career Fair");
            publicEvent2.setDescription("Annual career fair with companies looking to recruit new graduates.");
            publicEvent2.setEventDate(LocalDate.now().plusDays(30));
            publicEvent2.setEventTime(LocalTime.of(10, 0));
            publicEvent2.setType("meeting");
            publicEvent2.setLocation("University Campus");
            publicEvent2.setStatus("upcoming");
            publicEvent2.setIsPublic(true);
            publicEvent2.setCreatedBy("admin");
            eventRepository.save(publicEvent2);
        }
    }
}