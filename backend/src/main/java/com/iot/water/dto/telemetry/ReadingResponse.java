package com.iot.water.dto.telemetry;

import com.iot.water.entity.enums.ValveState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private LocalDateTime timestamp;
    private BigDecimal flowRateLpm;
    private BigDecimal volumeLitersDelta;
    private BigDecimal volumeLitersTotal;
    private ValveState valveState;
    private Integer batteryPct;
    private Integer signalRssi;
}
