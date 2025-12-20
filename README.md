# IoT Water Management System

A comprehensive IoT-based water flow control and monitoring system built with Spring Boot 3, MySQL 8, and vanilla HTML/CSS/JavaScript.

## 🌊 Overview

This system enables real-time monitoring and remote control of water consumption through IoT devices equipped with flow sensors and motorized valves. The platform provides:

- **Real-time telemetry** from IoT water flow sensors
- **Remote control** of valves and flow rates
- **Smart alerts** for leaks, overconsumption, and device issues
- **Historical analytics** with aggregated consumption data
- **Role-based access** for users and administrators
- **Device authentication** separate from user authentication

## 🏗️ Architecture

### Backend Stack
- Java 21
- Spring Boot 3.2.1
- Spring Security with JWT
- Spring Data JPA / Hibernate
- MySQL 8.0
- Flyway for database migrations
- OpenAPI/Swagger documentation

### Frontend Stack
- Plain HTML5/CSS3
- Vanilla JavaScript with Fetch API
- Responsive, modern UI design
- No frameworks required

### Database Schema

```sql
users (authentication & authorization)
├── id, email, password_hash
├── name, surname, phone_number
├── role (USER/ADMIN)
└── status (ACTIVE/DISABLED)

devices (IoT device registry)
├── id, device_uid (unique)
├── name, location, model
├── owner_user_id (FK → users)
├── device_api_key, firmware_version
├── last_seen_at, status
└── install_date

readings (telemetry data)
├── id, device_id (FK → devices)
├── ts (timestamp)
├── flow_rate_lpm, volume_liters_delta
├── valve_state, battery_pct, signal_rssi
└── raw_payload_json

commands (remote control)
├── id, device_id, requested_by_user_id
├── type, payload_json
├── status (PENDING→SENT→ACK/FAILED)
├── correlation_id
└── requested_at, sent_at, ack_at

alerts (notifications)
├── id, device_id, user_id
├── severity, type, message
├── ts, is_read
└── Types: LEAK, OVERCONSUMPTION, OFFLINE, LOW_BATTERY

audit_log (admin actions)
├── id, user_id, action
├── entity_type, entity_id
└── details, ip_address, ts
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- OR: Java 21, Maven, MySQL 8

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
cd capstone

# Start all services (MySQL + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development

```bash
# 1. Start MySQL
mysql -u root -p
CREATE DATABASE water_iot_db;
CREATE USER 'water_admin'@'localhost' IDENTIFIED BY 'WaterSecure2024!';
GRANT ALL PRIVILEGES ON water_iot_db.* TO 'water_admin'@'localhost';

# 2. Build and run backend
cd capstone
mvn clean package
java -jar target/water-management-system-1.0.0.jar

# 3. Serve frontend (use any web server)
cd frontend
python3 -m http.server 3000
# Or use: npx serve -p 3000
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John",
  "surname": "Doe",
  "phoneNumber": "+1234567890"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "id": 2,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: Same as register
```

### Device Management

#### List Devices
```http
GET /api/devices
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "deviceUid": "DEV-SAMPLE-001",
    "name": "Kitchen Faucet",
    "location": "Kitchen",
    "ownerId": 2,
    "ownerName": "John Doe",
    "model": "WF-100",
    "firmwareVersion": "1.0.0",
    "status": "ACTIVE",
    "lastSeenAt": "2024-12-17T10:30:00"
  }
]
```

#### Register Device (Admin only)
```http
POST /api/devices/register
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "deviceUid": "DEV-NEW-001",
  "name": "Bathroom Sensor",
  "location": "Bathroom 1",
  "model": "WF-200",
  "firmwareVersion": "1.2.0"
}
```

#### Assign Device to User (Admin only)
```http
PUT /api/devices/{deviceId}/assign/{userId}
Authorization: Bearer {admin-token}
```

### Telemetry Endpoints

#### Ingest Telemetry (Device → Server)
```http
POST /api/telemetry
Content-Type: application/json

{
  "deviceUid": "DEV-SAMPLE-001",
  "apiKey": "dev_key_sample_001",
  "timestamp": "2024-12-17T10:30:00",
  "flowRateLpm": 5.2,
  "volumeDelta": 0.087,
  "volumeTotal": 145.3,
  "valveState": "OPEN",
  "batteryPct": 85,
  "signalRssi": -65,
  "rawPayload": {
    "temperature": 22.5,
    "pressure": 2.1
  }
}

Response:
{
  "status": "success",
  "message": "Telemetry data received"
}
```

#### Get Device Readings
```http
GET /api/devices/{id}/readings?from=2024-12-16T00:00:00&to=2024-12-17T00:00:00&limit=100
Authorization: Bearer {token}

Response:
[
  {
    "id": 1523,
    "deviceId": 1,
    "deviceName": "Kitchen Faucet",
    "timestamp": "2024-12-17T10:30:00",
    "flowRateLpm": 5.2,
    "volumeLitersDelta": 0.087,
    "volumeLitersTotal": 145.3,
    "valveState": "OPEN",
    "batteryPct": 85,
    "signalRssi": -65
  }
]
```

#### Get Aggregated Readings
```http
GET /api/devices/{id}/readings/aggregated?from=2024-12-10T00:00:00&to=2024-12-17T00:00:00&granularity=daily
Authorization: Bearer {token}

Response:
[
  {
    "period": "2024-12-16",
    "avgFlowRate": 4.5,
    "totalVolume": 125.8
  },
  {
    "period": "2024-12-17",
    "avgFlowRate": 5.1,
    "totalVolume": 98.3
  }
]
```

### Command Endpoints

#### Send Command to Device
```http
POST /api/devices/{id}/commands
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "SET_FLOW_RATE",
  "payload": {
    "target_flow_lpm": 3.5
  }
}

Response:
{
  "id": 42,
  "deviceId": 1,
  "type": "SET_FLOW_RATE",
  "payload": {"target_flow_lpm": 3.5},
  "status": "PENDING",
  "correlationId": "cmd_a1b2c3d4...",
  "requestedAt": "2024-12-17T10:35:00"
}
```

Available command types:
- `VALVE_OPEN` - Open valve completely
- `VALVE_CLOSE` - Close valve completely
- `SHUT_OFF` - Emergency shutoff
- `SET_FLOW_RATE` - Set target flow rate
- `SET_MODE` - Change device mode

#### Device Polls for Commands
```http
POST /api/device/commands/poll?deviceUid=DEV-SAMPLE-001&apiKey=dev_key_sample_001

Response:
[
  {
    "id": 42,
    "correlationId": "cmd_a1b2c3d4...",
    "type": "SET_FLOW_RATE",
    "payload": {"target_flow_lpm": 3.5},
    "status": "SENT",
    "requestedAt": "2024-12-17T10:35:00",
    "sentAt": "2024-12-17T10:35:02"
  }
]
```

#### Device Acknowledges Command
```http
POST /api/device/commands/ack
Content-Type: application/json

{
  "correlationId": "cmd_a1b2c3d4...",
  "success": true,
  "message": "Flow rate adjusted to 3.5 L/min"
}
```

### Alert Endpoints

#### Get User Alerts
```http
GET /api/alerts?isRead=false&limit=50
Authorization: Bearer {token}

Response:
[
  {
    "id": 15,
    "deviceId": 1,
    "deviceName": "Kitchen Faucet",
    "severity": "CRITICAL",
    "type": "LEAK_SUSPECTED",
    "message": "Possible leak detected! Flow rate of 12.5 L/min exceeds threshold.",
    "timestamp": "2024-12-17T08:22:00",
    "isRead": false
  }
]
```

#### Mark Alert as Read
```http
PUT /api/alerts/{id}/read
Authorization: Bearer {token}
```

#### Mark All Alerts as Read
```http
PUT /api/alerts/read-all
Authorization: Bearer {token}
```

## 🔐 Authentication Flow

### User Authentication (JWT)
1. User registers or logs in
2. Server returns JWT token
3. Frontend stores token in `localStorage`
4. All subsequent requests include: `Authorization: Bearer {token}`
5. Token expires after 24 hours (configurable)

### Device Authentication (API Key)
1. Admin registers device, system generates API key
2. API key stored in device configuration
3. Device includes `deviceUid` and `apiKey` in telemetry/command requests
4. Server validates before accepting data

**Important**: Device endpoints (`/api/telemetry`, `/api/device/commands/*`) do NOT require JWT tokens.

## 📊 Database Indexes & Performance

### Optimized Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Devices
CREATE INDEX idx_devices_device_uid ON devices(device_uid);
CREATE INDEX idx_devices_owner_user_id ON devices(owner_user_id);
CREATE INDEX idx_devices_last_seen ON devices(last_seen_at);

-- Readings (critical for query performance)
CREATE INDEX idx_readings_device_ts ON readings(device_id, ts);
CREATE INDEX idx_readings_ts ON readings(ts);

-- Commands
CREATE INDEX idx_commands_device_status_requested ON commands(device_id, status, requested_at);
CREATE INDEX idx_commands_correlation_id ON commands(correlation_id);

-- Alerts
CREATE INDEX idx_alerts_user_read_ts ON alerts(user_id, is_read, ts);
```

### Partitioning Strategy (Production)

For high-volume telemetry data, consider partitioning the `readings` table by month:

```sql
ALTER TABLE readings PARTITION BY RANGE (YEAR(ts)*100 + MONTH(ts)) (
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p202501 VALUES LESS THAN (202502),
    PARTITION p202502 VALUES LESS THAN (202503)
    -- Add partitions monthly
);
```

## 🎨 Frontend Pages

### Public Pages
- `/index.html` - Landing page with features
- `/login.html` - User login
- `/signup.html` - User registration

### Protected Pages (Require Authentication)
- `/app/dashboard.html` - Main dashboard with KPIs, devices, alerts
- `/app/device.html?id={id}` - Device details, readings, commands
- `/app/profile.html` - User profile and settings
- `/app/admin.html` - Admin panel (ADMIN role only)

### UI Features
- Clean, modern corporate IoT design
- Status badges (Active/Offline/Maintenance)
- Real-time data updates
- Responsive grid layouts
- Form validation
- Alert notifications
- Modal dialogs

## 🛠️ Configuration

### Environment Variables (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=water_iot_db
DB_USER=water_admin
DB_PASSWORD=WaterSecure2024!

# JWT
JWT_SECRET=YourVerySecureSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm2024
JWT_EXPIRATION=86400000  # 24 hours in ms

# Server
SERVER_PORT=8080

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80

# Alerts
ALERT_DEVICE_OFFLINE_MINUTES=60
ALERT_OVERCONSUMPTION_LITERS_DAILY=500
ALERT_LEAK_FLOW_RATE_LPM=10.0
```

### Application Profiles
- `dev` - Development mode (verbose logging)
- `prod` - Production mode (minimal logging)

```bash
# Run with specific profile
java -jar app.jar --spring.profiles.active=prod
```

## 🔧 Testing

### Manual API Testing with cURL

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'

# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wateriot.com","password":"Admin123!"}' \
  | jq -r '.token')

# List devices
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer $TOKEN"

# Send telemetry
curl -X POST http://localhost:8080/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid":"DEV-SAMPLE-001",
    "apiKey":"dev_key_sample_001",
    "timestamp":"2024-12-17T10:30:00",
    "flowRateLpm":5.2,
    "volumeDelta":0.087,
    "valveState":"OPEN"
  }'
```

### Default Credentials

**Admin Account** (pre-seeded):
- Email: `admin@wateriot.com`
- Password: `Admin123!` (change in production!)

**Sample Device**:
- UID: `DEV-SAMPLE-001`
- API Key: `dev_key_sample_001`

## 📈 Monitoring & Alerts

### Automated Alert Generation

The system automatically generates alerts for:

1. **Device Offline** (every 10 minutes)
   - Triggers when `last_seen_at` > 60 minutes ago

2. **Leak Detection** (real-time)
   - Triggers when `flow_rate_lpm` > 10.0 L/min

3. **Overconsumption** (daily at 2 AM)
   - Triggers when daily usage > 500 liters

4. **Low Battery** (real-time)
   - WARNING: battery < 20%
   - CRITICAL: battery < 10%

5. **Command Failed** (on failure)
   - Device reports command execution failure

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains only
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting
- [ ] Regular security audits
- [ ] Database backups
- [ ] Monitor failed login attempts
- [ ] Implement password reset flow

### CORS Configuration
Update `application.yml`:
```yaml
cors:
  allowed-origins: https://yourdomain.com,https://app.yourdomain.com
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL is running
docker ps | grep mysql
# Or
systemctl status mysql

# Verify credentials
mysql -u water_admin -p water_iot_db
```

**Frontend can't connect to backend**
- Check CORS configuration in `application.yml`
- Verify `API_URL` in `/frontend/js/app.js`
- Check browser console for errors

**JWT Token Expired**
- Tokens expire after 24 hours by default
- User must login again
- Adjust `JWT_EXPIRATION` in `.env` if needed

**Device telemetry rejected**
- Verify `deviceUid` and `apiKey` match database
- Check device status is ACTIVE
- Review backend logs

## 📝 License

Copyright © 2024 WaterIoT. All rights reserved.

## 🤝 Support

For issues and questions:
- Check Swagger documentation: http://localhost:8080/swagger-ui.html
- Review backend logs: `docker-compose logs -f backend`
- Check database: `docker exec -it water-iot-mysql mysql -u water_admin -p`

## 🎯 Future Enhancements

- WebSocket/MQTT for real-time updates
- Mobile app (React Native/Flutter)
- Advanced analytics with charts (Chart.js)
- User notification preferences (email/SMS)
- Multi-tenancy support
- Geolocation for devices
- Machine learning for anomaly detection
- Export data (CSV/PDF reports)
- Two-factor authentication (2FA)
