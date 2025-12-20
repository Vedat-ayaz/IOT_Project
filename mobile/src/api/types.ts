// API Types
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface Device {
  id: number;
  deviceUid: string;
  name: string;
  location?: string;
  status: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE';
  lastSeenAt?: string;
  firmwareVersion?: string;
  model?: string;
  owner?: User;
  createdAt?: string;
}

export interface Reading {
  id: number;
  deviceId: number;
  ts: string;
  flowRateLpm: number;
  volumeLitersDelta: number;
  valveState: 'OPEN' | 'CLOSED' | 'PARTIAL';
  batteryPct?: number;
  signalStrength?: number;
}

export interface Command {
  id: number;
  deviceId: number;
  type: 'OPEN_VALVE' | 'CLOSE_VALVE' | 'SET_FLOW_RATE' | 'SHUT_OFF' | 'SET_MODE';
  payloadJson?: string;
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'EXPIRED';
  requestedAt: string;
  sentAt?: string;
  ackAt?: string;
  failureReason?: string;
  requestedBy?: User;
}

export interface Alert {
  id: number;
  deviceId: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'HIGH_FLOW' | 'LEAK_DETECTED' | 'LOW_BATTERY' | 'DEVICE_OFFLINE' | 'VALVE_MALFUNCTION';
  message: string;
  ts: string;
  isRead: boolean;
  device?: Device;
}

export interface AggregatedData {
  todayLiters: number;
  weekLiters: number;
  activeDevicesCount: number;
  unreadAlertsCount: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  user: User;
}

// Command Types
export interface CreateCommandRequest {
  type: 'OPEN_VALVE' | 'CLOSE_VALVE' | 'SET_FLOW_RATE' | 'SHUT_OFF' | 'SET_MODE';
  payload?: {
    flowRateLpm?: number;
    mode?: string;
  };
}

// Device Registration (Admin)
export interface RegisterDeviceRequest {
  deviceUid: string;
  name: string;
  location?: string;
  model?: string;
  firmwareVersion?: string;
}

// API Error Response
export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
  errors?: Record<string, string>;
}
