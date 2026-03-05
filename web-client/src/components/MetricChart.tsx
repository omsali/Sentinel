import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricPoint } from '../types';

interface MetricChartProps {
  data: MetricPoint[];
  dataKey: keyof MetricPoint; // 'cpu' or 'memory'
  title: string;
  color: string;
  yDomain: [number, number]; // e.g., [0, 100]
}

const MetricChart: React.FC<MetricChartProps> = ({ data, dataKey, title, color, yDomain }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-80">
      <h3 className="text-lg font-semibold mb-2 text-gray-200">{title} Usage (%)</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" stroke="#999" tickFormatter={(tick) => tick.split(':').slice(1).join(':')} /> {/* Show only MM:SS */}
          <YAxis stroke="#999" domain={yDomain} />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#eee' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false} // No dots for high-frequency data
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricChart;