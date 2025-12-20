-- V1__create_users_table.sql
-- Users table for authentication and authorization

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    surname VARCHAR(100),
    phone_number VARCHAR(20),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default admin user (password: Admin123!)
-- Password hash generated with BCrypt for: Admin123!
INSERT INTO users (email, password_hash, name, surname, role, status) 
VALUES ('admin@wateriot.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J1YBV7BqzJ0lQqVb6LqU6Kk1G6E.q2', 'System', 'Administrator', 'ADMIN', 'ACTIVE');
