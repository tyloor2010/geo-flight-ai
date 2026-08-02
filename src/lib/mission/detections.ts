/**
 * Simulated detection intelligence dataset.
 *
 * IMPORTANT: every record below is synthetic demo data generated for the
 * DroneRoute AI prototype. Nothing here comes from a live camera, a real
 * detection model, or any operational/classified source.
 */
import frame1 from "@/assets/aerial-frame-1.jpg";
import frame2 from "@/assets/aerial-frame-2.jpg";
import frame3 from "@/assets/aerial-frame-3.jpg";
import frame4 from "@/assets/aerial-frame-4.jpg";
import type { LatLng } from "./types";

export type DetectionClass =
  | "Vehicle"
  | "Structure"
  | "Infrastructure Anomaly"
  | "Obstacle"
  | "Equipment"
  | "Unknown Object";

export type DetectionStatus = "new" | "review" | "confirmed" | "dismissed" | "flagged";

export type BoundingBox = {
  /** normalised 0-1 coordinates relative to the frame */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Detection = {
  id: string;
  index: number;
  objectClass: DetectionClass;
  confidence: number; // 0-100
  frameId: string;
  image: string;
  box: BoundingBox;
  sector: string;
  timestamp: string; // HH:MM:SS mission clock
  /** seconds into the simulated mission when this detection surfaces */
  t: number;
  altitude: number; // m AGL
  position: LatLng; // demo coordinates
  status: DetectionStatus;
  severity: "routine" | "attention" | "critical";
  assessment: string;
  reason: string;
  notes: string[];
};

export type AerialFrame = {
  id: string;
  image: string;
  timestamp: string;
  altitude: number;
  sector: string;
  position: LatLng;
  detections: string[];
};

/** Demo coordinates in the New Administrative Capital survey area (fictional sectors). */
const NAC = { lat: 30.0244, lng: 31.7669 };
const off = (dLat: number, dLng: number): LatLng => ({
  lat: NAC.lat + dLat,
  lng: NAC.lng + dLng,
});

export const DETECTIONS: Detection[] = [
  {
    id: "OBJ-021",
    index: 1,
    objectClass: "Vehicle",
    confidence: 94.7,
    frameId: "FRAME-00428",
    image: frame1,
    box: { x: 0.58, y: 0.48, w: 0.09, h: 0.08 },
    sector: "B-12",
    timestamp: "14:32:18",
    t: 62,
    altitude: 82,
    position: off(0.0042, -0.0051),
    status: "review",
    severity: "attention",
    assessment: "Object detected within designated survey area, adjacent to the primary boulevard.",
    reason: "Rectangular high-contrast shape with vehicle-consistent aspect ratio and cast shadow.",
    notes: [],
  },
  {
    id: "OBJ-022",
    index: 2,
    objectClass: "Vehicle",
    confidence: 91.3,
    frameId: "FRAME-00428",
    image: frame1,
    box: { x: 0.33, y: 0.14, w: 0.07, h: 0.09 },
    sector: "B-12",
    timestamp: "14:32:24",
    t: 74,
    altitude: 82,
    position: off(0.0051, -0.0038),
    status: "new",
    severity: "routine",
    assessment: "Parked vehicle cluster on an unpaved lot inside the survey polygon.",
    reason: "Repeated shapes of similar size and reflectance grouped in a parking pattern.",
    notes: [],
  },
  {
    id: "OBJ-023",
    index: 3,
    objectClass: "Infrastructure Anomaly",
    confidence: 88.3,
    frameId: "FRAME-00431",
    image: frame2,
    box: { x: 0.62, y: 0.28, w: 0.07, h: 0.5 },
    sector: "C-07",
    timestamp: "14:35:42",
    t: 138,
    altitude: 84,
    position: off(-0.0026, 0.0044),
    status: "flagged",
    severity: "critical",
    assessment: "Surface discontinuity along the road shoulder — flagged for ground inspection.",
    reason: "Visual pattern differs from the surrounding reference imagery along the pavement edge.",
    notes: [],
  },
  {
    id: "OBJ-024",
    index: 4,
    objectClass: "Equipment",
    confidence: 92.6,
    frameId: "FRAME-00431",
    image: frame2,
    box: { x: 0.39, y: 0.35, w: 0.19, h: 0.26 },
    sector: "C-07",
    timestamp: "14:35:55",
    t: 150,
    altitude: 84,
    position: off(-0.0031, 0.0037),
    status: "confirmed",
    severity: "routine",
    assessment: "Utility compound identified inside the corridor buffer.",
    reason: "Enclosed rectangular compound with regular metallic cabinets matching utility templates.",
    notes: [],
  },
  {
    id: "OBJ-025",
    index: 5,
    objectClass: "Structure",
    confidence: 96.1,
    frameId: "FRAME-00435",
    image: frame3,
    box: { x: 0.2, y: 0.13, w: 0.6, h: 0.42 },
    sector: "C-09",
    timestamp: "14:38:07",
    t: 206,
    altitude: 90,
    position: off(-0.0048, -0.0019),
    status: "confirmed",
    severity: "routine",
    assessment: "Large structure under construction — matches expected build footprint for the sector.",
    reason: "Continuous roof plane with regular façade modulation and active crane presence.",
    notes: [],
  },
  {
    id: "OBJ-026",
    index: 6,
    objectClass: "Obstacle",
    confidence: 89.4,
    frameId: "FRAME-00435",
    image: frame3,
    box: { x: 0.11, y: 0.12, w: 0.36, h: 0.26 },
    sector: "C-09",
    timestamp: "14:38:19",
    t: 218,
    altitude: 90,
    position: off(-0.0053, -0.0025),
    status: "review",
    severity: "attention",
    assessment: "Tall obstruction detected near the flight corridor — vertical clearance recommended.",
    reason: "Elongated lattice structure with a long shadow indicating significant vertical extent.",
    notes: [],
  },
  {
    id: "OBJ-027",
    index: 7,
    objectClass: "Equipment",
    confidence: 93.8,
    frameId: "FRAME-00442",
    image: frame4,
    box: { x: 0.27, y: 0.29, w: 0.23, h: 0.22 },
    sector: "D-03",
    timestamp: "14:41:36",
    t: 284,
    altitude: 86,
    position: off(0.0018, 0.0058),
    status: "confirmed",
    severity: "routine",
    assessment: "Solar array field mapped inside the environmental monitoring sector.",
    reason: "Regular grid of dark, low-reflectance panels aligned on a consistent azimuth.",
    notes: [],
  },
  {
    id: "OBJ-028",
    index: 8,
    objectClass: "Unknown Object",
    confidence: 71.2,
    frameId: "FRAME-00442",
    image: frame4,
    box: { x: 0.84, y: 0.58, w: 0.09, h: 0.12 },
    sector: "D-03",
    timestamp: "14:42:02",
    t: 305,
    altitude: 86,
    position: off(0.0011, 0.0066),
    status: "review",
    severity: "attention",
    assessment: "Low-confidence object near the equipment yard — operator review required.",
    reason: "Shape partially occluded by shadow; classifier confidence below the 80% threshold.",
    notes: [],
  },
];

export const FRAMES: AerialFrame[] = [
  {
    id: "FRAME-00428",
    image: frame1,
    timestamp: "14:32:18",
    altitude: 82,
    sector: "B-12",
    position: off(0.0045, -0.0045),
    detections: ["OBJ-021", "OBJ-022"],
  },
  {
    id: "FRAME-00431",
    image: frame2,
    timestamp: "14:35:42",
    altitude: 84,
    sector: "C-07",
    position: off(-0.0028, 0.004),
    detections: ["OBJ-023", "OBJ-024"],
  },
  {
    id: "FRAME-00435",
    image: frame3,
    timestamp: "14:38:07",
    altitude: 90,
    sector: "C-09",
    position: off(-0.005, -0.0022),
    detections: ["OBJ-025", "OBJ-026"],
  },
  {
    id: "FRAME-00442",
    image: frame4,
    timestamp: "14:41:36",
    altitude: 86,
    sector: "D-03",
    position: off(0.0015, 0.0062),
    detections: ["OBJ-027", "OBJ-028"],
  },
];

export const CLASS_COLORS: Record<DetectionClass, string> = {
  Vehicle: "#38bdf8",
  Structure: "#4ade80",
  "Infrastructure Anomaly": "#f59e0b",
  Obstacle: "#fb923c",
  Equipment: "#a3b18a",
  "Unknown Object": "#f87171",
};

export const STATUS_LABEL: Record<DetectionStatus, string> = {
  new: "New",
  review: "Review Required",
  confirmed: "Confirmed",
  dismissed: "Dismissed",
  flagged: "Flagged",
};

export function frameById(id: string) {
  return FRAMES.find((f) => f.id === id) ?? null;
}

export function summarise(detections: Detection[]) {
  const visible = detections.filter((d) => d.status !== "dismissed");
  const avg = visible.length
    ? visible.reduce((a, d) => a + d.confidence, 0) / visible.length
    : 0;
  return {
    framesAnalyzed: 428,
    total: visible.length,
    highConfidence: visible.filter((d) => d.confidence >= 90).length,
    reviewRequired: visible.filter((d) => d.status === "review" || d.status === "new").length,
    critical: visible.filter((d) => d.severity === "critical").length,
    avgConfidence: Math.round(avg * 10) / 10,
    coverage: 96.4,
  };
}
