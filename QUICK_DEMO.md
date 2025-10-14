# Quick Demo Instructions 🚀

## 3-Device E2EE Demo (Web Browsers)

### ⚡ Quick Start (5 minutes)

#### 1. Make sure backend is running ✅

You should see: `🚀 Server running on port 3000`

#### 2. Open 3 browser tabs/windows

Navigate all three to your Expo web app (press `w` in Expo terminal)

Typical URL: `http://localhost:8081`

---

### 🎭 Setup Your 3 "Devices"

#### 👤 Tab 1: Alice (Normal User)

```
Username: Alice
Mode: 🔒 Normal User (default)
Click: Join Chat
Then: Select "Bob" from user list
```

#### 👤 Tab 2: Bob (Normal User)

```
Username: Bob
Mode: 🔒 Normal User (default)
Click: Join Chat
Then: Select "Alice" from user list
```

#### 🕵️ Tab 3: Hacker (Monitor Mode)

```
Username: Hacker
Mode: Toggle to 🔓 Monitor Mode (click the toggle button)
Click: Join Chat
```

---

### 💬 Test the Demo

#### Alice sends message:

1. In Alice's tab, type: "Secret meeting at midnight"
2. Click Send

**Results:**

- ✅ Alice: Sees message in blue bubble
- ✅ Bob: Sees decrypted message "Secret meeting at midnight"
- ⚠️ Hacker: Sees encrypted gibberish + "Cannot decrypt without private key"

#### Bob replies:

1. In Bob's tab, type: "Got it, I'll be there!"
2. Click Send

**Results:**

- ✅ Bob: Sees message in blue bubble
- ✅ Alice: Sees decrypted message
- ⚠️ Hacker: Sees another encrypted message they can't read!

---

### 🎓 What This Proves

| What Hacker Sees              | What Hacker CAN'T See  |
| ----------------------------- | ---------------------- |
| ✅ Alice ↔ Bob are chatting   | ❌ Message content     |
| ✅ Encrypted data (gibberish) | ❌ Private keys        |
| ✅ Timestamps                 | ❌ Decrypted text      |
| ✅ Message count              | ❌ Actual conversation |

---

### 🎯 Demo Talking Points

1. **"Watch the hacker's screen - they can intercept but not decrypt"**
2. **"Each user's private key never leaves their device"**
3. **"Even if the server is hacked, messages remain private"**
4. **"This is how WhatsApp, Signal, and iMessage work"**

---

### 🔧 Troubleshooting

**Can't connect?**

- Check backend is running
- Make sure all tabs use same URL
- Check browser console for errors

**Hacker seeing plain text?**

- Make sure you toggled to Monitor Mode (🔓)
- Should see "Monitor Mode - Hacker" when registering

**Messages not appearing?**

- Make sure Alice selected Bob (and vice versa)
- Check backend terminal for logs

---

### 📱 Bonus: Mix Devices!

Try with:

- 2 phones + 1 web browser
- 1 phone + 2 web browsers
- 3 phones (if available)

Any combination works! Just make sure they're on the same network.

---

## 🎬 Ready to Demo!

Your setup is complete. Just open 3 browser tabs and follow the steps above.

**Expo web command:** Press `w` in the Expo terminal to open web version.
