package com.pfetrack.api.controller;

import com.pfetrack.api.model.Grade;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.GradeRepository;
import com.pfetrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GradeController {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Grade>> getAllGrades() {
        try {
            List<Grade> grades = gradeRepository.findAll();
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-grades")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Grade>> getMyGrades(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Grade> grades = gradeRepository.findByStudentAndIsPublishedOrderByEvaluationDateDesc(userOpt.get(), true);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-grades/semester/{semester}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Grade>> getMyGradesBySemester(@PathVariable String semester, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Grade> grades = gradeRepository.findByStudentAndSemesterAndIsPublishedOrderByEvaluationDateDesc(userOpt.get(), semester, true);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-grades/academic-year/{year}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Grade>> getMyGradesByAcademicYear(@PathVariable String year, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Grade> grades = gradeRepository.findByStudentAndAcademicYearAndIsPublishedOrderByEvaluationDateDesc(userOpt.get(), year, true);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-gpa")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Double> getMyGPA(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Double gpa = gradeRepository.calculateGPAByStudent(userOpt.get());
            return ResponseEntity.ok(gpa != null ? gpa : 0.0);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Long studentId) {
        try {
            Optional<User> studentOpt = userRepository.findById(studentId);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Grade> grades = gradeRepository.findByStudentOrderByEvaluationDateDesc(studentOpt.get());
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<Grade> createGrade(@RequestBody Grade grade) {
        try {
            Grade savedGrade = gradeRepository.save(grade);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGrade);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade gradeDetails) {
        try {
            Optional<Grade> gradeOpt = gradeRepository.findById(id);
            
            if (!gradeOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Grade grade = gradeOpt.get();
            
            // Update fields
            if (gradeDetails.getSubjectName() != null) grade.setSubjectName(gradeDetails.getSubjectName());
            if (gradeDetails.getGradeValue() != null) grade.setGradeValue(gradeDetails.getGradeValue());
            if (gradeDetails.getLetterGrade() != null) grade.setLetterGrade(gradeDetails.getLetterGrade());
            if (gradeDetails.getCredits() != null) grade.setCredits(gradeDetails.getCredits());
            if (gradeDetails.getSemester() != null) grade.setSemester(gradeDetails.getSemester());
            if (gradeDetails.getAcademicYear() != null) grade.setAcademicYear(gradeDetails.getAcademicYear());
            if (gradeDetails.getEvaluationType() != null) grade.setEvaluationType(gradeDetails.getEvaluationType());
            if (gradeDetails.getEvaluationDate() != null) grade.setEvaluationDate(gradeDetails.getEvaluationDate());
            if (gradeDetails.getMaxScore() != null) grade.setMaxScore(gradeDetails.getMaxScore());
            if (gradeDetails.getObtainedScore() != null) grade.setObtainedScore(gradeDetails.getObtainedScore());
            if (gradeDetails.getProfessor() != null) grade.setProfessor(gradeDetails.getProfessor());
            if (gradeDetails.getComments() != null) grade.setComments(gradeDetails.getComments());
            if (gradeDetails.getStatus() != null) grade.setStatus(gradeDetails.getStatus());
            if (gradeDetails.getIsPublished() != null) grade.setIsPublished(gradeDetails.getIsPublished());
            
            Grade updatedGrade = gradeRepository.save(grade);
            return ResponseEntity.ok(updatedGrade);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        try {
            if (gradeRepository.existsById(id)) {
                gradeRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<Grade> publishGrade(@PathVariable Long id) {
        try {
            Optional<Grade> gradeOpt = gradeRepository.findById(id);
            
            if (!gradeOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Grade grade = gradeOpt.get();
            grade.setIsPublished(true);
            
            Grade updatedGrade = gradeRepository.save(grade);
            return ResponseEntity.ok(updatedGrade);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/semester/{semester}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Grade>> getGradesBySemester(@PathVariable String semester) {
        try {
            List<Grade> grades = gradeRepository.findBySemesterOrderByEvaluationDateDesc(semester);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/subject/{subjectName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Grade>> getGradesBySubject(@PathVariable String subjectName) {
        try {
            List<Grade> grades = gradeRepository.findBySubjectNameOrderByEvaluationDateDesc(subjectName);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Grade>> searchGrades(@RequestParam String keyword) {
        try {
            List<Grade> grades = gradeRepository.searchGrades(keyword);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}