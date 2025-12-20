package com.iot.water.dto.command;

import com.iot.water.entity.enums.CommandStatus;
import com.iot.water.entity.enums.CommandType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private Long requestedByUserId;
    private String requestedByUserName;
    private CommandType type;
    private Map<String, Object> payload;
    private CommandStatus status;
    private String correlationId;
    private LocalDateTime requestedAt;
    private LocalDateTime sentAt;
    private LocalDateTime ackAt;
    private String failureReason;
}
