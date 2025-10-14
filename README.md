# E2EE Chat Demo

A simple end-to-end encrypted chat application with React Native (Expo) and Node.js backend.

## Project Structure

- `backend-e2ee/` - Node.js WebSocket server
- `demo-e2ee/` - React Native mobile app

## Quick Start

### Backend

1. Navigate to backend folder:

```bash
cd backend-e2ee
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

### Mobile App

1. Navigate to demo-e2ee folder:

```bash
cd demo-e2ee
```

2. Install dependencies:

```bash
npm install
```

3. Update the SERVER_URL in `app/(tabs)/e2ee.tsx` with your computer's IP address:

```typescript
const SERVER_URL = "http://YOUR_IP:3000";
```

To find your IP:

- Windows: Run `ipconfig` and look for IPv4 Address
- Mac/Linux: Run `ifconfig` or `ip addr`

4. Start the app:

```bash
npm start
```

Then press:

- `a` for Android
- `i` for iOS
- `w` for web

## Features

- ✅ End-to-end encryption (simplified XOR encryption for demo)
- ✅ Real-time messaging with WebSocket
- ✅ No authentication required
- ✅ User presence detection
- ✅ Simple and clean UI

## Security Note

This is a **demo application** using simplified encryption (XOR). For production use, implement proper cryptographic libraries like:

- `react-native-rsa-native`
- `crypto-js`
- Or use established protocols like Signal Protocol

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Mobile**: React Native, Expo, TypeScript
- **Encryption**: Expo Crypto (demo implementation)
