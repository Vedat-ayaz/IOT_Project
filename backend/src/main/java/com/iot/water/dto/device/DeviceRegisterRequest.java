package com.iot.water.dto.device;

import com.iot.water.entity.enums.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceRegisterRequest {
    
    @NotBlank(message = "Device UID is required")
    private String deviceUid;
    
    @NotBlank(message = "Device name is required")
    private String name;
    
    private String location;
    
    private String model;
    
    private String firmwareVersion;
    
    private LocalDate installDate;
    
    @Builder.Default
    private DeviceStatus status = DeviceStatus.INACTIVE;
}
