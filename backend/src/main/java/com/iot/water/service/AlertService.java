package com.iot.water.service;

import com.iot.water.dto.alert.AlertResponse;
import com.iot.water.entity.Alert;
import com.iot.water.entity.Device;
import com.iot.water.entity.Reading;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.AlertSeverity;
import com.iot.water.entity.enums.AlertType;
import com.iot.water.exception.ResourceNotFoundException;
import com.iot.water.repository.AlertRepository;
import com.iot.water.repository.DeviceRepository;
import com.iot.water.repository.ReadingRepository;
import com.iot.water.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {
    
    private final AlertRepository alertRepository;
    private final DeviceRepository deviceRepository;
    private final ReadingRepository readingRepository;
    
    @Value("${alert.device-offline-minutes:60}")
    private int deviceOfflineMinutes;
    
    @Value("${alert.overconsumption-liters-daily:500}")
    private BigDecimal overconsumptionThreshold;
    
    @Value("${alert.leak-flow-rate-lpm:10.0}")
    private BigDecimal leakFlowRateThreshold;
    
    @Transactional
    public void checkAndCreateAlertsForReading(Device device, Reading reading) {
        if (device.getOwner() == null) {
            return; // No owner to alert
        }
        
        // Check for leak (high flow rate)
        if (reading.getFlowRateLpm() != null && 
            reading.getFlowRateLpm().compareTo(leakFlowRateThreshold) > 0) {
            
            // Check if we already created a leak alert recently
            List<Alert> recentLeakAlerts = alertRepository.findRecentAlertsByDeviceAndType(
                    device.getId(), AlertType.LEAK_SUSPECTED, LocalDateTime.now().minusHours(1));
            
            if (recentLeakAlerts.isEmpty()) {
                createAlert(device, device.getOwner(), AlertSeverity.CRITICAL, AlertType.LEAK_SUSPECTED,
                        "Possible leak detected! Flow rate of " + reading.getFlowRateLpm() + " L/min exceeds threshold.");
            }
        }
        
        // Check for low battery
        if (reading.getBatteryPct() != null && reading.getBatteryPct() < 20) {
            List<Alert> recentBatteryAlerts = alertRepository.findRecentAlertsByDeviceAndType(
                    device.getId(), AlertType.LOW_BATTERY, LocalDateTime.now().minusDays(1));
            
            if (recentBatteryAlerts.isEmpty()) {
                AlertSeverity severity = reading.getBatteryPct() < 10 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
                createAlert(device, device.getOwner(), severity, AlertType.LOW_BATTERY,
                        "Device battery is low: " + reading.getBatteryPct() + "%");
            }
        }
    }
    
    @Scheduled(fixedRate = 600000) // Every 10 minutes
    @Transactional
    public void checkOfflineDevices() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(deviceOfflineMinutes);
        List<Device> offlineDevices = deviceRepository.findOfflineDevices(threshold);
        
        for (Device device : offlineDevices) {
            if (device.getOwner() == null) continue;
            
            // Check if we already created an offline alert recently
            List<Alert> recentOfflineAlerts = alertRepository.findRecentAlertsByDeviceAndType(
                    device.getId(), AlertType.DEVICE_OFFLINE, LocalDateTime.now().minusHours(2));
            
            if (recentOfflineAlerts.isEmpty()) {
                createAlert(device, device.getOwner(), AlertSeverity.WARNING, AlertType.DEVICE_OFFLINE,
                        "Device has been offline for more than " + deviceOfflineMinutes + " minutes. Last seen: " + 
                        device.getLastSeenAt());
            }
        }
    }
    
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    @Transactional
    public void checkDailyConsumption() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        
        List<Device> devices = deviceRepository.findAll();
        
        for (Device device : devices) {
            if (device.getOwner() == null) continue;
            
            BigDecimal dailyConsumption = readingRepository.sumVolumeByDeviceIdAndTimeRange(
                    device.getId(), yesterday, today);
            
            if (dailyConsumption != null && dailyConsumption.compareTo(overconsumptionThreshold) > 0) {
                createAlert(device, device.getOwner(), AlertSeverity.WARNING, AlertType.OVERCONSUMPTION,
                        "High water consumption detected: " + dailyConsumption + " liters used yesterday.");
            }
        }
    }
    
    @Transactional
    public void createAlert(Device device, User user, AlertSeverity severity, AlertType type, String message) {
        Alert alert = Alert.builder()
                .device(device)
                .user(user)
                .severity(severity)
                .type(type)
                .message(message)
                .ts(LocalDateTime.now())
                .isRead(false)
                .build();
        
        alertRepository.save(alert);
    }
    
    @Transactional(readOnly = true)
    public List<AlertResponse> getUserAlerts(Boolean isRead, Integer limit) {
        User currentUser = getCurrentUser();
        
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 50, Sort.by("ts").descending());
        
        Page<Alert> alerts;
        if (isRead != null) {
            alerts = alertRepository.findByUserAndIsReadOrderByTsDesc(currentUser, isRead, pageable);
        } else {
            alerts = alertRepository.findByUserOrderByTsDesc(currentUser, pageable);
        }
        
        return alerts.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Long getUnreadCount() {
        User currentUser = getCurrentUser();
        return alertRepository.countUnreadByUserId(currentUser.getId());
    }
    
    @Transactional
    public AlertResponse markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        
        User currentUser = getCurrentUser();
        if (!alert.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Alert not found");
        }
        
        alert.setIsRead(true);
        alert = alertRepository.save(alert);
        
        return mapToResponse(alert);
    }
    
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Alert> unreadAlerts = alertRepository.findByUserAndIsReadOrderByTsDesc(currentUser, false);
        
        for (Alert alert : unreadAlerts) {
            alert.setIsRead(true);
            alertRepository.save(alert);
        }
    }
    
    private AlertResponse mapToResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .deviceId(alert.getDevice().getId())
                .deviceName(alert.getDevice().getName())
                .userId(alert.getUser().getId())
                .userName(alert.getUser().getFullName())
                .severity(alert.getSeverity())
                .type(alert.getType())
                .message(alert.getMessage())
                .timestamp(alert.getTs())
                .isRead(alert.getIsRead())
                .build();
    }
    
    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
