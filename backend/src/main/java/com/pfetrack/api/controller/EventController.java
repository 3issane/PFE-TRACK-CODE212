package com.pfetrack.api.controller;

import com.pfetrack.api.model.Event;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.EventRepository;
import com.pfetrack.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(
            Authentication authentication,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        // Default date range: current month
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        }
        
        List<Event> events;
        if (type != null || status != null) {
            events = eventRepository.findEventsWithFilters(user, type, status, startDate, endDate);
        } else {
            events = eventRepository.findByStudentOrPublicAndDateRange(user, startDate, endDate);
        }
        
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        List<Event> events = eventRepository.findUpcomingEventsByStudentOrPublic(user);
        
        return ResponseEntity.ok(events);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Event>> getEventsByDate(
            Authentication authentication,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        List<Event> events = eventRepository.findByStudentAndEventDate(user, date);
        
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Optional<Event> eventOpt = eventRepository.findById(id);
        
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Event event = eventOpt.get();
        
        // Check if user has access to this event
        if (!event.getIsPublic() && !event.getStudent().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(event);
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        // Set the student for the event
        event.setStudent(user);
        event.setCreatedBy("student");
        
        // Validate required fields
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (event.getEventDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id, 
            @RequestBody Event eventDetails, 
            Authentication authentication) {
        
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Optional<Event> eventOpt = eventRepository.findById(id);
        
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Event event = eventOpt.get();
        
        // Check if user owns this event
        if (!event.getStudent().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Update event details
        if (eventDetails.getTitle() != null) {
            event.setTitle(eventDetails.getTitle());
        }
        if (eventDetails.getDescription() != null) {
            event.setDescription(eventDetails.getDescription());
        }
        if (eventDetails.getEventDate() != null) {
            event.setEventDate(eventDetails.getEventDate());
        }
        if (eventDetails.getEventTime() != null) {
            event.setEventTime(eventDetails.getEventTime());
        }
        if (eventDetails.getType() != null) {
            event.setType(eventDetails.getType());
        }
        if (eventDetails.getLocation() != null) {
            event.setLocation(eventDetails.getLocation());
        }
        if (eventDetails.getStatus() != null) {
            event.setStatus(eventDetails.getStatus());
        }
        
        Event updatedEvent = eventRepository.save(event);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Optional<Event> eventOpt = eventRepository.findById(id);
        
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Event event = eventOpt.get();
        
        // Check if user owns this event
        if (!event.getStudent().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        eventRepository.delete(event);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Object> getEventStatistics(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        long totalEventsCount = eventRepository.findByStudent(user).size();
        long upcomingExamsCount = eventRepository.countUpcomingEventsByStudentAndType(user, "exam");
        long upcomingPfeEventsCount = eventRepository.countUpcomingEventsByStudentAndType(user, "pfe");
        long upcomingMeetingsCount = eventRepository.countUpcomingEventsByStudentAndType(user, "meeting");
        
        return ResponseEntity.ok(new Object() {
            public final long totalEvents = totalEventsCount;
            public final long upcomingExams = upcomingExamsCount;
            public final long upcomingPfeEvents = upcomingPfeEventsCount;
            public final long upcomingMeetings = upcomingMeetingsCount;
        });
    }
}