import React from 'react';
import { Alert } from '../types';

interface AlertDisplayProps {
  alerts: Alert[];
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({ alerts }) => {
  return (
    <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg shadow-md max-h-60 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2 text-red-400">Recent Alerts</h3>
      {alerts.length === 0 ? (
        <p className="text-gray-400">No active alerts.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, index) => (
            <li key={index} className="bg-red-800 bg-opacity-50 p-2 rounded text-red-200 text-sm">
              <span className="font-mono text-xs mr-2">[{new Date(alert.timestamp).toLocaleTimeString()}]</span>
              <span className="font-semibold">{alert.host}:</span> {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertDisplay;