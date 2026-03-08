"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeTraffic, TrafficResult } from "../../services/api";
import LOSIndicator from "../../components/LOSIndicator";
import VehicleCompositionChart from "../../components/VehicleCompositionChart";
import TrafficFlowChart from "../../components/TrafficFlowChart";
import { MapPin, Bike, Car, Truck, Zap, Activity, Navigation, Loader2, BarChart4 } from "lucide-react";

const initialForm = {
  location: "",
  bike: 0,
  car: 0,
  auto: 0,
  bus: 0,
  truck: 0,
  speed: 0,
};

export default function TrafficPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<TrafficResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "location" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await analyzeTraffic(form);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "location", label: "Location", type: "text", placeholder: "e.g. Guindy Junction", icon: <MapPin className="w-4 h-4" /> },
    { name: "bike", label: "Bike Count", type: "number", placeholder: "0", icon: <Bike className="w-4 h-4" /> },
    { name: "car", label: "Car Count", type: "number", placeholder: "0", icon: <Car className="w-4 h-4" /> },
    { name: "auto", label: "Auto Count", type: "number", placeholder: "0", icon: <Navigation className="w-4 h-4" /> },
    { name: "bus", label: "Bus Count", type: "number", placeholder: "0", icon: <Truck className="w-4 h-4" /> },
    { name: "truck", label: "Truck Count", type: "number", placeholder: "0", icon: <Truck className="w-4 h-4" /> },
    { name: "speed", label: "Average Speed (km/h)", type: "number", placeholder: "0", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">Traffic Survey Form</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Input your latest road survey data to instantly calculate PCU, road density, and the exact Level of Service grading.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="lg:col-span-4"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Enter Details</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
                {fields.map((f) => (
                  <div key={f.name} className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{f.label}</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                        {f.icon}
                      </div>
                      <input
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.name as keyof typeof form]}
                        onChange={handleChange}
                        min={f.type === "number" ? 0 : undefined}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 pl-10 pr-4 py-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                ))}

                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-500 dark:text-red-400 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full relative overflow-hidden bg-slate-900 dark:bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-blue-900/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                    {loading ? "Processing Data..." : "Run Analysis"}
                  </span>
                </button>
              </form>
            </div>
          </motion.div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="space-y-8"
                >
                  <LOSIndicator
                    los={result.los}
                    density={result.density}
                    pcu={result.pcu}
                    totalVehicles={result.totalVehicles}
                    speed={result.speed}
                    location={result.location}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <VehicleCompositionChart
                        bike={result.bike}
                        car={result.car}
                        auto={result.auto}
                        bus={result.bus}
                        truck={result.truck}
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <TrafficFlowChart
                        bike={result.bike}
                        car={result.car}
                        auto={result.auto}
                        bus={result.bus}
                        truck={result.truck}
                        pcu={result.pcu}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[500px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 px-6 text-center"
                >
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <BarChart4 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Data Yet</h3>
                  <p className="max-w-md">Fill out the traffic survey form on the left and hit "Run Analysis" to generate interactive charts and LOS calculations.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}