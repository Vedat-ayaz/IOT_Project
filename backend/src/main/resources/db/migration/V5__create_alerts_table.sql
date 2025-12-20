-- V5__create_alerts_table.sql
-- Alerts for users about device status and consumption anomalies

CREATE TABLE alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    severity ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    type ENUM('OVERCONSUMPTION', 'LEAK_SUSPECTED', 'DEVICE_OFFLINE', 'LOW_BATTERY', 'COMMAND_FAILED', 'GENERAL') NOT NULL,
    message TEXT NOT NULL,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    
    INDEX idx_alerts_user_read_ts (user_id, is_read, ts),
    INDEX idx_alerts_device_ts (device_id, ts),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_type (type),
    INDEX idx_alerts_is_read (is_read),
    
    CONSTRAINT fk_alerts_device FOREIGN KEY (device_id) 
        REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
