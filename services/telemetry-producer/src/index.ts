import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { TelemetryData } from './types';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:4000';
const TICK_RATE_MS = parseInt(process.env.TICK_RATE_MS || '1000', 10);
const HOST_ID = `${process.env.HOST_ID_PREFIX || 'host'}-${uuidv4().substring(0, 4)}`;

let socket: Socket;
let intervalId: NodeJS.Timeout | null = null;

let currentCpu = 50; // Starting CPU usage
let currentMemory = 60; // Starting Memory usage

const generateTelemetry = (): TelemetryData => {
  // Simulate CPU usage fluctuation
  currentCpu += (Math.random() - 0.5) * 10; // +/- 5%
  if (currentCpu > 95) currentCpu = 95;
  if (currentCpu < 10) currentCpu = 10;

  // Simulate Memory usage fluctuation
  currentMemory += (Math.random() - 0.5) * 5; // +/- 2.5%
  if (currentMemory > 98) currentMemory = 98;
  if (currentMemory < 20) currentMemory = 20;

  return {
    host: HOST_ID,
    cpu: parseFloat(currentCpu.toFixed(2)),
    memory: parseFloat(currentMemory.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
};

const connectToServer = () => {
  socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log(`${HOST_ID} connected to ingestion server at ${SERVER_URL}`);
    if (intervalId) clearInterval(intervalId); // Clear any old interval
    intervalId = setInterval(() => {
      const data = generateTelemetry();
      socket.emit('telemetry_batch', data);
      // console.log(`${HOST_ID} sent:`, data); // Too verbose for continuous output
    }, TICK_RATE_MS);
  });

  socket.on('disconnect', (reason: Socket.DisconnectReason) => {
    console.log(`${HOST_ID} disconnected: ${reason}`);
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  socket.on('connect_error', (error: Error) => {
    console.error(`${HOST_ID} connection error:`, error.message);
  });
};

// Start the producer
connectToServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`${HOST_ID} received SIGINT, shutting down...`);
  if (intervalId) clearInterval(intervalId);
  if (socket) socket.disconnect();
  process.exit(0);
});
process.on('SIGTERM', () => {
    console.log(`${HOST_ID} received SIGTERM, shutting down...`);
    if (intervalId) clearInterval(intervalId);
    if (socket) socket.disconnect();
    process.exit(0);
});