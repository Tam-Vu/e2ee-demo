# Quick Start Guide - E2EE Chat Demo

## ✅ Current Status

### Backend Server

**Status**: ✅ RUNNING on port 3000

- Location: `backend-e2ee/server.js`
- URL: `http://192.168.2.37:3000`

### Mobile App

**Status**: ✅ STARTING (Expo Dev Server)

- Location: `demo-e2ee/`
- Framework: React Native + Expo

## 🚀 Next Steps

### 1. Wait for Expo to finish starting

You should see a QR code in the terminal

### 2. Open the app on your device:

- **Android**: Press `a` to open in Android emulator
- **iOS**: Press `i` to open in iOS simulator (Mac only)
- **Web**: Press `w` to open in browser
- **Physical Device**:
  - Install "Expo Go" app from Play Store/App Store
  - Scan the QR code shown in terminal

### 3. Test the E2EE Chat:

1. Enter a username (e.g., "Alice")
2. Click "Join Chat"
3. Open another instance (another phone/browser)
4. Enter different username (e.g., "Bob")
5. Select each other from the user list
6. Send encrypted messages!

## 📱 App Flow

```
1. Username Screen
   ↓
2. User List Screen (see online users)
   ↓
3. Chat Screen (send encrypted messages)
```

## 🔐 E2EE Features

- ✅ Each message is encrypted before sending
- ✅ Server only relays encrypted data
- ✅ Only recipient can decrypt
- ✅ No message storage on server

## 🛠️ If You Need to Change IP

If your computer's IP changes:

1. Run: `ipconfig | findstr /i "IPv4"`
2. Update `SERVER_URL` in: `demo-e2ee/app/(tabs)/e2ee.tsx`
3. Restart the mobile app

## 📋 Keyboard Shortcuts in Expo

- `a` - Open on Android
- `i` - Open on iOS
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu
- `j` - Open debugger

## 🐛 Troubleshooting

### Can't connect to server?

- Make sure backend is running (check terminal)
- Verify IP address is correct
- Make sure phone and computer are on same WiFi network

### App won't start?

- Close and restart Expo: `Ctrl+C` then `npm start`
- Clear cache: `npm start -- --clear`

### Expo Go app issues?

- Update Expo Go to latest version
- Or use web browser instead (press `w`)

Enjoy testing your E2EE chat! 🎉
