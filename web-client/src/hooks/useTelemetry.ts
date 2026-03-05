/// <reference types="vite/client" />
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { TelemetryData, Alert, MetricPoint } from '../types';

interface TelemetryState {
  metrics: MetricPoint[];
  alerts: Alert[];
  isConnected: boolean;
}

const MAX_METRIC_POINTS = 100; // Display last 100 points (approx 100 seconds if 1s interval)
const MAX_ALERTS = 10;

export const useTelemetry = (serverUrl: string = import.meta.env.VITE_WS_URL || 'ws://localhost:4000'): TelemetryState => {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  const processMetricData = useCallback((data: TelemetryData) => {
    setMetrics((prev) => {
      const newPoint: MetricPoint = {
        time: new Date(data.timestamp).toLocaleTimeString(), // Format for display
        cpu: data.cpu,
        memory: data.memory,
      };
      // Keep a rolling window of metrics
      return [...prev, newPoint].slice(-MAX_METRIC_POINTS);
    });
  }, []);

  const processAlertData = useCallback((alert: Alert) => {
    setAlerts((prev) => [alert, ...prev].slice(0, MAX_ALERTS));
  }, []);

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn('Disconnected from WebSocket server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    socket.on('metrics_update', processMetricData);
    socket.on('alert', processAlertData); // Listen for specific alert events

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('metrics_update');
      socket.off('alert');
      socket.disconnect();
    };
  }, [serverUrl, processMetricData, processAlertData]);

  return { metrics, alerts, isConnected };
};