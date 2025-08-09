package com.pfetrack.api.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, maxAge = 3600)
@RestController
@RequestMapping("/health")
public class HealthController {
    
    @GetMapping
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend server is running");
        return response;
    }
}