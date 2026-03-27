const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_URL. Add it to your frontend .env.local file.");
}

export interface TrafficInput {
  location: string;
  bike: number;
  car: number;
  auto: number;
  bus: number;
  truck: number;
  speed: number;
}

export interface TrafficResult {
  id: string;
  location: string;
  totalVehicles: number;
  pcu: number;
  density: number;
  los: string;
  speed: number;
  bike: number;
  car: number;
  auto: number;
  bus: number;
  truck: number;
  createdAt: string;
}

export async function analyzeTraffic(data: TrafficInput): Promise<TrafficResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

export async function getAllRecords(): Promise<TrafficResult[]> {
  const res = await fetch(`${API_BASE}/records`);
  if (!res.ok) throw new Error("Failed to fetch records");
  return res.json();
}

// Area Analysis API

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface AreaAnalysisResult {
  averageSpeed: number;
  density: number;
  los: string;
  dynamicCapacity?: number;
  debug?: {
    totalPairs: number;
    validSegments: number;
    skippedSegments: number;
    speeds: number[];
  };
}

export async function analyzeAreaTraffic(bounds: BoundingBox): Promise<AreaAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze-area`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bounds),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Area analysis failed");
  }
  return res.json();
}

// Tracking API

export interface TrackingDataPoint {
  timestamp: Date;
  averageSpeed: number;
  density: number;
  los: string;
}

export interface TrackingSessionResponse {
  sessionId: string;
  location: string;
  roadCapacity: number;
  startTime: string;
  status: string;
}

export interface TrackingSession {
  _id: string;
  location: string;
  boundingBox: BoundingBox;
  roadCapacity: number;
  dataPoints: TrackingDataPoint[];
  startTime: Date;
  endTime?: Date;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
}

export async function startTracking(
  location: string,
  boundingBox: BoundingBox,
  roadCapacity?: number
): Promise<TrackingSessionResponse> {
  const res = await fetch(`${API_BASE}/tracking/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location,
      ...boundingBox,
      roadCapacity,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to start tracking");
  }
  return res.json();
}

export async function addTrackingDataPoint(
  sessionId: string,
  averageSpeed: number,
  density: number,
  los: string
): Promise<{ sessionId: string; dataPointCount: number; lastDataPoint: TrackingDataPoint }> {
  const res = await fetch(`${API_BASE}/tracking/add-point`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, averageSpeed, density, los }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add tracking data point");
  }
  return res.json();
}

export async function stopTracking(sessionId: string): Promise<{
  sessionId: string;
  status: string;
  endTime: Date;
  dataPointCount: number;
}> {
  const res = await fetch(`${API_BASE}/tracking/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to stop tracking");
  }
  return res.json();
}

export async function getTrackingSession(sessionId: string): Promise<TrackingSession> {
  const res = await fetch(`${API_BASE}/tracking/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch tracking session");
  return res.json();
}

export async function updateRoadCapacity(sessionId: string, roadCapacity: number): Promise<{
  sessionId: string;
  roadCapacity: number;
}> {
  const res = await fetch(`${API_BASE}/tracking/update-capacity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, roadCapacity }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update road capacity");
  }
  return res.json();
}
