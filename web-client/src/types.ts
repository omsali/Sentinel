// Shared with backend
export interface TelemetryData {
  host: string;
  cpu: number;
  memory: number;
  timestamp: string; // ISO 8601 string
}

// Shared with backend
export interface Alert {
  timestamp: string;
  host: string;
  metric: 'cpu' | 'memory';
  threshold: number;
  currentValue: number;
  message: string;
}

// For charting
export interface MetricPoint {
  time: string; // Formatted time for display
  cpu: number;
  memory: number;
}