-- V2__create_devices_table.sql
-- Devices table for IoT water flow devices

CREATE TABLE devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_uid VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique device identifier (QR code)',
    name VARCHAR(255) NOT NULL COMMENT 'Human-readable device name',
    location VARCHAR(255) COMMENT 'Physical location (room, building, etc.)',
    owner_user_id BIGINT COMMENT 'User who owns this device',
    model VARCHAR(100) COMMENT 'Device hardware model',
    firmware_version VARCHAR(50) COMMENT 'Current firmware version',
    device_api_key VARCHAR(255) COMMENT 'API key for device authentication',
    install_date DATE COMMENT 'Installation date',
    last_seen_at TIMESTAMP NULL COMMENT 'Last communication from device',
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'INACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_devices_device_uid (device_uid),
    INDEX idx_devices_owner_user_id (owner_user_id),
    INDEX idx_devices_status (status),
    INDEX idx_devices_last_seen (last_seen_at),
    INDEX idx_devices_created_at (created_at),
    
    CONSTRAINT fk_devices_owner FOREIGN KEY (owner_user_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sample unassigned device
INSERT INTO devices (device_uid, name, location, model, firmware_version, device_api_key, status)
VALUES ('DEV-SAMPLE-001', 'Demo Faucet Sensor', 'Showroom', 'WF-100', '1.0.0', 'dev_key_sample_001', 'ACTIVE');
