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
@Table(name = "inference_events", indexes = {
    @Index(name = "idx_dev_time", columnList = "device_id, event_start_ts"),
    @Index(name = "idx_fixture", columnList = "predicted_fixture")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InferenceEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ie_device"))
    private Device device;
    
    @Column(name = "model_id")
    private Long modelId;
    
    @Column(name = "event_start_ts", nullable = false)
    private LocalDateTime eventStartTs;
    
    @Column(name = "event_end_ts", nullable = false)
    private LocalDateTime eventEndTs;
    
    @Column(name = "duration_sec", precision = 10, scale = 3)
    private BigDecimal durationSec;
    
    @Column(precision = 12, scale = 3)
    private BigDecimal liters;
    
    @Column(name = "mean_flow_lpm", precision = 10, scale = 3)
    private BigDecimal meanFlowLpm;
    
    @Column(name = "max_flow_lpm", precision = 10, scale = 3)
    private BigDecimal maxFlowLpm;
    
    @Column(name = "predicted_fixture", nullable = false, length = 64)
    private String predictedFixture;
    
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal confidence;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "decided_valve_state", length = 20)
    private ValveState decidedValveState;
    
    @Column(name = "control_profile", length = 32)
    private String controlProfile;
    
    @Column(name = "decision_reason", length = 255)
    private String decisionReason;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features_json", columnDefinition = "json")
    private Map<String, Object> featuresJson;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_event_json", columnDefinition = "json")
    private Map<String, Object> rawEventJson;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
