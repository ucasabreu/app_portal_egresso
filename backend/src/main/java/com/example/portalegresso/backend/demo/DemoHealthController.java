package com.example.portalegresso.backend.demo;

import java.util.Map;

import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@Profile("demo")
@RequiredArgsConstructor
public class DemoHealthController {
    private final ApplicationAvailability availability;
    private final JdbcTemplate jdbc;

    @GetMapping("/api/demo/health")
    public ResponseEntity<Map<String, String>> health() {
        if (availability.getReadinessState() != ReadinessState.ACCEPTING_TRAFFIC) {
            return ResponseEntity.status(503).body(Map.of("status", "starting"));
        }
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok(Map.of("status", "ok", "mode", "demo"));
        } catch (RuntimeException error) {
            return ResponseEntity.status(503).body(Map.of("status", "database-unavailable"));
        }
    }
}
