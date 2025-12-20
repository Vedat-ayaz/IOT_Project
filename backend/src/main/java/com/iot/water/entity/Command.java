package com.iot.water.entity;

import com.iot.water.entity.enums.CommandStatus;
import com.iot.water.entity.enums.CommandType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "commands", indexes = {
    @Index(name = "idx_commands_device_status_requested", columnList = "device_id, status, requested_at"),
    @Index(name = "idx_commands_correlation_id", columnList = "correlation_id"),
    @Index(name = "idx_commands_device_id", columnList = "device_id"),
    @Index(name = "idx_commands_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Command {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false, foreignKey = @ForeignKey(name = "fk_commands_device"))
    private Device device;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_commands_user"))
    private User requestedByUser;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CommandType type;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_json", columnDefinition = "json")
    private Map<String, Object> payloadJson;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CommandStatus status = CommandStatus.PENDING;
    
    @Column(name = "correlation_id", nullable = false, unique = true, length = 100)
    private String correlationId;
    
    @Column(name = "requested_at", nullable = false)
    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "ack_at")
    private LocalDateTime ackAt;
    
    @Column(name = "failure_reason", length = 500)
    private String failureReason;
}
