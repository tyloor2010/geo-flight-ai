import type { LatLng } from "./types";

export type Pt = { x: number; y: number };

const R = 6378137;

export function projector(origin: LatLng) {
  const latRad = (origin.lat * Math.PI) / 180;
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * latRad) + 1.175 * Math.cos(4 * latRad);
  const mPerDegLng = 111412.84 * Math.cos(latRad) - 93.5 * Math.cos(3 * latRad);
  return {
    to(p: LatLng): Pt {
      return { x: (p.lng - origin.lng) * mPerDegLng, y: (p.lat - origin.lat) * mPerDegLat };
    },
    from(p: Pt): LatLng {
      return { lat: origin.lat + p.y / mPerDegLat, lng: origin.lng + p.x / mPerDegLng };
    },
  };
}

export function centroid(points: LatLng[]): LatLng {
  if (!points.length) return { lat: 0, lng: 0 };
  const s = points.reduce((a, p) => ({ lat: a.lat + p.lat, lng: a.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: s.lat / points.length, lng: s.lng / points.length };
}

export function haversine(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function pathLength(points: LatLng[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += haversine(points[i - 1]!, points[i]!);
  return d;
}

export function polygonAreaM2(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const proj = projector(centroid(points));
  const pts = points.map(proj.to);
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a / 2);
}

export function polygonPerimeterM(points: LatLng[]): number {
  if (points.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < points.length; i++) d += haversine(points[i]!, points[(i + 1) % points.length]!);
  return d;
}

export function pointInPolygonXY(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

export function pointInPolygon(p: LatLng, poly: LatLng[]): boolean {
  if (poly.length < 3) return false;
  const proj = projector(poly[0]!);
  return pointInPolygonXY(proj.to(p), poly.map(proj.to));
}

export function bboxXY(poly: Pt[]) {
  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function rotate(p: Pt, angle: number): Pt {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

export function inflatePolygon(poly: Pt[], buffer: number): Pt[] {
  const cx = poly.reduce((a, p) => a + p.x, 0) / poly.length;
  const cy = poly.reduce((a, p) => a + p.y, 0) / poly.length;
  return poly.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * buffer, y: p.y + (dy / len) * buffer };
  });
}

export function longestEdgeAngle(poly: Pt[]): number {
  let best = 0;
  let bestLen = -1;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len > bestLen) {
      bestLen = len;
      best = Math.atan2(b.y - a.y, b.x - a.x);
    }
  }
  return best;
}

export function bearingLabel(a: LatLng, b: LatLng): string {
  const y = Math.sin(((b.lng - a.lng) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.cos(((b.lng - a.lng) * Math.PI) / 180);
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  deg = (deg + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dir = dirs[Math.round(deg / 45) % 8]!;
  return `${dir} ${Math.round(deg)}°`;
}

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function pointAlongPath(path: LatLng[], distance: number): { point: LatLng; index: number } {
  if (path.length === 0) return { point: { lat: 0, lng: 0 }, index: 0 };
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const seg = haversine(path[i - 1]!, path[i]!);
    if (acc + seg >= distance) {
      const t = seg === 0 ? 0 : (distance - acc) / seg;
      return { point: interpolate(path[i - 1]!, path[i]!, t), index: i };
    }
    acc += seg;
  }
  return { point: path[path.length - 1]!, index: path.length - 1 };
}

export function circlePolygon(center: LatLng, radiusM: number, segments = 32): LatLng[] {
  const proj = projector(center);
  const out: LatLng[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    out.push(proj.from({ x: Math.cos(a) * radiusM, y: Math.sin(a) * radiusM }));
  }
  return out;
}
