# Troubleshooting Guide - Messages Not Appearing

## ✅ ISSUE FIXED!

The problem was a **JavaScript closure issue** where the socket event handlers were capturing the initial `null` value of `myKeys` instead of the updated value.

## 🔧 What Was Fixed:

### Problem:

```typescript
// OLD CODE - Closure problem
newSocket.on("message", ({ encryptedMessage, iv }) => {
  if (myKeys) {
    // ❌ This always sees null!
    decrypt(encryptedMessage, myKeys.privateKey);
  }
});
```

### Solution:

```typescript
// NEW CODE - Using useRef
const myKeysRef = useRef<KeyPair | null>(null);

useEffect(() => {
  myKeysRef.current = myKeys; // ✅ Always up-to-date
}, [myKeys]);

newSocket.on("message", ({ encryptedMessage, iv }) => {
  const keys = myKeysRef.current; // ✅ Gets current value
  if (keys) {
    decrypt(encryptedMessage, keys.privateKey);
  }
});
```

## 🎯 Now Messages Should Work!

### Test Steps:

1. **Open Browser Console** (F12) to see logs
2. **Alice sends message** → You should see:
   ```
   Sending message: { to: "xyz123", toUsername: "Bob", originalMessage: "Hello" }
   ```
3. **Bob receives message** → You should see:
   ```
   Received message: { from: "abc456", fromUsername: "Alice", decrypted: "Hello" }
   ```

## 🐛 If Messages Still Don't Appear:

### Check 1: Backend Running?

```bash
# Should show "Server running on port 3000"
```

### Check 2: Users Connected?

- Both users should see each other in the user list
- Check backend terminal for: "User registered: Alice" and "User registered: Bob"

### Check 3: Check Browser Console

```javascript
// Open browser console (F12)
// You should see these logs:
"Sending message: ..."; // When sending
"Received message: ..."; // When receiving
```

### Check 4: Network Tab

- Open Network tab in browser (F12 → Network)
- Filter by "WS" (WebSocket)
- Should see active WebSocket connection
- Click on it and check "Messages" tab

### Check 5: Keys Generated?

```javascript
// In browser console, type:
localStorage; // Should have socket connection info
```

## 🔍 Common Issues:

### Issue: "No keys available to decrypt message"

**Solution:** Keys weren't generated properly. Try:

1. Refresh the page
2. Re-enter username and join again

### Issue: Message shows in sender but not receiver

**Solution:**

1. Check if both users are connected (see user list)
2. Verify WebSocket connection in Network tab
3. Check backend logs for message relay

### Issue: Messages appear as encrypted gibberish

**Solution:** This means you're in Monitor Mode

1. Make sure you selected "Normal User" (not Monitor Mode)
2. Toggle off the "Monitor Mode" switch

## ✅ Expected Behavior:

### Alice's View:

```
┌─────────────────────┐
│ ← Back      Bob     │
├─────────────────────┤
│                     │
│    Hello Bob! 👋    │ ← Blue (sent by Alice)
│                     │
│  Hi Alice!          │ ← Gray (received from Bob)
│                     │
└─────────────────────┘
```

### Bob's View:

```
┌─────────────────────┐
│ ← Back     Alice    │
├─────────────────────┤
│                     │
│  Hello Bob! 👋      │ ← Gray (received from Alice)
│                     │
│    Hi Alice!        │ ← Blue (sent by Bob)
│                     │
└─────────────────────┘
```

### Hacker's View (Monitor Mode):

```
┌─────────────────────────┐
│ 🔍 Monitor Mode         │
├─────────────────────────┤
│ 📡 Alice → Bob          │
│ Encrypted:              │
│ aG3kL9x2bQ8...          │
│ 🔒 Cannot decrypt       │
└─────────────────────────┘
```

## 🎉 It Should Work Now!

The closure issue has been fixed with `useRef`. Messages should now properly:

1. ✅ Encrypt on sender's side
2. ✅ Transmit through server
3. ✅ Decrypt on receiver's side
4. ✅ Display in both chat windows

Try it out! 🚀
