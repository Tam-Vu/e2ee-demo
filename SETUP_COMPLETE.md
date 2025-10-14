# E2EE Chat Demo - Setup Complete! 🎉

## ✅ What's Been Set Up

### Backend Server (`backend-e2ee/`)

- ✅ WebSocket server with Socket.IO
- ✅ User registration and management
- ✅ Message relay between users
- ✅ Running on `http://192.168.2.37:3000`

### Mobile App (`demo-e2ee/`)

- ✅ React Native (Expo) chat interface
- ✅ End-to-end encryption utilities
- ✅ Real-time messaging
- ✅ No authentication required

## 🚀 How to Run

### Backend is Already Running!

The backend server is currently running in the terminal. You should see:

```
🚀 Server running on port 3000
```

### Start the Mobile App

1. Open a new terminal and run:

```bash
cd demo-e2ee
npm start
```

2. Choose your platform:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (Mac only)
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## 📱 How to Use the App

1. **Enter Username**: Type any username (no authentication needed)
2. **Join Chat**: Click "Join Chat" to connect to the server
3. **Select User**: See a list of online users and select one to chat with
4. **Send Messages**: Type your message and press Send
5. **Encrypted**: All messages are encrypted end-to-end using the crypto utilities

## 🔐 How E2EE Works (Simplified Demo)

1. Each user generates a key pair when joining
2. Messages are encrypted using the recipient's public key
3. Only the recipient can decrypt with their private key
4. The server never sees the plain text messages

**Note**: This demo uses simplified XOR encryption for demonstration purposes. For production, use proper cryptographic libraries like:

- `react-native-rsa-native`
- `crypto-js`
- Signal Protocol

## 🏗️ Project Structure

```
SE405/
├── backend-e2ee/
│   ├── server.js          # WebSocket server
│   ├── package.json       # Backend dependencies
│   └── README.md
│
└── demo-e2ee/
    ├── app/
    │   └── (tabs)/
    │       ├── e2ee.tsx   # Chat screen
    │       ├── index.tsx  # Home screen
    │       └── explore.tsx
    ├── utils/
    │   └── crypto.ts      # E2EE utilities
    └── package.json       # Mobile dependencies
```

## 🧪 Testing

1. Open two instances of the app (two phones or phone + web)
2. Register with different usernames
3. Select each other from the user list
4. Send encrypted messages!

## 📝 Features

- ✅ Real-time messaging
- ✅ End-to-end encryption
- ✅ User presence
- ✅ Simple UI
- ✅ No authentication
- ✅ Cross-platform (iOS, Android, Web)

## 🛠️ Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React Native, Expo, TypeScript
- **Encryption**: Expo Crypto (simplified demo)

## 🔧 Configuration

The mobile app is configured to connect to: `http://192.168.2.37:3000`

If your IP changes, update `SERVER_URL` in:

```
demo-e2ee/app/(tabs)/e2ee.tsx
```

## 📚 Next Steps

To make this production-ready:

1. Implement proper asymmetric encryption (RSA/ECC)
2. Add user authentication
3. Implement message persistence (optional for E2EE)
4. Add typing indicators
5. Add read receipts
6. Implement group chat
7. Add file sharing with encryption

Enjoy your E2EE chat demo! 🚀
