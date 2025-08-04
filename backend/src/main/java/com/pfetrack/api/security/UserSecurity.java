package com.pfetrack.api.security;

import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.UserRepository;
import com.pfetrack.api.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {

    @Autowired
    private UserRepository userRepository;

    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userDetails.getId().equals(userId);
    }

    public boolean isCurrentUserByUsername(String username) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userDetails.getUsername().equals(username);
    }
}