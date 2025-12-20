package com.iot.water.service;

import com.iot.water.dto.device.DeviceRegisterRequest;
import com.iot.water.dto.device.DeviceResponse;
import com.iot.water.dto.device.DeviceUpdateRequest;
import com.iot.water.entity.Device;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.DeviceStatus;
import com.iot.water.entity.enums.UserRole;
import com.iot.water.exception.ResourceAlreadyExistsException;
import com.iot.water.exception.ResourceNotFoundException;
import com.iot.water.exception.UnauthorizedException;
import com.iot.water.repository.DeviceRepository;
import com.iot.water.repository.UserRepository;
import com.iot.water.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {
    
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    
    @Transactional
    public DeviceResponse registerDevice(DeviceRegisterRequest request) {
        if (deviceRepository.existsByDeviceUid(request.getDeviceUid())) {
            throw new ResourceAlreadyExistsException("Device with UID " + request.getDeviceUid() + " already exists");
        }
        
        Device device = Device.builder()
                .deviceUid(request.getDeviceUid())
                .name(request.getName())
                .location(request.getLocation())
                .model(request.getModel())
                .firmwareVersion(request.getFirmwareVersion())
                .installDate(request.getInstallDate())
                .status(request.getStatus())
                .deviceApiKey(generateApiKey())
                .build();
        
        device = deviceRepository.save(device);
        
        auditService.logAction("DEVICE_REGISTERED", "DEVICE", device.getId(), 
                "Device registered: " + device.getDeviceUid());
        
        return mapToResponse(device);
    }
    
    @Transactional
    public DeviceResponse assignDevice(Long deviceId, Long userId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        device.setOwner(user);
        device = deviceRepository.save(device);
        
        auditService.logAction("DEVICE_ASSIGNED", "DEVICE", deviceId, 
                "Device " + device.getDeviceUid() + " assigned to user " + user.getEmail());
        
        return mapToResponse(device);
    }
    
    @Transactional
    public DeviceResponse unassignDevice(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        String previousOwner = device.getOwner() != null ? device.getOwner().getEmail() : "none";
        device.setOwner(null);
        device = deviceRepository.save(device);
        
        auditService.logAction("DEVICE_UNASSIGNED", "DEVICE", deviceId, 
                "Device " + device.getDeviceUid() + " unassigned from " + previousOwner);
        
        return mapToResponse(device);
    }
    
    @Transactional(readOnly = true)
    public List<DeviceResponse> getAllDevices() {
        User currentUser = getCurrentUser();
        
        if (currentUser.getRole() == UserRole.ADMIN) {
            return deviceRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            return deviceRepository.findByOwner(currentUser).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }
    
    @Transactional(readOnly = true)
    public DeviceResponse getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN && 
            (device.getOwner() == null || !device.getOwner().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You don't have permission to access this device");
        }
        
        return mapToResponse(device);
    }
    
    @Transactional
    public DeviceResponse updateDevice(Long id, DeviceUpdateRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN && 
            (device.getOwner() == null || !device.getOwner().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You don't have permission to update this device");
        }
        
        device.setName(request.getName());
        device.setLocation(request.getLocation());
        if (request.getFirmwareVersion() != null) {
            device.setFirmwareVersion(request.getFirmwareVersion());
        }
        
        device = deviceRepository.save(device);
        
        auditService.logUserAction(currentUser.getId(), "DEVICE_UPDATED", "DEVICE", id, 
                "Device updated: " + device.getDeviceUid());
        
        return mapToResponse(device);
    }
    
    @Transactional
    public void deleteDevice(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        auditService.logAction("DEVICE_DELETED", "DEVICE", id, 
                "Device deleted: " + device.getDeviceUid());
        
        deviceRepository.delete(device);
    }
    
    @Transactional
    public void updateDeviceStatus(Long id, DeviceStatus status) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        device.setStatus(status);
        deviceRepository.save(device);
    }
    
    private DeviceResponse mapToResponse(Device device) {
        return DeviceResponse.builder()
                .id(device.getId())
                .deviceUid(device.getDeviceUid())
                .name(device.getName())
                .location(device.getLocation())
                .ownerId(device.getOwner() != null ? device.getOwner().getId() : null)
                .ownerName(device.getOwner() != null ? device.getOwner().getFullName() : null)
                .model(device.getModel())
                .firmwareVersion(device.getFirmwareVersion())
                .installDate(device.getInstallDate())
                .lastSeenAt(device.getLastSeenAt())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .updatedAt(device.getUpdatedAt())
                .build();
    }
    
    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
    
    private String generateApiKey() {
        return "dev_" + UUID.randomUUID().toString().replace("-", "");
    }
    
    public Device getDeviceEntityById(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
    }
}
