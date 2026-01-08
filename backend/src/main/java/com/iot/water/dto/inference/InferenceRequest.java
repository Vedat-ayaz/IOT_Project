package com.iot.water.dto.inference;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InferenceRequest {
    
    @NotBlank(message = "Device UID is required")
    private String deviceUid;
    
    @NotBlank(message = "API key is required")
    private String apiKey;
    
    private String modelName;
    private String modelVersion;
    
    @NotBlank(message = "Timestamp is required")
    private String timestamp;
    
    @NotBlank(message = "Event start is required")
    private String eventStart;
    
    @NotBlank(message = "Event end is required")
    private String eventEnd;
    
    @NotNull(message = "Duration is required")
    private BigDecimal durationSec;
    
    @NotNull(message = "Liters is required")
    private BigDecimal liters;
    
    private BigDecimal meanFlowLpm;
    private BigDecimal maxFlowLpm;
    
    @NotBlank(message = "Predicted fixture is required")
    private String predictedFixture;
    
    @NotNull(message = "Confidence is required")
    private BigDecimal confidence;
    
    private String decidedValveState;
    private String controlProfile;
    private String decisionReason;
    
    private Map<String, Object> featuresJson;
    private Map<String, Object> rawEventJson;
}
