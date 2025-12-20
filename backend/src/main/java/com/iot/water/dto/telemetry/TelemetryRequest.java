package com.iot.water.dto.telemetry;

import com.iot.water.entity.enums.ValveState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class TelemetryRequest {
    
    @NotBlank(message = "Device UID is required")
    private String deviceUid;
    
    @NotBlank(message = "Device API key is required")
    private String apiKey;
    
    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;
    
    private BigDecimal flowRateLpm;
    
    private BigDecimal volumeDelta;
    
    private BigDecimal volumeTotal;
    
    private ValveState valveState;
    
    private Integer batteryPct;
    
    private Integer signalRssi;
    
    private Map<String, Object> rawPayload;
}
