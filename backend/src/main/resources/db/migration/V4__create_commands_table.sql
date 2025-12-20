-- V4__create_commands_table.sql
-- Commands sent to IoT devices for remote control

CREATE TABLE commands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    type ENUM('SET_FLOW_RATE', 'VALVE_OPEN', 'VALVE_CLOSE', 'SHUT_OFF', 'SET_MODE') NOT NULL,
    payload_json JSON COMMENT 'Command parameters, e.g., {"target_flow_lpm": 3.5}',
    status ENUM('PENDING', 'SENT', 'ACK', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    correlation_id VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique ID for tracking ack from device',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL COMMENT 'When command was sent to device',
    ack_at TIMESTAMP NULL COMMENT 'When device acknowledged',
    failure_reason VARCHAR(500) COMMENT 'Reason if status is FAILED',
    
    INDEX idx_commands_device_status_requested (device_id, status, requested_at),
    INDEX idx_commands_correlation_id (correlation_id),
    INDEX idx_commands_device_id (device_id),
    INDEX idx_commands_user_id (requested_by_user_id),
    INDEX idx_commands_status (status),
    INDEX idx_commands_requested_at (requested_at),
    
    CONSTRAINT fk_commands_device FOREIGN KEY (device_id) 
        REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commands_user FOREIGN KEY (requested_by_user_id) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
