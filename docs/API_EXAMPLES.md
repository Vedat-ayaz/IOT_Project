# API Documentation & Examples

Complete API reference with request/response examples for the IoT Water Management System.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Device Management APIs](#device-management-apis)
3. [Telemetry APIs](#telemetry-apis)
4. [Command APIs](#command-apis)
5. [Alert APIs](#alert-apis)
6. [Error Codes](#error-codes)

---

## Base Configuration

**Base URL:** `http://localhost:8080/api`

**Authentication:**
- User endpoints: JWT token in `Authorization: Bearer <token>` header
- Device endpoints: Device API key in `X-Device-API-Key` header

**Content Type:** `application/json`

---

## Authentication APIs

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "name": "John",
  "surname": "Doe",
  "phoneNumber": "+1-555-0123"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "name": "John",
  "role": "USER"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "name": "John",
    "surname": "Doe",
    "phoneNumber": "+1-555-0123"
  }'
```

**Validation Rules:**
- Email must be valid and unique
- Password minimum 8 characters
- Phone number optional

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@wateriot.com",
  "password": "Admin123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB3YXRlcmlvdC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDI4MzYwMDAsImV4cCI6MTcwMjkyMjQwMH0.signature",
  "email": "admin@wateriot.com",
  "name": "System",
  "role": "ADMIN"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wateriot.com",
    "password": "Admin123!"
  }'
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

---

## Device Management APIs

### 3. List User Devices

**Endpoint:** `GET /devices`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "deviceUid": "DEV-SAMPLE-001",
    "name": "Kitchen Faucet Sensor",
    "location": "Kitchen, Building A",
    "model": "WF-100",
    "firmwareVersion": "1.2.3",
    "installDate": "2024-01-15",
    "lastSeenAt": "2024-12-17T10:25:30Z",
    "status": "ACTIVE",
    "ownerId": 2,
    "ownerEmail": "john.doe@example.com"
  },
  {
    "id": 2,
    "deviceUid": "DEV-SAMPLE-002",
    "name": "Bathroom Shower Sensor",
    "location": "Bathroom 2F",
    "model": "WF-200",
    "firmwareVersion": "1.3.0",
    "installDate": "2024-02-10",
    "lastSeenAt": "2024-12-17T10:20:15Z",
    "status": "ACTIVE",
    "ownerId": 2,
    "ownerEmail": "john.doe@example.com"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Get Device Details

**Endpoint:** `GET /devices/{id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deviceUid": "DEV-SAMPLE-001",
  "name": "Kitchen Faucet Sensor",
  "location": "Kitchen, Building A",
  "model": "WF-100",
  "firmwareVersion": "1.2.3",
  "installDate": "2024-01-15",
  "lastSeenAt": "2024-12-17T10:25:30Z",
  "status": "ACTIVE",
  "ownerId": 2,
  "ownerEmail": "john.doe@example.com"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/devices/1 \
  -H "Authorization: Bearer <token>"
```

**Error Response (404 Not Found):**
```json
{
  "message": "Device not found with id: 1",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

---

### 5. Register New Device (Admin Only)

**Endpoint:** `POST /devices/register`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "deviceUid": "DEV-NEW-12345",
  "name": "Garage Water Meter",
  "location": "Garage",
  "model": "WF-300",
  "firmwareVersion": "2.0.0",
  "installDate": "2024-12-17"
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "deviceUid": "DEV-NEW-12345",
  "name": "Garage Water Meter",
  "location": "Garage",
  "model": "WF-300",
  "firmwareVersion": "2.0.0",
  "installDate": "2024-12-17",
  "lastSeenAt": null,
  "status": "INACTIVE",
  "ownerId": null,
  "ownerEmail": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/devices/register \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid": "DEV-NEW-12345",
    "name": "Garage Water Meter",
    "location": "Garage",
    "model": "WF-300",
    "firmwareVersion": "2.0.0",
    "installDate": "2024-12-17"
  }'
```

---

### 6. Assign Device to User (Admin Only)

**Endpoint:** `POST /devices/{deviceId}/assign/{userId}`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 15,
  "deviceUid": "DEV-NEW-12345",
  "name": "Garage Water Meter",
  "location": "Garage",
  "model": "WF-300",
  "firmwareVersion": "2.0.0",
  "installDate": "2024-12-17",
  "lastSeenAt": null,
  "status": "ACTIVE",
  "ownerId": 5,
  "ownerEmail": "jane.smith@example.com"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/devices/15/assign/5 \
  -H "Authorization: Bearer <admin_token>"
```

---

### 7. Update Device

**Endpoint:** `PUT /devices/{id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "name": "Kitchen Main Faucet",
  "location": "Kitchen - Main Sink",
  "firmwareVersion": "1.2.4"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "deviceUid": "DEV-SAMPLE-001",
  "name": "Kitchen Main Faucet",
  "location": "Kitchen - Main Sink",
  "model": "WF-100",
  "firmwareVersion": "1.2.4",
  "installDate": "2024-01-15",
  "lastSeenAt": "2024-12-17T10:25:30Z",
  "status": "ACTIVE",
  "ownerId": 2,
  "ownerEmail": "john.doe@example.com"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:8080/api/devices/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kitchen Main Faucet",
    "location": "Kitchen - Main Sink",
    "firmwareVersion": "1.2.4"
  }'
```

---

## Telemetry APIs

### 8. Ingest Telemetry (Device API Key)

**Endpoint:** `POST /telemetry`

**Headers:**
```
X-Device-API-Key: dev_key_sample_001
Content-Type: application/json
```

**Request:**
```json
{
  "deviceUid": "DEV-SAMPLE-001",
  "timestamp": "2024-12-17T10:30:00Z",
  "flowRateLpm": 5.2,
  "volumeLitersDelta": 0.087,
  "volumeLitersTotal": 1523.456,
  "valveState": "OPEN",
  "batteryPct": 85,
  "signalRssi": -65
}
```

**Response (201 Created):**
```json
{
  "message": "Telemetry data ingested successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/telemetry \
  -H "X-Device-API-Key: dev_key_sample_001" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid": "DEV-SAMPLE-001",
    "timestamp": "2024-12-17T10:30:00Z",
    "flowRateLpm": 5.2,
    "volumeLitersDelta": 0.087,
    "volumeLitersTotal": 1523.456,
    "valveState": "OPEN",
    "batteryPct": 85,
    "signalRssi": -65
  }'
```

**Notes:**
- No JWT token required
- Automatically updates `devices.last_seen_at`
- Stores complete payload in `raw_payload_json` for debugging

---

### 9. Get Device Readings

**Endpoint:** `GET /devices/{id}/readings?from={iso_date}&to={iso_date}&limit={num}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `from` (optional): Start timestamp (ISO 8601)
- `to` (optional): End timestamp (ISO 8601)
- `limit` (optional): Max number of results (default 100)

**Response (200 OK):**
```json
[
  {
    "id": 5001,
    "deviceId": 1,
    "timestamp": "2024-12-17T10:30:00Z",
    "flowRateLpm": 5.2,
    "volumeLitersDelta": 0.087,
    "volumeLitersTotal": 1523.456,
    "valveState": "OPEN",
    "batteryPct": 85,
    "signalRssi": -65
  },
  {
    "id": 5000,
    "deviceId": 1,
    "timestamp": "2024-12-17T10:29:00Z",
    "flowRateLpm": 5.1,
    "volumeLitersDelta": 0.085,
    "volumeLitersTotal": 1523.369,
    "valveState": "OPEN",
    "batteryPct": 85,
    "signalRssi": -64
  }
]
```

**cURL Example:**
```bash
# Last 24 hours
curl -X GET "http://localhost:8080/api/devices/1/readings?from=2024-12-16T10:30:00Z&to=2024-12-17T10:30:00Z&limit=100" \
  -H "Authorization: Bearer <token>"

# Last 100 readings (default)
curl -X GET http://localhost:8080/api/devices/1/readings \
  -H "Authorization: Bearer <token>"
```

---

### 10. Get Aggregated Readings

**Endpoint:** `GET /devices/{id}/readings/aggregated?from={iso_date}&to={iso_date}&interval={minutes}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `from` (required): Start timestamp
- `to` (required): End timestamp
- `interval` (optional): Aggregation interval in minutes (default 60)

**Response (200 OK):**
```json
[
  {
    "hourBucket": "2024-12-17T10:00:00Z",
    "avgFlowRateLpm": 4.8,
    "maxFlowRateLpm": 7.2,
    "minFlowRateLpm": 0.0,
    "totalVolumeLiters": 15.3,
    "recordCount": 60
  },
  {
    "hourBucket": "2024-12-17T09:00:00Z",
    "avgFlowRateLpm": 3.2,
    "maxFlowRateLpm": 5.5,
    "minFlowRateLpm": 0.0,
    "totalVolumeLiters": 10.8,
    "recordCount": 60
  }
]
```

**cURL Example:**
```bash
# Hourly aggregation for last 7 days
curl -X GET "http://localhost:8080/api/devices/1/readings/aggregated?from=2024-12-10T00:00:00Z&to=2024-12-17T23:59:59Z&interval=60" \
  -H "Authorization: Bearer <token>"
```

---

### 11. Get Daily Consumption

**Endpoint:** `GET /devices/{id}/consumption/daily?date={yyyy-MM-dd}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `date` (optional): Date in format `yyyy-MM-dd` (default today)

**Response (200 OK):**
```json
{
  "date": "2024-12-17",
  "totalLiters": 234.5,
  "deviceId": 1,
  "deviceName": "Kitchen Faucet Sensor"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8080/api/devices/1/consumption/daily?date=2024-12-17" \
  -H "Authorization: Bearer <token>"
```

---

## Command APIs

### 12. Send Command to Device

**Endpoint:** `POST /commands`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "deviceId": 1,
  "type": "SET_FLOW_RATE",
  "payloadJson": "{\"target_flow_lpm\": 3.5}"
}
```

**Command Types:**
- `SET_FLOW_RATE` - Adjust flow rate
- `VALVE_OPEN` - Open valve
- `VALVE_CLOSE` - Close valve
- `SHUT_OFF` - Emergency shutoff
- `SET_MODE` - Change operating mode

**Response (201 Created):**
```json
{
  "id": 42,
  "deviceId": 1,
  "type": "SET_FLOW_RATE",
  "payloadJson": "{\"target_flow_lpm\": 3.5}",
  "status": "PENDING",
  "correlationId": "cmd_abc123def456",
  "requestedAt": "2024-12-17T10:35:00Z",
  "sentAt": null,
  "ackAt": null,
  "failureReason": null
}
```

**cURL Example:**
```bash
# Set flow rate
curl -X POST http://localhost:8080/api/commands \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": 1,
    "type": "SET_FLOW_RATE",
    "payloadJson": "{\"target_flow_lpm\": 3.5}"
  }'

# Close valve
curl -X POST http://localhost:8080/api/commands \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": 1,
    "type": "VALVE_CLOSE",
    "payloadJson": "{}"
  }'
```

---

### 13. List Commands

**Endpoint:** `GET /commands?deviceId={id}&status={status}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `deviceId` (optional): Filter by device
- `status` (optional): Filter by status (PENDING, SENT, ACK, FAILED, EXPIRED)

**Response (200 OK):**
```json
[
  {
    "id": 42,
    "deviceId": 1,
    "type": "SET_FLOW_RATE",
    "payloadJson": "{\"target_flow_lpm\": 3.5}",
    "status": "ACK",
    "correlationId": "cmd_abc123def456",
    "requestedAt": "2024-12-17T10:35:00Z",
    "sentAt": "2024-12-17T10:35:02Z",
    "ackAt": "2024-12-17T10:35:15Z",
    "failureReason": null
  }
]
```

**cURL Example:**
```bash
# All commands for device
curl -X GET "http://localhost:8080/api/commands?deviceId=1" \
  -H "Authorization: Bearer <token>"

# Pending commands only
curl -X GET "http://localhost:8080/api/commands?status=PENDING" \
  -H "Authorization: Bearer <token>"
```

---

### 14. Poll Commands (Device API Key)

**Endpoint:** `GET /device/commands/poll`

**Headers:**
```
X-Device-API-Key: dev_key_sample_001
```

**Query Parameters:**
- `deviceUid`: Device unique identifier

**Response (200 OK):**
```json
[
  {
    "id": 42,
    "deviceId": 1,
    "type": "SET_FLOW_RATE",
    "payloadJson": "{\"target_flow_lpm\": 3.5}",
    "status": "SENT",
    "correlationId": "cmd_abc123def456",
    "requestedAt": "2024-12-17T10:35:00Z",
    "sentAt": "2024-12-17T10:35:02Z",
    "ackAt": null,
    "failureReason": null
  }
]
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8080/api/device/commands/poll?deviceUid=DEV-SAMPLE-001" \
  -H "X-Device-API-Key: dev_key_sample_001"
```

**Notes:**
- Automatically marks PENDING → SENT
- Device should poll every 30-60 seconds

---

### 15. Acknowledge Command (Device API Key)

**Endpoint:** `POST /device/commands/ack`

**Headers:**
```
X-Device-API-Key: dev_key_sample_001
Content-Type: application/json
```

**Request:**
```json
{
  "correlationId": "cmd_abc123def456",
  "success": true,
  "message": "Flow rate adjusted to 3.5 L/min"
}
```

**Response (200 OK):**
```json
{
  "id": 42,
  "deviceId": 1,
  "type": "SET_FLOW_RATE",
  "payloadJson": "{\"target_flow_lpm\": 3.5}",
  "status": "ACK",
  "correlationId": "cmd_abc123def456",
  "requestedAt": "2024-12-17T10:35:00Z",
  "sentAt": "2024-12-17T10:35:02Z",
  "ackAt": "2024-12-17T10:35:15Z",
  "failureReason": null
}
```

**Failure Example:**
```json
{
  "correlationId": "cmd_abc123def456",
  "success": false,
  "message": "Valve motor timeout"
}
```

**cURL Example:**
```bash
# Success
curl -X POST http://localhost:8080/api/device/commands/ack \
  -H "X-Device-API-Key: dev_key_sample_001" \
  -H "Content-Type: application/json" \
  -d '{
    "correlationId": "cmd_abc123def456",
    "success": true,
    "message": "Command executed successfully"
  }'

# Failure
curl -X POST http://localhost:8080/api/device/commands/ack \
  -H "X-Device-API-Key: dev_key_sample_001" \
  -H "Content-Type: application/json" \
  -d '{
    "correlationId": "cmd_abc123def456",
    "success": false,
    "message": "Valve motor timeout"
  }'
```

---

## Alert APIs

### 16. Get User Alerts

**Endpoint:** `GET /alerts?isRead={true|false}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `isRead` (optional): Filter by read status

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "deviceId": 1,
    "deviceName": "Kitchen Faucet Sensor",
    "severity": "CRITICAL",
    "type": "LEAK_SUSPECTED",
    "message": "Possible leak detected! Flow rate of 12.5 L/min exceeds threshold of 10.0 L/min.",
    "timestamp": "2024-12-17T09:15:00Z",
    "isRead": false
  },
  {
    "id": 9,
    "deviceId": 2,
    "deviceName": "Bathroom Shower Sensor",
    "severity": "WARNING",
    "type": "OVERCONSUMPTION",
    "message": "Daily consumption of 520.3 liters exceeded threshold of 500.0 liters.",
    "timestamp": "2024-12-16T23:00:00Z",
    "isRead": true
  }
]
```

**cURL Example:**
```bash
# All alerts
curl -X GET http://localhost:8080/api/alerts \
  -H "Authorization: Bearer <token>"

# Unread only
curl -X GET "http://localhost:8080/api/alerts?isRead=false" \
  -H "Authorization: Bearer <token>"
```

---

### 17. Mark Alert as Read

**Endpoint:** `PUT /alerts/{id}/read`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 10,
  "deviceId": 1,
  "deviceName": "Kitchen Faucet Sensor",
  "severity": "CRITICAL",
  "type": "LEAK_SUSPECTED",
  "message": "Possible leak detected! Flow rate of 12.5 L/min exceeds threshold of 10.0 L/min.",
  "timestamp": "2024-12-17T09:15:00Z",
  "isRead": true
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:8080/api/alerts/10/read \
  -H "Authorization: Bearer <token>"
```

---

### 18. Get Unread Alert Count

**Endpoint:** `GET /alerts/unread/count`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "count": 3
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8080/api/alerts/unread/count \
  -H "Authorization: Bearer <token>"
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid JSON or missing required fields |
| 401 | Unauthorized | Invalid/expired JWT token or API key |
| 403 | Forbidden | Insufficient permissions (e.g., user accessing admin endpoint) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email already registered) |
| 500 | Internal Server Error | Unexpected server error |

### Error Response Format

```json
{
  "message": "Error description",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

### Common Error Messages

**Authentication Errors:**
```json
{
  "message": "Invalid credentials",
  "timestamp": "2024-12-17T10:30:00Z"
}

{
  "message": "Token has expired",
  "timestamp": "2024-12-17T10:30:00Z"
}

{
  "message": "Invalid device API key",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

**Resource Errors:**
```json
{
  "message": "Device not found with id: 999",
  "timestamp": "2024-12-17T10:30:00Z"
}

{
  "message": "User already exists with email: john@example.com",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

**Validation Errors:**
```json
{
  "message": "Invalid request: flowRateLpm must be positive",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

---

## Postman Collection

Import this collection into Postman for easy API testing:

```json
{
  "info": {
    "name": "IoT Water Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\",\n  \"name\": \"Test\",\n  \"surname\": \"User\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@wateriot.com\",\n  \"password\": \"Admin123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api"
    }
  ]
}
```

Save as `postman_collection.json` and import into Postman.

---

## Rate Limiting (Production)

Recommended rate limits for production:

- **User endpoints:** 100 requests/minute per user
- **Telemetry ingest:** 600 requests/minute per device (1 req/second)
- **Command polling:** 120 requests/minute per device (1 req/30 seconds)

Implement using Spring Rate Limiter or API Gateway (Kong, AWS API Gateway, etc.).

---

**Last Updated:** December 17, 2024
**API Version:** 1.0.0
