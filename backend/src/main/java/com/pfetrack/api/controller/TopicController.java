package com.pfetrack.api.controller;

import com.pfetrack.api.model.Topic;
import com.pfetrack.api.model.TopicApplication;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.TopicRepository;
import com.pfetrack.api.repository.TopicApplicationRepository;
import com.pfetrack.api.repository.UserRepository;
import com.pfetrack.api.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, maxAge = 3600)
@RestController
@RequestMapping("/topics")
public class TopicController {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private TopicApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        
        List<Topic> topics;
        if (keyword != null || department != null || type != null || status != null) {
            topics = topicRepository.findTopicsWithFilters(keyword, department, type, status);
        } else {
            topics = topicRepository.findAll();
        }
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Topic>> getAvailableTopics() {
        List<Topic> topics = topicRepository.findAvailableTopics();
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        Optional<Topic> topic = topicRepository.findById(id);
        return topic.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    public ResponseEntity<Topic> createTopic(@RequestBody Topic topic) {
        Topic savedTopic = topicRepository.save(topic);
        return ResponseEntity.ok(savedTopic);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    public ResponseEntity<Topic> updateTopic(@PathVariable Long id, @RequestBody Topic topicDetails) {
        Optional<Topic> optionalTopic = topicRepository.findById(id);
        if (optionalTopic.isPresent()) {
            Topic topic = optionalTopic.get();
            topic.setTitle(topicDetails.getTitle());
            topic.setDescription(topicDetails.getDescription());
            topic.setSupervisor(topicDetails.getSupervisor());
            topic.setDepartment(topicDetails.getDepartment());
            topic.setType(topicDetails.getType());
            topic.setStatus(topicDetails.getStatus());
            topic.setMaxStudents(topicDetails.getMaxStudents());
            
            Topic updatedTopic = topicRepository.save(topic);
            return ResponseEntity.ok(updatedTopic);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        if (topicRepository.existsById(id)) {
            topicRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyToTopic(@PathVariable Long id, 
                                         @RequestBody(required = false) String motivation,
                                         Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        Optional<Topic> topicOpt = topicRepository.findById(id);
        
        if (userOpt.isEmpty() || topicOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Topic topic = topicOpt.get();
        
        // Check if already applied
        if (applicationRepository.existsByStudentAndTopic(user, topic)) {
            return ResponseEntity.badRequest().body("Already applied to this topic");
        }
        
        // Check if topic is available
        if (!topic.isAvailable()) {
            return ResponseEntity.badRequest().body("Topic is not available");
        }
        
        TopicApplication application = new TopicApplication();
        application.setStudent(user);
        application.setTopic(topic);
        application.setMotivation(motivation);
        
        applicationRepository.save(application);
        return ResponseEntity.ok().body("Application submitted successfully");
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TopicApplication>> getMyApplications(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<TopicApplication> applications = applicationRepository.findByStudent(userOpt.get());
        return ResponseEntity.ok(applications);
    }
}