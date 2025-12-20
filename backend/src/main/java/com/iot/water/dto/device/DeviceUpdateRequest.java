package com.iot.water.dto.device;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceUpdateRequest {
    
    @NotBlank(message = "Device name is required")
    private String name;
    
    private String location;
    
    private String firmwareVersion;
}
