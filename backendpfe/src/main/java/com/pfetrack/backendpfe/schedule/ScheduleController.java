package com.pfetrack.backendpfe.schedule;

import com.pfetrack.backendpfe.topic.StudentTopic;
import com.pfetrack.backendpfe.topic.StudentTopicRepository;
import com.pfetrack.backendpfe.user.Professor;
import com.pfetrack.backendpfe.user.ProfessorRepository;
import com.pfetrack.backendpfe.topic.Topic;
import com.pfetrack.backendpfe.topic.TopicRepository;
import com.pfetrack.backendpfe.user.Student;
import com.pfetrack.backendpfe.user.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;
    private final StudentTopicRepository studentTopicRepository;
    private final ProfessorRepository professorRepository;
    private final TopicRepository topicRepository;
    private final StudentRepository studentRepository;

    public record ScheduleDTO(Long id, String title, String description, ScheduleType type, LocalDate date,
                              LocalTime startTime, LocalTime endTime, String location, Long studentTopicId, Long professorId) {}

    public record CreateScheduleRequest(String title, String description, ScheduleType type, LocalDate date,
                                        LocalTime startTime, LocalTime endTime, String location, Long studentTopicId, Long professorId) {}

    private ScheduleDTO toDTO(Schedule s) {
        return new ScheduleDTO(
                s.getId(),
                s.getTitle(),
                s.getDescription(),
                s.getType(),
                s.getDate(),
                s.getStartTime(),
                s.getEndTime(),
                s.getLocation(),
                s.getStudentTopic() != null ? s.getStudentTopic().getId() : null,
                s.getProfessor() != null ? s.getProfessor().getId() : null
        );
    }

    @GetMapping
    public List<ScheduleDTO> list(@RequestParam(value = "type", required = false) ScheduleType type,
                                  @RequestParam(value = "date", required = false) LocalDate date,
                                  @RequestParam(value = "studentTopicId", required = false) Long studentTopicId) {
        if (studentTopicId != null) {
            return scheduleRepository.findByStudentTopic_Id(studentTopicId).stream().map(this::toDTO).toList();
        }
        if (date != null) {
            return scheduleRepository.findByDate(date).stream().map(this::toDTO).toList();
        }
        if (type != null) {
            return scheduleRepository.findByType(type).stream().map(this::toDTO).toList();
        }
        return scheduleRepository.findAll().stream().map(this::toDTO).toList();
    }

    // Expose available schedule types
    @GetMapping("/types")
    public ScheduleType[] types() { return ScheduleType.values(); }

    // List student topics for a given student (by studentId)
    @GetMapping("/student-topics/{studentId}")
    public List<Long> studentTopics(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        return studentTopicRepository.findAll().stream()
                .filter(st -> st.getStudent().getId().equals(student.getId()))
                .map(st -> st.getId()).toList();
    }

    // Get professors for a topic (its creator primarily)
    @GetMapping("/topic/{topicId}/professors")
    public List<Long> topicProfessors(@PathVariable Long topicId) {
        Topic topic = topicRepository.findById(topicId).orElseThrow();
        return List.of(topic.getCreator().getId());
    }

    // All student topics with detail (for selection UI)
    public record StudentTopicDetail(Long studentTopicId, Long topicId, String topicTitle, Long studentId, String studentName, Long professorId, String professorName) {}
    @GetMapping("/all-student-topics")
    public List<StudentTopicDetail> allStudentTopics() {
        return studentTopicRepository.findAll().stream().map(st -> {
            Topic t = st.getTopic();
            Professor p = t.getCreator();
            Student s = st.getStudent();
            String studentName = (s.getFirstName()!=null? s.getFirstName(): "") + " " + (s.getLastName()!=null? s.getLastName(): "").trim();
            String professorName = (p.getFirstName()!=null? p.getFirstName(): "") + " " + (p.getLastName()!=null? p.getLastName(): "").trim();
            return new StudentTopicDetail(st.getId(), t.getId(), t.getTitle(), s.getId(), studentName.trim(), p.getId(), professorName.trim());
        }).toList();
    }

    public record ProfessorDTO(Long id, String firstName, String lastName, String email) {}
    @GetMapping("/professors")
    public List<ProfessorDTO> professors() {
        return professorRepository.findAll().stream()
                .map(p -> new ProfessorDTO(p.getId(), p.getFirstName(), p.getLastName(), p.getEmail()))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<ScheduleDTO> create(@RequestBody CreateScheduleRequest req) {
        StudentTopic st = null;
        if (req.studentTopicId != null) {
            st = studentTopicRepository.findById(req.studentTopicId)
                    .orElseThrow(() -> new IllegalArgumentException("StudentTopic not found: " + req.studentTopicId));
        }
        Professor prof = null;
        if (req.professorId != null) {
            prof = professorRepository.findById(req.professorId)
                    .orElseThrow(() -> new IllegalArgumentException("Professor not found: " + req.professorId));
        }
        // If type is PFE_PRESENTATION require a studentTopic; otherwise ignore studentTopic
        if (req.type() == ScheduleType.PFE_PRESENTATION && st == null) {
            throw new IllegalArgumentException("studentTopicId required for PFE_PRESENTATION");
        }
        if (req.type() != ScheduleType.PFE_PRESENTATION) {
            st = null; // ensure null for lecture/exam
        }
        Schedule schedule = Schedule.builder()
            .title(req.title())
            .description(req.description())
            .type(req.type())
            .date(req.date())
            .startTime(req.startTime())
            .endTime(req.endTime())
            .location(req.location())
            .studentTopic(st)
            .professor(prof)
            .build();
        scheduleRepository.save(schedule);
        return ResponseEntity.ok(toDTO(schedule));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!scheduleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        scheduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
