import React from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import MetricChart from './components/MetricChart';
import AlertDisplay from './components/AlertDisplay';

const App: React.FC = () => {
  // Replace with your local IP or 'http://localhost:4000' for local dev
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

  const { metrics, alerts, isConnected } = useTelemetry(WS_URL);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">
            SENTINEL <span className="text-gray-500 font-light">| Real-Time Observability</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitoring distributed system telemetry via WebSockets
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center px-3 py-1 rounded-full bg-gray-900 border border-gray-700">
            <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-mono uppercase">
              {isConnected ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metric Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricChart 
              data={metrics} 
              dataKey="cpu" 
              title="CPU Load" 
              color="#6366f1" 
              yDomain={[0, 100]} 
            />
            <MetricChart 
              data={metrics} 
              dataKey="memory" 
              title="Memory Usage" 
              color="#10b981" 
              yDomain={[0, 100]} 
            />
          </div>

          {/* System Info / Stats Bar */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pipeline Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-mono text-indigo-400">{metrics.length}</p>
                <p className="text-xs text-gray-500">Buffer Size</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-green-400">~60ms</p>
                <p className="text-xs text-gray-500">Avg Latency</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-yellow-400">{alerts.length}</p>
                <p className="text-xs text-gray-500">Total Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Logs */}
        <div className="lg:col-span-1">
          <AlertDisplay alerts={alerts} />
          
          <div className="mt-6 bg-gray-900 border border-gray-800 p-4 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Connection Details</h3>
            <div className="space-y-2 font-mono text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Transport:</span>
                <span className="text-indigo-400">WebSocket</span>
              </div>
              <div className="flex justify-between">
                <span>Cluster:</span>
                <span className="text-indigo-400">Sentinel-Node-01</span>
              </div>
              <div className="flex justify-between">
                <span>Buffer Policy:</span>
                <span className="text-indigo-400">LIFO (100 pts)</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="mt-12 text-center text-gray-600 text-xs">
        Sentinel Monitoring Platform &copy; 2026 | Built for High-Throughput Ingestion
      </footer>
    </div>
  );
};

export default App;