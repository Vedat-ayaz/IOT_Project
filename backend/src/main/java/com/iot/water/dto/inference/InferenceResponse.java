package com.iot.water.dto.inference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InferenceResponse {
    
    private Long id;
    private Long deviceId;
    private String deviceUid;
    private Long modelId;
    private LocalDateTime eventStartTs;
    private LocalDateTime eventEndTs;
    private BigDecimal durationSec;
    private BigDecimal liters;
    private BigDecimal meanFlowLpm;
    private BigDecimal maxFlowLpm;
    private String predictedFixture;
    private BigDecimal confidence;
    private String decidedValveState;
    private String controlProfile;
    private String decisionReason;
    private Map<String, Object> featuresJson;
    private Map<String, Object> rawEventJson;
    private LocalDateTime createdAt;
    
    // Frontend için ek alanlar
    private String roomName;
}
