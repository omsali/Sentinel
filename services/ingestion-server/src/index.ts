import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { setupSocketHandlers } from './socketHandler';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io server with CORS for the React frontend
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Setup Socket.io event handlers
setupSocketHandlers(io);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Ingestion Server is running');
});

httpServer.listen(config.port, () => {
  console.log(`Ingestion Server running on port ${config.port}`);
});