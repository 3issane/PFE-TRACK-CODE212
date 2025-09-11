package com.pfetrack.backendpfe.report;

import com.pfetrack.backendpfe.topic.StudentTopic;
import com.pfetrack.backendpfe.topic.StudentTopicRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ReportsController {
    private final ReportRepository reportRepository;
    private final StudentTopicRepository studentTopicRepository;

    public ReportsController(ReportRepository reportRepository,
                             StudentTopicRepository studentTopicRepository) {
        this.reportRepository = reportRepository;
        this.studentTopicRepository = studentTopicRepository;
    }

    public record ReportDto(Long id, String title, String type, String status, Double grade, Long size,
                             String fileName, String storedFileName, Long studentTopicId, String studentEmail, String topicTitle, String supervisorEmail,
                             java.time.Instant submissionDate, String feedback) {}

    public record CreateReportRequest(@NotBlank String title, String type, String status,
                                      Double grade, Long size, String fileName, String feedback,
                                      @NotNull Long studentTopicId) {}

    public record StudentUploadRequest(@NotBlank String title, String type, String fileName, Long size) {}

    private final Path uploadRoot = Paths.get("uploads");

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countReports() {
        long total = reportRepository.count();
        return ResponseEntity.ok(Map.of("total", total));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR','STUDENT')")
    public ResponseEntity<List<ReportDto>> listReports(Authentication auth) {
        String email = auth.getName();
        List<Report> reports;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            reports = reportRepository.findAll();
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PROFESSOR"))) {
            reports = reportRepository.findByStudentTopic_Topic_Creator_Email(email);
        } else { // student
            reports = reportRepository.findByStudentTopic_Student_Email(email);
        }
        List<ReportDto> list = reports.stream().map(r -> {
            StudentTopic st = r.getStudentTopic();
        return new ReportDto(
            r.getId(), r.getTitle(), r.getType(), r.getStatus(), r.getGrade(), r.getSize(),
            r.getFileName(), r.getStoredFileName(),
                    st != null ? st.getId() : null,
                    st != null ? st.getStudent().getEmail() : null,
                    st != null ? (st.getTopic()!=null ? st.getTopic().getTitle() : null) : null,
                    st != null && st.getTopic()!=null && st.getTopic().getCreator()!=null ? st.getTopic().getCreator().getEmail() : null,
                    r.getSubmissionDate(),
                    r.getFeedback()
            );
        }).toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<?> createReport(@Valid @RequestBody CreateReportRequest req, Authentication authentication) {
        StudentTopic st = studentTopicRepository.findById(req.studentTopicId()).orElse(null);
        if (st == null) return ResponseEntity.badRequest().body(Map.of("error", "StudentTopic not found"));
        Report saved = reportRepository.save(Report.builder()
                .title(req.title())
                .type(req.type())
                .status(req.status())
                .grade(req.grade())
                .size(req.size())
                .fileName(req.fileName())
                .feedback(req.feedback())
                .studentTopic(st)
                .build());
        return ResponseEntity.ok(Map.of("id", saved.getId(), "feedback", saved.getFeedback()));
    }

    @PostMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> studentUpload(@Valid @RequestBody StudentUploadRequest req, Authentication auth) {
        String email = auth.getName();
        // find student's assignment
        List<StudentTopic> list = studentTopicRepository.findByStudent_Email(email);
        if (list.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No topic assignment found"));
        StudentTopic st = list.get(0);
        Report saved = reportRepository.save(Report.builder()
                .title(req.title())
                .type(req.type())
                .fileName(req.fileName())
                .size(req.size())
                .status("SUBMITTED")
                .studentTopic(st)
                .build());
        return ResponseEntity.ok(Map.of("id", saved.getId()));
    }

    @PostMapping(value = "/student/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> studentMultipartUpload(@RequestPart("title") String title,
                                                    @RequestPart(value = "type", required = false) String type,
                                                    @RequestPart("file") MultipartFile file,
                                                    Authentication auth) throws IOException {
        String email = auth.getName();
        List<StudentTopic> list = studentTopicRepository.findByStudent_Email(email);
        if (list.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No topic assignment found"));
        StudentTopic st = list.get(0);
        if (!Files.exists(uploadRoot)) Files.createDirectories(uploadRoot);
        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) original = "report.bin";
        String stored = st.getStudent().getId() + "_" + System.currentTimeMillis() + "_" + original.replaceAll("[^a-zA-Z0-9._-]","_");
        Path target = uploadRoot.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        Report saved = reportRepository.save(Report.builder()
                .title(title)
                .type(type)
                .fileName(original)
                .storedFileName(stored)
                .size(file.getSize())
                .status("SUBMITTED")
                .studentTopic(st)
                .build());
        return ResponseEntity.ok(Map.of("id", saved.getId(), "fileName", saved.getFileName()));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('STUDENT','PROFESSOR','ADMIN')")
    public ResponseEntity<?> download(@PathVariable Long id, Authentication auth) throws IOException {
        Report report = reportRepository.findById(id).orElse(null);
        if (report == null) return ResponseEntity.notFound().build();
        StudentTopic st = report.getStudentTopic();
        String email = auth.getName();
        boolean isOwner = st != null && st.getStudent()!=null && email.equals(st.getStudent().getEmail());
        boolean isSupervisor = st != null && st.getTopic()!=null && st.getTopic().getCreator()!=null && email.equals(st.getTopic().getCreator().getEmail());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!(isOwner || isSupervisor || isAdmin)) return ResponseEntity.status(403).body(Map.of("error","Not allowed"));
        if (report.getStoredFileName()==null) return ResponseEntity.badRequest().body(Map.of("error","No stored file"));
        Path filePath = uploadRoot.resolve(report.getStoredFileName());
        if (!Files.exists(filePath)) return ResponseEntity.notFound().build();
        Resource resource = new FileSystemResource(filePath);
        String mime = Files.probeContentType(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getFileName() + "\"")
                .contentType(mime != null ? MediaType.parseMediaType(mime) : MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(Files.size(filePath))
                .body(resource);
    }

    @PatchMapping("/{id}/feedback")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<?> addFeedback(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Report report = reportRepository.findById(id).orElse(null);
        if (report == null) return ResponseEntity.notFound().build();
        String email = auth.getName();
    StudentTopic st = report.getStudentTopic();
    if (st == null || st.getTopic()==null || st.getTopic().getCreator()==null || !email.equals(st.getTopic().getCreator().getEmail())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not supervisor of this report"));
        }
        report.setFeedback(body.getOrDefault("feedback", null));
        reportRepository.save(report);
        return ResponseEntity.ok(Map.of("id", report.getId(), "feedback", report.getFeedback()));
    }
}
