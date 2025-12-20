package com.iot.water.controller;

import com.iot.water.dto.telemetry.AggregatedReadingResponse;
import com.iot.water.dto.telemetry.ReadingResponse;
import com.iot.water.dto.telemetry.TelemetryRequest;
import com.iot.water.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Telemetry", description = "Device telemetry and readings")
public class TelemetryController {
    
    private final TelemetryService telemetryService;
    
    @PostMapping("/telemetry")
    @Operation(summary = "Ingest telemetry data from device (requires device API key)")
    public ResponseEntity<Map<String, String>> ingestTelemetry(@Valid @RequestBody TelemetryRequest request) {
        telemetryService.ingestTelemetry(request);
        return new ResponseEntity<>(Map.of("status", "success", "message", "Telemetry data received"), 
                                    HttpStatus.CREATED);
    }
    
    @GetMapping("/devices/{deviceId}/readings")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get device readings with optional filters")
    public ResponseEntity<List<ReadingResponse>> getReadings(
            @PathVariable Long deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        
        return ResponseEntity.ok(telemetryService.getReadings(deviceId, from, to, limit));
    }
    
    @GetMapping("/devices/{deviceId}/readings/aggregated")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get aggregated readings (hourly/daily/monthly)")
    public ResponseEntity<List<AggregatedReadingResponse>> getAggregatedReadings(
            @PathVariable Long deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false, defaultValue = "hourly") String granularity) {
        
        return ResponseEntity.ok(telemetryService.getAggregatedReadings(deviceId, from, to, granularity));
    }
    
    @GetMapping("/devices/{deviceId}/consumption")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get total water consumption for a time period")
    public ResponseEntity<Map<String, BigDecimal>> getTotalConsumption(
            @PathVariable Long deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        
        BigDecimal total = telemetryService.getTotalConsumption(deviceId, from, to);
        return ResponseEntity.ok(Map.of("totalLiters", total));
    }
}
