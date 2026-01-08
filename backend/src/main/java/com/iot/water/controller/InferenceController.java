package com.iot.water.controller;

import com.iot.water.dto.inference.InferenceRequest;
import com.iot.water.dto.inference.InferenceResponse;
import com.iot.water.service.InferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Inference", description = "ML inference events")
public class InferenceController {
    
    private final InferenceService inferenceService;
    
    @PostMapping("/inferences")
    @Operation(summary = "Ingest ML inference event from device (requires device API key)")
    public ResponseEntity<Map<String, Object>> ingestInference(@Valid @RequestBody InferenceRequest request) {
        InferenceResponse response = inferenceService.ingestInference(request);
        return new ResponseEntity<>(
            Map.of("status", "success", "message", "Inference received", "inferenceId", response.getId()), 
            HttpStatus.CREATED);
    }
    
    @GetMapping("/devices/{deviceId}/inferences")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get ML inference events for a device")
    public ResponseEntity<List<InferenceResponse>> getInferences(
            @PathVariable Long deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        
        List<InferenceResponse> inferences;
        
        if (from != null && to != null) {
            inferences = inferenceService.getInferencesByDeviceAndDateRange(deviceId, from, to);
        } else {
            inferences = inferenceService.getInferencesByDevice(deviceId, limit);
        }
        
        return ResponseEntity.ok(inferences);
    }
}
