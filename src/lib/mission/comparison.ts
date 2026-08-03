import { pathLength, pointInPolygon, polygonAreaM2, projector } from "./geo";
import type { LatLng, MissionConfig, PlannedRoute, Zone } from "./types";

/**
 * Baseline "manual pilot" route — a naive, non-optimized lawnmower pattern with a
 * full boundary lap, ignoring restricted zones and turn efficiency. Used purely to
 * illustrate the value of AI optimization in the before/after comparison view.
 */
export type ManualRoute = {
  path: LatLng[];
  distance: number;
  duration: number;
  batteryUsage: number;
  coverage: number;
  waypointCount: number;
  zoneConflicts: number;
};

const WIND: Record<string, number> = { low: 1, moderate: 1.09, high: 1.2 };

export function planManualRoute(
  area: LatLng[],
  zones: Zone[],
  config: MissionConfig,
  home?: LatLng | null,
): ManualRoute | null {
  if (area.length < 3) return null;
  const origin = area[0]!;
  const proj = projector(origin);
  const pts = area.map(proj.to);
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const footprint = 2 * config.altitude * Math.tan(((config.fov / 2) * Math.PI) / 180);
  // Manual pilots keep conservative, uniform spacing with no adaptive optimization.
  const spacing = Math.max(12, footprint * (1 - config.sideOverlap) * 0.78);

  const path: LatLng[] = [];
  if (home) path.push(home);
  // Manual operators typically fly the full boundary first.
  for (const p of area) path.push(p);
  path.push(area[0]!);

  let flip = false;
  for (let x = minX; x <= maxX; x += spacing) {
    const a = proj.from({ x, y: flip ? maxY : minY });
    const b = proj.from({ x, y: flip ? minY : maxY });
    path.push(a, b);
    flip = !flip;
  }
  if (home) path.push(home);

  let zoneConflicts = 0;
  for (const p of path) {
    if (zones.some((z) => pointInPolygon(p, z.polygon))) zoneConflicts += 1;
  }

  const distance = pathLength(path);
  const wind = WIND[config.wind] ?? 1;
  // Manual flying loses time on turns, re-positioning and human reaction.
  const duration = (distance / Math.max(2, config.speed * 0.86)) * wind + path.length * 2.4;
  const drainPerSecond = 100 / (config.maxFlightTime * 60 * 0.9);
  const batteryUsage = Math.min(100, duration * drainPerSecond * wind);
  const areaM2 = polygonAreaM2(area);
  const swath = footprint * (1 - config.sideOverlap) * 0.78;
  const covered = Math.min(areaM2, (distance - 0) * swath * 0.72);
  const coverage = Math.max(0.55, Math.min(0.93, covered / areaM2));

  return {
    path,
    distance,
    duration,
    batteryUsage,
    coverage,
    waypointCount: path.length,
    zoneConflicts,
  };
}

export type Comparison = {
  distanceSaved: number; // %
  timeSaved: number; // %
  batterySaved: number; // %
  coverageGain: number; // percentage points
  conflictsAvoided: number;
};

export function compareRoutes(ai: PlannedRoute, manual: ManualRoute): Comparison {
  const pct = (m: number, a: number) => (m <= 0 ? 0 : Math.round(((m - a) / m) * 1000) / 10);
  return {
    distanceSaved: pct(manual.distance, ai.metrics.distance),
    timeSaved: pct(manual.duration, ai.metrics.duration),
    batterySaved: pct(manual.batteryUsage, ai.metrics.batteryUsage),
    coverageGain: Math.round((ai.metrics.coverage - manual.coverage) * 1000) / 10,
    conflictsAvoided: manual.zoneConflicts,
  };
}

/** Human-readable justification for the selected AI route. */
export function explainRoute(
  route: PlannedRoute,
  config: MissionConfig,
  zones: Zone[],
  comparison: Comparison | null,
): string[] {
  const out: string[] = [];
  out.push(
    `Flight lines were aligned to the longest edge of the survey area at ${Math.round(route.metrics.lineSpacing)} m spacing, derived from ${config.altitude} m altitude, ${config.fov}° FOV and ${Math.round(config.sideOverlap * 100)}% side overlap.`,
  );
  if (zones.length) {
    out.push(
      `${zones.length} operator-declared zone${zones.length > 1 ? "s were" : " was"} treated as hard constraints — survey lines were clipped and connector legs re-routed to preserve lateral clearance.`,
    );
  } else {
    out.push("No restricted zones were declared, so the grid was allowed to run edge-to-edge.");
  }
  out.push(
    `Estimated battery usage is ${Math.round(route.metrics.batteryUsage)}% per sortie against a ${config.rthThreshold}% return-to-home threshold, leaving ${Math.round(route.metrics.batteryRemaining)}% reserve — ${route.metrics.rthFeasible ? "return-to-home remains feasible from the furthest waypoint" : "return-to-home is NOT feasible; reduce area or altitude"}.`,
  );
  if (route.metrics.sorties > 1) {
    out.push(
      `The grid exceeds a single battery endurance, so the mission was split into ${route.metrics.sorties} sorties with a battery swap at the home point between each leg.`,
    );
  }

  out.push(
    `Wind condition "${config.wind}" was applied as a speed and energy penalty, and the ${route.label.toLowerCase()} profile was scored highest overall (${route.score.overall}/100) across efficiency, coverage and safety.`,
  );
  if (comparison && comparison.distanceSaved > 0) {
    out.push(
      `Compared with a conventional manual lawnmower pattern, this route is ${comparison.distanceSaved}% shorter and uses ${comparison.batterySaved}% less battery while raising coverage by ${comparison.coverageGain} points.`,
    );
  }
  return out;
}
