package com.pfetrack.backendpfe.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Instant createdAt;
    private Instant lastLogin; // not tracked; left null
}
