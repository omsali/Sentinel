import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { config } from './config';
import { TelemetryData } from './types';

const { url, token, org, bucket } = config.influx;

if (!url || !token || !org || !bucket) {
  console.error('InfluxDB environment variables are not fully configured.');
  process.exit(1);
}

const influxDB = new InfluxDB({ url, token });
// const writeApi: WriteApi = influxDB.getWriteApi(org, bucket, 'ms' config.influxWriteOptions as any);
const writeApi = influxDB.getWriteApi(org, bucket, undefined, {
  ...config.influxWriteOptions,
  writeFailed: (error, lines) => {
    console.error('InfluxDB write failed:', error, 'lines:', lines.length);
  },
});


// Log any errors from the InfluxDB write client (Note: 'on' method is not directly available on WriteApi in current client versions)
// influxDB.getWriteApi(org, bucket, config.influxWriteOptions as any).on('writeError', (error: Error) => {
//   console.error('InfluxDB Write Error:', error.message);
// });

// // Log any errors from the InfluxDB write client
// writeApi.on('writeError', (error: Error) => {
//   console.error('InfluxDB Write Error:', error);
// });

/**
 * Persists a single telemetry data point to InfluxDB.
 * The actual write to the database is batched and flushed by the WriteApi.
 */
export const writeTelemetryPoint = (data: TelemetryData): void => {
  const point = new Point('system_metrics')
    .tag('host', data.host)
    .floatField('cpu_usage', data.cpu)
    .floatField('mem_usage', data.memory)
    .timestamp(new Date(data.timestamp));

  writeApi.writePoint(point);
};

/**
 * Flushes any pending writes to InfluxDB.
 * Called on server shutdown or periodically.
 */
export const flushInfluxWrites = async (): Promise<void> => {
  try {
    await writeApi.flush();
    console.log('InfluxDB write buffer flushed.');
  } catch (error) {
    console.error('Failed to flush InfluxDB buffer:', error);
  }
};