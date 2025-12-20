-- V3__create_readings_table.sql
-- Telemetry readings from IoT devices

CREATE TABLE readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    ts TIMESTAMP NOT NULL COMMENT 'Timestamp when reading was measured',
    flow_rate_lpm DECIMAL(10, 3) COMMENT 'Flow rate in liters per minute',
    volume_liters_delta DECIMAL(12, 3) COMMENT 'Volume delta since last reading',
    volume_liters_total DECIMAL(15, 3) COMMENT 'Total cumulative volume',
    valve_state ENUM('OPEN', 'CLOSED', 'PARTIAL') COMMENT 'Current valve state',
    battery_pct INT COMMENT 'Battery percentage (0-100)',
    signal_rssi INT COMMENT 'Signal strength indicator',
    raw_payload_json JSON COMMENT 'Raw device payload for debugging',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_readings_device_ts (device_id, ts),
    INDEX idx_readings_ts (ts),
    INDEX idx_readings_device_id (device_id),
    INDEX idx_readings_created_at (created_at),
    
    CONSTRAINT fk_readings_device FOREIGN KEY (device_id) 
        REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: For production, consider partitioning by month:
-- PARTITION BY RANGE (YEAR(ts)*100 + MONTH(ts)) (
--     PARTITION p202401 VALUES LESS THAN (202402),
--     PARTITION p202402 VALUES LESS THAN (202403),
--     ...
-- );
-- This improves query performance and enables easier archival of old data.
