import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TempChart = ({ snapshotData }) => {
  // Default to 5deg resolution as per requirements
  const [resolution, setResolution] = useState('5deg');

  if (!snapshotData) return <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">No Data</div>;

  // Extract the specific distribution object based on toggle
  const distKey = `temperature_dist_${resolution}`;
  const rawDist = snapshotData[distKey] || {};

  // Convert object { "20-25": 10 } -> array [{ range: "20-25", minutes: 10 }]
  const data = Object.entries(rawDist).map(([range, minutes]) => ({
    range,
    minutes
  }));

  return (
    <div className="bg-white dark:bg-slate-900/70 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Temperature Distribution</h3>
        
        {/* The Toggle Button Requirement */}
        <select 
          value={resolution} 
          onChange={(e) => setResolution(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="5deg">5°C Steps</option>
          <option value="10deg">10°C Steps</option>
          <option value="15deg">15°C Steps</option>
          <option value="20deg">20°C Steps</option>
        </select>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-300 dark:stroke-slate-700" />
            <XAxis 
              dataKey="range" 
              tick={{fontSize: 12}} 
              className="text-slate-600 dark:text-slate-400"
              stroke="currentColor"
            />
            <YAxis 
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} 
              className="text-slate-600 dark:text-slate-400"
              stroke="currentColor"
            />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--tooltip-bg)', 
                border: '1px solid var(--tooltip-border)',
                color: 'var(--tooltip-text)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TempChart;