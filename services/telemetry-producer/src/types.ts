// Shared type with ingestion-server
export interface TelemetryData {
    host: string;
    cpu: number;
    memory: number;
    timestamp: string;
}