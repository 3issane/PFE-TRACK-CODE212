package com.pfetrack.backendpfe.auth;

import com.pfetrack.backendpfe.user.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Role role;
    private Long id;
    private String name;
}
