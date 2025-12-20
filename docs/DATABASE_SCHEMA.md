# Database Schema Documentation

## Overview
This document describes the complete database schema for the IoT Water Management System.

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │1      n │   devices   │1      n │  readings   │
│             ├─────────┤             ├─────────┤             │
│ PK id       │ owner   │ PK id       │         │ PK id       │
│    email    │         │    device_  │         │    device_id│
│    password_│         │    uid      │         │    ts       │
│    hash     │         │    name     │         │    flow_rate│
│    role     │         │    owner_id │         │    volume_  │
│    status   │         │    status   │         │    liters_  │
└─────────────┘         └─────────────┘         │    delta    │
       │                      │                 └─────────────┘
       │1                     │1
       │                      │
       │n                     │n
┌─────────────┐         ┌─────────────┐
│  commands   │         │   alerts    │
│             │         │             │
│ PK id       │         │ PK id       │
│    device_id│         │    device_id│
│    requested│         │    user_id  │
│    _by_user_│         │    severity │
│    id       │         │    type     │
│    type     │         │    message  │
│    status   │         │    is_read  │
└─────────────┘         └─────────────┘
```

## Tables

### users
Stores user authentication and profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login username) |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| name | VARCHAR(100) | NULL | First name |
| surname | VARCHAR(100) | NULL | Last name |
| phone_number | VARCHAR(20) | NULL | Contact phone number |
| role | ENUM('USER','ADMIN') | NOT NULL | User role for RBAC |
| status | ENUM('ACTIVE','DISABLED') | NOT NULL | Account status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `role`, `status`, `created_at`

**Sample Data:**
```sql
INSERT INTO users (email, password_hash, name, surname, role, status)
VALUES ('admin@wateriot.com', '$2a$10$...', 'System', 'Administrator', 'ADMIN', 'ACTIVE');
```

---

### devices
IoT device registry and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique device identifier |
| device_uid | VARCHAR(100) | UNIQUE, NOT NULL | Physical device unique ID (QR code) |
| name | VARCHAR(255) | NOT NULL | Human-readable device name |
| location | VARCHAR(255) | NULL | Physical installation location |
| owner_user_id | BIGINT | FK → users.id, NULL | User who owns this device |
| model | VARCHAR(100) | NULL | Hardware model number |
| firmware_version | VARCHAR(50) | NULL | Current firmware version |
| device_api_key | VARCHAR(255) | NULL | API key for device authentication |
| install_date | DATE | NULL | Installation date |
| last_seen_at | TIMESTAMP | NULL | Last communication timestamp |
| status | ENUM('ACTIVE','INACTIVE','MAINTENANCE') | NOT NULL | Device operational status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `device_uid`
- INDEX: `owner_user_id`, `status`, `last_seen_at`, `created_at`
- FOREIGN KEY: `owner_user_id` → `users.id` (SET NULL ON DELETE)

**Sample Data:**
```sql
INSERT INTO devices (device_uid, name, location, model, firmware_version, device_api_key, status)
VALUES ('DEV-SAMPLE-001', 'Demo Faucet Sensor', 'Showroom', 'WF-100', '1.0.0', 'dev_key_sample_001', 'ACTIVE');
```

---

### readings
Telemetry data from IoT sensors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique reading identifier |
| device_id | BIGINT | FK → devices.id, NOT NULL | Device that generated reading |
| ts | TIMESTAMP | NOT NULL | Measurement timestamp |
| flow_rate_lpm | DECIMAL(10,3) | NULL | Flow rate (liters per minute) |
| volume_liters_delta | DECIMAL(12,3) | NULL | Volume since last reading (liters) |
| volume_liters_total | DECIMAL(15,3) | NULL | Cumulative volume (liters) |
| valve_state | ENUM('OPEN','CLOSED','PARTIAL') | NULL | Current valve position |
| battery_pct | INT | NULL | Battery percentage (0-100) |
| signal_rssi | INT | NULL | Signal strength indicator (dBm) |
| raw_payload_json | JSON | NULL | Complete device payload for debugging |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(device_id, ts)` - Critical for time-series queries
- INDEX: `ts`, `device_id`, `created_at`
- FOREIGN KEY: `device_id` → `devices.id` (CASCADE ON DELETE)

**Performance Notes:**
- High-volume table - expect millions of rows
- Consider monthly partitioning for production
- Archival strategy: move data older than 1 year to cold storage

**Sample Data:**
```sql
INSERT INTO readings (device_id, ts, flow_rate_lpm, volume_liters_delta, valve_state, battery_pct)
VALUES (1, NOW(), 5.2, 0.087, 'OPEN', 85);
```

---

### commands
Remote control commands sent to devices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique command identifier |
| device_id | BIGINT | FK → devices.id, NOT NULL | Target device |
| requested_by_user_id | BIGINT | FK → users.id, NOT NULL | User who sent command |
| type | ENUM | NOT NULL | Command type (see below) |
| payload_json | JSON | NULL | Command parameters |
| status | ENUM | NOT NULL | Lifecycle status (see below) |
| correlation_id | VARCHAR(100) | UNIQUE, NOT NULL | UUID for ack tracking |
| requested_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Command creation time |
| sent_at | TIMESTAMP | NULL | Time sent to device |
| ack_at | TIMESTAMP | NULL | Time acknowledged by device |
| failure_reason | VARCHAR(500) | NULL | Error message if failed |

**Command Types:**
- `SET_FLOW_RATE` - Adjust flow rate target
- `VALVE_OPEN` - Open valve completely
- `VALVE_CLOSE` - Close valve completely
- `SHUT_OFF` - Emergency shutoff
- `SET_MODE` - Change device operating mode

**Status Lifecycle:**
```
PENDING → SENT → ACK (success)
                ↓
              FAILED (device error)
                ↓
              EXPIRED (timeout after 30 min)
```

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `correlation_id`
- COMPOSITE: `(device_id, status, requested_at)` - For polling queries
- INDEX: `device_id`, `requested_by_user_id`, `status`
- FOREIGN KEY: `device_id` → `devices.id` (CASCADE ON DELETE)
- FOREIGN KEY: `requested_by_user_id` → `users.id` (CASCADE ON DELETE)

**Sample Data:**
```sql
INSERT INTO commands (device_id, requested_by_user_id, type, payload_json, status, correlation_id)
VALUES (1, 2, 'SET_FLOW_RATE', '{"target_flow_lpm": 3.5}', 'PENDING', 'cmd_abc123');
```

---

### alerts
User notifications for important events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique alert identifier |
| device_id | BIGINT | FK → devices.id, NOT NULL | Related device |
| user_id | BIGINT | FK → users.id, NOT NULL | User to notify |
| severity | ENUM('INFO','WARNING','CRITICAL') | NOT NULL | Alert priority |
| type | ENUM | NOT NULL | Alert category (see below) |
| message | TEXT | NOT NULL | Human-readable message |
| ts | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Alert generation time |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |

**Alert Types:**
- `OVERCONSUMPTION` - Daily usage exceeded threshold
- `LEAK_SUSPECTED` - Abnormal flow rate detected
- `DEVICE_OFFLINE` - Device hasn't communicated
- `LOW_BATTERY` - Battery below threshold
- `COMMAND_FAILED` - Remote command failed
- `GENERAL` - Other notifications

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(user_id, is_read, ts)` - For unread alerts query
- COMPOSITE: `(device_id, ts)` - For device alert history
- INDEX: `severity`, `type`, `is_read`
- FOREIGN KEY: `device_id` → `devices.id` (CASCADE ON DELETE)
- FOREIGN KEY: `user_id` → `users.id` (CASCADE ON DELETE)

**Sample Data:**
```sql
INSERT INTO alerts (device_id, user_id, severity, type, message)
VALUES (1, 2, 'CRITICAL', 'LEAK_SUSPECTED', 'Possible leak detected! Flow rate of 12.5 L/min exceeds threshold.');
```

---

### audit_log
Administrative action tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique log entry identifier |
| user_id | BIGINT | FK → users.id, NULL | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action type (see below) |
| entity_type | VARCHAR(50) | NULL | Type of affected entity |
| entity_id | BIGINT | NULL | ID of affected entity |
| details | TEXT | NULL | Additional context/changes |
| ip_address | VARCHAR(45) | NULL | Client IP address (IPv4/IPv6) |
| user_agent | VARCHAR(500) | NULL | Client user agent string |
| ts | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

**Common Actions:**
- `USER_REGISTERED`, `USER_LOGIN`, `USER_UPDATED`, `USER_DELETED`
- `DEVICE_REGISTERED`, `DEVICE_ASSIGNED`, `DEVICE_UNASSIGNED`, `DEVICE_UPDATED`, `DEVICE_DELETED`
- `COMMAND_CREATED`, `ALERT_GENERATED`

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(user_id, ts)` - For user activity history
- INDEX: `action`, `ts`
- COMPOSITE: `(entity_type, entity_id)` - For entity audit trail
- FOREIGN KEY: `user_id` → `users.id` (SET NULL ON DELETE)

**Sample Data:**
```sql
INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
VALUES (1, 'DEVICE_REGISTERED', 'DEVICE', 5, 'Device DEV-NEW-001 registered');
```

## Data Retention & Archival

### Recommended Policies

**readings** (telemetry):
- **Hot data**: Last 90 days (fast SSD storage)
- **Warm data**: 91-365 days (standard storage)
- **Cold data**: >1 year (archive to S3/Glacier)
- **Aggregation**: Keep hourly/daily summaries indefinitely

**commands**:
- Keep 1 year, then archive
- Completed commands (ACK/FAILED) can be archived after 90 days

**alerts**:
- Keep read alerts for 90 days
- Keep unread/critical alerts for 1 year

**audit_log**:
- Keep all logs for regulatory compliance (7+ years)

### Archival Script Example

```sql
-- Archive old readings to separate table
CREATE TABLE readings_archive LIKE readings;

INSERT INTO readings_archive
SELECT * FROM readings
WHERE ts < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM readings
WHERE ts < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Optimize table after deletion
OPTIMIZE TABLE readings;
```

## Backup Strategy

### Recommended Approach

1. **Daily Full Backups**
   ```bash
   mysqldump -u root -p water_iot_db > backup_$(date +%Y%m%d).sql
   ```

2. **Incremental Binary Logs**
   - Enable binary logging in MySQL config
   - Rotate logs daily
   - Keep 7 days of binary logs

3. **Critical Tables** (priority backup):
   - `users`
   - `devices`
   - `commands` (recent)
   - `audit_log`

4. **Large Tables** (separate backup):
   - `readings` (can be partially restored from devices)

### Restore Procedure

```bash
# Restore full backup
mysql -u root -p water_iot_db < backup_20241217.sql

# Apply binary logs for point-in-time recovery
mysqlbinlog binlog.000001 binlog.000002 | mysql -u root -p water_iot_db
```

## Migration Management

### Flyway Migration Scripts

All schema changes are version-controlled in `/backend/src/main/resources/db/migration/`:

- `V1__create_users_table.sql`
- `V2__create_devices_table.sql`
- `V3__create_readings_table.sql`
- `V4__create_commands_table.sql`
- `V5__create_alerts_table.sql`
- `V6__create_audit_log_table.sql`

### Adding New Migration

```sql
-- V7__add_device_timezone.sql
ALTER TABLE devices ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
```

Flyway automatically applies on application startup.

## Performance Tuning

### MySQL Configuration

```ini
# /etc/mysql/my.cnf

[mysqld]
# InnoDB Buffer Pool (70-80% of RAM)
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M

# Query Cache (deprecated in MySQL 8.0)
# Use application-level caching instead

# Connection Pool
max_connections = 200

# Slow Query Log
slow_query_log = 1
long_query_time = 2

# Binary Logging (for replication & backups)
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
```

### Query Optimization Examples

```sql
-- Good: Uses composite index (device_id, ts)
SELECT * FROM readings
WHERE device_id = 1 AND ts BETWEEN '2024-12-10' AND '2024-12-17'
ORDER BY ts DESC;

-- Good: Uses index on (user_id, is_read, ts)
SELECT * FROM alerts
WHERE user_id = 2 AND is_read = FALSE
ORDER BY ts DESC
LIMIT 50;

-- Analyze query performance
EXPLAIN SELECT * FROM readings WHERE device_id = 1;
```

## Security Considerations

### Sensitive Data

**Encrypted at Rest:**
- `users.password_hash` - BCrypt (already hashed)
- `devices.device_api_key` - Consider encryption in production

**Access Control:**
- Row-level security via application logic
- Users can only access their own devices
- Admins have full access

### SQL Injection Prevention

All queries use JPA/Hibernate with parameterized queries:

```java
// Safe - parameterized query
@Query("SELECT r FROM Reading r WHERE r.device.id = :deviceId AND r.ts BETWEEN :from AND :to")
List<Reading> findByDeviceIdAndTimeRange(@Param("deviceId") Long deviceId, ...);

// Never concatenate SQL strings!
```

## Monitoring Queries

### Useful Diagnostic Queries

```sql
-- Find slowest queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Table sizes
SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'water_iot_db'
ORDER BY size_mb DESC;

-- Index usage
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'water_iot_db';

-- Devices not reporting
SELECT id, device_uid, name, last_seen_at
FROM devices
WHERE last_seen_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
AND status = 'ACTIVE';

-- Top water consumers this month
SELECT d.id, d.name, SUM(r.volume_liters_delta) as total_liters
FROM devices d
JOIN readings r ON d.id = r.device_id
WHERE r.ts >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY d.id
ORDER BY total_liters DESC
LIMIT 10;
```

---

**Last Updated:** December 17, 2024
**Schema Version:** 1.0.0
