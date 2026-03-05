# Sentinel Telemetry Demo

End-to-end real-time telemetry stack: simulated producers stream CPU/memory metrics over WebSockets to an ingestion server that persists to InfluxDB and broadcasts to a React dashboard with live charts and alerts.

## Architecture
- `telemetry-producer` → emits `telemetry_batch` events (one point per tick) via Socket.IO.
- `ingestion-server` → rebroadcasts as `metrics_update`, writes to InfluxDB, and emits `alert` when thresholds are crossed.
- `web-client` → Vite/React app that visualizes recent metrics and alert feed.
- `docker-compose.yml` → starts InfluxDB, the ingestion server, and a producer; the dashboard runs separately.

## Repository layout
- `services/ingestion-server/` — Express + Socket.IO gateway and InfluxDB writer.
- `services/telemetry-producer/` — synthetic metric generator.
- `web-client/` — Vite/Tailwind/React dashboard.
- `.env` — sample backend envs (ignored by Git).
- `setup.sh` — installs all package dependencies.

## Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose v2

## Quick start (Dockerized backend + producer)
```bash
# 1) Install JS deps (optional but speeds up docker build cache)
./setup.sh

# 2) Bring up InfluxDB + ingestion server + one producer
docker-compose up --build
```

Services:
- Ingestion server: http://localhost:4000 (health at `/health`)
- InfluxDB UI: http://localhost:8086 (org `sentinel_org`, bucket `telemetry_bucket`, token `my-super-secret-token`)
- Producer connects internally to `ws://ingestion-server:4000`

## Run the dashboard (local dev)
```bash
cd web-client
cp .env .env.local  # optional; ensure VITE_WS_URL is set
npm run dev         # opens on http://localhost:5173
```
Set `VITE_WS_URL` (in `.env` or `.env.local`) to `ws://localhost:4000` or the public WS endpoint.

## Environment variables
Backend / ingestion server (`services/ingestion-server`):
- `PORT` (default 4000)
- `INFLUX_URL` (e.g., `http://localhost:8086` or `http://influxdb:8086` in Compose)
- `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET`

Producer (`services/telemetry-producer`):
- `SERVER_URL` (e.g., `ws://localhost:4000` or `ws://ingestion-server:4000`)
- `TICK_RATE_MS` (default 1000)
- `HOST_ID_PREFIX` (default `host`)

Web client (`web-client`):
- `VITE_WS_URL` pointing to the Socket.IO endpoint.

## Development tips
- Ingestion server: `npm run dev` (ts-node + nodemon) inside `services/ingestion-server`.
- Producer: `npm run dev` inside `services/telemetry-producer`.
- Build for prod: `npm run build` (each package).
- Alert thresholds and write tuning are in `services/ingestion-server/src/config.ts`.

## Data model
Telemetry point:
```ts
{
  host: string;
  cpu: number;      // percent
  memory: number;   // percent
  timestamp: string; // ISO 8601
}
```
Alerts mirror these fields and include `metric`, `threshold`, `currentValue`, and a message.

## Notes / caveats
- CORS is wide-open (`*`) by default; lock it down for production.
- The dashboard aggregates all hosts into single CPU/Memory series; extend it if you need per-host breakdowns.
- `telemetry_batch` currently carries a single point; rename or batch as needed before scaling producers.
