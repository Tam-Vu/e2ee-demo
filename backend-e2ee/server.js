const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', ({ username, publicKey, isMonitor }) => {
    users.set(socket.id, { username, publicKey, socketId: socket.id, isMonitor: isMonitor || false });
    io.emit('users', Array.from(users.values()));
    console.log(`User registered: ${username}${isMonitor ? ' (MONITOR MODE - Hacker)' : ''}`);
  });

  socket.on('message', ({ to, encryptedMessage, iv }) => {
    const fromUser = users.get(socket.id);
    const toUser = users.get(to);
    
    // Send to recipient
    io.to(to).emit('message', {
      from: socket.id,
      fromUsername: fromUser?.username,
      toUsername: toUser?.username,
      encryptedMessage,
      iv,
      timestamp: Date.now()
    });

    // Broadcast to all monitors (hackers) - they see encrypted data
    users.forEach((user, socketId) => {
      if (user.isMonitor && socketId !== socket.id) {
        io.to(socketId).emit('intercepted', {
          from: socket.id,
          to: to,
          fromUsername: fromUser?.username,
          toUsername: toUser?.username,
          encryptedMessage,
          iv,
          timestamp: Date.now(),
          note: '🔒 INTERCEPTED - Cannot decrypt without private key'
        });
      }
    });

    console.log(`Message from ${fromUser?.username} to ${toUser?.username} (Encrypted)`);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.username}`);
    }
    users.delete(socket.id);
    io.emit('users', Array.from(users.values()));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
