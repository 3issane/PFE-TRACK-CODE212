package com.pfetrack.backendpfe.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
// Removed fragile regex approach

@RestController
@RequestMapping("/api/ai/gemini")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.OPTIONS})
public class AiAnalysisController {

    private final ObjectMapper mapper = new ObjectMapper();
    @Value("${gemini.api.key:}")
    private String configuredKey;

    public record AnalyzeRequest(String text) {}

    @GetMapping("/status")
    public ResponseEntity<?> status(Authentication auth) {
    boolean configured = resolveApiKey() != null && !resolveApiKey().isBlank();
        return ResponseEntity.ok(Map.of(
                "configured", configured,
                "authenticated", auth != null
        ));
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody AnalyzeRequest req) {
        if (req == null || req.text() == null || req.text().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty text"));
        }
    String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "Gemini key not configured on server", "hint", "Set GEMINI_API_KEY env var before starting backend"));
        }
        String model = "gemini-1.5-flash"; // configurable if needed
        String text = req.text();
        // Truncate extremely large input (Gemini context limit safeguard)
        if (text.length() > 24000) {
            text = text.substring(0, 24000);
        }
        String prompt = "You are an academic writing assistant. Return ONLY strict JSON with keys: " +
                "orthography_score (0-100 int), clarity_score (0-100 int), structure_score (0-100 int), originality_score (0-100 int), " +
                "orthography_comment, clarity_comment, structure_comment, originality_comment, improvement_suggestions (array of short imperative strings), risk_flags (array). Text:" +
                "<<<" + text.replaceAll("[\\r\\n]+", " ") + ">>>";

        try {
            String requestJson = mapper.writeValueAsString(Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    ))
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + apiKey))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson, StandardCharsets.UTF_8))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> resp = client.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resp.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "Gemini API error", "status", resp.statusCode(), "body", resp.body()));
            }
            String body = resp.body();
            JsonNode root = mapper.readTree(body);
            // Extract first text part
            String modelText = null;
            try {
                modelText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            } catch (Exception ignored) {}
            if (modelText == null || modelText.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "No model text in response"));
            }
            Map<String,Object> parsed = extractJson(modelText);
            if (parsed == null) {
                // attempt to parse entire raw body as last resort
                parsed = extractJson(body);
            }
            if (parsed == null) {
                return ResponseEntity.ok(Map.of("raw", modelText));
            }
            // compute overall average if scores present
            double count = 0; double sum = 0;
            for (String k : List.of("orthography_score","clarity_score","structure_score","originality_score")) {
                Object v = parsed.get(k);
                if (v instanceof Number n) { sum += n.doubleValue(); count++; }
            }
            if (count > 0) parsed.put("overall_ai_score", Math.round(sum / count));
            return ResponseEntity.ok(parsed);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","AI processing failed","message", e.getMessage()));
        }
    }

    private String resolveApiKey() {
        if (configuredKey != null && !configuredKey.isBlank()) return configuredKey.trim();
        String env = System.getenv("GEMINI_API_KEY");
        return env == null || env.isBlank() ? null : env.trim();
    }

    private Map<String,Object> extractJson(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        int start = -1; int depth = 0;
        for (int i=0; i<s.length(); i++) {
            char c = s.charAt(i);
            if (c == '{') {
                if (start == -1) start = i;
                depth++;
            } else if (c == '}') {
                if (depth > 0) depth--;
                if (depth == 0 && start != -1) {
                    String candidate = s.substring(start, i+1);
                    try {
                        return mapper.readValue(candidate, Map.class);
                    } catch (Exception ignore) {
                        // continue scanning for next possible JSON object
                        start = -1; depth = 0;
                    }
                }
            }
        }
        return null;
    }
}
