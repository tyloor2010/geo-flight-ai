/**
 * SIMULATED multi-drone fleet operations.
 *
 * Sectors are allocated from the active survey area and each simulated
 * aircraft flies its own generated coverage path. No real aircraft are
 * commanded and no operational fleet data is used.
 */
import { create } from "zustand";
import { allocateSectors, type Sector } from "@/lib/mission/fleet";
import { planMission } from "@/lib/mission/planner";
import { centroid, pathLength, pointAlongPath } from "@/lib/mission/geo";
import type { DroneSpec, LatLng, MissionConfig } from "@/lib/mission/types";

export type FleetUnit = {
  id: string;
  model: string;
  sector: Sector;
  path: LatLng[];
  length: number;
  progress: number; // metres flown
  position: LatLng | null;
  battery: number;
  status: "idle" | "flying" | "returning" | "complete";
  speed: number; // m/s
  coverage: number; // 0-1
};

export const FLEET_COLORS = ["#38bdf8", "#4ade80", "#f59e0b", "#a78bfa", "#f87171", "#22d3ee"];

type FleetState = {
  active: boolean;
  units: FleetUnit[];
  sectors: Sector[];
  message: string | null;
  launch: (area: LatLng[], drones: DroneSpec[], config: MissionConfig) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

let timer: ReturnType<typeof setInterval> | null = null;

export const useFleet = create<FleetState>((set, get) => ({
  active: false,
  units: [],
  sectors: [],
  message: null,

  launch: (area, drones, config) => {
    if (timer) clearInterval(timer);
    timer = null;
    const usable = drones.filter((d) => d.status !== "maintenance").slice(0, 6);
    const sectors = allocateSectors(area, usable);
    if (!sectors.length) {
      set({ units: [], sectors: [], active: false, message: "Draw a survey area before launching the fleet." });
      return;
    }

    const units: FleetUnit[] = [];
    sectors.forEach((sector, i) => {
      const drone = usable[i]!;
      const home = centroid(sector.polygon);
      const result = planMission({
        area: sector.polygon,
        zones: [],
        config: { ...config, droneId: drone.id, speed: drone.cruiseSpeed, maxFlightTime: drone.maxFlightTime },
        home,
      });
      const path = result.ok ? result.routes[0]!.path : [...sector.polygon, sector.polygon[0]!];
      units.push({
        id: drone.id,
        model: drone.model,
        sector,
        path,
        length: pathLength(path),
        progress: 0,
        position: path[0] ?? null,
        battery: drone.battery,
        status: "flying",
        speed: drone.cruiseSpeed,
        coverage: 0,
      });
    });

    set({ units, sectors, active: true, message: null });
    tick(set, get);
  },

  pause: () => {
    if (timer) clearInterval(timer);
    timer = null;
    set({ active: false });
  },
  resume: () => {
    if (!get().units.length) return;
    set({ active: true });
    tick(set, get);
  },
  reset: () => {
    if (timer) clearInterval(timer);
    timer = null;
    set({ units: [], sectors: [], active: false, message: null });
  },
}));

function tick(set: (p: Partial<FleetState>) => void, get: () => FleetState) {
  const INTERVAL = 200;
  timer = setInterval(() => {
    const s = get();
    if (!s.active) return;
    let running = false;
    const units = s.units.map((u) => {
      if (u.status === "complete") return u;
      const step = u.speed * (INTERVAL / 1000) * 12;
      const progress = Math.min(u.length, u.progress + step);
      const { point } = pointAlongPath(u.path, progress);
      const frac = u.length ? progress / u.length : 1;
      const battery = Math.max(8, u.battery - step / Math.max(1, u.length) * 55);
      const done = progress >= u.length - 0.5;
      if (!done) running = true;
      return {
        ...u,
        progress,
        position: point,
        battery,
        coverage: frac,
        status: done ? ("complete" as const) : frac > 0.9 ? ("returning" as const) : ("flying" as const),
      };
    });
    if (!running) {
      if (timer) clearInterval(timer);
      timer = null;
      set({ units, active: false, message: "All sectors surveyed — simulated fleet mission complete." });
      return;
    }
    set({ units });
  }, INTERVAL);
}
