"use client";

import { motion } from "framer-motion";
import { Map } from "lucide-react";
import TrafficMap from "../../components/TrafficMap";

export default function AreaAnalysisPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50">
            <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Area-Based Analysis</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
            Map Traffic Analysis
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Select a rectangular area on the map to estimate average traffic speed, density, and Level of Service using real-time Google Maps data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TrafficMap />
        </motion.div>
      </div>
    </div>
  );
}
