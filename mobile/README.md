# Smart Faucet Mobile App

Production-ready React Native mobile application for the IoT Smart Faucet Water Management System.

## 📱 Features

- **Authentication**: Secure login/signup with JWT tokens stored in Expo SecureStore
- **Dashboard**: Real-time KPIs (today/week water consumption, active devices, alerts)
- **Device Management**: 
  - View all devices with real-time status
  - Device details with charts and analytics
  - Send commands (open/close valve, set flow rate, shut off)
  - View command history with status tracking
- **Alerts**: View and manage system alerts with severity indicators
- **Profile**: User profile management, password change, and logout
- **Admin Panel**: User and device management (role-based access)

## 🛠 Tech Stack

- **Framework**: React Native with Expo (~50.0.0)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: @tanstack/react-query for API state
- **HTTP Client**: Axios with interceptors
- **Auth Storage**: expo-secure-store (secure JWT storage)
- **Forms**: react-hook-form + zod validation
- **UI Library**: react-native-paper
- **Charts**: react-native-chart-kit
- **Date Formatting**: date-fns

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for macOS) or Android Studio (for Android)
- Backend API running (default: http://localhost:8080/api)

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Create a `.env` file in the mobile directory:

```bash
cp .env.example .env
```

Edit `.env` to set your API base URL:

```
API_BASE_URL=http://localhost:8080/api
```

**Important Notes:**
- For iOS Simulator: Use `http://localhost:8080/api`
- For Android Emulator: Use `http://10.0.2.2:8080/api`
- For Physical Devices: Use your computer's IP address (e.g., `http://192.168.1.100:8080/api`)

### 3. Run the App

Start the Expo development server:

```bash
npm start
# or
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

### Running on Specific Platforms

```bash
# iOS
npm run ios

# Android
npm run android

# Web (limited functionality)
npm run web
```

## 📁 Project Structure

```
mobile/
├── App.tsx                 # App entry point
├── app.config.ts          # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── api/               # API client and endpoints
    │   ├── client.ts      # Axios instance with interceptors
    │   ├── types.ts       # TypeScript interfaces
    │   ├── auth.ts        # Auth API
    │   ├── devices.ts     # Devices API
    │   ├── readings.ts    # Readings API
    │   ├── commands.ts    # Commands API
    │   └── alerts.ts      # Alerts API
    ├── auth/              # Authentication context
    │   ├── AuthContext.tsx
    │   └── useAuth.ts
    ├── components/        # Reusable components
    │   ├── StatusBadge.tsx
    │   ├── DeviceCard.tsx
    │   ├── KPIWidget.tsx
    │   ├── AlertCard.tsx
    │   ├── ConfirmModal.tsx
    │   ├── FlowRateSlider.tsx
    │   ├── ErrorBanner.tsx
    │   ├── Loading.tsx
    │   └── EmptyState.tsx
    ├── screens/           # App screens
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   └── SignupScreen.tsx
    │   └── app/
    │       ├── DashboardScreen.tsx
    │       ├── DevicesScreen.tsx
    │       ├── DeviceDetailScreen.tsx
    │       ├── AlertsScreen.tsx
    │       ├── ProfileScreen.tsx
    │       └── AdminPanelScreen.tsx
    ├── navigation/        # Navigation structure
    │   ├── AuthStack.tsx
    │   ├── AppTabs.tsx
    │   └── RootNavigator.tsx
    ├── theme/             # Theme configuration
    │   └── theme.ts
    └── utils/             # Utility functions
        ├── date.ts
        └── format.ts
```

## 🔐 Security

### JWT Token Storage

The app uses **Expo SecureStore** for secure token storage, which:
- Uses iOS Keychain on iOS
- Uses Android Keystore on Android
- Provides encrypted storage for sensitive data

**Never use plain AsyncStorage for JWT tokens in production!**

### API Authentication

- All API requests include JWT Bearer token in Authorization header
- Automatic token refresh on 401 responses
- Secure logout with token cleanup

## 🔄 API Integration

### Base URL Configuration

The API base URL is configured in `app.config.ts`:

```typescript
extra: {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api'
}
```

### API Endpoints

The app expects the following REST API endpoints:

**Auth:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

**Devices:**
- `GET /api/devices` - List devices (user's owned or all for admin)
- `GET /api/devices/:id` - Get device details
- `POST /api/devices/register` - Register new device (admin)
- `PUT /api/devices/:id/assign/:userId` - Assign device (admin)
- `DELETE /api/devices/:id` - Delete device (admin)

**Readings:**
- `GET /api/devices/:id/readings` - Get device readings
- `GET /api/telemetry/aggregated` - Get dashboard KPIs

**Commands:**
- `GET /api/devices/:id/commands` - Get command history
- `POST /api/devices/:id/commands` - Send new command

**Alerts:**
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/read` - Mark alert as read

### Command Types

Supported command types:
- `OPEN_VALVE` - Open the valve
- `CLOSE_VALVE` - Close the valve
- `SHUT_OFF` - Emergency shut off
- `SET_FLOW_RATE` - Set flow rate (requires payload: `{ flowRateLpm: number }`)
- `SET_MODE` - Set device mode (requires payload: `{ mode: string }`)

### Command Status Lifecycle

Commands go through these states:
1. `PENDING` - Command created, waiting to be sent
2. `SENT` - Command sent to device
3. `ACKNOWLEDGED` - Device confirmed receipt
4. `FAILED` - Command failed to execute
5. `EXPIRED` - Command timed out

## 🎨 UI/UX Features

### Status Indicators

- **Active** (Green): Device is online and operational
- **Offline** (Red): Device is not responding
- **Maintenance** (Orange): Device is in maintenance mode

### Charts & Analytics

- Real-time flow rate charts
- Daily/weekly volume consumption
- Configurable time ranges (24h, 7d, 30d)

### Offline Support

- React Query caching for offline viewing
- Pull-to-refresh on all lists
- Retry mechanisms for failed requests

## 🐛 Troubleshooting

### Common Issues

#### 1. Cannot Connect to Backend

**Problem**: App shows "Network Error" or "Connection Refused"

**Solutions:**
- Check that backend is running
- Verify API_BASE_URL in `.env`
- For Android Emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure phone and computer are on same WiFi network
- Disable firewall temporarily to test

#### 2. CORS Errors (Web Only)

**Problem**: CORS policy blocking requests

**Solution**: Configure CORS in backend to allow your development origin:
```java
@CrossOrigin(origins = "http://localhost:19006")
```

#### 3. SSL/TLS Errors

**Problem**: "Network request failed" on HTTPS endpoints

**Solution**: 
- For development, use HTTP instead of HTTPS
- For production, ensure valid SSL certificate
- On Android, add `android:usesCleartextTraffic="true"` to AndroidManifest.xml for HTTP

#### 4. Expo Modules Not Found

**Problem**: Module import errors after installation

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

#### 5. iOS Simulator Issues

**Problem**: App crashes on iOS Simulator

**Solution:**
```bash
# Reset iOS Simulator
xcrun simctl erase all
npx expo start --ios
```

### Debug Mode

Enable debug logging:

```typescript
// In src/api/client.ts
client.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url);
  return config;
});
```

## 📱 Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Testing Plan

Recommended tests to implement:

1. **API Client Tests**
   - Mock axios requests
   - Test authentication flow
   - Test error handling

2. **Component Tests**
   - Render tests for all components
   - User interaction tests
   - Form validation tests

3. **Integration Tests**
   - Login flow
   - Device command flow
   - Alert management flow

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change API_BASE_URL to production URL
- [ ] Enable error tracking (Sentry, Bugsnag)
- [ ] Test on real devices (iOS and Android)
- [ ] Test with slow network
- [ ] Test offline scenarios
- [ ] Implement analytics (Firebase, Amplitude)
- [ ] Add crash reporting
- [ ] Configure app icons and splash screen
- [ ] Setup push notifications (if applicable)
- [ ] Enable Proguard/R8 for Android
- [ ] Test with production backend
- [ ] Review and update app permissions
- [ ] Add privacy policy and terms of service

## 📝 License

This project is part of the IoT Water Management System.

## 👥 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend API documentation
3. Check Expo documentation: https://docs.expo.dev
4. Check React Navigation docs: https://reactnavigation.org

## 🔄 Updates & Maintenance

### Updating Dependencies

```bash
# Update all dependencies
npm update

# Update Expo SDK
expo upgrade
```

### App Version

Update version in `app.config.ts`:

```typescript
version: '1.0.0'
```

---

**Built with ❤️ using React Native and Expo**
