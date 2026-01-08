Project Group = 7
Group Member = Vedat AYAZ, Erdem MUSLU , Semih IŞIK , Mustafa ERGUT

Video + Report
Drive link = https://drive.google.com/drive/folders/1-m84p4RzNOEDAufKRSz_tOCywQ8khbOv


# 🌊 IoT Water Management System with ML Fixture Detection

A comprehensive IoT-based water monitoring and control system with **Machine Learning-powered fixture detection**. Built with Spring Boot 3, MySQL 8, and real-time ML inference for intelligent water usage analysis.

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Java 21, Maven 3.9+, MySQL 8.0

### 🚀 Run with Docker (5 minutes)

```bash
# Clone repository
git clone https://github.com/Vedat-ayaz/IOT_Project.git
cd IOT_Project

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

**Access Points:**
- 🌐 **Web Dashboard**: http://localhost
- 🔌 **Backend API**: http://localhost:8080
- 💾 **MySQL**: localhost:3307

**Default Credentials:**
- Email: `admin@wateriot.com`
- Password: `Admin123!`

### 📱 Test Devices
- **Device UID**: `RASPI-001`
- **API Key**: `raspi_key_12345`

---

## 🎯 Key Features

### 1. 🤖 ML-Powered Fixture Detection
- Real-time water fixture classification (Kitchen Faucet, Toilet, Shower, etc.)
- Confidence scoring and decision tracking
- Automated valve control based on fixture type
- Historical fixture usage analytics

### 2. 📊 Real-Time Monitoring
- Live telemetry from IoT flow sensors
- Water consumption tracking (liters, flow rate)
- Device status and health monitoring
- Battery level and signal strength (RSSI)

### 3. 🎮 Remote Control
- Valve state control (OPEN/CLOSED/PARTIAL)
- Flow rate limiting with duty cycle profiles
- Command acknowledgment tracking
- Control history and audit logs

### 4. 🚨 Smart Alerts
- Leak detection
- Overconsumption warnings
- Device offline notifications
- Low battery alerts

### 5. 👥 Role-Based Access Control
- User and Admin roles
- Device ownership management
- JWT-based authentication
- Separate device API key authentication

### 6. 📈 Analytics & Reporting
- Daily/Weekly/Monthly consumption aggregates
- Fixture usage distribution charts
- Device performance metrics
- Exportable reports

---

## 🏗️ System Architecture

### Technology Stack

**Backend:**
- ☕ **Java 21** with Spring Boot 3.4.1
- 🔒 Spring Security + JWT authentication
- 💾 MySQL 8.0 with Flyway migrations
- 🐳 Docker containerized deployment

**Frontend:**
- 🌐 HTML5/CSS3/Vanilla JavaScript
- 🚀 Nginx web server
- 📱 Responsive design (mobile-friendly)

**IoT/Raspberry Pi:**
- 🐍 Python 3
- 📡 MQTT → HTTP bridge
- 🤖 ML inference with joblib models
- 📊 Real-time data processing

### Database Schema

**Core Tables:**

```sql
-- User Management
users (id, email, password_hash, name, surname, phone_number, role, status)

-- Device Registry
devices (id, device_uid, name, location, model, owner_user_id, 
         device_api_key, firmware_version, last_seen_at, status)

-- Telemetry Data
readings (id, device_id, ts, flow_rate_lpm, volume_liters_delta, 
          valve_state, battery_pct, signal_rssi, raw_payload_json)

-- ML Inference Events (NEW)
inference_events (id, device_id, model_id, event_start_ts, event_end_ts,
                 duration_sec, liters, mean_flow_lpm, max_flow_lpm,
                 predicted_fixture, confidence, decided_valve_state,
                 control_profile, decision_reason, features_json, 
                 raw_event_json, created_at)

-- ML Model Registry (NEW)
ml_models (id, model_name, model_version, training_source, notes, created_at)

-- Fixture Mapping (NEW)
device_fixture_map (id, device_id, fixture_label, room_name)

-- Remote Control
commands (id, device_id, requested_by_user_id, type, payload_json,
          status, correlation_id, requested_at, sent_at, ack_at)

-- Alerts & Notifications
alerts (id, device_id, user_id, severity, type, message, ts, is_read)

-- Audit Trail
audit_log (id, user_id, action, entity_type, entity_id, details, ip_address, ts)
```

**ML Inference View:**
```sql
-- v_inference_events: Joins inference_events with device_fixture_map for room names
SELECT ie.*, dfm.room_name FROM inference_events ie
LEFT JOIN device_fixture_map dfm ON ie.device_id = dfm.device_id 
  AND ie.predicted_fixture = dfm.fixture_label;
```

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/login          # User login (returns JWT)
POST /api/auth/register       # User registration
POST /api/auth/refresh        # Refresh JWT token
GET  /api/auth/me            # Get current user info
```

### Devices
```http
GET    /api/devices                    # List all devices
GET    /api/devices/{id}              # Get device details
POST   /api/devices                    # Register new device (Admin)
PUT    /api/devices/{id}              # Update device
DELETE /api/devices/{id}              # Delete device (Admin)
GET    /api/devices/{id}/readings     # Get device telemetry
POST   /api/devices/{id}/commands     # Send control command
```

### ML Inference (NEW)
```http
POST /api/inferences                   # Ingest ML inference event (Device API Key)
GET  /api/devices/{id}/inferences     # Get inference history
GET  /api/devices/{id}/inferences?from=...&to=...  # Date range query
```

### Telemetry
```http
POST /api/readings           # Submit sensor reading (Device API Key)
GET  /api/readings          # Query historical readings
```

### Alerts
```http
GET    /api/alerts                # Get user alerts
PUT    /api/alerts/{id}/read     # Mark alert as read
DELETE /api/alerts/{id}          # Delete alert
```

### Dashboard
```http
GET /api/dashboard/summary       # Overview statistics
GET /api/dashboard/consumption   # Consumption trends
```

---

## 🔧 Configuration

### Environment Variables

**Backend (docker-compose.yml):**
```yaml
DB_HOST: host.docker.internal
DB_PORT: 3307
DB_NAME: water_iot_db
DB_USER: water_admin
DB_PASSWORD: WaterSecure2024!
JWT_SECRET: YourVerySecureSecretKey...
CORS_ALLOWED_ORIGINS: http://localhost:80,http://localhost:3000
SERVER_ADDRESS: 0.0.0.0
```

### Database Connection
```properties
# application.yml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

---

## 🤖 ML Inference Integration

### Raspberry Pi Setup

**1. Install Dependencies:**
```bash
pip install paho-mqtt requests numpy scikit-learn joblib
```

**2. Configure Script:**
```python
# In your Pi Python script
MAC_API_INFERENCE = "http://172.20.10.4:8080/api/inferences"
DEVICE_UID = "RASPI-001"
API_KEY = "raspi_key_12345"
POST_INFERENCE_SEPARATE = True
```

**3. Payload Format:**
```json
{
  "deviceUid": "RASPI-001",
  "apiKey": "raspi_key_12345",
  "timestamp": "2026-01-08T13:11:45Z",
  "eventStart": "2026-01-08T13:11:45Z",
  "eventEnd": "2026-01-08T13:12:00Z",
  "durationSec": 15.0,
  "liters": 3.5,
  "meanFlowLpm": 14.0,
  "maxFlowLpm": 18.5,
  "predictedFixture": "KitchenFaucet",
  "confidence": 0.95,
  "decidedValveState": "OPEN",
  "controlProfile": "FULL_OPEN",
  "decisionReason": "MODEL_OK",
  "featuresJson": "{\"mean\":14.0,\"max\":18.5}",
  "rawEventJson": "{\"samples_count\":15}"
}
```

**Supported Fixtures:**
- `KitchenFaucet`
- `BathroomFaucet`
- `Toilet`
- `Shower`
- `Bathtub`
- `WashingMachine`
- `Dishwasher`
- `GardenHose`

**Control Profiles:**
- `FULL_OPEN`: No restriction (flow < 15 LPM)
- `LIMIT_50`: 50% duty cycle (flow 15-30 LPM)
- `LIMIT_75`: 75% duty cycle (flow > 30 LPM)

---

## 🛠️ Local Development Setup

### Option 1: Docker (Recommended)
Already covered in Quick Start above.

### Option 2: Manual Setup

**1. Database:**
```bash
# Start MySQL 8.0
mysql -u root -p

# Create database and user
CREATE DATABASE water_iot_db;
CREATE USER 'water_admin'@'localhost' IDENTIFIED BY 'WaterSecure2024!';
GRANT ALL PRIVILEGES ON water_iot_db.* TO 'water_admin'@'localhost';
FLUSH PRIVILEGES;
```

**2. Backend:**
```bash
cd backend

# Build
mvn clean package -DskipTests

# Run
java -jar target/water-management-system-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://localhost:3306/water_iot_db \
  --spring.datasource.username=water_admin \
  --spring.datasource.password=WaterSecure2024!

# Backend will start on http://localhost:8080
```

**3. Frontend:**
```bash
cd frontend

# Option A: Python
python3 -m http.server 3000

# Option B: Node.js
npx serve -p 3000

# Frontend will be available at http://localhost:3000
```

---

## 📸 Screenshots & Features

### Web Dashboard
- 📊 Real-time device overview with status indicators
- 📈 Water consumption charts (daily/weekly/monthly)
- 🤖 ML inference events with fixture detection
- 🚨 Active alerts and notifications
- 📱 Responsive design for mobile/tablet

### Device Detail Page
- 🔄 Live telemetry updates
- 🎛️ Remote valve control
- 📊 Consumption history graphs
- 🤖 **ML Inference Events Table**:
  - Event timestamp
  - Detected fixture with room name
  - Duration and water used
  - Average/max flow rates
  - Confidence score with color-coded badges
  - Control profile applied

### Dashboard KPIs
- 💧 Total water consumption today
- 🔌 Active devices count
- 🚨 Unread alerts
- 🤖 **ML events detected today**

### Fixture Usage Analytics
- 📊 Bar chart showing water usage by fixture type
- 🏠 Room-based grouping
- 📈 Percentage distribution
- 🕐 Time-based filtering

---

## 🧪 Testing

### Test User Accounts
```
Admin:
- Email: admin@wateriot.com
- Password: Admin123!

Regular User:
- Email: user@wateriot.com
- Password: User123!
```

### Test Device
```
Device UID: RASPI-001
API Key: raspi_key_12345
Owner: Admin
```

### API Testing with curl

**1. Login:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wateriot.com","password":"Admin123!"}' \
  | jq -r .token)
```

**2. Get Devices:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/devices | jq .
```

**3. Submit Telemetry (as Device):**
```bash
curl -X POST http://localhost:8080/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid": "RASPI-001",
    "apiKey": "raspi_key_12345",
    "timestamp": "2026-01-08T10:30:00Z",
    "flowRateLpm": 12.5,
    "volumeLitersDelta": 0.21,
    "valveState": "OPEN",
    "batteryPct": 87
  }'
```

**4. Submit ML Inference:**
```bash
curl -X POST http://localhost:8080/api/inferences \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid": "RASPI-001",
    "apiKey": "raspi_key_12345",
    "timestamp": "2026-01-08T10:30:00Z",
    "eventStart": "2026-01-08T10:30:00Z",
    "eventEnd": "2026-01-08T10:30:15Z",
    "durationSec": 15.0,
    "liters": 3.5,
    "meanFlowLpm": 14.0,
    "maxFlowLpm": 18.5,
    "predictedFixture": "KitchenFaucet",
    "confidence": 0.95,
    "decidedValveState": "OPEN",
    "controlProfile": "FULL_OPEN"
  }'
```

**5. Get ML Inferences:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/devices/2/inferences?limit=10" | jq .
```

---

## 📁 Project Structure

```
capstone/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/iot/water/
│   │   ├── config/            # Security, CORS, DB config
│   │   ├── controller/        # REST API endpoints
│   │   ├── service/           # Business logic
│   │   ├── repository/        # JPA repositories
│   │   ├── entity/            # JPA entities
│   │   ├── dto/               # Data transfer objects
│   │   └── exception/         # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.yml    # Spring configuration
│   │   └── db/migration/      # Flyway SQL migrations
│   └── pom.xml               # Maven dependencies
│
├── frontend/                  # Web UI
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── signup.html           # Registration page
│   ├── app/
│   │   ├── dashboard.html    # Main dashboard
│   │   ├── device.html       # Device detail page
│   │   ├── admin.html        # Admin panel
│   │   └── profile.html      # User profile
│   ├── css/
│   │   ├── style.css         # Main styles
│   │   └── auth.css          # Authentication styles
│   └── js/
│       ├── app.js            # Main application logic
│       └── home-animations.js # Landing page animations
│
├── nginx/                     # Nginx configuration
│   └── nginx.conf
│
├── docs/                      # Documentation
│   ├── API_EXAMPLES.md       # API usage examples
│   └── DATABASE_SCHEMA.md    # Database schema details
│
├── docker-compose.yml         # Docker services configuration
├── Dockerfile                 # Backend container image
└── README.md                 # This file
```

---

## 🔒 Security Features

### Authentication
- ✅ JWT-based stateless authentication
- ✅ Password hashing with BCrypt
- ✅ Token expiration and refresh mechanism
- ✅ Role-based access control (USER/ADMIN)

### Device Security
- ✅ Separate API key authentication for devices
- ✅ Device ownership validation
- ✅ Command correlation IDs for tracking

### API Security
- ✅ CORS configuration
- ✅ SQL injection prevention (JPA/Hibernate)
- ✅ XSS protection headers
- ✅ Rate limiting (configurable)

---

## 🚀 Deployment

### Docker Production Deployment

**1. Build optimized images:**
```bash
docker-compose -f docker-compose.prod.yml build
```

**2. Set environment variables:**
```bash
# Create .env.production
DB_PASSWORD=<strong-password>
JWT_SECRET=<256-bit-secret>
```

**3. Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment Options
- AWS EC2 + RDS
- Azure App Service + Azure Database for MySQL
- Google Cloud Run + Cloud SQL
- DigitalOcean Droplet + Managed Database

---

## 📊 Performance Metrics

- ⚡ Average API response time: <50ms
- 📈 Database queries optimized with indexes
- 🔄 Real-time telemetry processing: 1000+ readings/min
- 💾 Efficient storage with JSON columns for flexible data

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request



## 👥 Authors

- **IoT Water Management Team**
- Contact: https://github.com/Vedat-ayaz/IOT_Project

---

## 🙏 Acknowledgments

- Spring Boot community
- MySQL team
- Docker & containerization ecosystem
- Scikit-learn for ML capabilities

---

## 📞 Support

For issues and questions:
- 🐛 Issues: https://github.com/Vedat-ayaz/IOT_Project/issues
- 📧 Email: [vedat.ayaz@agu.edu.tr]
- 💬 Discussions: GitHub Discussions

---

**Last Updated:** January 8, 2026
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
