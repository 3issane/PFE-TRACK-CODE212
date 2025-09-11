package com.pfetrack.backendpfe.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.pfetrack.backendpfe.report.ReportRepository;
import com.pfetrack.backendpfe.topic.TopicRepository;
import com.pfetrack.backendpfe.report.Report;
import com.pfetrack.backendpfe.topic.Topic;
import com.pfetrack.backendpfe.schedule.ScheduleRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin")
public class UserStatsController {
    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final ReportRepository reportRepository;
    private final TopicRepository topicRepository;
    private final ScheduleRepository scheduleRepository;

    public UserStatsController(AdminRepository adminRepository,
                               StudentRepository studentRepository,
                               ProfessorRepository professorRepository,
                               ReportRepository reportRepository,
                               TopicRepository topicRepository,
                               ScheduleRepository scheduleRepository) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
        this.reportRepository = reportRepository;
        this.topicRepository = topicRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @GetMapping("/user-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        long admins = adminRepository.count();
        long students = studentRepository.count();
        long professors = professorRepository.count();
        return ResponseEntity.ok(UserStatsResponse.builder()
                .admins(admins)
                .students(students)
                .professors(professors)
                .total(admins + students + professors)
                .build());
    }

    public record RecentItem(String type, Long id, String title, String secondary, String createdAt) {}

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RecentItem> recent() {
    var recentStudents = studentRepository.findAll().stream()
        .sorted(Comparator.comparing(Student::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .limit(5)
        .map(s -> new RecentItem("USER", s.getId(), s.getFirstName()+" "+s.getLastName(), s.getEmail(), s.getCreatedAt()!=null? s.getCreatedAt().toString(): null));
    var recentReports = reportRepository.findAll().stream()
        .sorted(Comparator.comparing(Report::getSubmissionDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .limit(5)
        .map(r -> new RecentItem("REPORT", r.getId(), r.getTitle(), r.getStatus(), r.getSubmissionDate()!=null? r.getSubmissionDate().toString(): null));
    var recentTopics = topicRepository.findAll().stream()
        .sorted(Comparator.comparing(Topic::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .limit(5)
        .map(t -> new RecentItem("TOPIC", t.getId(), t.getTitle(), t.getDepartment()!=null? t.getDepartment().name(): null, t.getCreatedAt()!=null? t.getCreatedAt().toString(): null));
    return Stream.concat(Stream.concat(recentStudents, recentReports), recentTopics)
        .sorted(Comparator.comparing(RecentItem::createdAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .limit(15)
        .toList();
    }

    @GetMapping("/schedule-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> scheduleCount() {
    return Map.of("total", scheduleRepository.count());
    }
}
