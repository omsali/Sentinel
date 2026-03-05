import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  influx: {
    url: process.env.INFLUX_URL || 'http://localhost:8086',
    token: process.env.INFLUX_TOKEN || 'my-super-secret-token',
    org: process.env.INFLUX_ORG || 'sentinel_org',
    bucket: process.env.INFLUX_BUCKET || 'telemetry_bucket',
  },
  // InfluxDB write options
  influxWriteOptions: {
    batchSize: 500, // Write up to 500 points at a time
    flushInterval: 5000, // Flush every 5 seconds even if batchSize is not met
    maxRetries: 3,
    maxBufferLines: 5000, // Max points to buffer before dropping
    exponentialBase: 2,
    rateLimiting: 2000, // ms
  },
  // Server-side alerting thresholds
  alertThresholds: {
    cpu: 85, // %
    memory: 90, // %
  },
};