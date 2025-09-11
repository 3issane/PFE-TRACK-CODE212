package com.pfetrack.backendpfe.security;

import com.pfetrack.backendpfe.user.AdminRepository;
import com.pfetrack.backendpfe.user.ProfessorRepository;
import com.pfetrack.backendpfe.user.StudentRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final StudentRepository studentRepo;
    private final AdminRepository adminRepo;
    private final ProfessorRepository profRepo;

    public CustomUserDetailsService(StudentRepository studentRepo, AdminRepository adminRepo, ProfessorRepository profRepo) {
        this.studentRepo = studentRepo;
        this.adminRepo = adminRepo;
        this.profRepo = profRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return studentRepo.findByEmail(email)
                .map(s -> new User(s.getEmail(), s.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))))
                .or(() -> adminRepo.findByEmail(email).map(a -> new User(a.getEmail(), a.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))))
                .or(() -> profRepo.findByEmail(email).map(p -> new User(p.getEmail(), p.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_PROFESSOR")))))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
