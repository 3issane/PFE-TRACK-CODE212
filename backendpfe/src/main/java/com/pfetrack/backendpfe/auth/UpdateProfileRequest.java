package com.pfetrack.backendpfe.auth;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name; // full name combined
    private String currentPassword;
    private String newPassword;
}
