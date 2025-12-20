package com.iot.water.dto.telemetry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedReadingResponse {
    private String period;
    private BigDecimal avgFlowRate;
    private BigDecimal totalVolume;
}
