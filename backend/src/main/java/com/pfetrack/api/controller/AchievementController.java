package com.pfetrack.api.controller;

import com.pfetrack.api.model.Achievement;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.AchievementRepository;
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
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AchievementController {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        try {
            List<Achievement> achievements = achievementRepository.findAll();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-achievements")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Achievement>> getMyAchievements(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Achievement> achievements = achievementRepository.findByStudentOrderByAchievementDateDesc(userOpt.get());
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-achievements/recent")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Achievement>> getMyRecentAchievements(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Achievement> achievements = achievementRepository.findRecentAchievementsByStudent(userOpt.get());
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-achievements/points")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Integer> getMyTotalPoints(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Integer totalPoints = achievementRepository.getTotalPointsByStudent(userOpt.get());
            return ResponseEntity.ok(totalPoints != null ? totalPoints : 0);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-achievements/type/{type}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Achievement>> getMyAchievementsByType(@PathVariable String type, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Achievement> achievements = achievementRepository.findByStudentAndTypeOrderByAchievementDateDesc(userOpt.get(), type);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-achievements/category/{category}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Achievement>> getMyAchievementsByCategory(@PathVariable String category, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Achievement> achievements = achievementRepository.findByStudentAndCategoryOrderByAchievementDateDesc(userOpt.get(), category);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @achievementController.isOwner(#id, authentication))")
    public ResponseEntity<Achievement> getAchievementById(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<Achievement> achievementOpt = achievementRepository.findById(id);
            
            if (achievementOpt.isPresent()) {
                return ResponseEntity.ok(achievementOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Achievement> createAchievement(@RequestBody Achievement achievement, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            achievement.setStudent(userOpt.get());
            achievement.setStatus("Pending"); // Default status for student-created achievements
            
            Achievement savedAchievement = achievementRepository.save(achievement);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAchievement);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @achievementController.isOwner(#id, authentication) or hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Achievement> updateAchievement(@PathVariable Long id, @RequestBody Achievement achievementDetails, Authentication authentication) {
        try {
            Optional<Achievement> achievementOpt = achievementRepository.findById(id);
            
            if (!achievementOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Achievement achievement = achievementOpt.get();
            
            // Update fields
            if (achievementDetails.getTitle() != null) achievement.setTitle(achievementDetails.getTitle());
            if (achievementDetails.getDescription() != null) achievement.setDescription(achievementDetails.getDescription());
            if (achievementDetails.getType() != null) achievement.setType(achievementDetails.getType());
            if (achievementDetails.getIssuingOrganization() != null) achievement.setIssuingOrganization(achievementDetails.getIssuingOrganization());
            if (achievementDetails.getAchievementDate() != null) achievement.setAchievementDate(achievementDetails.getAchievementDate());
            if (achievementDetails.getCertificateUrl() != null) achievement.setCertificateUrl(achievementDetails.getCertificateUrl());
            if (achievementDetails.getVerificationUrl() != null) achievement.setVerificationUrl(achievementDetails.getVerificationUrl());
            if (achievementDetails.getCategory() != null) achievement.setCategory(achievementDetails.getCategory());
            if (achievementDetails.getIsPublic() != null) achievement.setIsPublic(achievementDetails.getIsPublic());
            if (achievementDetails.getExpiryDate() != null) achievement.setExpiryDate(achievementDetails.getExpiryDate());
            if (achievementDetails.getAdditionalDetails() != null) achievement.setAdditionalDetails(achievementDetails.getAdditionalDetails());
            
            // Only admins and professors can update status and points
            if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PROFESSOR"))) {
                if (achievementDetails.getStatus() != null) achievement.setStatus(achievementDetails.getStatus());
                if (achievementDetails.getPointsAwarded() != null) achievement.setPointsAwarded(achievementDetails.getPointsAwarded());
            }
            
            Achievement updatedAchievement = achievementRepository.save(achievement);
            return ResponseEntity.ok(updatedAchievement);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @achievementController.isOwner(#id, authentication) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAchievement(@PathVariable Long id, Authentication authentication) {
        try {
            if (achievementRepository.existsById(id)) {
                achievementRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<Achievement> verifyAchievement(@PathVariable Long id) {
        try {
            Optional<Achievement> achievementOpt = achievementRepository.findById(id);
            
            if (!achievementOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Achievement achievement = achievementOpt.get();
            achievement.setStatus("Verified");
            
            Achievement updatedAchievement = achievementRepository.save(achievement);
            return ResponseEntity.ok(updatedAchievement);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Achievement>> getAchievementsByStudent(@PathVariable Long studentId) {
        try {
            Optional<User> studentOpt = userRepository.findById(studentId);
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            List<Achievement> achievements = achievementRepository.findByStudentOrderByAchievementDateDesc(studentOpt.get());
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Achievement>> getAchievementsByType(@PathVariable String type) {
        try {
            List<Achievement> achievements = achievementRepository.findByTypeOrderByAchievementDateDesc(type);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Achievement>> getAchievementsByCategory(@PathVariable String category) {
        try {
            List<Achievement> achievements = achievementRepository.findByCategoryOrderByAchievementDateDesc(category);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<Achievement>> getPublicAchievements() {
        try {
            List<Achievement> achievements = achievementRepository.findPublicAchievements();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<Achievement>> searchAchievements(@RequestParam String keyword) {
        try {
            List<Achievement> achievements = achievementRepository.searchAchievements(keyword);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/types")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllTypes() {
        try {
            List<String> types = achievementRepository.findAllTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/categories")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = achievementRepository.findAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method for security
    public boolean isOwner(Long achievementId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return false;
            }
            
            Optional<Achievement> achievementOpt = achievementRepository.findById(achievementId);
            
            if (!achievementOpt.isPresent()) {
                return false;
            }
            
            return achievementOpt.get().getStudent().getId().equals(userOpt.get().getId());
        } catch (Exception e) {
            return false;
        }
    }
}