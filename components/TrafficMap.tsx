"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import {
  analyzeAreaTraffic,
  AreaAnalysisResult,
  BoundingBox,
  startTracking,
  addTrackingDataPoint,
  stopTracking,
  TrackingDataPoint,
} from "../services/api";
import { Loader2, MapPin, Gauge, Activity, ShieldCheck, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrackingChart from "./TrackingChart";
import TrackingTable from "./TrackingTable";

const MAP_CENTER = { lat: 13.0827, lng: 80.2707 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "500px", borderRadius: "1rem" };
const LIBRARIES: ("drawing")[] = ["drawing"];

const LOS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Free Flow" },
  B: { bg: "bg-lime-500", text: "text-lime-600 dark:text-lime-400", label: "Reasonably Free Flow" },
  C: { bg: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Stable Flow" },
  D: { bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "Approaching Unstable" },
  E: { bg: "bg-red-500", text: "text-red-500 dark:text-red-400", label: "Unstable Flow" },
  F: { bg: "bg-rose-800", text: "text-rose-700 dark:text-rose-400", label: "Forced / Breakdown" },
};

const TRACKING_INTERVAL = 10000; // 10 seconds
const TRACKING_DURATION = 5 * 60 * 1000; // 5 minutes

export default function TrafficMap() {
  const [result, setResult] = useState<AreaAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rectangleRef = useRef<google.maps.Rectangle | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  // Tracking states
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackingDataPoints, setTrackingDataPoints] = useState<TrackingDataPoint[]>([]);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const [roadCapacity, setRoadCapacity] = useState(2000);
  const [trackingTimeLeft, setTrackingTimeLeft] = useState(0);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // Handle tracking timer countdown
  useEffect(() => {
    if (!isTracking) return;

    const timer = setInterval(() => {
      setTrackingTimeLeft((prev) => {
        if (prev <= 1000) {
          // Stop tracking when time is up
          handleStopTracking();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    trackingTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [isTracking]);

  const handleRectangleComplete = useCallback(async (rectangle: google.maps.Rectangle) => {
    // Remove previous rectangle
    if (rectangleRef.current) {
      rectangleRef.current.setMap(null);
    }
    rectangleRef.current = rectangle;

    const bounds = rectangle.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const boundingBox = {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng(),
    };

    setCurrentBoundingBox(boundingBox);
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeAreaTraffic(boundingBox);
      setResult(data);
      if (data.dynamicCapacity) {
        setRoadCapacity(data.dynamicCapacity);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartTracking = async () => {
    if (!currentBoundingBox) {
      setTrackingError("Please draw a rectangle on the map first");
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingDataPoints([]);

    try {
      // Start tracking session
      const session = await startTracking("Area Analysis", currentBoundingBox, roadCapacity);
      setSessionId(session.sessionId);
      setIsTracking(true);
      setTrackingTimeLeft(TRACKING_DURATION);

      // Start interval for collecting data
      trackingIntervalRef.current = setInterval(async () => {
        try {
          if (!session.sessionId) return;

          const analysisResult = await analyzeAreaTraffic(currentBoundingBox);
          await addTrackingDataPoint(
            session.sessionId,
            analysisResult.averageSpeed,
            analysisResult.density,
            analysisResult.los
          );

          setTrackingDataPoints((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              averageSpeed: analysisResult.averageSpeed,
              density: analysisResult.density,
              los: analysisResult.los,
            },
          ]);
        } catch (err: unknown) {
          console.error("Error collecting tracking data:", err);
        }
      }, TRACKING_INTERVAL);
    } catch (err: unknown) {
      setTrackingError(err instanceof Error ? err.message : "Failed to start tracking");
      setIsTracking(false);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleStopTracking = async () => {
    if (!sessionId) return;

    try {
      await stopTracking(sessionId);
      setIsTracking(false);
      setSessionId(null);

      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (trackingTimerRef.current) {
        clearInterval(trackingTimerRef.current);
      }
    } catch (err: unknown) {
      setTrackingError(err instanceof Error ? err.message : "Failed to stop tracking");
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    // Prevent duplicate DrawingManager
    if (drawingManagerRef.current) return;

    const dm = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
      },
      rectangleOptions: {
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        strokeColor: "#2563eb",
        strokeWeight: 2,
        editable: true,
      },
    });

    dm.setMap(map);
    drawingManagerRef.current = dm;

    google.maps.event.addListener(dm, "rectanglecomplete", (rect: google.maps.Rectangle) => {
      handleRectangleComplete(rect);
    });
  }, [handleRectangleComplete]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-white/60 dark:border-slate-800/60">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-500 dark:text-slate-400 font-medium">Loading Google Maps...</span>
      </div>
    );
  }

  const losConfig = result ? LOS_COLORS[result.los] || LOS_COLORS.F : null;
  const timeLeftMinutes = Math.floor(trackingTimeLeft / 60000);
  const timeLeftSeconds = Math.floor((trackingTimeLeft % 60000) / 1000);

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Area Selection Map</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Draw a rectangle on the map to analyze traffic in that area</p>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={MAP_CENTER}
          zoom={12}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            gestureHandling: "greedy",
          }}
        />
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-6 flex items-center gap-4"
          >
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-300">Analyzing traffic in selected area...</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Fetching travel data from Google Maps for grid points</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/50 p-6"
          >
            <p className="font-semibold text-red-800 dark:text-red-300">Analysis Failed</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Card */}
      <AnimatePresence>
        {result && losConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Analysis Results</h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* LOS Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 min-w-[220px]"
              >
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Level of Service
                </p>
                <div className={`text-8xl font-black ${losConfig.text} drop-shadow-sm`}>
                  {result.los}
                </div>
                <div className={`mt-3 inline-block px-4 py-1.5 rounded-full ${losConfig.bg} text-white text-sm font-bold shadow-sm`}>
                  {losConfig.label}
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                      <Gauge className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Speed</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{result.averageSpeed}</p>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">km/h</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                      <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Traffic Density</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{result.density}</p>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">veh/km</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="sm:col-span-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                      <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated Road Capacity</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{roadCapacity}</p>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">vehicles/hour</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Tracking Controls */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Auto-Tracking</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTracking ? `Tracking active... ${trackingDataPoints.length} data points collected` : "Click to start tracking at 10-second intervals for 5 minutes"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isTracking && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {timeLeftMinutes}:{String(timeLeftSeconds).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-blue-500 dark:text-blue-400">time left</p>
                    </div>
                  )}
                  <button
                    onClick={isTracking ? handleStopTracking : handleStartTracking}
                    disabled={trackingLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                      isTracking
                        ? "bg-red-500 hover:bg-red-600 active:scale-95"
                        : "bg-blue-500 hover:bg-blue-600 active:scale-95"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {trackingLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting...
                      </>
                    ) : isTracking ? (
                      <>
                        <Square className="w-5 h-5" />
                        Stop Tracking
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Tracking
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* LOS Scale Bar */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">LOS Scale</p>
              <div className="flex rounded-xl overflow-hidden h-3">
                {["A", "B", "C", "D", "E", "F"].map((grade) => (
                  <div
                    key={grade}
                    className={`flex-1 ${LOS_COLORS[grade].bg} ${result.los === grade ? "ring-2 ring-offset-1 ring-slate-800 dark:ring-slate-200 scale-y-150" : "opacity-60"} transition-all`}
                  />
                ))}
              </div>
              <div className="flex mt-1">
                {["A", "B", "C", "D", "E", "F"].map((grade) => (
                  <span key={grade} className={`flex-1 text-center text-xs font-bold ${result.los === grade ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                    {grade}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Error */}
      <AnimatePresence>
        {trackingError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/50 p-6"
          >
            <p className="font-semibold text-red-800 dark:text-red-300">Tracking Error</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{trackingError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Chart */}
      <AnimatePresence>
        {trackingDataPoints.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TrackingChart dataPoints={trackingDataPoints} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Table */}
      <AnimatePresence>
        {trackingDataPoints.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TrackingTable dataPoints={trackingDataPoints} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
