export type LatLng = { lat: number; lng: number };

export type ZoneKind = "no-fly" | "restricted" | "obstacle" | "sensitive";

export type Zone = {
  id: string;
  name: string;
  kind: ZoneKind;
  polygon: LatLng[];
};

export type MissionObjective = "survey" | "mapping" | "inspection" | "search" | "custom";

export type CameraType = "rgb" | "thermal" | "multispectral";
export type PayloadType = "none" | "camera" | "sensor";
export type WindCondition = "low" | "moderate" | "high";

export type DroneSpec = {
  id: string;
  model: string;
  batteryCapacity: number; // mAh
  cruiseSpeed: number; // m/s
  maxFlightTime: number; // minutes
  camera: CameraType;
  payload: PayloadType;
  fov: number; // degrees
  status: "ready" | "charging" | "maintenance" | "in-flight";
  battery: number; // %
  health: "excellent" | "good" | "fair";
  gps: "locked" | "acquiring";
  flightHours: number;
  missions: number;
};

export type MissionConfig = {
  objective: MissionObjective;
  altitude: number; // m
  speed: number; // m/s
  fov: number; // deg
  frontOverlap: number; // 0-1
  sideOverlap: number; // 0-1
  rthThreshold: number; // %
  safetyReserve: number; // %
  wind: WindCondition;
  startBattery: number; // %
  batteryCapacity: number;
  maxFlightTime: number; // min
  camera: CameraType;
  payload: PayloadType;
  droneId: string;
};

export type Waypoint = {
  id: string;
  index: number;
  position: LatLng;
  altitude: number;
  distanceFromStart: number; // m
  etaSeconds: number;
  battery: number; // %
  action: string;
};

export type RouteMetrics = {
  distance: number; // m
  duration: number; // s
  batteryUsage: number; // %
  batteryRemaining: number; // %
  coverage: number; // 0-1
  safetyMargin: number; // %
  risk: "low" | "moderate" | "high";
  waypointCount: number;
  images: number;
  lineSpacing: number;
  rthDistance: number;
  rthFeasible: boolean;
  sorties: number; // number of battery sorties required
};

export type RouteScore = {
  overall: number;
  routeEfficiency: number;
  batteryEfficiency: number;
  coverage: number;
  safety: number;
};

export type RouteStrategy = "recommended" | "shortest" | "coverage" | "safety";

export type PlannedRoute = {
  strategy: RouteStrategy;
  label: string;
  description: string;
  path: LatLng[];
  waypoints: Waypoint[];
  rthPath: LatLng[];
  metrics: RouteMetrics;
  score: RouteScore;
};

export type MissionEvent = {
  id: string;
  t: number; // seconds into mission
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
};

export type TelemetrySample = {
  t: number;
  battery: number;
  altitude: number;
  speed: number;
  coverage: number;
  distance: number;
};

export type MissionRecord = {
  id: string;
  name: string;
  location: string;
  date: string;
  objective: MissionObjective;
  droneModel: string;
  operator: string;
  areaKm2: number;
  distanceKm: number;
  durationSec: number;
  coverage: number;
  batteryUsed: number;
  efficiency: number;
  images: number;
  waypoints: number;
  status: "completed" | "aborted" | "planned";
  events: MissionEvent[];
  telemetry: TelemetrySample[];
  area: LatLng[];
  path: LatLng[];
  zones: Zone[];
};
