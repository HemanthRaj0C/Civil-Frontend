"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChart3 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface TrafficFlowChartProps {
  bike: number;
  car: number;
  auto: number;
  bus: number;
  truck: number;
  pcu: number;
}

export default function TrafficFlowChart({ bike, car, auto, bus, truck, pcu }: TrafficFlowChartProps) {
  const pcuValues = {
    Bike: bike * 0.5,
    Car: car * 1.0,
    Auto: auto * 1.2,
    Bus: bus * 3.0,
    Truck: truck * 3.0,
  };

  const data = {
    labels: Object.keys(pcuValues),
    datasets: [
      {
        label: "Raw Count",
        data: [bike, car, auto, bus, truck],
        backgroundColor: "#60a5fa", // Blue 400
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: "PCU Equivalent",
        data: Object.values(pcuValues),
        backgroundColor: "#f43f5e", // Red 400
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "'Inter', sans-serif", weight: 500 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: {
          color: "rgba(226, 232, 240, 0.6)", // slate-200
          drawBorder: false,
        },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif" } }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif" } }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Flow vs PCU</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total PCU</p>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{pcu}</p>
        </div>
      </div>
      <div className="flex-1 min-h-[300px] relative">
        <Bar data={data} options={options as any} />
      </div>
    </div>
  );
}