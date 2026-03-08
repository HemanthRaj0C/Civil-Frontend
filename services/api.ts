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
