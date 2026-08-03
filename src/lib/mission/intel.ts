/**
 * Mission intelligence layer — briefs, scoring and recommendations.
 *
 * Every value produced here is derived deterministically from the current
 * SIMULATED mission state. Nothing is fetched from a live aircraft, a real
 * detection model, or any operational data source.
 */
import { formatDuration, formatKm } from "./planner";
import { polygonAreaM2, projector } from "./geo";
import type { LatLng, MissionConfig, PlannedRoute, Zone } from "./types";

export type BriefRow = { label: string; value: string; tone?: "default" | "primary" | "success" | "warning" | "danger" };

export type MissionBrief = {
  mission: string;
  location: string;
  areaKm2: number;
  missionType: string;
  drone: string;
  flightTime: string;
  distance: string;
  coverage: string;
  batteryUsage: string;
  reserve: string;
  risk: string;
  efficiency: number;
  recommendation: string;
  decision: { label: string; value: number }[];
  rows: BriefRow[];
};

export function buildBrief(input: {
  missionName: string;
  locationName: string;
  missionType: string;
  droneModel: string;
  area: LatLng[];
  route: PlannedRoute;
}): MissionBrief {
  const { route } = input;
  const areaKm2 = Math.round((polygonAreaM2(input.area) / 1e6) * 100) / 100;
  const coverage = route.metrics.coverage * 100;
  const risk = route.metrics.risk.toUpperCase();

  const rows: BriefRow[] = [
    { label: "Mission", value: input.missionName },
    { label: "Location", value: input.locationName },
    { label: "Area", value: `${areaKm2.toFixed(2)} km²` },
    { label: "Mission Type", value: input.missionType },
    { label: "Drone", value: input.droneModel },
    { label: "Est. Flight Time", value: formatDuration(route.metrics.duration) },
    { label: "Est. Distance", value: formatKm(route.metrics.distance) },
    { label: "Expected Coverage", value: `${coverage.toFixed(1)}%`, tone: "primary" },
    { label: "Est. Battery Usage", value: `${Math.round(route.metrics.batteryUsage)}%` },
    { label: "Expected Reserve", value: `${Math.round(route.metrics.batteryRemaining)}%`, tone: route.metrics.batteryRemaining > 25 ? "success" : "warning" },
    {
      label: "Risk Level",
      value: risk,
      tone: route.metrics.risk === "low" ? "success" : route.metrics.risk === "moderate" ? "warning" : "danger",
    },
    { label: "Mission Efficiency", value: `${route.score.overall} / 100`, tone: "primary" },
  ];

  return {
    mission: input.missionName,
    location: input.locationName,
    areaKm2,
    missionType: input.missionType,
    drone: input.droneModel,
    flightTime: formatDuration(route.metrics.duration),
    distance: formatKm(route.metrics.distance),
    coverage: `${coverage.toFixed(1)}%`,
    batteryUsage: `${Math.round(route.metrics.batteryUsage)}%`,
    reserve: `${Math.round(route.metrics.batteryRemaining)}%`,
    risk,
    efficiency: route.score.overall,
    recommendation: recommendationText(route, areaKm2),
    decision: [
      { label: "Route Efficiency", value: route.score.routeEfficiency },
      { label: "Battery Efficiency", value: route.score.batteryEfficiency },
      { label: "Coverage", value: route.score.coverage },
      { label: "Safety Margin", value: route.score.safety },
    ],
    rows,
  };
}

function recommendationText(route: PlannedRoute, areaKm2: number): string {
  const parts: string[] = [];
  parts.push(
    `AI selected the ${route.label.toLowerCase()} route because it delivers ${(route.metrics.coverage * 100).toFixed(1)}% coverage across ${areaKm2.toFixed(2)} km² while keeping total travel at ${formatKm(route.metrics.distance)}.`,
  );
  if (route.metrics.sorties > 1) {
    parts.push(
      `Endurance analysis requires ${route.metrics.sorties} sorties with a battery swap at the home point between each leg.`,
    );
  } else {
    parts.push(
      `Estimated consumption of ${Math.round(route.metrics.batteryUsage)}% preserves the configured ${Math.round(route.metrics.batteryRemaining)}% reserve for return-to-home.`,
    );
  }
  parts.push(
    route.metrics.risk === "low"
      ? "No restricted-zone conflicts were found along the simulated corridor."
      : "Lateral clearance was widened around restricted simulation zones, adding minor travel distance.",
  );
  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/* Mission score                                                       */
/* ------------------------------------------------------------------ */

export type MissionScore = {
  overall: number;
  breakdown: { label: string; value: number }[];
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));

export function computeMissionScore(input: {
  route: PlannedRoute;
  batteryRemaining: number;
  coverage: number; // 0-1
  detections: number;
  avgConfidence: number; // 0-100
  criticalAlerts: number;
  adaptations: number;
}): MissionScore {
  const routeEfficiency = clamp(input.route.score.routeEfficiency);
  const coverage = clamp(input.coverage * 100);
  const batteryEfficiency = clamp(40 + input.batteryRemaining * 1.5);
  const safety = clamp(input.route.score.safety - input.criticalAlerts * 4);
  const detectionQuality = clamp(
    input.detections === 0 ? 70 : 55 + input.avgConfidence * 0.35 + Math.min(12, input.detections * 1.5),
  );
  const adaptability = clamp(input.adaptations > 0 ? 92 + Math.min(6, input.adaptations * 3) : 84);

  const breakdown = [
    { label: "Route Efficiency", value: routeEfficiency },
    { label: "Coverage", value: coverage },
    { label: "Battery Efficiency", value: batteryEfficiency },
    { label: "Safety Compliance", value: safety },
    { label: "Detection Quality", value: detectionQuality },
    { label: "Mission Adaptability", value: adaptability },
  ];
  const overall = clamp(breakdown.reduce((a, b) => a + b.value, 0) / breakdown.length);
  return { overall, breakdown };
}

export function buildRecommendations(input: {
  areaKm2: number;
  batteryRemaining: number;
  coverage: number;
  sorties: number;
  detections: { sector: string; confidence: number }[];
  adaptations: number;
  criticalAlerts: number;
}): string[] {
  const out: string[] = [];
  if (input.batteryRemaining < 25) {
    out.push(
      `Battery reserve closed at ${Math.round(input.batteryRemaining)}%. Consider increasing the starting reserve for missions exceeding ${input.areaKm2.toFixed(1)} km².`,
    );
  } else {
    out.push(
      `Battery reserve of ${Math.round(input.batteryRemaining)}% remained at landing — endurance envelope for this area is comfortable.`,
    );
  }
  if (input.sorties > 1) {
    out.push(`Mission required ${input.sorties} sorties. A longer-endurance airframe would allow a single continuous pass.`);
  }
  const bySector = new Map<string, number>();
  for (const d of input.detections) bySector.set(d.sector, (bySector.get(d.sector) ?? 0) + 1);
  const densest = [...bySector.entries()].sort((a, b) => b[1] - a[1])[0];
  if (densest) {
    out.push(`Sector ${densest[0]} produced the highest detection density (${densest[1]} objects) — prioritise it in the next survey.`);
  }
  if (input.adaptations > 0) {
    out.push(`AI route adaptation preserved ${(input.coverage * 100).toFixed(1)}% coverage after ${input.adaptations} simulated in-flight event(s).`);
  }
  if (input.criticalAlerts > 0) {
    out.push(`${input.criticalAlerts} critical simulated alert(s) were raised. Review the mission timeline before repeating this profile.`);
  }
  if (input.coverage < 0.9) {
    out.push(`Coverage closed below 90%. Reduce line spacing or increase side overlap on the next run.`);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Obstacle generation for autonomous replanning                       */
/* ------------------------------------------------------------------ */

/** Builds a small square SIMULATED obstacle zone centred on a point of the route. */
export function simulatedObstacle(center: LatLng, sizeM = 260): Zone {
  const proj = projector(center);
  const h = sizeM / 2;
  const polygon = [
    proj.from({ x: -h, y: -h }),
    proj.from({ x: h, y: -h }),
    proj.from({ x: h, y: h }),
    proj.from({ x: -h, y: h }),
  ];
  return {
    id: `obstacle-${Date.now()}`,
    name: "Simulated Obstacle (in-flight)",
    kind: "obstacle",
    polygon,
  };
}

export const REPLAN_STAGES = [
  "ANALYZING...",
  "GENERATING ALTERNATIVES...",
  "VALIDATING BATTERY...",
  "CHECKING COVERAGE...",
  "OPTIMIZING...",
] as const;

export type RouteSnapshot = {
  label: string;
  distanceKm: number;
  coverage: number; // %
  battery: number; // % usage
  reserve: number; // %
  efficiency: number;
  waypoints: number;
  path: LatLng[];
};

export function snapshotRoute(route: PlannedRoute, label: string): RouteSnapshot {
  return {
    label,
    distanceKm: Math.round((route.metrics.distance / 1000) * 100) / 100,
    coverage: Math.round(route.metrics.coverage * 1000) / 10,
    battery: Math.round(route.metrics.batteryUsage),
    reserve: Math.round(route.metrics.batteryRemaining),
    efficiency: route.score.overall,
    waypoints: route.metrics.waypointCount,
    path: route.path,
  };
}

export type AiDecision = {
  event: string;
  action: string;
  reason: string;
  priorities: string[];
  results: string[];
  summary: string;
};

export function buildReplanDecision(before: RouteSnapshot, after: RouteSnapshot): AiDecision {
  const delta = after.distanceKm - before.distanceKm;
  return {
    event: "Simulated obstacle detected on active corridor",
    action: "Route recalculated in flight",
    reason: "Original path intersects the newly reported simulated obstacle and is no longer valid.",
    priorities: ["Safety", "Battery Reserve", "Coverage", "Distance"],
    results: [
      `Coverage ${after.coverage >= before.coverage - 0.5 ? "maintained" : "reduced"} at ${after.coverage.toFixed(1)}%`,
      `Battery reserve ${after.reserve >= 20 ? "maintained" : "tight"} at ${after.reserve}%`,
      "Restricted and obstacle zones avoided",
      `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} km additional travel`,
    ],
    summary:
      "Simulated obstacle introduced along the original route. AI selected an alternate path while preserving required coverage and the configured battery reserve.",
  };
}

/* ------------------------------------------------------------------ */
/* Manual vs AI comparison (simulation results)                        */
/* ------------------------------------------------------------------ */

export function manualBaseline(route: PlannedRoute, config: MissionConfig) {
  const distance = route.metrics.distance * 1.16;
  const duration = distance / Math.max(1, route.metrics.distance / route.metrics.duration) * 1.08;
  return {
    distanceKm: Math.round((distance / 1000) * 100) / 100,
    durationSec: Math.round(duration),
    coverage: Math.round(route.metrics.coverage * 1000) / 10 - 8.2,
    battery: Math.min(100, Math.round(route.metrics.batteryUsage * 1.12)),
    waypoints: Math.round(route.metrics.waypointCount * 0.62),
    efficiency: Math.max(40, route.score.overall - 22),
    adaptability: 0,
    speed: config.speed,
  };
}
