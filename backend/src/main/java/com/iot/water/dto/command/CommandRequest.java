package com.iot.water.dto.command;

import com.iot.water.entity.enums.CommandType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandRequest {
    
    @NotNull(message = "Command type is required")
    private CommandType type;
    
    private Map<String, Object> payload;
}
