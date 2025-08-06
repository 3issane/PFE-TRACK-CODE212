package com.pfetrack.api.controller;

import com.pfetrack.api.model.StudentProfile;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.StudentProfileRepository;
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
@RequestMapping("/api/student-profiles")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<StudentProfile>> getAllProfiles() {
        try {
            List<StudentProfile> profiles = studentProfileRepository.findAll();
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfile> getMyProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUser(userOpt.get());
            
            if (profileOpt.isPresent()) {
                return ResponseEntity.ok(profileOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or (hasRole('STUDENT') and @studentProfileController.isOwner(#id, authentication))")
    public ResponseEntity<StudentProfile> getProfileById(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<StudentProfile> profileOpt = studentProfileRepository.findById(id);
            
            if (profileOpt.isPresent()) {
                return ResponseEntity.ok(profileOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfile> createProfile(@RequestBody StudentProfile profile, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            
            // Check if profile already exists
            Optional<StudentProfile> existingProfile = studentProfileRepository.findByUser(user);
            if (existingProfile.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            profile.setUser(user);
            StudentProfile savedProfile = studentProfileRepository.save(profile);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/my-profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfile> updateMyProfile(@RequestBody StudentProfile profileDetails, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUser(userOpt.get());
            
            if (!profileOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            StudentProfile profile = profileOpt.get();
            
            // Update fields
            if (profileDetails.getStudentId() != null) profile.setStudentId(profileDetails.getStudentId());
            if (profileDetails.getDepartment() != null) profile.setDepartment(profileDetails.getDepartment());
            if (profileDetails.getAcademicYear() != null) profile.setAcademicYear(profileDetails.getAcademicYear());
            if (profileDetails.getEnrollmentDate() != null) profile.setEnrollmentDate(profileDetails.getEnrollmentDate());
            if (profileDetails.getExpectedGraduation() != null) profile.setExpectedGraduation(profileDetails.getExpectedGraduation());
            if (profileDetails.getGpa() != null) profile.setGpa(profileDetails.getGpa());
            if (profileDetails.getCreditsCompleted() != null) profile.setCreditsCompleted(profileDetails.getCreditsCompleted());
            if (profileDetails.getTotalCreditsRequired() != null) profile.setTotalCreditsRequired(profileDetails.getTotalCreditsRequired());
            if (profileDetails.getPhone() != null) profile.setPhone(profileDetails.getPhone());
            if (profileDetails.getAddress() != null) profile.setAddress(profileDetails.getAddress());
            if (profileDetails.getBio() != null) profile.setBio(profileDetails.getBio());
            if (profileDetails.getProfilePictureUrl() != null) profile.setProfilePictureUrl(profileDetails.getProfilePictureUrl());
            if (profileDetails.getEmergencyContactName() != null) profile.setEmergencyContactName(profileDetails.getEmergencyContactName());
            if (profileDetails.getEmergencyContactPhone() != null) profile.setEmergencyContactPhone(profileDetails.getEmergencyContactPhone());
            
            StudentProfile updatedProfile = studentProfileRepository.save(profile);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        try {
            if (studentProfileRepository.existsById(id)) {
                studentProfileRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<StudentProfile>> getProfilesByDepartment(@PathVariable String department) {
        try {
            List<StudentProfile> profiles = studentProfileRepository.findByDepartment(department);
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/academic-year/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<StudentProfile>> getProfilesByAcademicYear(@PathVariable String year) {
        try {
            List<StudentProfile> profiles = studentProfileRepository.findByAcademicYear(year);
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<StudentProfile>> searchProfiles(@RequestParam String keyword) {
        try {
            List<StudentProfile> profiles = studentProfileRepository.searchProfiles(keyword);
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method for security
    public boolean isOwner(Long profileId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                return false;
            }
            
            Optional<StudentProfile> profileOpt = studentProfileRepository.findById(profileId);
            
            if (!profileOpt.isPresent()) {
                return false;
            }
            
            return profileOpt.get().getUser().getId().equals(userOpt.get().getId());
        } catch (Exception e) {
            return false;
        }
    }
}