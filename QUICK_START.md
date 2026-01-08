# 🚀 Quick Start Guide - Smart Water Management System

## System Status ✅

### Backend Services (Docker)
```
✅ wateriot-app   - Spring Boot API on :8080
✅ wateriot-db    - MySQL Database on :3307
✅ wateriot-web   - Nginx Web Server on :80
```

### Mobile App (Expo)
```
✅ Metro Bundler running on :8087
✅ API connected to: http://172.20.10.4:8080/api
```

## 🎯 Quick Commands

### Start Backend
```bash
cd /Users/vedatayaz/Desktop/capstone
docker-compose up -d
```

### Start Mobile App
```bash
cd /Users/vedatayaz/Desktop/capstone/mobile
npx expo start --port 8087
```

### Check Status
```bash
# Docker containers
docker ps

# Backend logs
docker logs wateriot-app --tail 50 -f

# Check API health
curl http://172.20.10.4:8080/api/health
```

### Restart Services
```bash
# Restart backend
docker-compose restart

# Restart just the app
docker restart wateriot-app

# Clean restart (caution: may lose data)
docker-compose down
docker-compose up -d
```

## 📱 Access URLs

### Backend API
- **Local**: http://localhost:8080/api
- **Network**: http://172.20.10.4:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html

### Frontend Web
- **Local**: http://localhost
- **Network**: http://172.20.10.4

### Mobile App
- **Expo DevTools**: http://localhost:8087
- **QR Code**: Scan with Expo Go app
- **iOS Simulator**: Press 'i' in terminal
- **Android Emulator**: Press 'a' in terminal

### Database
- **Host**: localhost:3307
- **Username**: root
- **Password**: root123
- **Database**: smart_water

## 🎨 Testing the New Design

### 1. Open Mobile App
```bash
cd mobile
npx expo start --port 8087
```

### 2. Scan QR Code
- Open Expo Go on your phone
- Scan the QR code displayed
- Or press 'i' for iOS simulator

### 3. Test Authentication
- **Sign Up**: Fill all fields with icons
- **Login**: Use created credentials
- See gradient backgrounds and glassmorphism

### 4. Explore Dashboard
- View KPI widgets with icons (💧📊✅⚠️)
- Scroll device cards with status bars
- Tap device cards for details
- Try quick actions (open/close/stop)

### 5. Check Design Elements
- ✅ Gradient backgrounds
- ✅ Logo circles with water drops
- ✅ Icon-enhanced inputs
- ✅ Password visibility toggles
- ✅ Modern rounded cards
- ✅ Shadows and depth
- ✅ Status color coding

## 🔧 Development Commands

### Frontend Web (if needed)
```bash
cd frontend
# Serve with live server or open index.html
```

### Backend Development
```bash
cd backend
./mvnw spring-boot:run

# Or with Docker rebuild
docker-compose up --build
```

### Mobile Development
```bash
cd mobile

# Install dependencies
npm install

# Start dev server
npx expo start

# Start on specific port
npx expo start --port 8087

# Clear cache
npx expo start -c

# Type checking
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker logs wateriot-app

# Restart container
docker restart wateriot-app

# Check database
docker exec -it wateriot-db mysql -uroot -proot123
```

### Mobile App Not Connecting
```bash
# Check API URL in app.config.ts
# Should be: http://172.20.10.4:8080/api

# Test API manually
curl http://172.20.10.4:8080/api/health

# Restart Expo
cd mobile
npx expo start -c
```

### Port Already in Use
```bash
# Kill process on port 8087
lsof -ti:8087 | xargs kill -9

# Or use different port
npx expo start --port 8088
```

### Watchman Warning (can be ignored)
```bash
# If you want to clear it:
watchman watch-del '/Users/vedatayaz/Desktop/capstone'
watchman watch-project '/Users/vedatayaz/Desktop/capstone'
```

## 📊 Test Data

### Test User Account
```
Email: test@example.com
Password: test123
Name: Test User
```

### Create New User
```bash
# Via mobile app Sign Up screen
# Or via API:
curl -X POST http://172.20.10.4:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123"
  }'
```

## 🎨 Design Features to Test

### Login Screen
- [x] Gradient background (blue to cyan)
- [x] Water drop logo circle
- [x] Email input with ✉️ icon
- [x] Password with 🔒 icon and eye toggle
- [x] Rounded white card with shadow
- [x] Modern sign in button
- [x] "Don't have account?" link

### Signup Screen
- [x] Same gradient background
- [x] Water drop logo
- [x] Name input with 👤 icon
- [x] Surname input with 👥 icon
- [x] Email input with ✉️ icon
- [x] Phone input with 📱 icon
- [x] Password inputs with 🔒🔐 icons
- [x] Both passwords have eye toggles
- [x] Create account button
- [x] Divider with "or"
- [x] Sign in redirect link

### Dashboard
- [x] Gradient header
- [x] "Dashboard" title
- [x] "Water Management Overview" subtitle
- [x] KPI widgets with icons
  - [x] 💧 Today's Usage
  - [x] 📊 This Week
  - [x] ✅ Active Devices
  - [x] ⚠️ Alerts
- [x] Device cards with:
  - [x] Colored status bar
  - [x] Device icon circle
  - [x] Location with 📍
  - [x] Device ID and last active
  - [x] Action buttons (🔓🔒⛔)
- [x] "View All →" link

## 📈 Performance Check

### Expected Metrics
- Bundle size: ~6-7 MB
- Initial load: ~2-3 seconds
- Navigation: <100ms
- API response: <500ms

### Monitor Performance
```bash
# In Expo console
# Check bundle time (should be ~6-7 seconds)
# Monitor memory usage
# Check for warnings
```

## 🎯 Next Development Steps

### Immediate (This Session)
- [ ] Test all modernized screens
- [ ] Verify navigation flows
- [ ] Check error states
- [ ] Test on physical device

### Short Term (Next Session)
- [ ] Complete DevicesScreen
- [ ] Add DeviceDetailScreen
- [ ] Modernize AlertsScreen
- [ ] Update ProfileScreen

### Medium Term
- [ ] Add animations
- [ ] Implement skeleton loaders
- [ ] Add haptic feedback
- [ ] Polish remaining components

## 📝 Notes

### Current Progress
- ✅ 60% of screens modernized
- ✅ Core authentication complete
- ✅ Dashboard redesigned
- ✅ Components updated
- ⏳ 40% remaining (4 more screens)

### Known Issues
- ⚠️ Watchman warning (cosmetic, can ignore)
- ⚠️ Port 8081 in use (using 8087 instead)

### Useful Links
- [Expo Docs](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)

---

## 🎉 Quick Demo Flow

1. **Start Everything**
   ```bash
   # Terminal 1: Backend
   cd /Users/vedatayaz/Desktop/capstone
   docker-compose up -d
   
   # Terminal 2: Mobile
   cd /Users/vedatayaz/Desktop/capstone/mobile
   npx expo start --port 8087
   ```

2. **Open Mobile App**
   - Scan QR code with Expo Go
   - Or press 'i' for iOS simulator

3. **Test Modern Design**
   - See login screen with gradient
   - Try signup with icon inputs
   - Login and view dashboard
   - Interact with device cards

4. **Verify Backend**
   ```bash
   curl http://172.20.10.4:8080/api/health
   ```

5. **Monitor Logs**
   ```bash
   docker logs wateriot-app -f
   ```

**Everything should work smoothly with the new modern design! 🎨✨**

---

**Last Updated**: January 2025
**System Status**: ✅ All Services Running
**Mobile App**: ✅ Modernized & Running
**Backend**: ✅ Healthy
**Database**: ✅ Connected
