"use client";

import { motion } from "framer-motion";
import { Activity, CarFront, Zap, Target } from "lucide-react";

const LOS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/60", label: "Free Flow" },
  B: { color: "text-lime-600 dark:text-lime-400", bg: "bg-lime-50 dark:bg-lime-950/40", border: "border-lime-200 dark:border-lime-800/60", label: "Reasonably Free Flow" },
  C: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-800/60", label: "Stable Flow" },
  D: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800/60", label: "Approaching Unstable" },
  E: { color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800/60", label: "Unstable Flow" },
  F: { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800/60", label: "Forced / Breakdown" },
};

interface LOSIndicatorProps {
  los: string;
  density: number;
  pcu: number;
  totalVehicles: number;
  speed: number;
  location: string;
}

export default function LOSIndicator({ los, density, pcu, totalVehicles, speed, location }: LOSIndicatorProps) {
  const config = LOS_CONFIG[los] || LOS_CONFIG.F;

  const statCards = [
    { label: "Total Vehicles", value: totalVehicles, icon: <CarFront className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, unit: "Count" },
    { label: "PCU", value: pcu, icon: <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />, unit: "Units" },
    { label: "Density", value: density, icon: <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, unit: "veh/km" },
    { label: "Speed", value: speed, icon: <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />, unit: "km/h" },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Main LOS Display */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`flex flex-col items-center justify-center p-8 rounded-3xl ${config.bg} ${config.border} border-2 min-w-[280px] shadow-inner dark:shadow-none`}
        >
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{location || "Analyzed Location"}</p>
          <div className={`text-8xl font-black ${config.color} drop-shadow-sm dark:drop-shadow-none`}>
            {los}
          </div>
          <div className={`mt-3 inline-block px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm text-sm font-bold shadow-sm ${config.color}`}>
            {config.label}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {statCards.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
              className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md dark:hover:shadow-none transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LOS Scale Bar */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Scale Mapping</span>
          <span>A → F</span>
        </div>
        <div className="flex gap-1.5 h-12 w-full">
          {Object.entries(LOS_CONFIG).map(([grade, cfg]) => (
            <motion.div
              key={grade}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`relative flex-1 flex items-center justify-center rounded-xl cursor-default transition-all ${
                grade === los 
                  ? `${cfg.bg} border-2 ${cfg.border} shadow-md dark:shadow-none z-10 scale-105` 
                  : "bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span className={`text-sm font-bold ${grade === los ? cfg.color : ""}`}>
                {grade}
              </span>
              {grade === los && (
                <motion.div layoutId="indicator" className="absolute -top-3 w-4 h-4 text-slate-800 dark:text-slate-200 rotate-180">
                  ▼
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}