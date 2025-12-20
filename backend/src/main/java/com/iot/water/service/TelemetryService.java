package com.iot.water.service;

import com.iot.water.dto.telemetry.AggregatedReadingResponse;
import com.iot.water.dto.telemetry.ReadingResponse;
import com.iot.water.dto.telemetry.TelemetryRequest;
import com.iot.water.entity.Device;
import com.iot.water.entity.Reading;
import com.iot.water.entity.User;
import com.iot.water.entity.enums.DeviceStatus;
import com.iot.water.entity.enums.UserRole;
import com.iot.water.exception.ResourceNotFoundException;
import com.iot.water.exception.UnauthorizedException;
import com.iot.water.repository.DeviceRepository;
import com.iot.water.repository.ReadingRepository;
import com.iot.water.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {
    
    private final ReadingRepository readingRepository;
    private final DeviceRepository deviceRepository;
    private final AlertService alertService;
    
    @Transactional
    public void ingestTelemetry(TelemetryRequest request) {
        Device device = deviceRepository.findByDeviceUid(request.getDeviceUid())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + request.getDeviceUid()));
        
        // Validate API key
        if (!device.getDeviceApiKey().equals(request.getApiKey())) {
            throw new UnauthorizedException("Invalid device API key");
        }
        
        // Create reading
        Reading reading = Reading.builder()
                .device(device)
                .ts(request.getTimestamp())
                .flowRateLpm(request.getFlowRateLpm())
                .volumeLitersDelta(request.getVolumeDelta())
                .volumeLitersTotal(request.getVolumeTotal())
                .valveState(request.getValveState())
                .batteryPct(request.getBatteryPct())
                .signalRssi(request.getSignalRssi())
                .rawPayloadJson(request.getRawPayload())
                .build();
        
        readingRepository.save(reading);
        
        // Update device last seen and status
        device.setLastSeenAt(LocalDateTime.now());
        if (device.getStatus() == DeviceStatus.INACTIVE) {
            device.setStatus(DeviceStatus.ACTIVE);
        }
        deviceRepository.save(device);
        
        // Check for alerts (leak detection, low battery)
        alertService.checkAndCreateAlertsForReading(device, reading);
    }
    
    @Transactional(readOnly = true)
    public List<ReadingResponse> getReadings(Long deviceId, LocalDateTime from, LocalDateTime to, Integer limit) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        validateDeviceAccess(device);
        
        List<Reading> readings;
        if (from != null && to != null) {
            readings = readingRepository.findByDeviceIdAndTimeRange(deviceId, from, to);
        } else {
            Pageable pageable = PageRequest.of(0, limit != null ? limit : 100, Sort.by("ts").descending());
            Page<Reading> page = readingRepository.findByDeviceOrderByTsDesc(device, pageable);
            readings = page.getContent();
        }
        
        return readings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AggregatedReadingResponse> getAggregatedReadings(
            Long deviceId, 
            LocalDateTime from, 
            LocalDateTime to, 
            String granularity) {
        
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        validateDeviceAccess(device);
        
        String dateFormat;
        String granularityLower = granularity != null ? granularity.toLowerCase() : "hourly";
        switch (granularityLower) {
            case "daily":
                dateFormat = "%Y-%m-%d";
                break;
            case "monthly":
                dateFormat = "%Y-%m";
                break;
            default:
                dateFormat = "%Y-%m-%d %H:00:00"; // hourly
                break;
        }
        
        List<Object[]> results = readingRepository.getAggregatedReadings(deviceId, from, to, dateFormat);
        
        return results.stream()
                .map(row -> AggregatedReadingResponse.builder()
                        .period((String) row[0])
                        .avgFlowRate((BigDecimal) row[1])
                        .totalVolume((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getTotalConsumption(Long deviceId, LocalDateTime from, LocalDateTime to) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        
        validateDeviceAccess(device);
        
        BigDecimal total = readingRepository.sumVolumeByDeviceIdAndTimeRange(deviceId, from, to);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    private void validateDeviceAccess(Device device) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN && 
            (device.getOwner() == null || !device.getOwner().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You don't have permission to access this device data");
        }
    }
    
    private ReadingResponse mapToResponse(Reading reading) {
        return ReadingResponse.builder()
                .id(reading.getId())
                .deviceId(reading.getDevice().getId())
                .deviceName(reading.getDevice().getName())
                .timestamp(reading.getTs())
                .flowRateLpm(reading.getFlowRateLpm())
                .volumeLitersDelta(reading.getVolumeLitersDelta())
                .volumeLitersTotal(reading.getVolumeLitersTotal())
                .valveState(reading.getValveState())
                .batteryPct(reading.getBatteryPct())
                .signalRssi(reading.getSignalRssi())
                .build();
    }
    
    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
