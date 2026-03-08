"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface VehicleChartProps {
  bike: number;
  car: number;
  auto: number;
  bus: number;
  truck: number;
}

export default function VehicleCompositionChart({ bike, car, auto, bus, truck }: VehicleChartProps) {
  const data = {
    labels: ["Bike", "Car", "Auto", "Bus", "Truck"],
    datasets: [
      {
        data: [bike, car, auto, bus, truck],
        backgroundColor: [
          "#3b82f6", // Blue
          "#10b981", // Emerald
          "#f59e0b", // Amber
          "#ef4444", // Red
          "#8b5cf6", // Violet
        ],
        borderWidth: 4,
        borderColor: "#ffffff", // Creates a nice gap between slices
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: 500,
          }
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <PieChart className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vehicle Breakdown</h2>
      </div>
      <div className="flex-1 min-h-[300px] relative flex items-center justify-center p-4">
        <div className="w-full h-full relative" style={{ maxHeight: '300px' }}>
            <Pie data={data} options={options as any} />
        </div>
      </div>
    </div>
  );
}