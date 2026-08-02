import {
  bboxXY,
  centroid,
  inflatePolygon,
  longestEdgeAngle,
  pathLength,
  pointInPolygonXY,
  polygonAreaM2,
  projector,
  rotate,
  type Pt,
} from "./geo";
import type {
  LatLng,
  MissionConfig,
  PlannedRoute,
  RouteMetrics,
  RouteScore,
  RouteStrategy,
  Waypoint,
  Zone,
} from "./types";

const WIND_FACTOR: Record<string, number> = { low: 1, moderate: 1.09, high: 1.2 };

type StrategyTuning = {
  label: string;
  description: string;
  spacingFactor: number;
  zoneBuffer: number;
  altitudeDelta: number;
  speedFactor: number;
};

export const STRATEGIES: Record<RouteStrategy, StrategyTuning> = {
  recommended: {
    label: "AI Recommended",
    description: "Best balance between coverage, battery usage and safety margin.",
    spacingFactor: 1,
    zoneBuffer: 35,
    altitudeDelta: 0,
    speedFactor: 1,
  },
  shortest: {
    label: "Shortest Route",
    description: "Lowest distance and flight time, slightly reduced survey coverage.",
    spacingFactor: 1.32,
    zoneBuffer: 25,
    altitudeDelta: 8,
    speedFactor: 1.12,
  },
  coverage: {
    label: "Maximum Coverage",
    description: "Densest survey grid for highest coverage, higher battery consumption.",
    spacingFactor: 0.74,
    zoneBuffer: 30,
    altitudeDelta: -6,
    speedFactor: 0.92,
  },
  safety: {
    label: "Maximum Safety",
    description: "Wider clearance from restricted airspace and a larger battery reserve.",
    spacingFactor: 1.12,
    zoneBuffer: 80,
    altitudeDelta: 12,
    speedFactor: 0.88,
  },
};

const OBJECTIVE_TUNING: Record<string, { spacing: number; overlapBoost: number }> = {
  survey: { spacing: 1, overlapBoost: 0 },
  mapping: { spacing: 0.85, overlapBoost: 0.05 },
  inspection: { spacing: 1.4, overlapBoost: -0.05 },
  search: { spacing: 0.95, overlapBoost: 0.02 },
  custom: { spacing: 1, overlapBoost: 0 },
};

function segmentsOutsideZones(
  a: Pt,
  b: Pt,
  zones: Pt[][],
): Array<[Pt, Pt]> {
  if (!zones.length) return [[a, b]];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.max(2, Math.ceil(len / 8));
  const out: Array<[Pt, Pt]> = [];
  let runStart: Pt | null = null;
  let prev: Pt | null = null;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const blocked = zones.some((z) => pointInPolygonXY(p, z));
    if (!blocked) {
      if (!runStart) runStart = p;
      prev = p;
    } else if (runStart && prev) {
      if (Math.hypot(prev.x - runStart.x, prev.y - runStart.y) > 12) out.push([runStart, prev]);
      runStart = null;
      prev = null;
    }
  }
  if (runStart && prev && Math.hypot(prev.x - runStart.x, prev.y - runStart.y) > 12)
    out.push([runStart, prev]);
  return out;
}

function connectorPath(a: Pt, b: Pt, zones: Pt[][]): Pt[] {
  const blocked = zones.filter((z) => segmentsOutsideZones(a, b, [z]).length !== 1);
  if (!blocked.length) return [a, b];
  // Detour around the union bbox of the blocking zones, choosing the shorter side.
  const all = blocked.flat();
  const bb = bboxXY(all);
  const pad = 30;
  const left = [
    { x: bb.minX - pad, y: a.y },
    { x: bb.minX - pad, y: b.y },
  ];
  const right = [
    { x: bb.maxX + pad, y: a.y },
    { x: bb.maxX + pad, y: b.y },
  ];
  const cost = (mid: Pt[]) =>
    [a, ...mid, b].reduce(
      (acc, p, i, arr) => (i === 0 ? 0 : acc + Math.hypot(p.x - arr[i - 1]!.x, p.y - arr[i - 1]!.y)),
      0,
    );
  return cost(left) <= cost(right) ? [a, ...left, b] : [a, ...right, b];
}

export type PlanInput = {
  area: LatLng[];
  zones: Zone[];
  config: MissionConfig;
  home?: LatLng | null;
};

export type PlanFailure = {
  ok: false;
  reason: string;
  suggestions: string[];
};

export type PlanSuccess = { ok: true; routes: PlannedRoute[] };

export function planMission(input: PlanInput): PlanSuccess | PlanFailure {
  const { area, zones, config } = input;
  if (area.length < 3)
    return {
      ok: false,
      reason: "No valid survey area is defined. Draw a polygon with at least three vertices.",
      suggestions: ["Draw Survey Area", "Load Demo Mission"],
    };

  const areaM2 = polygonAreaM2(area);
  if (areaM2 < 2000)
    return {
      ok: false,
      reason: "The selected survey area is too small to generate a meaningful coverage grid.",
      suggestions: ["Enlarge Survey Area", "Reduce Altitude"],
    };

  const routes = (Object.keys(STRATEGIES) as RouteStrategy[])
    .map((s) => buildRoute(s, input, areaM2))
    .filter((r): r is PlannedRoute => r !== null);

  if (!routes.length)
    return {
      ok: false,
      reason:
        "The selected survey area is fully covered by restricted airspace, so no safe coverage grid can be produced.",
      suggestions: ["Move Survey Area", "Edit Restricted Zones", "Reduce Coverage"],
    };

  const feasible = routes.filter((r) => r.metrics.rthFeasible);
  if (!feasible.length) {
    const best = routes.sort((a, b) => a.metrics.batteryUsage - b.metrics.batteryUsage)[0]!;
    return {
      ok: false,
      reason: `The selected area cannot be fully covered while maintaining the required ${config.safetyReserve}% battery reserve (best case needs ${Math.round(best.metrics.batteryUsage)}%).`,
      suggestions: ["Reduce Coverage", "Increase Battery", "Change Drone", "Optimize Mission"],
    };
  }

  feasible.sort((a, b) => b.score.overall - a.score.overall);
  const recommended = feasible.find((r) => r.strategy === "recommended");
  const ordered = recommended
    ? [recommended, ...feasible.filter((r) => r !== recommended)]
    : feasible;
  return { ok: true, routes: ordered };
}

function buildRoute(strategy: RouteStrategy, input: PlanInput, areaM2: number): PlannedRoute | null {
  const { area, zones, config } = input;
  const tuning = STRATEGIES[strategy];
  const objective = OBJECTIVE_TUNING[config.objective] ?? OBJECTIVE_TUNING["survey"]!;

  const altitude = Math.min(120, Math.max(20, config.altitude + tuning.altitudeDelta));
  const speed = Math.min(20, Math.max(1, config.speed * tuning.speedFactor));
  const sideOverlap = Math.min(0.85, Math.max(0.2, config.sideOverlap + objective.overlapBoost));
  const footprint = 2 * altitude * Math.tan(((config.fov / 2) * Math.PI) / 180);
  const spacing = Math.max(
    8,
    footprint * (1 - sideOverlap) * tuning.spacingFactor * objective.spacing,
  );

  const origin = centroid(area);
  const proj = projector(origin);
  const polyXY = area.map(proj.to);
  const zonesXY = zones.map((z) => inflatePolygon(z.polygon.map(proj.to), tuning.zoneBuffer));

  const angle = config.objective === "inspection" ? 0 : longestEdgeAngle(polyXY);
  const rotIn = (p: Pt) => rotate(p, -angle);
  const rotOut = (p: Pt) => rotate(p, angle);

  const rPoly = polyXY.map(rotIn);
  const rZones = zonesXY.map((z) => z.map(rotIn));
  const bb = bboxXY(rPoly);

  const lines: Array<[Pt, Pt]> = [];
  let y = bb.minY + spacing / 2;
  let flip = false;
  while (y <= bb.maxY) {
    const xs: number[] = [];
    for (let i = 0; i < rPoly.length; i++) {
      const a = rPoly[i]!;
      const b = rPoly[(i + 1) % rPoly.length]!;
      if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const inset = Math.min(spacing * 0.25, (xs[i + 1]! - xs[i]!) / 4);
      const start = { x: xs[i]! + inset, y };
      const end = { x: xs[i + 1]! - inset, y };
      if (end.x - start.x < 5) continue;
      for (const seg of segmentsOutsideZones(start, end, rZones)) {
        lines.push(flip ? [seg[1], seg[0]] : seg);
      }
    }
    flip = !flip;
    y += spacing;
  }

  if (lines.length < 2) return null;

  const home = input.home ?? proj.from(rotOut({ x: rPoly[0]!.x, y: bb.minY - spacing }));
  const homeXY = rotIn(proj.to(home));

  const pathXY: Pt[] = [homeXY];
  for (const [a, b] of lines) {
    const last = pathXY[pathXY.length - 1]!;
    const connector = connectorPath(last, a, rZones);
    pathXY.push(...connector.slice(1));
    pathXY.push(b);
  }
  const rthStart = pathXY[pathXY.length - 1]!;
  const rthXY = connectorPath(rthStart, homeXY, rZones);
  const path = pathXY.map((p) => proj.from(rotOut(p)));
  const rthPath = rthXY.map((p) => proj.from(rotOut(p)));

  const surveyDistance = pathLength(path);
  const rthDistance = pathLength(rthPath);
  const distance = surveyDistance + rthDistance;

  const windFactor = WIND_FACTOR[config.wind] ?? 1;
  const duration = (distance / speed) * windFactor + lines.length * 1.6;
  const durationMin = duration / 60;

  const drainPerMin = (100 / Math.max(6, config.maxFlightTime)) * windFactor;
  const payloadFactor = config.payload === "sensor" ? 1.08 : config.payload === "camera" ? 1.03 : 1;
  const batteryUsage = Math.min(140, durationMin * drainPerMin * payloadFactor);
  const batteryRemaining = config.startBattery - batteryUsage;

  const sweptArea = lines.reduce(
    (acc, [a, b]) => acc + Math.hypot(b.x - a.x, b.y - a.y) * Math.min(footprint, spacing * 1.35),
    0,
  );
  const zoneArea = zones.reduce((acc, z) => acc + polygonAreaM2(z.polygon), 0);
  const effectiveArea = Math.max(areaM2 - Math.min(zoneArea, areaM2 * 0.8), areaM2 * 0.2);
  const coverage = Math.min(0.995, sweptArea / effectiveArea);

  const rthFeasible = batteryRemaining >= config.safetyReserve;
  const safetyMargin = Math.max(0, batteryRemaining - config.safetyReserve);

  const imageInterval = Math.max(4, footprint * 0.72 * (1 - config.frontOverlap));
  const images = Math.round(surveyDistance / imageInterval);

  const waypoints = buildWaypoints(path, altitude, speed, config, batteryUsage, windFactor);

  const risk: RouteMetrics["risk"] =
    !rthFeasible || safetyMargin < 4
      ? "high"
      : config.wind === "high" || safetyMargin < 12 || zones.length > 2
        ? "moderate"
        : "low";

  const metrics: RouteMetrics = {
    distance,
    duration,
    batteryUsage,
    batteryRemaining,
    coverage,
    safetyMargin,
    risk,
    waypointCount: waypoints.length,
    images,
    lineSpacing: spacing,
    rthDistance,
    rthFeasible,
  };

  const idealDistance = effectiveArea / Math.max(spacing, 1);
  const routeEfficiency = clamp((idealDistance / Math.max(surveyDistance, 1)) * 100, 45, 99);
  const batteryEfficiency = clamp(100 - Math.max(0, batteryUsage - 45) * 1.05, 40, 99);
  const coverageScore = clamp(coverage * 100, 30, 99);
  const safetyScore = clamp(
    62 +
      Math.min(24, safetyMargin * 1.1) +
      (tuning.zoneBuffer / 10) -
      (config.wind === "high" ? 12 : config.wind === "moderate" ? 5 : 0),
    35,
    99,
  );

  const score: RouteScore = {
    routeEfficiency: Math.round(routeEfficiency),
    batteryEfficiency: Math.round(batteryEfficiency),
    coverage: Math.round(coverageScore),
    safety: Math.round(safetyScore),
    overall: Math.round(
      routeEfficiency * 0.28 + batteryEfficiency * 0.22 + coverageScore * 0.28 + safetyScore * 0.22,
    ),
  };

  return {
    strategy,
    label: tuning.label,
    description: tuning.description,
    path,
    waypoints,
    rthPath,
    metrics,
    score,
  };
}

function buildWaypoints(
  path: LatLng[],
  altitude: number,
  speed: number,
  config: MissionConfig,
  batteryUsage: number,
  windFactor: number,
): Waypoint[] {
  const total = pathLength(path);
  const out: Waypoint[] = [];
  let acc = 0;
  for (let i = 0; i < path.length; i++) {
    if (i > 0) acc += segLen(path[i - 1]!, path[i]!);
    const frac = total === 0 ? 0 : acc / total;
    out.push({
      id: `WP${String(i + 1).padStart(2, "0")}`,
      index: i,
      position: path[i]!,
      altitude: i === 0 ? 0 : Math.round(altitude),
      distanceFromStart: acc,
      etaSeconds: (acc / speed) * windFactor,
      battery: Math.max(0, config.startBattery - batteryUsage * frac),
      action:
        i === 0
          ? "Takeoff / Home Point"
          : i === path.length - 1
            ? "Survey Complete — Prepare RTH"
            : i % 2 === 1
              ? "Capture Survey Image"
              : "Turn / Line Transition",
    });
  }
  return out;
}

function segLen(a: LatLng, b: LatLng) {
  return pathLength([a, b]);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}
