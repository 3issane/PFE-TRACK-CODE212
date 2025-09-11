package com.pfetrack.backendpfe.auth;

import com.pfetrack.backendpfe.security.JwtService;
import com.pfetrack.backendpfe.user.AdminRepository;
import com.pfetrack.backendpfe.user.ProfessorRepository;
import com.pfetrack.backendpfe.user.Role;
import com.pfetrack.backendpfe.user.Student;
import com.pfetrack.backendpfe.user.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final StudentRepository studentRepo;
    private final AdminRepository adminRepo;
    private final ProfessorRepository professorRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, StudentRepository studentRepo, AdminRepository adminRepo, ProfessorRepository professorRepo, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.studentRepo = studentRepo;
        this.adminRepo = adminRepo;
        this.professorRepo = professorRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        UserDetails user = (UserDetails) auth.getPrincipal();
        String email = user.getUsername();
        Role role = resolveRole(email);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role.name());
        String token = jwtService.generateToken(user, claims);

        Long id = null;
        String name = "";
        switch (role) {
            case STUDENT -> {
                var opt = studentRepo.findByEmail(email); if (opt.isPresent()) { id = opt.get().getId(); name = (opt.get().getFirstName()+" "+opt.get().getLastName()).trim(); }
            }
            case ADMIN -> {
                var opt = adminRepo.findByEmail(email); if (opt.isPresent()) { id = opt.get().getId(); name = (opt.get().getFirstName()+" "+opt.get().getLastName()).trim(); }
            }
            case PROFESSOR -> {
                var opt = professorRepo.findByEmail(email); if (opt.isPresent()) { id = opt.get().getId(); name = (opt.get().getFirstName()+" "+opt.get().getLastName()).trim(); }
            }
        }

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .role(role)
                .id(id)
                .name(name)
                .build());
    }

    private Role resolveRole(String email) {
        if (studentRepo.findByEmail(email).isPresent()) return Role.STUDENT;
        if (adminRepo.findByEmail(email).isPresent()) return Role.ADMIN;
        if (professorRepo.findByEmail(email).isPresent()) return Role.PROFESSOR;
        throw new IllegalStateException("Role not found for user");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        // Only students can sign up via public endpoint
        if (studentRepo.findByEmail(request.getEmail()).isPresent()
                || adminRepo.findByEmail(request.getEmail()).isPresent()
                || professorRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        Student s = Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        studentRepo.save(s);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Role role = resolveRole(email);
        String name = studentRepo.findByEmail(email).map(s -> s.getFirstName() + " " + s.getLastName())
                .or(() -> adminRepo.findByEmail(email).map(a -> a.getFirstName() + " " + a.getLastName()))
                .or(() -> professorRepo.findByEmail(email).map(p -> p.getFirstName() + " " + p.getLastName()))
                .orElse("");
        return ResponseEntity.ok(UserProfileResponse.builder()
                .email(email)
                .name(name)
                .role(role)
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody(required = false) UpdateProfileRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Role role = resolveRole(email);
        if (request == null) {
            log.warn("Update profile called with null body user={} role={}", email, role);
            return ResponseEntity.badRequest().body("Empty body");
        }
        log.debug("Update profile start user={} role={} name={} changePwd={} ", email, role, request.getName(), request.getNewPassword()!=null);
        // Update name & password depending on role repository
        switch (role) {
            case STUDENT -> {
                var opt = studentRepo.findByEmail(email);
                if (opt.isEmpty()) return ResponseEntity.notFound().build();
                var s = opt.get();
                applyNameSplitIfPresent(s, request.getName());
                if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                    if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), s.getPassword())) {
                        log.debug("Invalid current password for user={} role=STUDENT", email);
                        return ResponseEntity.status(400).body("Invalid current password");
                    }
                    s.setPassword(passwordEncoder.encode(request.getNewPassword()));
                }
                studentRepo.save(s);
            }
            case ADMIN -> {
                var opt = adminRepo.findByEmail(email);
                if (opt.isEmpty()) return ResponseEntity.notFound().build();
                var a = opt.get();
                applyNameSplitIfPresent(a, request.getName());
                if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                    if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), a.getPassword())) {
                        log.debug("Invalid current password for user={} role=ADMIN", email);
                        return ResponseEntity.status(400).body("Invalid current password");
                    }
                    a.setPassword(passwordEncoder.encode(request.getNewPassword()));
                }
                adminRepo.save(a);
            }
            case PROFESSOR -> {
                var opt = professorRepo.findByEmail(email);
                if (opt.isEmpty()) return ResponseEntity.notFound().build();
                var p = opt.get();
                applyNameSplitIfPresent(p, request.getName());
                if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                    if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), p.getPassword())) {
                        log.debug("Invalid current password for user={} role=PROFESSOR", email);
                        return ResponseEntity.status(400).body("Invalid current password");
                    }
                    p.setPassword(passwordEncoder.encode(request.getNewPassword()));
                }
                professorRepo.save(p);
            }
        }
        log.debug("Update profile success user={} role={}", email, role);
        return ResponseEntity.ok().build();
    }

    private void applyNameSplitIfPresent(Object entity, String fullName) {
        if (fullName == null || fullName.isBlank()) return;
        String[] parts = fullName.trim().split("\\s+", 2);
        String first = parts[0];
        String last = parts.length > 1 ? parts[1] : "";
        try {
            entity.getClass().getMethod("setFirstName", String.class).invoke(entity, first);
            entity.getClass().getMethod("setLastName", String.class).invoke(entity, last);
        } catch (Exception ignored) {}
    }
}
