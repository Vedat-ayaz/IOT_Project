package com.iot.water.dto.alert;

import com.iot.water.entity.enums.AlertSeverity;
import com.iot.water.entity.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private Long userId;
    private String userName;
    private AlertSeverity severity;
    private AlertType type;
    private String message;
    private LocalDateTime timestamp;
    private Boolean isRead;
}
