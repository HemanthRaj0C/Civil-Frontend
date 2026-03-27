"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrackingDataPoint } from "../services/api";

interface TrackingChartProps {
  dataPoints: TrackingDataPoint[];
  title?: string;
}

export default function TrackingChart({ dataPoints, title = "Traffic Tracking Over Time" }: TrackingChartProps) {
  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No tracking data available yet</p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = dataPoints.map((point, idx) => ({
    time: idx + 1,
    timestamp: new Date(point.timestamp).toLocaleTimeString(),
    speed: parseFloat(point.averageSpeed.toFixed(2)),
    density: parseFloat(point.density.toFixed(2)),
  }));

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="timestamp" stroke="#64748b" />
          <YAxis yAxisId="left" stroke="#3b82f6" />
          <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="speed"
            stroke="#3b82f6"
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Speed (km/h)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="density"
            stroke="#8b5cf6"
            dot={{ fill: "#8b5cf6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Density (vehicles/km)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
