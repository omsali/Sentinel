import { Server, Socket } from 'socket.io';
import { TelemetryData, Alert } from './types';
import { writeTelemetryPoint, flushInfluxWrites } from './influxdb';
import { config } from './config';

let activeClients = 0; // Keep track of connected clients

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    activeClients++;
    console.log(`Client connected: ${socket.id}. Total active clients: ${activeClients}`);

    // Handle incoming telemetry from producers (or potentially other clients)
    socket.on('telemetry_batch', (data: TelemetryData) => {
      // 1. Immediate Broadcast (Low Latency Path for Dashboard)
      io.emit('metrics_update', data);

      // 2. Persistence (Asynchronous Path to InfluxDB)
      writeTelemetryPoint(data);

      // 3. Server-side Alerting Logic
      checkAndEmitAlerts(data, io);
    });

    socket.on('disconnect', () => {
      activeClients--;
      console.log(`Client disconnected: ${socket.id}. Total active clients: ${activeClients}`);
      // On disconnect, ensure any pending writes from this connection are flushed
      flushInfluxWrites();
    });

    // Optional: Handle error from client
    socket.on('error', (err: Error) => {
      console.error(`Socket error from ${socket.id}:`, err);
    });
  });

  // Graceful shutdown: flush remaining data on process exit
  process.on('SIGINT', async () => {
    console.log('SIGINT received. Flushing InfluxDB and shutting down...');
    await flushInfluxWrites();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Flushing InfluxDB and shutting down...');
    await flushInfluxWrites();
    process.exit(0);
  });
};

/**
 * Checks incoming telemetry data against defined thresholds and emits alerts.
 */
const checkAndEmitAlerts = (data: TelemetryData, io: Server) => {
  const { cpu, memory, host, timestamp } = data;
  const { alertThresholds } = config;

  if (cpu > alertThresholds.cpu) {
    const alert: Alert = {
      timestamp,
      host,
      metric: 'cpu',
      threshold: alertThresholds.cpu,
      currentValue: cpu,
      message: `CRITICAL: CPU usage on ${host} exceeded ${alertThresholds.cpu}% (${cpu}%)`,
    };
    io.emit('alert', alert); // Emit a specific 'alert' event
    console.warn(`ALERT: ${alert.message}`);
  }

  if (memory > alertThresholds.memory) {
    const alert: Alert = {
      timestamp,
      host,
      metric: 'memory',
      threshold: alertThresholds.memory,
      currentValue: memory,
      message: `CRITICAL: Memory usage on ${host} exceeded ${alertThresholds.memory}% (${memory}%)`,
    };
    io.emit('alert', alert);
    console.warn(`ALERT: ${alert.message}`);
  }
};