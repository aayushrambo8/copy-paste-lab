import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Copy-Paste Lab WebSocket Backend is running!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface ClipboardItem {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: string;
}

// Ephemeral memory storage for session history
const sessionHistory: Record<string, ClipboardItem[]> = {};

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-session', (sessionId: string) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);

    if (sessionHistory[sessionId]) {
      socket.emit('session-history', sessionHistory[sessionId]);
    } else {
      sessionHistory[sessionId] = [];
      socket.emit('session-history', []);
    }
  });

  socket.on('send-item', (data: { sessionId: string, item: ClipboardItem }) => {
    const { sessionId, item } = data;
    
    if (!sessionHistory[sessionId]) {
      sessionHistory[sessionId] = [];
    }
    
    if (sessionHistory[sessionId].length >= 50) {
      sessionHistory[sessionId].shift(); // Remove oldest
    }
    
    sessionHistory[sessionId].push(item);

    // Broadcast to everyone else in the room
    socket.to(sessionId).emit('new-item', item);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
