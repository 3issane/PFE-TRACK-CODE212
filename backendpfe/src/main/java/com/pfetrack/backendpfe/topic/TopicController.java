package com.pfetrack.backendpfe.topic;

import com.pfetrack.backendpfe.user.Student;
import com.pfetrack.backendpfe.user.Professor;
import com.pfetrack.backendpfe.user.ProfessorRepository;
import com.pfetrack.backendpfe.user.StudentRepository;
import com.pfetrack.backendpfe.user.ProfessorDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class TopicController {
    private final TopicRepository topicRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final StudentTopicRepository studentTopicRepository;

    public TopicController(TopicRepository topicRepository,
                           StudentRepository studentRepository,
                           StudentTopicRepository studentTopicRepository,
                           ProfessorRepository professorRepository) {
        this.topicRepository = topicRepository;
        this.studentRepository = studentRepository;
        this.studentTopicRepository = studentTopicRepository;
        this.professorRepository = professorRepository;
    }

    public record CreateTopicRequest(@NotBlank String title, String description, Long creatorProfessorId, Department department) {}
    public record TopicDto(Long id, String title, String description, String creatorName, String creatorEmail, Department department, java.time.Instant createdAt) {}

    @PostMapping("/topics")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<?> createTopic(@Valid @RequestBody CreateTopicRequest req,
                                         Authentication authentication) {
        String email = authentication.getName();
        Professor creator = professorRepository.findByEmail(email).orElse(null);
        if (creator == null) {
            // Allow ADMINs: they can create a topic by assigning a professor as creator
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (isAdmin) {
                if (req.creatorProfessorId() != null) {
                    creator = professorRepository.findById(req.creatorProfessorId()).orElse(null);
                }
                if (creator == null) {
                    creator = professorRepository.findAll().stream().findFirst().orElse(null);
                }
                if (creator == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No professor available to assign as creator"));
                }
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Only professors or admins can create topics"));
            }
        }
    Topic topic = Topic.builder()
                .title(req.title())
                .description(req.description())
                .creator(creator)
        .department(req.department())
                .build();
        return ResponseEntity.ok(topicRepository.save(topic));
    }

    @PutMapping("/topics/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<?> updateTopic(@PathVariable Long id,
                                         @Valid @RequestBody CreateTopicRequest req,
                                         Authentication authentication) {
        Topic topic = topicRepository.findById(id).orElse(null);
        if (topic == null) {
            return ResponseEntity.notFound().build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        String email = authentication.getName();
        boolean isCreator = topic.getCreator() != null && email.equalsIgnoreCase(topic.getCreator().getEmail());
        if (!(isAdmin || isCreator)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed to update this topic"));
        }
        topic.setTitle(req.title());
        topic.setDescription(req.description());
    topic.setDepartment(req.department());
        Topic saved = topicRepository.save(topic);
    TopicDto dto = new TopicDto(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getCreator() != null ? (saved.getCreator().getFirstName() + " " + saved.getCreator().getLastName()) : "",
        saved.getCreator() != null ? saved.getCreator().getEmail() : "",
        saved.getDepartment(),
                saved.getCreatedAt()
        );
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/topics/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id, Authentication authentication) {
        Topic topic = topicRepository.findById(id).orElse(null);
        if (topic == null) {
            return ResponseEntity.notFound().build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        String email = authentication.getName();
        boolean isCreator = topic.getCreator() != null && email.equalsIgnoreCase(topic.getCreator().getEmail());
        if (!(isAdmin || isCreator)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed to delete this topic"));
        }
        topicRepository.delete(topic);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/professors")
    public ResponseEntity<List<ProfessorDto>> listProfessors() {
    List<ProfessorDto> list = professorRepository.findAll().stream()
        .map(p -> ProfessorDto.builder()
            .id(p.getId())
            .firstName(p.getFirstName())
            .lastName(p.getLastName())
            .email(p.getEmail())
            .build())
        .collect(Collectors.toList());
    return ResponseEntity.ok(list);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDto>> listTopics(@RequestParam(value = "mine", required = false) Boolean mine,
                                                     Authentication authentication) {
        List<Topic> topics;
        if (Boolean.TRUE.equals(mine) && authentication != null) {
            String email = authentication.getName();
            topics = topicRepository.findAll().stream()
                    .filter(t -> t.getCreator() != null && email.equalsIgnoreCase(t.getCreator().getEmail()))
                    .collect(Collectors.toList());
        } else {
            topics = topicRepository.findAll();
        }
    List<TopicDto> out = topics.stream().map(t -> new TopicDto(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getCreator() != null ? (t.getCreator().getFirstName() + " " + t.getCreator().getLastName()) : "",
        t.getCreator() != null ? t.getCreator().getEmail() : "",
        t.getDepartment(),
                t.getCreatedAt()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    public record AssignRequest(@NotNull Long topicId, @NotNull Long studentId) {}

    @PostMapping("/topics/assign")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<?> assignStudent(@Valid @RequestBody AssignRequest req) {
        Topic topic = topicRepository.findById(req.topicId()).orElse(null);
        if (topic == null) return ResponseEntity.badRequest().body(Map.of("error", "Topic not found"));
        Student student = studentRepository.findById(req.studentId()).orElse(null);
        if (student == null) return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
        StudentTopic st = StudentTopic.builder().topic(topic).student(student).build();
        studentTopicRepository.save(st);
        return ResponseEntity.ok().build();
    }

    // Student self-apply (can only have one topic). Returns 200 with existing assignment if already applied.
    public record ApplyRequest(@NotNull Long topicId) {}

    public record MyTopicDto(Long topicId, String title, String description, String professorName, String professorEmail, java.time.Instant assignedAt) {}

    @PostMapping("/topics/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyToTopic(@Valid @RequestBody ApplyRequest req, Authentication authentication) {
        String email = authentication.getName();
        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student == null) return ResponseEntity.status(403).body(Map.of("error", "Student not found"));
        // If already assigned to any topic, forbid additional application
        if (studentTopicRepository.existsByStudent_Id(student.getId())) {
            return ResponseEntity.status(409).body(Map.of("error", "You have already applied to a topic"));
        }
        Topic topic = topicRepository.findById(req.topicId()).orElse(null);
        if (topic == null) return ResponseEntity.badRequest().body(Map.of("error", "Topic not found"));
        StudentTopic st = StudentTopic.builder().student(student).topic(topic).build();
        studentTopicRepository.save(st);
        return ResponseEntity.ok(Map.of("status", "APPLIED"));
    }

    // Return the current student's topic (if any)
    @GetMapping("/topics/my-topic")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> myTopic(Authentication authentication) {
        String email = authentication.getName();
        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student == null) return ResponseEntity.status(403).body(Map.of("error", "Student not found"));
        List<StudentTopic> list = studentTopicRepository.findByStudent_Id(student.getId());
        if (list.isEmpty()) return ResponseEntity.ok(Map.of());
        StudentTopic st = list.get(0);
        Topic t = st.getTopic();
        MyTopicDto dto = new MyTopicDto(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getCreator() != null ? (t.getCreator().getFirstName() + " " + t.getCreator().getLastName()) : null,
                t.getCreator() != null ? t.getCreator().getEmail() : null,
                st.getAssignedAt()
        );
        return ResponseEntity.ok(dto);
    }

    public record ApplicantDto(Long id, String firstName, String lastName, String email, java.time.Instant assignedAt) {}

    @GetMapping("/topics/{id}/applicants")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<List<ApplicantDto>> listApplicants(@PathVariable Long id) {
    Topic topic = topicRepository.findById(id).orElse(null);
    if (topic == null) return ResponseEntity.notFound().build();
    List<ApplicantDto> list = studentTopicRepository.findByTopicId(id).stream()
        .map(st -> new ApplicantDto(
            st.getStudent().getId(),
            st.getStudent().getFirstName(),
            st.getStudent().getLastName(),
            st.getStudent().getEmail(),
            st.getAssignedAt()
        ))
        .collect(java.util.stream.Collectors.toList());
    return ResponseEntity.ok(list);
    }
}
