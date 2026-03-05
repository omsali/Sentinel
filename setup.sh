#!/bin/bash
echo "Installing dependencies for Sentinel Platform..."

echo "1/3 Installing Ingestion Server deps..."
cd services/ingestion-server && npm install && cd ../..

echo "2/3 Installing Telemetry Producer deps..."
cd services/telemetry-producer && npm install && cd ../..

echo "3/3 Installing Web Client deps..."
cd web-client && npm install && cd ..

echo "Initialization complete. Run 'docker-compose up --build' to start."

