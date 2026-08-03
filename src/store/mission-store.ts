import { create } from "zustand";
import { DEMO_AREA, DEMO_HOME, DEMO_MISSIONS, DEMO_ZONES, DRONES } from "@/lib/mission/demo";
import { bearingLabel, pathLength, pointAlongPath, polygonAreaM2, polygonPerimeterM } from "@/lib/mission/geo";
import { planMission, type PlanFailure } from "@/lib/mission/planner";
import {
  getLocation,
  getTemplate,
  NAC_AREA,
  NAC_HOME,
  NAC_ZONES,
  type EgyptLocationKey,
  type MissionTemplateId,
} from "@/lib/mission/egypt";
import {
  compareRoutes,
  planManualRoute,
  type Comparison,
  type ManualRoute,
} from "@/lib/mission/comparison";
import type {
  DroneSpec,
  LatLng,
  MissionConfig,
  MissionEvent,
  MissionRecord,
  PlannedRoute,
  RouteStrategy,
  TelemetrySample,
  Zone,
  ZoneKind,
} from "@/lib/mission/types";

export type DrawMode = "none" | "area" | "rect" | "zone" | "home" | "marker";
export type MapStyle = "dark" | "satellite" | "standard" | "terrain";
export type PlanStatus = "idle" | "optimizing" | "ready" | "error";
export type SimStatus = "idle" | "running" | "paused" | "complete" | "aborted";

export const OPTIMIZATION_STEPS = [
  "Analyzing mission area geometry...",
  "Detecting restricted zones and obstacles...",
  "Calculating coverage grid...",
  "Evaluating candidate flight paths...",
  "Optimizing route distance...",
  "Estimating battery consumption...",
  "Checking return-to-home feasibility...",
  "Running safety validation...",
  "Mission optimized.",
];

export type Marker = { id: string; position: LatLng; label: string };

type Settings = {
  units: "metric" | "imperial";
  mapStyle: MapStyle;
  defaultAltitude: number;
  defaultSpeed: number;
  batteryReserve: number;
  rthThreshold: number;
  simulationSpeed: number;
  safetyAlerts: boolean;
  followDrone: boolean;
  presentationMode: boolean;
  strategicMode: boolean;
  smartCityLayer: boolean;
  showComparison: boolean;
};

export type MapFocus = { center: LatLng; zoom: number; nonce: number };

type State = {
  missionName: string;
  locationKey: EgyptLocationKey;
  templateId: MissionTemplateId | null;
  focus: MapFocus | null;
  manual: ManualRoute | null;
  comparison: Comparison | null;
  area: LatLng[];
  zones: Zone[];
  markers: Marker[];
  home: LatLng | null;
  drawMode: DrawMode;
  pendingZoneKind: ZoneKind;
  config: MissionConfig;
  drones: DroneSpec[];
  settings: Settings;

  planStatus: PlanStatus;
  planStep: number;
  planError: PlanFailure | null;
  routes: PlannedRoute[];
  selectedStrategy: RouteStrategy;
  selectedWaypoint: number | null;

  simStatus: SimStatus;
  simElapsed: number;
  simDistance: number;
  simBattery: number;
  simCoverage: number;
  simPosition: LatLng | null;
  simHeading: string;
  simWaypoint: number;
  events: MissionEvent[];
  telemetry: TelemetrySample[];
  history: MissionRecord[];
  lastReportId: string | null;
  demoRunning: boolean;

  /** Autonomous in-flight replanning (simulated) */
  replanStage: number;
  replanning: boolean;
  originalSnapshot: RouteSnapshot | null;
  adaptedSnapshot: RouteSnapshot | null;
  originalPath: LatLng[] | null;
  aiDecision: AiDecision | null;
  adaptations: number;
  triggerObstacle: () => Promise<void>;
  clearAdaptation: () => void;


  setMissionName: (v: string) => void;
  setDrawMode: (m: DrawMode) => void;
  setPendingZoneKind: (k: ZoneKind) => void;
  setArea: (a: LatLng[]) => void;
  addZone: (polygon: LatLng[], kind?: ZoneKind) => void;
  removeZone: (id: string) => void;
  addMarker: (p: LatLng) => void;
  setHome: (p: LatLng) => void;
  clearMission: () => void;
  updateConfig: (p: Partial<MissionConfig>) => void;
  selectDrone: (id: string) => void;
  updateSettings: (p: Partial<Settings>) => void;
  setLocation: (key: EgyptLocationKey, opts?: { loadArea?: boolean }) => void;
  applyTemplate: (id: MissionTemplateId) => void;
  loadDemoMission: () => void;
  applySuggestion: (action: string) => void;

  generate: () => Promise<void>;
  selectStrategy: (s: RouteStrategy) => void;
  selectWaypoint: (i: number | null) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  abortSimulation: () => void;
  resetSimulation: () => void;
  runDemoSequence: () => Promise<void>;
};

const defaultDrone = DRONES[0]!;

const defaultConfig: MissionConfig = {
  objective: "survey",
  altitude: 80,
  speed: 8,
  fov: 78,
  frontOverlap: 0.75,
  sideOverlap: 0.65,
  rthThreshold: 20,
  safetyReserve: 15,
  wind: "low",
  startBattery: 100,
  batteryCapacity: 10000,
  maxFlightTime: 25,
  camera: "rgb",
  payload: "camera",
  droneId: defaultDrone.id,
};

const defaultSettings: Settings = {
  units: "metric",
  mapStyle: "dark",
  defaultAltitude: 80,
  defaultSpeed: 8,
  batteryReserve: 15,
  rthThreshold: 20,
  simulationSpeed: 24,
  safetyAlerts: true,
  followDrone: true,
  presentationMode: false,
  strategicMode: false,
  smartCityLayer: true,
  showComparison: false,
};

let simTimer: ReturnType<typeof setInterval> | null = null;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useMission = create<State>((set, get) => ({
  missionName: "NAC Infrastructure Survey — Sector A",
  locationKey: "nac",
  templateId: "infrastructure-survey",
  focus: null,
  manual: null,
  comparison: null,
  area: NAC_AREA,
  zones: NAC_ZONES,
  markers: [],
  home: NAC_HOME,
  drawMode: "none",
  pendingZoneKind: "no-fly",
  config: defaultConfig,
  drones: DRONES,
  settings: defaultSettings,

  planStatus: "idle",
  planStep: 0,
  planError: null,
  routes: [],
  selectedStrategy: "recommended",
  selectedWaypoint: null,

  simStatus: "idle",
  simElapsed: 0,
  simDistance: 0,
  simBattery: 100,
  simCoverage: 0,
  simPosition: null,
  simHeading: "—",
  simWaypoint: 0,
  events: [],
  telemetry: [],
  history: DEMO_MISSIONS,
  lastReportId: null,
  demoRunning: false,

  setMissionName: (v) => set({ missionName: v }),
  setDrawMode: (m) => set({ drawMode: m }),
  setPendingZoneKind: (k) => set({ pendingZoneKind: k }),
  setArea: (a) => set({ area: a, routes: [], planStatus: "idle", planError: null, drawMode: "none" }),
  addZone: (polygon, kind) =>
    set((s) => {
      const k = kind ?? s.pendingZoneKind;
      const labels: Record<ZoneKind, string> = {
        "no-fly": "No-Fly Zone",
        restricted: "Restricted Area",
        obstacle: "Obstacle",
        sensitive: "Sensitive Area",
      };
      const count = s.zones.filter((z) => z.kind === k).length + 1;
      return {
        zones: [
          ...s.zones,
          { id: `zone-${Date.now()}`, name: `${labels[k]} ${count}`, kind: k, polygon },
        ],
        routes: [],
        planStatus: "idle",
        planError: null,
        drawMode: "none",
      };
    }),
  removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id), routes: [] })),
  addMarker: (p) =>
    set((s) => ({
      markers: [...s.markers, { id: `m-${Date.now()}`, position: p, label: `POI ${s.markers.length + 1}` }],
      drawMode: "none",
    })),
  setHome: (p) => set({ home: p, drawMode: "none", routes: [] }),
  clearMission: () => {
    if (simTimer) clearInterval(simTimer);
    simTimer = null;
    set({
      area: [],
      zones: [],
      markers: [],
      home: null,
      routes: [],
      manual: null,
      comparison: null,
      planStatus: "idle",
      planError: null,
      planStep: 0,
      selectedWaypoint: null,
      simStatus: "idle",
      simElapsed: 0,
      simDistance: 0,
      simCoverage: 0,
      simPosition: null,
      events: [],
      telemetry: [],
    });
  },
  updateConfig: (p) => set((s) => ({ config: { ...s.config, ...p }, routes: [], planStatus: s.planStatus === "ready" ? "idle" : s.planStatus })),
  selectDrone: (id) => {
    const d = get().drones.find((x) => x.id === id);
    if (!d) return;
    set((s) => ({
      config: {
        ...s.config,
        droneId: d.id,
        batteryCapacity: d.batteryCapacity,
        maxFlightTime: d.maxFlightTime,
        speed: d.cruiseSpeed,
        fov: d.fov,
        camera: d.camera,
        payload: d.payload,
        startBattery: Math.max(20, d.battery),
      },
      routes: [],
      planStatus: "idle",
    }));
  },
  updateSettings: (p) =>
    set((s) => {
      const settings = { ...s.settings, ...p };
      return {
        settings,
        config: {
          ...s.config,
          safetyReserve: settings.batteryReserve,
          rthThreshold: settings.rthThreshold,
        },
      };
    }),
  setLocation: (key, opts) => {
    const loc = getLocation(key);
    set((s) => ({
      locationKey: key,
      focus: { center: loc.center, zoom: loc.zoom, nonce: Date.now() },
      ...(opts?.loadArea === false
        ? {}
        : {
            area: loc.area,
            zones: loc.zones,
            home: loc.home,
            markers: [],
            routes: [],
            manual: null,
            comparison: null,
            planStatus: "idle" as PlanStatus,
            planError: null,
            missionName: `${loc.name} — ${getTemplate(s.templateId ?? "infrastructure-survey").missionPrefix}`,
          }),
    }));
  },
  applyTemplate: (id) => {
    const t = getTemplate(id);
    set((s) => ({
      templateId: id,
      missionName: `${getLocation(s.locationKey).name} — ${t.missionPrefix}`,
      config: {
        ...s.config,
        objective: t.objective,
        altitude: t.altitude,
        speed: t.speed,
        sideOverlap: t.sideOverlap,
        frontOverlap: t.frontOverlap,
      },
      routes: [],
      manual: null,
      comparison: null,
      planStatus: "idle",
      planError: null,
    }));
  },
  loadDemoMission: () =>
    set((s) => ({
      missionName: "ITC DEMO — New Administrative Capital Infrastructure Survey",
      locationKey: "nac",
      templateId: "infrastructure-survey",
      focus: { center: getLocation("nac").center, zoom: 14, nonce: Date.now() },
      area: DEMO_AREA,
      zones: DEMO_ZONES,
      home: DEMO_HOME,
      manual: null,
      comparison: null,
      markers: [],
      routes: [],
      planStatus: "idle",
      planError: null,
      simStatus: "idle",
      simElapsed: 0,
      simDistance: 0,
      simCoverage: 0,
      simPosition: null,
      events: [],
      telemetry: [],
      config: { ...s.config, objective: "survey", altitude: 80, wind: "moderate" },
    })),

  applySuggestion: (action) => {
    const s = get();
    const cfg = s.config;
    switch (action) {
      case "Reduce Coverage":
        set({
          config: {
            ...cfg,
            sideOverlap: Math.max(0.2, cfg.sideOverlap - 0.15),
            frontOverlap: Math.max(0.3, cfg.frontOverlap - 0.1),
          },
        });
        break;
      case "Increase Battery":
        set({
          config: { ...cfg, startBattery: 100, safetyReserve: Math.max(10, cfg.safetyReserve - 5) },
          settings: { ...s.settings, batteryReserve: Math.max(10, cfg.safetyReserve - 5) },
        });
        break;
      case "Change Drone": {
        const best = [...s.drones].sort((a, b) => b.maxFlightTime - a.maxFlightTime)[0];
        if (best) get().selectDrone(best.id);
        break;
      }
      case "Optimize Mission":
        set({
          config: {
            ...cfg,
            altitude: Math.min(120, cfg.altitude + 20),
            speed: Math.min(20, cfg.speed + 2),
            wind: "low",
          },
        });
        break;
      case "Reduce Altitude":
        set({ config: { ...cfg, altitude: Math.max(20, cfg.altitude - 20) } });
        break;
      case "Load Demo Mission":
        get().loadDemoMission();
        break;
      case "Draw Survey Area":
      case "Enlarge Survey Area":
      case "Move Survey Area":
        set({ drawMode: "area", planStatus: "idle", planError: null });
        return;
      case "Edit Restricted Zones":
        set({ drawMode: "zone", planStatus: "idle", planError: null });
        return;
      default:
        break;
    }
    void get().generate();
  },



  generate: async () => {
    const { area, zones, config, home } = get();
    set({ planStatus: "optimizing", planStep: 0, planError: null, routes: [] });
    for (let i = 0; i < OPTIMIZATION_STEPS.length; i++) {
      await wait(i === OPTIMIZATION_STEPS.length - 1 ? 380 : 260);
      set({ planStep: i });
    }
    const result = planMission({ area, zones, config, home });
    if (!result.ok) {
      set({ planStatus: "error", planError: result });
      return;
    }
    const manual = planManualRoute(area, zones, config, home);
    set({
      planStatus: "ready",
      routes: result.routes,
      manual,
      comparison: manual ? compareRoutes(result.routes[0]!, manual) : null,
      selectedStrategy: result.routes[0]!.strategy,
      simStatus: "idle",
      simElapsed: 0,
      simDistance: 0,
      simCoverage: 0,
      simBattery: config.startBattery,
      simPosition: result.routes[0]!.path[0] ?? null,
      events: [],
      telemetry: [],
    });
  },
  selectStrategy: (strategy) =>
    set((s) => {
      const route = s.routes.find((r) => r.strategy === strategy);
      return {
        selectedStrategy: strategy,
        selectedWaypoint: null,
        comparison: route && s.manual ? compareRoutes(route, s.manual) : s.comparison,
      };
    }),
  selectWaypoint: (i) => set({ selectedWaypoint: i }),

  startSimulation: () => {
    const state = get();
    const route = state.routes.find((r) => r.strategy === state.selectedStrategy);
    if (!route) return;
    if (simTimer) clearInterval(simTimer);
    set({
      simStatus: "running",
      simElapsed: 0,
      simDistance: 0,
      simBattery: state.config.startBattery,
      simCoverage: 0,
      simWaypoint: 0,
      simPosition: route.path[0] ?? null,
      events: [
        {
          id: `ev-${Date.now()}`,
          t: 0,
          level: "info",
          title: "Mission Armed",
          message: "Simulated flight controller armed. Takeoff sequence initiated.",
        },
      ],
      telemetry: [],
      lastReportId: null,
    });
    tickLoop(set, get);
  },
  pauseSimulation: () => {
    if (simTimer) clearInterval(simTimer);
    simTimer = null;
    set({ simStatus: "paused" });
  },
  resumeSimulation: () => {
    if (get().simStatus !== "paused") return;
    set({ simStatus: "running" });
    tickLoop(set, get);
  },
  abortSimulation: () => {
    if (simTimer) clearInterval(simTimer);
    simTimer = null;
    set((s) => ({
      simStatus: "aborted",
      events: [
        ...s.events,
        {
          id: `ev-${Date.now()}`,
          t: Math.round(s.simElapsed),
          level: "critical",
          title: "Mission Aborted",
          message: "Operator abort command issued. Simulated return-to-home engaged.",
        },
      ],
    }));
  },
  resetSimulation: () => {
    if (simTimer) clearInterval(simTimer);
    simTimer = null;
    const st = get();
    const route = st.routes.find((r) => r.strategy === st.selectedStrategy);
    set({
      simStatus: "idle",
      simElapsed: 0,
      simDistance: 0,
      simCoverage: 0,
      simBattery: st.config.startBattery,
      simWaypoint: 0,
      simPosition: route?.path[0] ?? null,
      events: [],
      telemetry: [],
    });
  },

  runDemoSequence: async () => {
    set({ demoRunning: true });
    get().loadDemoMission();
    await wait(900);
    await get().generate();
    await wait(1400);
    if (get().planStatus === "ready") get().startSimulation();
    set({ demoRunning: false });
  },
}));

function tickLoop(
  set: (p: Partial<State> | ((s: State) => Partial<State>)) => void,
  get: () => State,
) {
  const INTERVAL = 100;
  simTimer = setInterval(() => {
    const s = get();
    const route = s.routes.find((r) => r.strategy === s.selectedStrategy);
    if (!route || s.simStatus !== "running") return;

    const speedFactor = s.settings.simulationSpeed;
    const dt = (INTERVAL / 1000) * speedFactor;
    const total = route.metrics.distance;
    const surveyDistance = total - route.metrics.rthDistance;
    const speed = route.metrics.distance / route.metrics.duration;
    const nextDistance = Math.min(total, s.simDistance + speed * dt);
    const elapsed = s.simElapsed + dt;
    const frac = total === 0 ? 1 : nextDistance / total;

    const fullPath = [...route.path, ...route.rthPath.slice(1)];
    const { point, index } = pointAlongPath(fullPath, nextDistance);
    const prev = fullPath[Math.max(0, index - 1)] ?? point;
    const battery = Math.max(0, s.config.startBattery - route.metrics.batteryUsage * frac);
    const coverage =
      route.metrics.coverage * Math.min(1, nextDistance / Math.max(surveyDistance, 1));

    const wp = route.waypoints.reduce(
      (acc, w) => (w.distanceFromStart <= nextDistance ? w.index : acc),
      0,
    );

    const events = [...s.events];
    if (s.settings.safetyAlerts) {
      const maybe = maybeEvent(frac, s.events, elapsed, battery, s.config.rthThreshold, s.config.wind);
      if (maybe) events.push(maybe);
    }

    const telemetry = [...s.telemetry];
    if (telemetry.length === 0 || elapsed - telemetry[telemetry.length - 1]!.t > 8) {
      telemetry.push({
        t: Math.round(elapsed),
        battery: Math.round(battery * 10) / 10,
        altitude:
          nextDistance >= surveyDistance
            ? Math.round(route.waypoints[1]?.altitude ?? 80)
            : Math.round((route.waypoints[1]?.altitude ?? 80) + Math.sin(frac * 12) * 3),
        speed: Math.round((speed + Math.cos(frac * 9) * 0.6) * 10) / 10,
        coverage: Math.round(coverage * 1000) / 10,
        distance: Math.round((nextDistance / 1000) * 100) / 100,
      });
    }

    if (nextDistance >= total - 0.5) {
      if (simTimer) clearInterval(simTimer);
      simTimer = null;
      const record = buildRecord(s, route, elapsed, events, telemetry);
      set({
        simStatus: "complete",
        simDistance: total,
        simElapsed: elapsed,
        simBattery: battery,
        simCoverage: route.metrics.coverage,
        simPosition: fullPath[fullPath.length - 1] ?? point,
        simWaypoint: route.waypoints.length - 1,
        events: [
          ...events,
          {
            id: `ev-done`,
            t: Math.round(elapsed),
            level: "info",
            title: "Mission Complete",
            message: "All waypoints executed. Simulated landing at home point confirmed.",
          },
        ],
        telemetry,
        history: [record, ...s.history],
        lastReportId: record.id,
      });
      return;
    }

    set({
      simDistance: nextDistance,
      simElapsed: elapsed,
      simBattery: battery,
      simCoverage: coverage,
      simPosition: point,
      simHeading: bearingLabel(prev, point),
      simWaypoint: wp,
      events,
      telemetry,
    });
  }, INTERVAL);
}

function maybeEvent(
  frac: number,
  existing: MissionEvent[],
  elapsed: number,
  battery: number,
  rthThreshold: number,
  wind: string,
): MissionEvent | null {
  const has = (id: string) => existing.some((e) => e.id === id);
  if (frac > 0.18 && !has("ev-gps")) {
    return {
      id: "ev-gps",
      t: Math.round(elapsed),
      level: "info",
      title: "GPS Lock Nominal",
      message: "18 satellites acquired. Horizontal accuracy 0.8 m (simulated).",
    };
  }
  if (wind !== "low" && frac > 0.36 && !has("ev-wind")) {
    return {
      id: "ev-wind",
      t: Math.round(elapsed),
      level: "warning",
      title: "Weather Warning",
      message: "Moderate wind detected. Route stability reduced — speed profile adapted.",
    };
  }
  if (frac > 0.58 && !has("ev-zone")) {
    return {
      id: "ev-zone",
      t: Math.round(elapsed),
      level: "warning",
      title: "Restricted Zone Proximity",
      message: "Potential route conflict detected nearby. Lateral clearance maintained by planner.",
    };
  }
  if (battery <= rthThreshold + 8 && !has("ev-batt")) {
    return {
      id: "ev-batt",
      t: Math.round(elapsed),
      level: "warning",
      title: "Battery Warning",
      message: "Battery reserve approaching return-to-home threshold.",
    };
  }
  return null;
}

function buildRecord(
  s: State,
  route: PlannedRoute,
  elapsed: number,
  events: MissionEvent[],
  telemetry: TelemetrySample[],
): MissionRecord {
  const id = `MSN-${String(25 + s.history.length - DEMO_MISSIONS.length).padStart(3, "0")}`;
  return {
    id,
    name: s.missionName.includes("Mission") ? s.missionName : `${s.missionName}`,
    location: `${route.label} — ${s.config.objective.toUpperCase()}`,
    date: new Date().toISOString(),
    objective: s.config.objective,
    droneModel: s.drones.find((d) => d.id === s.config.droneId)?.model ?? "Horus X1",
    operator: "Cmdr. N. Farouk",
    areaKm2: Math.round((polygonAreaM2(s.area) / 1e6) * 100) / 100,
    distanceKm: Math.round((route.metrics.distance / 1000) * 100) / 100,
    durationSec: Math.round(elapsed),
    coverage: route.metrics.coverage,
    batteryUsed: Math.round(route.metrics.batteryUsage),
    efficiency: route.score.overall,
    images: route.metrics.images,
    waypoints: route.metrics.waypointCount,
    status: "completed",
    events,
    telemetry,
    area: s.area,
    path: route.path,
    zones: s.zones,
  };
}

export function useAreaStats() {
  const area = useMission((s) => s.area);
  if (area.length < 3) return null;
  return {
    areaM2: polygonAreaM2(area),
    perimeter: polygonPerimeterM(area),
  };
}

export function useActiveRoute() {
  return useMission((s) => s.routes.find((r) => r.strategy === s.selectedStrategy) ?? null);
}

export function totalPathLength(path: LatLng[]) {
  return pathLength(path);
}
