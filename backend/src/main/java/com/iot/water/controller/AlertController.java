package com.iot.water.controller;

import com.iot.water.dto.alert.AlertResponse;
import com.iot.water.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Alerts", description = "User alerts and notifications")
public class AlertController {
    
    private final AlertService alertService;
    
    @GetMapping
    @Operation(summary = "Get user alerts")
    public ResponseEntity<List<AlertResponse>> getUserAlerts(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        return ResponseEntity.ok(alertService.getUserAlerts(isRead, limit));
    }
    
    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread alerts")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", alertService.getUnreadCount()));
    }
    
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark alert as read")
    public ResponseEntity<AlertResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }
    
    @PutMapping("/read-all")
    @Operation(summary = "Mark all alerts as read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        alertService.markAllAsRead();
        return ResponseEntity.ok(Map.of("status", "success", "message", "All alerts marked as read"));
    }
}
