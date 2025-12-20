-- V6__create_audit_log_table.sql
-- Audit log for admin actions and critical system events

CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT 'User who performed the action',
    action VARCHAR(100) NOT NULL COMMENT 'Action type (e.g., USER_CREATED, DEVICE_ASSIGNED)',
    entity_type VARCHAR(50) COMMENT 'Type of entity affected (USER, DEVICE, etc.)',
    entity_id BIGINT COMMENT 'ID of affected entity',
    details TEXT COMMENT 'Additional details or changes made',
    ip_address VARCHAR(45) COMMENT 'IP address of requester',
    user_agent VARCHAR(500) COMMENT 'User agent string',
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_user_ts (user_id, ts),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_ts (ts),
    
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
