package com.pfetrack.backendpfe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {
    // Intentionally left minimal since SecurityConfig supplies the active CorsConfigurationSource.
    // You can remove this class entirely if not adding further customization later.
}
