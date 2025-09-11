package com.pfetrack.backendpfe.dash;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashController {
    @GetMapping("/studentdash")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> student() {
        return ResponseEntity.ok("Welcome student");
    }

    @GetMapping("/admindash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> admin() {
        return ResponseEntity.ok("Welcome admin");
    }

    @GetMapping("/professordash")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<String> professor() {
        return ResponseEntity.ok("Welcome professor");
    }
}
