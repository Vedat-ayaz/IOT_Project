package com.iot.water.entity;

import com.iot.water.entity.enums.AlertSeverity;
import com.iot.water.entity.enums.AlertType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alerts_user_read_ts", columnList = "user_id, is_read, ts"),
    @Index(name = "idx_alerts_device_ts", columnList = "device_id, ts"),
    @Index(name = "idx_alerts_severity", columnList = "severity"),
    @Index(name = "idx_alerts_type", columnList = "type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false, foreignKey = @ForeignKey(name = "fk_alerts_device"))
    private Device device;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_alerts_user"))
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AlertSeverity severity = AlertSeverity.INFO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AlertType type;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime ts = LocalDateTime.now();
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
}
