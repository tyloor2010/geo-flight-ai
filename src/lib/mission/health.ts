/**
 * SIMULATED drone subsystem health + simulated in-flight system events.
 * All values are derived deterministically from the simulation state.
 */
export type HealthMetric = {
  label: string;
  value: string;
  pct: number;
  tone: "success" | "warning" | "danger";
};

export type SystemEventKind =
  | "gps-degraded"
  | "battery-warning"
  | "comm-latency"
  | "camera-unavailable"
  | "obstacle"
  | "weather"
  | "sensor-warning";

export type SimSystemEvent = {
  id: string;
  kind: SystemEventKind;
  title: string;
  message: string;
  level: "info" | "warning" | "critical";
  /** fraction of the mission at which the event surfaces */
  at: number;
  adaptationRequired: boolean;
};

export const SYSTEM_EVENT_LIBRARY: SimSystemEvent[] = [
  {
    id: "sys-gps",
    kind: "gps-degraded",
    title: "GPS Accuracy Reduced",
    message: "Satellite count dropped to 9. Horizontal accuracy degraded to 2.4 m (simulated).",
    level: "warning",
    at: 0.22,
    adaptationRequired: false,
  },
  {
    id: "sys-latency",
    kind: "comm-latency",
    title: "Communication Latency",
    message: "Downlink latency rose to 420 ms. Telemetry buffering engaged (simulated).",
    level: "warning",
    at: 0.34,
    adaptationRequired: false,
  },
  {
    id: "sys-weather",
    kind: "weather",
    title: "Weather Condition Change",
    message: "Crosswind gusts increased. Speed profile adapted by the mission engine (simulated).",
    level: "warning",
    at: 0.46,
    adaptationRequired: false,
  },
  {
    id: "sys-sensor",
    kind: "sensor-warning",
    title: "Sensor Warning",
    message: "IMU vibration above nominal on axis Y. Filtering applied (simulated).",
    level: "info",
    at: 0.68,
    adaptationRequired: false,
  },
  {
    id: "sys-camera",
    kind: "camera-unavailable",
    title: "Camera Frame Drop",
    message: "Payload camera skipped 3 frames during capture window (simulated).",
    level: "info",
    at: 0.78,
    adaptationRequired: false,
  },
];

export function droneHealth(input: {
  battery: number;
  simRunning: boolean;
  latencyWarning: boolean;
  gpsDegraded: boolean;
  cameraIssue: boolean;
  elapsed: number;
}): { metrics: HealthMetric[]; overall: number; label: string } {
  const storage = Math.max(8, 100 - Math.round(input.elapsed / 6));
  const temp = input.simRunning ? 42 + Math.round((100 - input.battery) / 6) : 28;

  const metrics: HealthMetric[] = [
    {
      label: "Battery",
      value: `${Math.round(input.battery)}%`,
      pct: input.battery,
      tone: input.battery > 40 ? "success" : input.battery > 20 ? "warning" : "danger",
    },
    {
      label: "GPS",
      value: input.gpsDegraded ? "DEGRADED" : "LOCKED",
      pct: input.gpsDegraded ? 62 : 98,
      tone: input.gpsDegraded ? "warning" : "success",
    },
    {
      label: "Connection",
      value: input.latencyWarning ? "LATENT" : "STABLE",
      pct: input.latencyWarning ? 68 : 96,
      tone: input.latencyWarning ? "warning" : "success",
    },
    {
      label: "Camera",
      value: input.cameraIssue ? "FRAME DROP" : "READY",
      pct: input.cameraIssue ? 74 : 99,
      tone: input.cameraIssue ? "warning" : "success",
    },
    { label: "Storage", value: `${storage}%`, pct: storage, tone: storage > 20 ? "success" : "warning" },
    {
      label: "Temperature",
      value: temp > 58 ? `${temp}°C HIGH` : `${temp}°C NORMAL`,
      pct: Math.max(0, 100 - (temp - 25) * 2),
      tone: temp > 58 ? "warning" : "success",
    },
    { label: "Flight Controller", value: "NOMINAL", pct: 100, tone: "success" },
    { label: "Sensors", value: "ONLINE", pct: 97, tone: "success" },
  ];

  const overall = Math.round(metrics.reduce((a, m) => a + m.pct, 0) / metrics.length);
  const label = overall >= 90 ? "NOMINAL" : overall >= 70 ? "DEGRADED" : "CRITICAL";
  return { metrics, overall, label };
}
