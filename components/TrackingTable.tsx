"use client";

import { TrackingDataPoint } from "../services/api";
import { motion } from "framer-motion";

interface TrackingTableProps {
  dataPoints: TrackingDataPoint[];
  title?: string;
}

const LOS_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-emerald-100 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300" },
  B: { bg: "bg-lime-100 dark:bg-lime-900/20", text: "text-lime-700 dark:text-lime-300" },
  C: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300" },
  D: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300" },
  E: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300" },
  F: { bg: "bg-rose-100 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300" },
};

export default function TrackingTable({ dataPoints, title = "Tracking Data Points" }: TrackingTableProps) {
  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No data points yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Time</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Speed (km/h)</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Density</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Level of Service</th>
            </tr>
          </thead>
          <tbody>
            {dataPoints.map((point, idx) => {
              const losConfig = LOS_COLORS[point.los] || LOS_COLORS.F;
              return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {point.averageSpeed.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {point.density.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${losConfig.bg} ${losConfig.text}`}
                    >
                      {point.los}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
