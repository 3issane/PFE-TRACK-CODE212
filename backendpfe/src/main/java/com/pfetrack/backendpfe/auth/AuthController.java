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
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import com.pfetrack.backendpfe.user.Student;
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

    private final PasswordResetTokenRepository resetRepo;

    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, StudentRepository studentRepo, AdminRepository adminRepo, ProfessorRepository professorRepo, PasswordEncoder passwordEncoder, PasswordResetTokenRepository resetRepo, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.studentRepo = studentRepo;
        this.adminRepo = adminRepo;
        this.professorRepo = professorRepo;
        this.passwordEncoder = passwordEncoder;
        this.resetRepo = resetRepo;
        this.emailService = emailService;
    }

    @Value("${google.client.id:}")
    private String googleClientId;

    @GetMapping("/google-client-id")
    public ResponseEntity<Map<String,String>> getGoogleClientId() {
        return ResponseEntity.ok(Map.of("clientId", googleClientId == null ? "" : googleClientId));
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

    public record GoogleLoginRequest(String idToken) {}

    public record ForgotPasswordRequest(String email) {}
    public record VerifyCodeRequest(String email, String code) {}
    public record ResetPasswordRequest(String email, String code, String newPassword) {}

    public record EmailExistsResponse(boolean exists) {}

    @GetMapping("/email-exists")
    public ResponseEntity<EmailExistsResponse> emailExists(@RequestParam("email") String email) {
        if (email == null || email.isBlank()) return ResponseEntity.ok(new EmailExistsResponse(false));
        String e = email.trim().toLowerCase();
        boolean exists = studentRepo.findByEmail(e).isPresent(); // only students per requirement
        return ResponseEntity.ok(new EmailExistsResponse(exists));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest req) {
        if (req == null || req.idToken()==null || req.idToken().isBlank()) {
            return ResponseEntity.badRequest().body("Missing idToken");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            return ResponseEntity.status(500).body("Google client id not configured");
        }
        try {
            var http = GoogleNetHttpTransport.newTrustedTransport();
            var json = GsonFactory.getDefaultInstance();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(http, json)
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(req.idToken());
            if (idToken == null) return ResponseEntity.status(401).body("Invalid Google token");
            var payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            // Ensure user exists (auto-provision as STUDENT if new)
            Role role;
            if (studentRepo.findByEmail(email).isEmpty() && adminRepo.findByEmail(email).isEmpty() && professorRepo.findByEmail(email).isEmpty()) {
                // create student
                String firstName = name != null ? name.split(" ",2)[0] : "";
                String lastName = name != null && name.contains(" ") ? name.substring(name.indexOf(' ')+1) : "";
                Student s = Student.builder().email(email).firstName(firstName).lastName(lastName).password(passwordEncoder.encode(java.util.UUID.randomUUID().toString())).build();
                studentRepo.save(s);
            }
            // Determine role
            if (adminRepo.findByEmail(email).isPresent()) role = Role.ADMIN;
            else if (professorRepo.findByEmail(email).isPresent()) role = Role.PROFESSOR;
            else role = Role.STUDENT;
            Map<String,Object> claims = new HashMap<>();
            claims.put("role", role.name());
            // Build minimal UserDetails-like principal for token gen
            org.springframework.security.core.userdetails.User principal = new org.springframework.security.core.userdetails.User(email, "", java.util.List.of());
            String token = jwtService.generateToken(principal, claims);
            Long id = null; String displayName = name!=null? name: "";
            switch (role) {
                case STUDENT -> id = studentRepo.findByEmail(email).map(Student::getId).orElse(null);
                case ADMIN -> id = adminRepo.findByEmail(email).map(a->a.getId()).orElse(null);
                case PROFESSOR -> id = professorRepo.findByEmail(email).map(p->p.getId()).orElse(null);
            }
            return ResponseEntity.ok(AuthResponse.builder().token(token).role(role).id(id).name(displayName).build());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Google verification error");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req == null || req.email()==null || req.email().isBlank()) return ResponseEntity.badRequest().body("Email required");
        String email = req.email().trim().toLowerCase();
        boolean exists = studentRepo.findByEmail(email).isPresent() || adminRepo.findByEmail(email).isPresent() || professorRepo.findByEmail(email).isPresent();
        if (!exists) return ResponseEntity.ok(Map.of("sent", true)); // do not reveal
        // generate 6-digit code
        String code = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        // expire in 10 minutes
        java.time.Instant expires = java.time.Instant.now().plusSeconds(600);
        PasswordResetToken token = PasswordResetToken.builder().email(email).code(code).expiresAt(expires).used(false).build();
        resetRepo.save(token);
        // TODO: send email (placeholder log)
    log.info("Issuing password reset code email={} code={}", email, code);
    emailService.sendPasswordCode(email, code);
        return ResponseEntity.ok(Map.of("sent", true));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest req) {
        if (req==null || req.email()==null || req.code()==null) return ResponseEntity.badRequest().body("Invalid");
        var opt = resetRepo.findFirstByEmailAndCodeAndUsedFalseAndExpiresAtAfter(req.email().toLowerCase(), req.code(), java.time.Instant.now());
        if (opt.isEmpty()) return ResponseEntity.status(400).body("Invalid code");
        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req==null || req.email()==null || req.code()==null || req.newPassword()==null || req.newPassword().length()<6) return ResponseEntity.badRequest().body("Invalid");
        var opt = resetRepo.findFirstByEmailAndCodeAndUsedFalseAndExpiresAtAfter(req.email().toLowerCase(), req.code(), java.time.Instant.now());
        if (opt.isEmpty()) return ResponseEntity.status(400).body("Invalid code");
        String email = req.email().toLowerCase();
        // update password in whichever repository contains the user
        studentRepo.findByEmail(email).ifPresent(u->{ u.setPassword(passwordEncoder.encode(req.newPassword())); studentRepo.save(u); });
        adminRepo.findByEmail(email).ifPresent(u->{ u.setPassword(passwordEncoder.encode(req.newPassword())); adminRepo.save(u); });
        professorRepo.findByEmail(email).ifPresent(u->{ u.setPassword(passwordEncoder.encode(req.newPassword())); professorRepo.save(u); });
        var token = opt.get(); token.setUsed(true); resetRepo.save(token);
        return ResponseEntity.ok(Map.of("reset", true));
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
