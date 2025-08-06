package com.pfetrack.api.controller;

import com.pfetrack.api.model.Project;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.ProjectRepository;
import com.pfetrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            List<Project> projects = projectRepository.findAll();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-project")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Project> getMyProject(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<Project> projectOpt = projectRepository.findActiveProjectByStudent(userOpt.get());
            
            if (projectOpt.isPresent()) {
                return ResponseEntity.ok(projectOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Project>> getMyProjects(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Project> projects = projectRepository.findByStudent(userOpt.get());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @projectController.isOwner(#id, authentication))")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<Project> projectOpt = projectRepository.findById(id);
            
            if (projectOpt.isPresent()) {
                return ResponseEntity.ok(projectOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Project> createProject(@RequestBody Project project, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            
            // Check if student already has an active project
            Optional<Project> existingProject = projectRepository.findActiveProjectByStudent(user);
            if (existingProject.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            project.setStudent(user);
            project.setStatus("Active"); // Default status
            project.setProgressPercentage(0.0); // Initial progress
            
            Project savedProject = projectRepository.save(project);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/my-project")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Project> updateMyProject(@RequestBody Project projectDetails, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<Project> projectOpt = projectRepository.findActiveProjectByStudent(userOpt.get());
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Project project = projectOpt.get();
            
            // Update fields that students can modify
            if (projectDetails.getTitle() != null) project.setTitle(projectDetails.getTitle());
            if (projectDetails.getDescription() != null) project.setDescription(projectDetails.getDescription());
            if (projectDetails.getObjectives() != null) project.setObjectives(projectDetails.getObjectives());
            if (projectDetails.getMethodology() != null) project.setMethodology(projectDetails.getMethodology());
            if (projectDetails.getExpectedOutcomes() != null) project.setExpectedOutcomes(projectDetails.getExpectedOutcomes());
            if (projectDetails.getCurrentChallenges() != null) project.setCurrentChallenges(projectDetails.getCurrentChallenges());
            if (projectDetails.getNextSteps() != null) project.setNextSteps(projectDetails.getNextSteps());
            if (projectDetails.getRepositoryUrl() != null) project.setRepositoryUrl(projectDetails.getRepositoryUrl());
            if (projectDetails.getDocumentationUrl() != null) project.setDocumentationUrl(projectDetails.getDocumentationUrl());
            if (projectDetails.getProgressPercentage() != null) project.setProgressPercentage(projectDetails.getProgressPercentage());
            if (projectDetails.getCurrentPhase() != null) project.setCurrentPhase(projectDetails.getCurrentPhase());
            
            Project updatedProject = projectRepository.save(project);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        try {
            Optional<Project> projectOpt = projectRepository.findById(id);
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Project project = projectOpt.get();
            
            // Update all fields (admin/professor can modify everything)
            if (projectDetails.getTitle() != null) project.setTitle(projectDetails.getTitle());
            if (projectDetails.getDescription() != null) project.setDescription(projectDetails.getDescription());
            if (projectDetails.getSupervisor() != null) project.setSupervisor(projectDetails.getSupervisor());
            if (projectDetails.getCoSupervisor() != null) project.setCoSupervisor(projectDetails.getCoSupervisor());
            if (projectDetails.getDepartment() != null) project.setDepartment(projectDetails.getDepartment());
            if (projectDetails.getType() != null) project.setType(projectDetails.getType());
            if (projectDetails.getStatus() != null) project.setStatus(projectDetails.getStatus());
            if (projectDetails.getStartDate() != null) project.setStartDate(projectDetails.getStartDate());
            if (projectDetails.getEndDate() != null) project.setEndDate(projectDetails.getEndDate());
            if (projectDetails.getExpectedCompletionDate() != null) project.setExpectedCompletionDate(projectDetails.getExpectedCompletionDate());
            if (projectDetails.getProgressPercentage() != null) project.setProgressPercentage(projectDetails.getProgressPercentage());
            if (projectDetails.getCurrentPhase() != null) project.setCurrentPhase(projectDetails.getCurrentPhase());
            if (projectDetails.getObjectives() != null) project.setObjectives(projectDetails.getObjectives());
            if (projectDetails.getMethodology() != null) project.setMethodology(projectDetails.getMethodology());
            if (projectDetails.getExpectedOutcomes() != null) project.setExpectedOutcomes(projectDetails.getExpectedOutcomes());
            if (projectDetails.getCurrentChallenges() != null) project.setCurrentChallenges(projectDetails.getCurrentChallenges());
            if (projectDetails.getNextSteps() != null) project.setNextSteps(projectDetails.getNextSteps());
            if (projectDetails.getFinalGrade() != null) project.setFinalGrade(projectDetails.getFinalGrade());
            if (projectDetails.getSupervisorFeedback() != null) project.setSupervisorFeedback(projectDetails.getSupervisorFeedback());
            if (projectDetails.getPresentationDate() != null) project.setPresentationDate(projectDetails.getPresentationDate());
            if (projectDetails.getRepositoryUrl() != null) project.setRepositoryUrl(projectDetails.getRepositoryUrl());
            if (projectDetails.getDocumentationUrl() != null) project.setDocumentationUrl(projectDetails.getDocumentationUrl());
            
            Project updatedProject = projectRepository.save(project);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            if (projectRepository.existsById(id)) {
                projectRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getProjectsByStatus(@PathVariable String status) {
        try {
            List<Project> projects = projectRepository.findByStatus(status);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getProjectsByDepartment(@PathVariable String department) {
        try {
            List<Project> projects = projectRepository.findByDepartment(department);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/supervisor/{supervisor}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getProjectsBySupervisor(@PathVariable String supervisor) {
        try {
            List<Project> projects = projectRepository.findBySupervisor(supervisor);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getOverdueProjects() {
        try {
            List<Project> projects = projectRepository.findOverdueProjects(LocalDate.now());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/due-soon")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> getProjectsDueSoon() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate twoWeeksFromNow = now.plusWeeks(2);
            List<Project> projects = projectRepository.findProjectsDueSoon(now, twoWeeksFromNow);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Project>> searchProjects(@RequestParam String keyword) {
        try {
            List<Project> projects = projectRepository.searchProjects(keyword);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statistics/average-progress")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Double> getAverageProgress() {
        try {
            Double averageProgress = projectRepository.getAverageProgressPercentage();
            return ResponseEntity.ok(averageProgress != null ? averageProgress : 0.0);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statistics/count-by-status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Long> getCountByStatus(@PathVariable String status) {
        try {
            Long count = projectRepository.countByStatus(status);
            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllDepartments() {
        try {
            List<String> departments = projectRepository.findAllDepartments();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/phases")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllActivePhases() {
        try {
            List<String> phases = projectRepository.findAllActivePhases();
            return ResponseEntity.ok(phases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method for security
    public boolean isOwner(Long projectId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return false;
            }
            
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            
            if (!projectOpt.isPresent()) {
                return false;
            }
            
            return projectOpt.get().getStudent().getId().equals(userOpt.get().getId());
        } catch (Exception e) {
            return false;
        }
    }
}