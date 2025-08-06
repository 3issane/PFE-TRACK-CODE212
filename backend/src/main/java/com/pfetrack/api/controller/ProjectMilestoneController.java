package com.pfetrack.api.controller;

import com.pfetrack.api.model.Project;
import com.pfetrack.api.model.ProjectMilestone;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.ProjectMilestoneRepository;
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
@RequestMapping("/api/project-milestones")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectMilestoneController {

    @Autowired
    private ProjectMilestoneRepository projectMilestoneRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> getAllMilestones() {
        try {
            List<ProjectMilestone> milestones = projectMilestoneRepository.findAll();
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-milestones")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ProjectMilestone>> getMyMilestones(Authentication authentication) {
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
            
            List<ProjectMilestone> milestones = projectMilestoneRepository.findByProjectOrderByOrderIndexAsc(projectOpt.get());
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-milestones/upcoming")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ProjectMilestone>> getMyUpcomingMilestones(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<ProjectMilestone> milestones = projectMilestoneRepository.findUpcomingMilestonesByStudent(userOpt.get().getId());
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @projectMilestoneController.isProjectOwner(#projectId, authentication))")
    public ResponseEntity<List<ProjectMilestone>> getMilestonesByProject(@PathVariable Long projectId, Authentication authentication) {
        try {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<ProjectMilestone> milestones = projectMilestoneRepository.findByProjectOrderByOrderIndexAsc(projectOpt.get());
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @projectMilestoneController.isMilestoneOwner(#id, authentication))")
    public ResponseEntity<ProjectMilestone> getMilestoneById(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<ProjectMilestone> milestoneOpt = projectMilestoneRepository.findById(id);
            
            if (milestoneOpt.isPresent()) {
                return ResponseEntity.ok(milestoneOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProjectMilestone> createMilestone(@RequestBody ProjectMilestone milestone, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            Optional<Project> projectOpt = projectRepository.findActiveProjectByStudent(userOpt.get());
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            milestone.setProject(projectOpt.get());
            milestone.setStatus("Pending"); // Default status
            milestone.setProgressPercentage(0.0); // Initial progress
            
            // Set order index if not provided
            if (milestone.getOrderIndex() == null) {
                Long maxOrder = projectMilestoneRepository.countTotalMilestonesByProject(projectOpt.get());
                milestone.setOrderIndex((maxOrder != null ? maxOrder.intValue() : 0) + 1);
            }
            
            ProjectMilestone savedMilestone = projectMilestoneRepository.save(milestone);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMilestone);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @projectMilestoneController.isMilestoneOwner(#id, authentication) or hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<ProjectMilestone> updateMilestone(@PathVariable Long id, @RequestBody ProjectMilestone milestoneDetails, Authentication authentication) {
        try {
            Optional<ProjectMilestone> milestoneOpt = projectMilestoneRepository.findById(id);
            
            if (!milestoneOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectMilestone milestone = milestoneOpt.get();
            
            // Update fields
            if (milestoneDetails.getTitle() != null) milestone.setTitle(milestoneDetails.getTitle());
            if (milestoneDetails.getDescription() != null) milestone.setDescription(milestoneDetails.getDescription());
            if (milestoneDetails.getDueDate() != null) milestone.setDueDate(milestoneDetails.getDueDate());
            if (milestoneDetails.getStatus() != null) milestone.setStatus(milestoneDetails.getStatus());
            if (milestoneDetails.getPriority() != null) milestone.setPriority(milestoneDetails.getPriority());
            if (milestoneDetails.getProgressPercentage() != null) milestone.setProgressPercentage(milestoneDetails.getProgressPercentage());
            if (milestoneDetails.getNotes() != null) milestone.setNotes(milestoneDetails.getNotes());
            if (milestoneDetails.getOrderIndex() != null) milestone.setOrderIndex(milestoneDetails.getOrderIndex());
            
            // Set completion date if status is completed
            if ("Completed".equals(milestoneDetails.getStatus()) && milestone.getCompletionDate() == null) {
                milestone.setCompletionDate(LocalDate.now());
                milestone.setProgressPercentage(100.0);
            }
            
            ProjectMilestone updatedMilestone = projectMilestoneRepository.save(milestone);
            return ResponseEntity.ok(updatedMilestone);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @projectMilestoneController.isMilestoneOwner(#id, authentication) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id, Authentication authentication) {
        try {
            if (projectMilestoneRepository.existsById(id)) {
                projectMilestoneRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('STUDENT') and @projectMilestoneController.isMilestoneOwner(#id, authentication)")
    public ResponseEntity<ProjectMilestone> completeMilestone(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<ProjectMilestone> milestoneOpt = projectMilestoneRepository.findById(id);
            
            if (!milestoneOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectMilestone milestone = milestoneOpt.get();
            milestone.setStatus("Completed");
            milestone.setCompletionDate(LocalDate.now());
            milestone.setProgressPercentage(100.0);
            
            ProjectMilestone updatedMilestone = projectMilestoneRepository.save(milestone);
            return ResponseEntity.ok(updatedMilestone);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> getMilestonesByStatus(@PathVariable String status) {
        try {
            List<ProjectMilestone> milestones = projectMilestoneRepository.findByStatus(status);
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> getMilestonesByPriority(@PathVariable String priority) {
        try {
            List<ProjectMilestone> milestones = projectMilestoneRepository.findByPriority(priority);
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> getOverdueMilestones() {
        try {
            List<ProjectMilestone> milestones = projectMilestoneRepository.findOverdueMilestones(LocalDate.now());
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/due-soon")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> getMilestonesDueSoon() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate oneWeekFromNow = now.plusWeeks(1);
            List<ProjectMilestone> milestones = projectMilestoneRepository.findMilestonesDueSoon(now, oneWeekFromNow);
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<ProjectMilestone>> searchMilestones(@RequestParam String keyword) {
        try {
            List<ProjectMilestone> milestones = projectMilestoneRepository.searchMilestones(keyword);
            return ResponseEntity.ok(milestones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/project/{projectId}/statistics/progress")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @projectMilestoneController.isProjectOwner(#projectId, authentication))")
    public ResponseEntity<Double> getProjectMilestonesProgress(@PathVariable Long projectId, Authentication authentication) {
        try {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Double averageProgress = projectMilestoneRepository.getAverageProgressByProject(projectOpt.get());
            return ResponseEntity.ok(averageProgress != null ? averageProgress : 0.0);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/project/{projectId}/statistics/completion")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @projectMilestoneController.isProjectOwner(#projectId, authentication))")
    public ResponseEntity<Double> getProjectCompletionRate(@PathVariable Long projectId, Authentication authentication) {
        try {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            
            if (!projectOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Long totalMilestones = projectMilestoneRepository.countTotalMilestonesByProject(projectOpt.get());
            Long completedMilestones = projectMilestoneRepository.countCompletedMilestonesByProject(projectOpt.get());
            
            if (totalMilestones == null || totalMilestones == 0) {
                return ResponseEntity.ok(0.0);
            }
            
            double completionRate = (completedMilestones != null ? completedMilestones.doubleValue() : 0.0) / totalMilestones.doubleValue() * 100.0;
            return ResponseEntity.ok(completionRate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statuses")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllStatuses() {
        try {
            List<String> statuses = projectMilestoneRepository.findAllStatuses();
            return ResponseEntity.ok(statuses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/priorities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllPriorities() {
        try {
            List<String> priorities = projectMilestoneRepository.findAllPriorities();
            return ResponseEntity.ok(priorities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper methods for security
    public boolean isMilestoneOwner(Long milestoneId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return false;
            }
            
            Optional<ProjectMilestone> milestoneOpt = projectMilestoneRepository.findById(milestoneId);
            
            if (!milestoneOpt.isPresent()) {
                return false;
            }
            
            return milestoneOpt.get().getProject().getStudent().getId().equals(userOpt.get().getId());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isProjectOwner(Long projectId, Authentication authentication) {
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