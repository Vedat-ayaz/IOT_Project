package com.iot.water.dto.device;

import com.iot.water.entity.enums.DeviceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResponse {
    private Long id;
    private String deviceUid;
    private String name;
    private String location;
    private Long ownerId;
    private String ownerName;
    private String model;
    private String firmwareVersion;
    private LocalDate installDate;
    private LocalDateTime lastSeenAt;
    private DeviceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
