// Define the structure of incoming telemetry data
export interface TelemetryData {
  host: string;
  cpu: number;
  memory: number;
  timestamp: string; // ISO 8601 string
}

// Define the structure of an alert
export interface Alert {
  timestamp: string;
  host: string;
  metric: 'cpu' | 'memory';
  threshold: number;
  currentValue: number;
  message: string;
}