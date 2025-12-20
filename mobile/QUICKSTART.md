# Quick Start Guide - Smart Faucet Mobile App

## 🚀 Get Started in 5 Minutes

### Step 1: Navigate to Mobile Directory
```bash
cd mobile
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React Native & Expo
- React Navigation
- React Query
- React Native Paper (UI components)
- And more...

### Step 3: Configure API URL

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```
API_BASE_URL=http://localhost:8080/api
```

**Important**: 
- iOS Simulator: `http://localhost:8080/api`
- Android Emulator: `http://10.0.2.2:8080/api`
- Physical Device: `http://YOUR_COMPUTER_IP:8080/api`

### Step 4: Start the App

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code for physical device (with Expo Go app)

### Step 5: Login

Use credentials from your backend:
- Email: `admin@example.com` (or any registered user)
- Password: Your password

## 📱 What You'll See

### Dashboard
- Today's water consumption
- Week's water consumption
- Active devices count
- Unread alerts count
- Quick access to recent devices

### Devices
- List of all your devices
- Real-time status indicators
- Search functionality
- Tap any device to see details

### Device Details
- Current status and last seen time
- Control buttons (Open, Close, Shut Off, Set Flow Rate)
- Flow rate and volume charts
- Recent readings
- Command history with status

### Alerts
- All alerts with severity badges
- Filter by unread/all
- Tap to mark as read
- Device name for each alert

### Profile
- Your user information
- Change password
- Admin panel (if admin role)
- Logout

## 🔧 Troubleshooting

### "Unable to connect to backend"

1. Make sure backend is running:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Check your API URL in `.env`

3. For Android Emulator, use `10.0.2.2` instead of `localhost`

### "Expo Go app not connecting"

1. Ensure phone and computer are on same WiFi
2. Use your computer's IP address in `.env`
3. Restart Expo server: `npm start --clear`

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start --clear
```

## 📦 Project Structure Overview

```
mobile/
├── App.tsx                    # Entry point
├── src/
│   ├── api/                   # API integration
│   │   ├── client.ts          # Axios + JWT interceptors
│   │   ├── auth.ts            # Login/signup
│   │   ├── devices.ts         # Device operations
│   │   ├── commands.ts        # Send commands
│   │   └── alerts.ts          # Alert management
│   ├── screens/               # All app screens
│   │   ├── auth/              # Login & Signup
│   │   └── app/               # Main app screens
│   ├── components/            # Reusable UI components
│   ├── navigation/            # Navigation setup
│   └── theme/                 # Colors, typography, etc.
```

## 🎯 Key Features Implemented

✅ JWT Authentication with SecureStore  
✅ Real-time device monitoring  
✅ Command sending with status tracking  
✅ Alert management  
✅ Charts and analytics  
✅ Pull-to-refresh  
✅ Offline caching  
✅ Form validation  
✅ Role-based access (Admin features)  
✅ Error handling with retry  

## 📚 Next Steps

1. **Customize Theme**: Edit `src/theme/theme.ts`
2. **Add Features**: Extend screens in `src/screens/app/`
3. **Add Tests**: Create tests in `__tests__/` directory
4. **Build for Production**: `eas build --platform android/ios`

## 🆘 Need Help?

1. Check the main `README.md` for detailed documentation
2. Review `TROUBLESHOOTING.md` section in README
3. Check Expo docs: https://docs.expo.dev
4. Check React Navigation: https://reactnavigation.org

---

Happy Coding! 🎉
