package com.iot.water.controller;

import com.iot.water.dto.device.DeviceRegisterRequest;
import com.iot.water.dto.device.DeviceResponse;
import com.iot.water.dto.device.DeviceUpdateRequest;
import com.iot.water.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Devices", description = "Device management endpoints")
public class DeviceController {
    
    private final DeviceService deviceService;
    
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new device (Admin only)")
    public ResponseEntity<DeviceResponse> registerDevice(@Valid @RequestBody DeviceRegisterRequest request) {
        return new ResponseEntity<>(deviceService.registerDevice(request), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign device to user (Admin only)")
    public ResponseEntity<DeviceResponse> assignDevice(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(deviceService.assignDevice(id, userId));
    }
    
    @PutMapping("/{id}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unassign device from user (Admin only)")
    public ResponseEntity<DeviceResponse> unassignDevice(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.unassignDevice(id));
    }
    
    @GetMapping
    @Operation(summary = "Get all devices (Admin: all devices, User: only owned devices)")
    public ResponseEntity<List<DeviceResponse>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get device by ID")
    public ResponseEntity<DeviceResponse> getDeviceById(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.getDeviceById(id));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update device")
    public ResponseEntity<DeviceResponse> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody DeviceUpdateRequest request) {
        return ResponseEntity.ok(deviceService.updateDevice(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete device (Admin only)")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}
