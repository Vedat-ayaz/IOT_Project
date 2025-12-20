package com.iot.water.controller;

import com.iot.water.dto.command.CommandAckRequest;
import com.iot.water.dto.command.CommandRequest;
import com.iot.water.dto.command.CommandResponse;
import com.iot.water.entity.enums.CommandStatus;
import com.iot.water.service.CommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Commands", description = "Device command management")
public class CommandController {
    
    private final CommandService commandService;
    
    @PostMapping("/devices/{deviceId}/commands")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a command for device")
    public ResponseEntity<CommandResponse> createCommand(
            @PathVariable Long deviceId,
            @Valid @RequestBody CommandRequest request) {
        return new ResponseEntity<>(commandService.createCommand(deviceId, request), HttpStatus.CREATED);
    }
    
    @GetMapping("/devices/{deviceId}/commands")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get commands for device")
    public ResponseEntity<List<CommandResponse>> getDeviceCommands(
            @PathVariable Long deviceId,
            @RequestParam(required = false) CommandStatus status) {
        return ResponseEntity.ok(commandService.getDeviceCommands(deviceId, status));
    }
    
    @PostMapping("/device/commands/poll")
    @Operation(summary = "Device polls for pending commands (requires device API key)")
    public ResponseEntity<List<CommandResponse>> pollCommands(
            @RequestParam String deviceUid,
            @RequestParam String apiKey) {
        return ResponseEntity.ok(commandService.pollCommands(deviceUid, apiKey));
    }
    
    @PostMapping("/device/commands/ack")
    @Operation(summary = "Device acknowledges command execution (requires device API key)")
    public ResponseEntity<Map<String, String>> acknowledgeCommand(@Valid @RequestBody CommandAckRequest request) {
        commandService.acknowledgeCommand(request);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Command acknowledged"));
    }
}
