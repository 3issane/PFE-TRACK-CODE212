package com.pfetrack.backendpfe.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminRepository adminRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private AdminUserDto mapAdmin(Admin a) {
        return AdminUserDto.builder()
                .id(a.getId())
                .firstName(a.getFirstName())
                .lastName(a.getLastName())
                .email(a.getEmail())
                .role(Role.ADMIN)
                .createdAt(a.getCreatedAt())
                .lastLogin(null)
                .build();
    }

    private AdminUserDto mapProfessor(Professor p) {
        return AdminUserDto.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .role(Role.PROFESSOR)
                .createdAt(p.getCreatedAt())
                .lastLogin(null)
                .build();
    }

    private AdminUserDto mapStudent(Student s) {
        return AdminUserDto.builder()
                .id(s.getId())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .role(Role.STUDENT)
                .createdAt(s.getCreatedAt())
                .lastLogin(null)
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserDto>> listAll() {
        List<AdminUserDto> result = new ArrayList<>();
        adminRepository.findAll().forEach(a -> result.add(mapAdmin(a)));
        professorRepository.findAll().forEach(p -> result.add(mapProfessor(p)));
        studentRepository.findAll().forEach(s -> result.add(mapStudent(s)));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{role}/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("role") String role,
                                       @PathVariable("id") Long id) {
        switch (role.toUpperCase()) {
            case "ADMIN" -> adminRepository.deleteById(id);
            case "PROFESSOR" -> professorRepository.deleteById(id);
            case "STUDENT" -> studentRepository.deleteById(id);
            default -> {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.noContent().build();
    }

    public record CreateUserRequest(String firstName, String lastName, String email, String password, String role) {}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDto> create(@Valid @RequestBody CreateUserRequest req) {
        String role = Optional.ofNullable(req.role()).orElse("STUDENT").toUpperCase();
        switch (role) {
            case "ADMIN": {
                Admin a = new Admin();
                a.setFirstName(req.firstName());
                a.setLastName(req.lastName());
                a.setEmail(req.email());
                if (req.password() != null && !req.password().isBlank()) {
                    a.setPassword(passwordEncoder.encode(req.password()));
                }
                Admin saved = adminRepository.save(a);
                return ResponseEntity.ok(mapAdmin(saved));
            }
            case "PROFESSOR": {
                Professor p = new Professor();
                p.setFirstName(req.firstName());
                p.setLastName(req.lastName());
                p.setEmail(req.email());
                if (req.password() != null && !req.password().isBlank()) {
                    p.setPassword(passwordEncoder.encode(req.password()));
                }
                Professor saved = professorRepository.save(p);
                return ResponseEntity.ok(mapProfessor(saved));
            }
            case "STUDENT":
            default: {
                Student s = new Student();
                s.setFirstName(req.firstName());
                s.setLastName(req.lastName());
                s.setEmail(req.email());
                if (req.password() != null && !req.password().isBlank()) {
                    s.setPassword(passwordEncoder.encode(req.password()));
                }
                Student saved = studentRepository.save(s);
                return ResponseEntity.ok(mapStudent(saved));
            }
        }
    }

    public record UpdateUserRequest(String firstName, String lastName, String email, String password) {}

    @PutMapping("/{role}/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDto> update(@PathVariable("role") String role,
                                               @PathVariable("id") Long id,
                                               @Valid @RequestBody UpdateUserRequest req) {
        switch (role.toUpperCase()) {
            case "ADMIN": {
                return adminRepository.findById(id)
                        .map(a -> {
                            if (req.firstName() != null) a.setFirstName(req.firstName());
                            if (req.lastName() != null) a.setLastName(req.lastName());
                            if (req.email() != null) a.setEmail(req.email());
                            if (req.password() != null && !req.password().isBlank()) {
                                a.setPassword(passwordEncoder.encode(req.password()));
                            }
                            return ResponseEntity.ok(mapAdmin(adminRepository.save(a)));
                        })
                        .orElse(ResponseEntity.notFound().build());
            }
            case "PROFESSOR": {
                return professorRepository.findById(id)
                        .map(p -> {
                            if (req.firstName() != null) p.setFirstName(req.firstName());
                            if (req.lastName() != null) p.setLastName(req.lastName());
                            if (req.email() != null) p.setEmail(req.email());
                            if (req.password() != null && !req.password().isBlank()) {
                                p.setPassword(passwordEncoder.encode(req.password()));
                            }
                            return ResponseEntity.ok(mapProfessor(professorRepository.save(p)));
                        })
                        .orElse(ResponseEntity.notFound().build());
            }
            case "STUDENT":
            default: {
                return studentRepository.findById(id)
                        .map(s -> {
                            if (req.firstName() != null) s.setFirstName(req.firstName());
                            if (req.lastName() != null) s.setLastName(req.lastName());
                            if (req.email() != null) s.setEmail(req.email());
                            if (req.password() != null && !req.password().isBlank()) {
                                s.setPassword(passwordEncoder.encode(req.password()));
                            }
                            return ResponseEntity.ok(mapStudent(studentRepository.save(s)));
                        })
                        .orElse(ResponseEntity.notFound().build());
            }
        }
    }
}
