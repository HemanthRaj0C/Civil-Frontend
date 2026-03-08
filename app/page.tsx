"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Activity, BarChart4, ChevronRight } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const features = [
    {
      icon: <Calculator className="w-6 h-6 text-blue-500" />,
      title: "PCU Calculation",
      description: "Convert mixed traffic streams into standardized Passenger Car Units accurately.",
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
      title: "Density & Flow",
      description: "Compute precise traffic density metrics using real-time flow and average speed data.",
    },
    {
      icon: <BarChart4 className="w-6 h-6 text-rose-500" />,
      title: "LOS Grading",
      description: "Automatically determine Level of Service from A (free flow) to F (breakdown).",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-32 pb-20 px-6 sm:px-12 w-full max-w-6xl mx-auto min-h-screen">
      <motion.div
        className="text-center max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6 inline-flex p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 shadow-sm items-center gap-2 pr-4">
          <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">New</span>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Next-Gen Traffic Analysis Engine</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1] mb-8"
        >
          Smart Traffic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">LOS Analysis</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed"
        >
          An intelligent dashboard to process road survey data. Instantly calculate Passenger Car Units (PCU), track density, and identify road Level of Service with powerful visualizations.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/traffic"
            className="group relative inline-flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold py-4 px-8 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </Link>
          <a
            href="#features"
            className="group inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-4 px-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 w-full sm:w-auto"
          >
            Learn More
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-32 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-800/50 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:bg-slate-800/70 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
