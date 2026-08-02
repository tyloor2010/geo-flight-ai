import { polygonAreaM2, projector } from "./geo";
import type { DroneSpec, LatLng } from "./types";

export type Sector = {
  id: string;
  label: string;
  droneId: string;
  droneModel: string;
  polygon: LatLng[];
  areaKm2: number;
  estMinutes: number;
  share: number; // 0-1
};

/**
 * Splits a survey area into vertical sectors weighted by each drone's endurance.
 * Simulation-only allocation heuristic — no real fleet dispatch is performed.
 */
export function allocateSectors(area: LatLng[], drones: DroneSpec[]): Sector[] {
  if (area.length < 3 || !drones.length) return [];
  const origin = area[0]!;
  const proj = projector(origin);
  const pts = area.map(proj.to);
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const weights = drones.map((d) => d.maxFlightTime * (d.battery / 100) * d.cruiseSpeed);
  const total = weights.reduce((a, b) => a + b, 0) || 1;

  let cursor = minX;
  return drones.map((d, i) => {
    const share = weights[i]! / total;
    const w = (maxX - minX) * share;
    const x0 = cursor;
    const x1 = i === drones.length - 1 ? maxX : cursor + w;
    cursor = x1;
    const polygon = [
      proj.from({ x: x0, y: minY }),
      proj.from({ x: x1, y: minY }),
      proj.from({ x: x1, y: maxY }),
      proj.from({ x: x0, y: maxY }),
    ];
    const areaKm2 = polygonAreaM2(polygon) / 1e6;
    return {
      id: `sector-${i + 1}`,
      label: `Sector ${String.fromCharCode(65 + i)}`,
      droneId: d.id,
      droneModel: d.model,
      polygon,
      areaKm2: Math.round(areaKm2 * 100) / 100,
      estMinutes: Math.round(Math.min(d.maxFlightTime, areaKm2 * 9 + 4)),
      share: Math.round(share * 1000) / 10,
    };
  });
}
