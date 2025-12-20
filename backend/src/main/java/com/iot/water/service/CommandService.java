package com.iot.water.service;

import com.iot.water.dto.command.CommandAckRequest;
import com.iot.water.dto.command.CommandRequest;
import com.iot.water.dto.command.CommandResponse;
import com.iot.water.entity.Command;
import com.iot.water.entity.Device;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.CommandStatus;
import com.iot.water.entity.enums.UserRole;
import com.iot.water.exception.ResourceNotFoundException;
import com.iot.water.exception.UnauthorizedException;
import com.iot.water.repository.CommandRepository;
import com.iot.water.repository.DeviceRepository;
import com.iot.water.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommandService {
    
    private final CommandRepository commandRepository;
    private final DeviceRepository deviceRepository;
    
    @Transactional
    public CommandResponse createCommand(Long deviceId, CommandRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        User currentUser = getCurrentUser();
        validateDeviceAccess(device, currentUser);
        
        Command command = Command.builder()
                .device(device)
                .requestedByUser(currentUser)
                .type(request.getType())
                .payloadJson(request.getPayload())
                .status(CommandStatus.PENDING)
                .correlationId(generateCorrelationId())
                .requestedAt(LocalDateTime.now())
                .build();
        
        command = commandRepository.save(command);
        
        return mapToResponse(command);
    }
    
    @Transactional(readOnly = true)
    public List<CommandResponse> getDeviceCommands(Long deviceId, CommandStatus status) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        User currentUser = getCurrentUser();
        validateDeviceAccess(device, currentUser);
        
        List<Command> commands;
        if (status != null) {
            commands = commandRepository.findByDeviceAndStatusOrderByRequestedAtDesc(device, status);
        } else {
            commands = commandRepository.findByDeviceOrderByRequestedAtDesc(device);
        }
        
        return commands.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public List<CommandResponse> pollCommands(String deviceUid, String apiKey) {
        Device device = deviceRepository.findByDeviceUid(deviceUid)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        if (!device.getDeviceApiKey().equals(apiKey)) {
            throw new UnauthorizedException("Invalid device API key");
        }
        
        List<Command> pendingCommands = commandRepository.findPendingCommandsByDeviceUid(
                deviceUid, CommandStatus.PENDING);
        
        // Mark commands as SENT
        for (Command command : pendingCommands) {
            command.setStatus(CommandStatus.SENT);
            command.setSentAt(LocalDateTime.now());
            commandRepository.save(command);
        }
        
        return pendingCommands.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void acknowledgeCommand(CommandAckRequest request) {
        Command command = commandRepository.findByCorrelationId(request.getCorrelationId())
                .orElseThrow(() -> new ResourceNotFoundException("Command not found"));
        
        if (request.isSuccess()) {
            command.setStatus(CommandStatus.ACK);
            command.setAckAt(LocalDateTime.now());
        } else {
            command.setStatus(CommandStatus.FAILED);
            command.setFailureReason(request.getMessage());
        }
        
        commandRepository.save(command);
    }
    
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void expireOldCommands() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<Command> expiredCommands = commandRepository.findExpiredCommands(
                CommandStatus.PENDING, threshold);
        
        for (Command command : expiredCommands) {
            command.setStatus(CommandStatus.EXPIRED);
            command.setFailureReason("Command expired after 30 minutes");
            commandRepository.save(command);
        }
    }
    
    private void validateDeviceAccess(Device device, User user) {
        if (user.getRole() != UserRole.ADMIN && 
            (device.getOwner() == null || !device.getOwner().getId().equals(user.getId()))) {
            throw new UnauthorizedException("You don't have permission to control this device");
        }
    }
    
    private CommandResponse mapToResponse(Command command) {
        return CommandResponse.builder()
                .id(command.getId())
                .deviceId(command.getDevice().getId())
                .deviceName(command.getDevice().getName())
                .requestedByUserId(command.getRequestedByUser().getId())
                .requestedByUserName(command.getRequestedByUser().getFullName())
                .type(command.getType())
                .payload(command.getPayloadJson())
                .status(command.getStatus())
                .correlationId(command.getCorrelationId())
                .requestedAt(command.getRequestedAt())
                .sentAt(command.getSentAt())
                .ackAt(command.getAckAt())
                .failureReason(command.getFailureReason())
                .build();
    }
    
    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
    
    private String generateCorrelationId() {
        return "cmd_" + UUID.randomUUID().toString().replace("-", "");
    }
}
