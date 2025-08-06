package com.pfetrack.api.controller;

import com.pfetrack.api.model.Report;
import com.pfetrack.api.model.User;
import com.pfetrack.api.repository.ReportRepository;
import com.pfetrack.api.repository.UserRepository;
import com.pfetrack.api.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, maxAge = 3600)
@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Report>> getMyReports(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Report> reports = reportRepository.findReportsWithFilters(
            userOpt.get(), keyword, type, status);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    public ResponseEntity<List<Report>> getAllReports(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        
        List<Report> reports = reportRepository.findAllReportsWithFilters(keyword, type, status);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id, Authentication authentication) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Report report = reportOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Students can only view their own reports
        if (userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT"))) {
            if (!report.getStudent().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        return ResponseEntity.ok(report);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Report> createReport(@RequestBody Report report, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        report.setStudent(userOpt.get());
        Report savedReport = reportRepository.save(report);
        return ResponseEntity.ok(savedReport);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, 
                                              @RequestBody Report reportDetails,
                                              Authentication authentication) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Report report = reportOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Students can only update their own reports
        if (!report.getStudent().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Only allow updates if report is in Draft status
        if (!"Draft".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body(null);
        }
        
        report.setTitle(reportDetails.getTitle());
        report.setDescription(reportDetails.getDescription());
        report.setType(reportDetails.getType());
        
        Report updatedReport = reportRepository.save(report);
        return ResponseEntity.ok(updatedReport);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createReportWithFile(@RequestParam("title") String title,
                                                  @RequestParam("type") String type,
                                                  @RequestParam("description") String description,
                                                  @RequestParam("file") MultipartFile file,
                                                  Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<User> userOpt = userRepository.findById(userDetails.getId());
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Create report first
            Report report = new Report();
            report.setTitle(title);
            report.setType(type);
            report.setDescription(description);
            report.setStudent(userOpt.get());
            report.setStatus("Draft");
            
            // Create type-specific upload directory
            Path typeDir = Paths.get(uploadDir, type.replaceAll("[^a-zA-Z0-9\\s]", ""));
            if (!Files.exists(typeDir)) {
                Files.createDirectories(typeDir);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            
            // Save file in type-specific directory
            Path filePath = typeDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update report with file information
            report.setFileName(originalFilename);
            report.setFilePath(filePath.toString());
            report.setFileSize(file.getSize());
            
            Report savedReport = reportRepository.save(report);
            
            return ResponseEntity.ok(savedReport);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadReportFile(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file,
                                             Authentication authentication) {
        try {
            Optional<Report> reportOpt = reportRepository.findById(id);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Report report = reportOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Students can only upload to their own reports
            if (!report.getStudent().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Create type-specific upload directory
            String reportType = report.getType() != null ? report.getType() : "General";
            Path typeDir = Paths.get(uploadDir, reportType.replaceAll("[^a-zA-Z0-9\\s]", ""));
            if (!Files.exists(typeDir)) {
                Files.createDirectories(typeDir);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            
            // Save file in type-specific directory
            Path filePath = typeDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update report with file information
            report.setFileName(originalFilename);
            report.setFilePath(filePath.toString());
            report.setFileSize(file.getSize());
            
            reportRepository.save(report);
            
            return ResponseEntity.ok().body("File uploaded successfully");
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadReportFile(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<Report> reportOpt = reportRepository.findById(id);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Report report = reportOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Students can only download their own reports
            if (userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT"))) {
                if (!report.getStudent().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
            
            if (report.getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = Paths.get(report.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + report.getFileName() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitReport(@PathVariable Long id, Authentication authentication) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Report report = reportOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Students can only submit their own reports
        if (!report.getStudent().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Only allow submission if report is in Draft status
        if (!"Draft".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body("Report is not in draft status");
        }
        
        report.setStatus("Submitted");
        report.setSubmittedAt(LocalDateTime.now());
        reportRepository.save(report);
        
        return ResponseEntity.ok().body("Report submitted successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> deleteReport(@PathVariable Long id, Authentication authentication) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Report report = reportOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Students can only delete their own reports
        if (!report.getStudent().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Only allow deletion if report is in Draft status
        if (!"Draft".equals(report.getStatus())) {
            return ResponseEntity.badRequest().body("Cannot delete submitted report");
        }
        
        // Delete file if exists
        if (report.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(report.getFilePath()));
            } catch (IOException e) {
                // Log error but continue with report deletion
            }
        }
        
        reportRepository.deleteById(id);
        return ResponseEntity.ok().body("Report deleted successfully");
    }
}