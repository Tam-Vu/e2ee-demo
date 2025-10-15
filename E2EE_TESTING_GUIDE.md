# 🧪 Hướng dẫn Test E2EE

## Chuẩn bị

### 1. Cập nhật Server URL (nếu cần)

Trong `demo-e2ee/app/(tabs)/e2ee.tsx`:

```typescript
const SERVER_URL = 'http://192.168.2.37:3000';
// Thay bằng IP của máy bạn nếu test trên thiết bị thật
```

### 2. Start Backend Server

```bash
cd backend-e2ee
npm install  # Lần đầu tiên
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

### 3. Start Mobile App

```bash
cd demo-e2ee
npm install  # Lần đầu tiên
npm start

# Chọn platform:
# - Press 'i' cho iOS Simulator
# - Press 'a' cho Android Emulator
# - Scan QR code cho thiết bị thật
```

## 📱 Test Scenarios

### Scenario 1: Chat giữa 2 users (Basic E2EE)

**Device 1: User Alice**

1. Launch app
2. Enter username: `Alice`
3. Keep "Normal User" mode
4. Tap "Join Chat"
5. Wait for other users...

**Device 2: User Bob**

1. Launch app
2. Enter username: `Bob`
3. Keep "Normal User" mode
4. Tap "Join Chat"
5. See "Alice" in user list
6. Tap on "Alice"

**Device 1: Alice**

- See "Bob" in user list
- Tap on "Bob"

**Device 2: Bob → Alice**

1. Type message: "Hello Alice!"
2. Tap "Send"

**Console Logs (Bob):**

```
🔑 Sending key exchange to: Alice
🔑 Received key exchange response from: Alice
✅ Shared secret established with: Alice
Sending message: { to: socket-123, toUsername: 'Alice', originalMessage: 'Hello Alice!' }
```

**Device 1: Alice**

- See decrypted message: "Hello Alice!"

**Console Logs (Alice):**

```
🔑 Received key exchange from: Bob
🔑 Sending key exchange response to: Bob
✅ Shared secret established with: Bob
Received message: { from: socket-456, fromUsername: 'Bob', decrypted: 'Hello Alice!' }
```

**Device 1: Alice → Bob**

1. Reply: "Hi Bob! How are you?"
2. Tap "Send"

**Device 2: Bob**

- See decrypted message: "Hi Bob! How are you?"

✅ **Verification:**

- Cả 2 users đều thấy plaintext messages
- Server console chỉ thấy encrypted data
- Key exchange tự động và transparent

---

### Scenario 2: Monitor Mode (Hacker Perspective)

**Device 3: Hacker**

1. Launch app
2. Enter username: `Hacker`
3. **Toggle to Monitor Mode** (tap the toggle button)
4. Tap "Join Chat"

**Device 1: Alice → Bob**

1. Send message: "Secret message!"

**Device 3: Hacker**

- See intercepted message:
  ```
  📡 Alice → Bob
  Encrypted Message (Full):
  dGhpcyBpcyBlbmNyeXB0ZWQgZGF0YQo=
  🔒 MESSAGE INTERCEPTED - Encrypted with shared secret (cannot decrypt)
  ```

**Device 2: Bob → Alice**

1. Reply: "Got it!"

**Device 3: Hacker**

- See another intercepted message (encrypted)

✅ **Verification:**

- Hacker thấy encrypted traffic
- Hacker KHÔNG thể decrypt
- Alice và Bob vẫn communicate normally

---

### Scenario 3: Key Exchange Interception

**Setup:**

- Device 1: Alice (Normal)
- Device 2: Bob (Normal)
- Device 3: Hacker (Monitor Mode)

**Flow:**

1. **Alice** joins → Hacker sees nothing (just user list update)
2. **Bob** joins → Hacker sees nothing
3. **Alice** selects Bob → Auto key exchange

**Hacker Console:**

```
📡 Alice → Bob
Encrypted Message (Full):
04a1b2c3d4e5f6... (public key hex)
🔑 KEY EXCHANGE - Public key intercepted (useless without private key)
```

```
📡 Bob → Alice
Encrypted Message (Full):
0489abcdef1234... (public key hex)
🔑 KEY EXCHANGE RESPONSE - Public key intercepted (useless without private key)
```

4. **Alice** sends: "Let's plan the surprise party"

**Hacker sees:**

```
📡 Alice → Bob
Encrypted Message (Full):
bXlzdGVyaW91c19lbmNyeXB0ZWRfZGF0YQ==
🔒 MESSAGE INTERCEPTED - Encrypted with shared secret (cannot decrypt)
```

✅ **Verification:**

- Hacker intercepts public keys → ❌ Cannot use them
- Hacker cannot calculate shared secret
- Hacker sees encrypted messages → ❌ Cannot decrypt

---

## 🔍 Debugging Tips

### Check Console Logs

**Frontend (React Native):**

```bash
# Metro Bundler console shows:
🔑 Key exchange logs
✅ Shared secret established
Sending/Receiving message logs
```

**Backend (Node.js):**

```bash
# Server console shows:
New client connected: socket-123
User registered: Alice
🔑 Key exchange request: Alice → Bob
🔑 Key exchange response: Bob → Alice
Message from Alice to Bob (Encrypted)
```

### Verify Shared Secrets Match

**Device 1 Console:**

```javascript
// Add to e2ee.tsx after calculating shared secret:
console.log('My shared secret:', toHex(sharedSecret));
```

**Device 2 Console:**

```javascript
// Should show SAME value:
console.log('My shared secret:', toHex(sharedSecret));
```

### Test Encryption/Decryption

```typescript
// Add to sendMessage function:
console.log('Original:', message);
console.log('Encrypted:', content);
console.log('IV:', iv);

// Add to message receive handler:
console.log('Received encrypted:', encryptedMessage);
console.log('Decrypted:', decrypted);
```

---

## 🐛 Common Issues

### Issue 1: "Could not connect to server"

**Solution:**

1. Check backend is running: `npm start` in `backend-e2ee/`
2. Check IP address matches
3. For iOS simulator: use `localhost` or `127.0.0.1`
4. For Android emulator: use `10.0.2.2`
5. For physical device: use computer's local IP

### Issue 2: "Establishing secure connection..."

**Solution:**

- This appears when sending message before key exchange completes
- Wait 1 second and try again
- Key exchange happens automatically

### Issue 3: "[Decryption failed]"

**Possible causes:**

1. Shared secrets don't match
2. IV mismatch
3. Corrupted encrypted data
4. Wrong user selected

**Debug:**

```typescript
// Check if shared secret exists:
console.log('Has shared secret:', !!selectedUser.sharedSecret);

// Check shared secret value:
console.log('Shared secret:', toHex(selectedUser.sharedSecret));
```

### Issue 4: Monitor not seeing messages

**Check:**

1. Monitor mode is enabled (toggle before joining)
2. Backend is broadcasting to monitors (check server.js)
3. Console shows intercepted events

---

## 📊 Expected Results Summary

### Normal Users (Alice & Bob):

✅ Auto key exchange when starting chat  
✅ See plaintext messages  
✅ Fast encryption/decryption  
✅ No visible crypto operations

### Monitor (Hacker):

✅ See all encrypted traffic  
❌ Cannot decrypt messages  
❌ Cannot derive shared secrets  
✅ Clear demonstration of E2EE security

### Server:

✅ Routes messages efficiently  
❌ Never sees plaintext  
❌ Never sees private keys  
❌ Never sees shared secrets  
✅ Only forwards encrypted data

---

## 🎯 Learning Objectives

After testing, you should understand:

1. **ECDH Key Exchange:**

   - How two parties establish shared secret
   - Why public keys alone are useless
   - Perfect forward secrecy

2. **AES Encryption:**

   - Symmetric encryption with shared secret
   - Role of IV (Initialization Vector)
   - Why AES is fast and secure

3. **E2EE Security Model:**

   - Server is untrusted (but still necessary)
   - Man-in-the-middle cannot decrypt
   - Only endpoints have decryption capability

4. **Real-world Parallels:**
   - Similar to WhatsApp, Signal, Telegram secret chats
   - Bitcoin uses same curve (secp256k1)
   - Foundation of modern secure messaging

---

## 🚀 Next Steps

Try these challenges:

1. **Add Key Fingerprints:** Show hash of public key for verification
2. **Group Chat:** Extend to multiple participants
3. **File Encryption:** Encrypt images/files before sending
4. **Key Rotation:** Regenerate keys after N messages
5. **Offline Messages:** Store encrypted messages when recipient offline

Happy Testing! 🎉
