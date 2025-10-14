# E2EE Chat Backend

Simple WebSocket server for end-to-end encrypted chat.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Features

- WebSocket connections with Socket.IO
- User registration with public keys
- Message relay between users
- No message storage (true E2EE)
