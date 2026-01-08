package com.iot.water.service;

import com.iot.water.dto.inference.InferenceRequest;
import com.iot.water.dto.inference.InferenceResponse;
import com.iot.water.entity.Device;
import com.iot.water.entity.InferenceEvent;
import com.iot.water.exception.ResourceNotFoundException;
import com.iot.water.exception.UnauthorizedException;
import com.iot.water.repository.DeviceRepository;
import com.iot.water.repository.InferenceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InferenceService {
    
    private final InferenceEventRepository inferenceEventRepository;
    private final DeviceRepository deviceRepository;
    
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;
    
    @Transactional
    public InferenceResponse ingestInference(InferenceRequest request) {
        Device device = deviceRepository.findByDeviceUid(request.getDeviceUid())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + request.getDeviceUid()));
        
        // Validate API key
        if (!device.getDeviceApiKey().equals(request.getApiKey())) {
            throw new UnauthorizedException("Invalid device API key");
        }
        
        // Parse timestamps
        LocalDateTime eventStart = LocalDateTime.parse(
            request.getEventStart().replace("Z", ""), ISO_FORMATTER);
        LocalDateTime eventEnd = LocalDateTime.parse(
            request.getEventEnd().replace("Z", ""), ISO_FORMATTER);
        
        // Model ID lookup (optional, can be null)
        Long modelId = null;
        // TODO: Lookup model_id from ml_models table if needed
        
        // Parse valve state
        com.iot.water.entity.enums.ValveState valveState = null;
        if (request.getDecidedValveState() != null) {
            try {
                valveState = com.iot.water.entity.enums.ValveState.valueOf(request.getDecidedValveState());
            } catch (IllegalArgumentException e) {
                // Ignore invalid valve states
            }
        }
        
        // Create inference event
        InferenceEvent event = InferenceEvent.builder()
                .device(device)
                .modelId(modelId)
                .eventStartTs(eventStart)
                .eventEndTs(eventEnd)
                .durationSec(request.getDurationSec())
                .liters(request.getLiters())
                .meanFlowLpm(request.getMeanFlowLpm())
                .maxFlowLpm(request.getMaxFlowLpm())
                .predictedFixture(request.getPredictedFixture())
                .confidence(request.getConfidence())
                .decidedValveState(valveState)
                .controlProfile(request.getControlProfile())
                .decisionReason(request.getDecisionReason())
                .featuresJson(request.getFeaturesJson())
                .rawEventJson(request.getRawEventJson())
                .build();
        
        InferenceEvent saved = inferenceEventRepository.save(event);
        
        return mapToResponse(saved);
    }
    
    public List<InferenceResponse> getInferencesByDevice(Long deviceId, Integer limit) {
        List<InferenceEvent> events;
        
        if (limit != null && limit > 0) {
            events = inferenceEventRepository.findTopByDeviceIdOrderByEventStartTsDesc(deviceId, limit);
        } else {
            events = inferenceEventRepository.findByDeviceIdOrderByEventStartTsDesc(deviceId);
        }
        
        return events.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<InferenceResponse> getInferencesByDeviceAndDateRange(
            Long deviceId, LocalDateTime from, LocalDateTime to) {
        
        List<InferenceEvent> events = inferenceEventRepository
                .findByDeviceIdAndEventStartTsBetweenOrderByEventStartTsDesc(deviceId, from, to);
        
        return events.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private InferenceResponse mapToResponse(InferenceEvent event) {
        return InferenceResponse.builder()
                .id(event.getId())
                .deviceId(event.getDevice().getId())
                .deviceUid(event.getDevice().getDeviceUid())
                .modelId(event.getModelId())
                .eventStartTs(event.getEventStartTs())
                .eventEndTs(event.getEventEndTs())
                .durationSec(event.getDurationSec())
                .liters(event.getLiters())
                .meanFlowLpm(event.getMeanFlowLpm())
                .maxFlowLpm(event.getMaxFlowLpm())
                .predictedFixture(event.getPredictedFixture())
                .confidence(event.getConfidence())
                .decidedValveState(event.getDecidedValveState() != null ? event.getDecidedValveState().name() : null)
                .controlProfile(event.getControlProfile())
                .decisionReason(event.getDecisionReason())
                .rawEventJson(event.getRawEventJson())
                .roomName(null)  // TODO: Join with device_fixture_map
                .createdAt(event.getCreatedAt())
                .build();
    }
}
