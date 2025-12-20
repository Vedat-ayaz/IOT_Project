package com.iot.water.entity;

import com.iot.water.entity.enums.ValveState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "readings", indexes = {
    @Index(name = "idx_readings_device_ts", columnList = "device_id, ts"),
    @Index(name = "idx_readings_ts", columnList = "ts"),
    @Index(name = "idx_readings_device_id", columnList = "device_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reading {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false, foreignKey = @ForeignKey(name = "fk_readings_device"))
    private Device device;
    
    @Column(nullable = false)
    private LocalDateTime ts;
    
    @Column(name = "flow_rate_lpm", precision = 10, scale = 3)
    private BigDecimal flowRateLpm;
    
    @Column(name = "volume_liters_delta", precision = 12, scale = 3)
    private BigDecimal volumeLitersDelta;
    
    @Column(name = "volume_liters_total", precision = 15, scale = 3)
    private BigDecimal volumeLitersTotal;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "valve_state", length = 20)
    private ValveState valveState;
    
    @Column(name = "battery_pct")
    private Integer batteryPct;
    
    @Column(name = "signal_rssi")
    private Integer signalRssi;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload_json", columnDefinition = "json")
    private Map<String, Object> rawPayloadJson;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
