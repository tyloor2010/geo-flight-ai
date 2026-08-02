import { circlePolygon } from "./geo";
import type { LatLng, MissionObjective, Zone } from "./types";

/**
 * Egypt geographic + scenario layer.
 *
 * IMPORTANT: every zone, perimeter and facility label in this file is FICTIONAL
 * and generated for simulation only. Nothing here represents authoritative
 * airspace data, official restrictions, or any real government/military site.
 */

export type EgyptLocationKey =
  | "nac"
  | "cairo"
  | "giza"
  | "new-cairo"
  | "alexandria"
  | "new-alamein"
  | "tenth-ramadan"
  | "ain-sokhna";

export type EgyptLocation = {
  key: EgyptLocationKey;
  name: string;
  region: string;
  center: LatLng;
  zoom: number;
  summary: string;
  focusAreas: string[];
  templates: MissionTemplateId[];
  area: LatLng[];
  zones: Zone[];
  home: LatLng;
  smartCity?: boolean;
};

export type MissionTemplateId =
  | "infrastructure-survey"
  | "smart-city-mapping"
  | "road-corridor"
  | "construction-progress"
  | "environmental"
  | "emergency"
  | "search-rescue"
  | "perimeter";

export type MissionTemplate = {
  id: MissionTemplateId;
  name: string;
  description: string;
  objective: MissionObjective;
  altitude: number;
  speed: number;
  sideOverlap: number;
  frontOverlap: number;
  missionPrefix: string;
};

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "infrastructure-survey",
    name: "Infrastructure Survey",
    description: "Monitor roads, bridges, construction zones and large infrastructure projects.",
    objective: "survey",
    altitude: 80,
    speed: 8,
    sideOverlap: 0.65,
    frontOverlap: 0.75,
    missionPrefix: "Infrastructure Survey",
  },
  {
    id: "smart-city-mapping",
    name: "Smart City Mapping",
    description: "Dense aerial survey grid for smart-city development and digital twin capture.",
    objective: "mapping",
    altitude: 90,
    speed: 7,
    sideOverlap: 0.72,
    frontOverlap: 0.8,
    missionPrefix: "Smart City Mapping",
  },
  {
    id: "road-corridor",
    name: "Road & Corridor Inspection",
    description: "Plan linear missions along major roads and infrastructure corridors.",
    objective: "inspection",
    altitude: 60,
    speed: 9,
    sideOverlap: 0.55,
    frontOverlap: 0.8,
    missionPrefix: "Corridor Inspection",
  },
  {
    id: "construction-progress",
    name: "Construction Progress",
    description: "Repeatable survey geometry for comparing construction sites over time.",
    objective: "mapping",
    altitude: 70,
    speed: 7,
    sideOverlap: 0.7,
    frontOverlap: 0.78,
    missionPrefix: "Construction Progress",
  },
  {
    id: "environmental",
    name: "Environmental Survey",
    description: "Wide-area coverage to identify terrain and environmental change.",
    objective: "survey",
    altitude: 110,
    speed: 11,
    sideOverlap: 0.5,
    frontOverlap: 0.7,
    missionPrefix: "Environmental Survey",
  },
  {
    id: "emergency",
    name: "Emergency Assessment",
    description: "Rapid aerial assessment following a simulated natural or infrastructure incident.",
    objective: "inspection",
    altitude: 75,
    speed: 12,
    sideOverlap: 0.45,
    frontOverlap: 0.7,
    missionPrefix: "Emergency Assessment",
  },
  {
    id: "search-rescue",
    name: "Search & Rescue",
    description: "Systematic aerial search coverage across a predefined area.",
    objective: "search",
    altitude: 55,
    speed: 8,
    sideOverlap: 0.7,
    frontOverlap: 0.8,
    missionPrefix: "Search Pattern",
  },
  {
    id: "perimeter",
    name: "Security Perimeter Simulation",
    description: "Simulated perimeter monitoring over a fictional demo boundary only.",
    objective: "inspection",
    altitude: 85,
    speed: 9,
    sideOverlap: 0.6,
    frontOverlap: 0.75,
    missionPrefix: "Perimeter Simulation",
  },
];

function poly(center: LatLng, dLat: number, dLng: number, jitter = 0): LatLng[] {
  const pts: LatLng[] = [
    { lat: center.lat + dLat, lng: center.lng - dLng * 0.9 },
    { lat: center.lat + dLat * 0.85, lng: center.lng + dLng },
    { lat: center.lat - dLat * 0.4, lng: center.lng + dLng * 0.92 },
    { lat: center.lat - dLat, lng: center.lng + dLng * 0.15 },
    { lat: center.lat - dLat * 0.7, lng: center.lng - dLng * 0.95 },
  ];
  if (!jitter) return pts;
  return pts.map((p, i) => ({
    lat: p.lat + Math.sin(i * 2.3) * jitter,
    lng: p.lng + Math.cos(i * 1.7) * jitter,
  }));
}

/** New Administrative Capital — primary ITC demonstration environment. */
export const NAC_CENTER: LatLng = { lat: 30.013, lng: 31.748 };

export const NAC_AREA: LatLng[] = [
  { lat: 30.0205, lng: 31.7385 },
  { lat: 30.0198, lng: 31.7592 },
  { lat: 30.0091, lng: 31.7625 },
  { lat: 30.0038, lng: 31.7508 },
  { lat: 30.0082, lng: 31.7381 },
];

export const NAC_ZONES: Zone[] = [
  {
    id: "nac-zone-gov",
    name: "Government District — DEMO",
    kind: "no-fly",
    polygon: circlePolygon({ lat: 30.0168, lng: 31.7532 }, 420, 28),
  },
  {
    id: "nac-zone-infra",
    name: "Infrastructure Zone — DEMO",
    kind: "obstacle",
    polygon: circlePolygon({ lat: 30.0096, lng: 31.7432 }, 210, 22),
  },
  {
    id: "nac-zone-sim",
    name: "Restricted Simulation Zone 03 — DEMO",
    kind: "restricted",
    polygon: circlePolygon({ lat: 30.0108, lng: 31.7568 }, 240, 22),
  },
];

export const NAC_HOME: LatLng = { lat: 30.0062, lng: 31.7402 };

export const EGYPT_CENTER: LatLng = { lat: 28.6, lng: 30.8 };

export const EGYPT_LOCATIONS: EgyptLocation[] = [
  {
    key: "nac",
    name: "New Administrative Capital",
    region: "Cairo Governorate — East",
    center: NAC_CENTER,
    zoom: 14,
    summary:
      "Egypt's flagship smart-city programme. Primary demonstration environment for DroneRoute AI.",
    focusAreas: ["Smart City Sector A", "Road Corridor 04", "Survey Zone 12", "Infrastructure Zone — DEMO"],
    templates: ["infrastructure-survey", "smart-city-mapping", "construction-progress", "road-corridor"],
    area: NAC_AREA,
    zones: NAC_ZONES,
    home: NAC_HOME,
    smartCity: true,
  },
  {
    key: "cairo",
    name: "Cairo",
    region: "Greater Cairo",
    center: { lat: 30.0444, lng: 31.2357 },
    zoom: 13,
    summary: "Dense urban environment — corridor inspection and emergency assessment scenarios.",
    focusAreas: ["Ring Road Corridor", "Urban Sector B", "Bridge Inspection Set"],
    templates: ["road-corridor", "emergency", "search-rescue"],
    area: poly({ lat: 30.0444, lng: 31.2357 }, 0.0075, 0.0095),
    zones: [
      {
        id: "cai-zone-1",
        name: "Urban Restriction — DEMO",
        kind: "restricted",
        polygon: circlePolygon({ lat: 30.0472, lng: 31.2402 }, 320, 24),
      },
    ],
    home: { lat: 30.0372, lng: 31.2281 },
  },
  {
    key: "giza",
    name: "Giza",
    region: "Giza Governorate",
    center: { lat: 29.9773, lng: 31.1325 },
    zoom: 13,
    summary: "Heritage-adjacent survey planning with conservative clearance profiles.",
    focusAreas: ["Survey Zone 07", "Access Corridor 02"],
    templates: ["environmental", "infrastructure-survey", "construction-progress"],
    area: poly({ lat: 29.9773, lng: 31.1325 }, 0.0068, 0.009),
    zones: [
      {
        id: "giz-zone-1",
        name: "Heritage Buffer — DEMO",
        kind: "sensitive",
        polygon: circlePolygon({ lat: 29.9792, lng: 31.1345 }, 380, 24),
      },
    ],
    home: { lat: 29.9705, lng: 31.1258 },
  },
  {
    key: "new-cairo",
    name: "New Cairo",
    region: "Cairo Governorate — East",
    center: { lat: 30.03, lng: 31.4913 },
    zoom: 13,
    summary: "Planned district expansion — infrastructure and construction monitoring.",
    focusAreas: ["Smart City Sector C", "Road Corridor 09"],
    templates: ["construction-progress", "smart-city-mapping", "infrastructure-survey"],
    area: poly({ lat: 30.03, lng: 31.4913 }, 0.008, 0.0105),
    zones: [
      {
        id: "nc-zone-1",
        name: "Infrastructure Zone — DEMO",
        kind: "obstacle",
        polygon: circlePolygon({ lat: 30.0322, lng: 31.4952 }, 220, 20),
      },
    ],
    home: { lat: 30.0231, lng: 31.4842 },
  },
  {
    key: "alexandria",
    name: "Alexandria",
    region: "Mediterranean Coast",
    center: { lat: 31.2156, lng: 29.9553 },
    zoom: 13,
    summary: "Coastal and port-adjacent survey planning with environmental monitoring.",
    focusAreas: ["Coastal Survey Zone 04", "Port Corridor — DEMO"],
    templates: ["environmental", "infrastructure-survey", "emergency"],
    area: poly({ lat: 31.2156, lng: 29.9553 }, 0.0072, 0.0098),
    zones: [
      {
        id: "alx-zone-1",
        name: "Port Control Airspace — DEMO",
        kind: "no-fly",
        polygon: circlePolygon({ lat: 31.2195, lng: 29.9495 }, 380, 26),
      },
    ],
    home: { lat: 31.2088, lng: 29.9462 },
  },
  {
    key: "new-alamein",
    name: "New Alamein",
    region: "Matrouh — North Coast",
    center: { lat: 30.8253, lng: 28.9522 },
    zoom: 13,
    summary: "Coastal smart-city development with large-scale construction corridors.",
    focusAreas: ["Smart City Sector A", "Coastal Corridor 01"],
    templates: ["smart-city-mapping", "construction-progress", "environmental"],
    area: poly({ lat: 30.8253, lng: 28.9522 }, 0.0068, 0.0105),
    zones: [
      {
        id: "ala-zone-1",
        name: "Construction Hazard Zone — DEMO",
        kind: "obstacle",
        polygon: circlePolygon({ lat: 30.8272, lng: 28.9562 }, 200, 20),
      },
    ],
    home: { lat: 30.8192, lng: 28.9452 },
    smartCity: true,
  },
  {
    key: "tenth-ramadan",
    name: "10th of Ramadan",
    region: "Sharqia — Industrial Belt",
    center: { lat: 30.296, lng: 31.742 },
    zoom: 13,
    summary: "Industrial estate monitoring and simulated perimeter demonstrations.",
    focusAreas: ["Industrial Sector D", "Perimeter Simulation Loop"],
    templates: ["perimeter", "infrastructure-survey", "emergency"],
    area: poly({ lat: 30.296, lng: 31.742 }, 0.0065, 0.0092),
    zones: [
      {
        id: "tr-zone-1",
        name: "Restricted Simulation Zone 01 — DEMO",
        kind: "restricted",
        polygon: circlePolygon({ lat: 30.2982, lng: 31.7452 }, 240, 20),
      },
    ],
    home: { lat: 30.2901, lng: 31.7352 },
  },
  {
    key: "ain-sokhna",
    name: "Ain Sokhna",
    region: "Suez — Red Sea",
    center: { lat: 29.6, lng: 32.315 },
    zoom: 13,
    summary: "Logistics and coastal infrastructure corridors along the Red Sea.",
    focusAreas: ["Logistics Corridor 03", "Coastal Survey Zone 08"],
    templates: ["road-corridor", "environmental", "infrastructure-survey"],
    area: poly({ lat: 29.6, lng: 32.315 }, 0.0062, 0.0098),
    zones: [
      {
        id: "as-zone-1",
        name: "Infrastructure Zone — DEMO",
        kind: "obstacle",
        polygon: circlePolygon({ lat: 29.6022, lng: 32.3188 }, 210, 20),
      },
    ],
    home: { lat: 29.5942, lng: 32.3082 },
  },
];

export function getLocation(key: EgyptLocationKey): EgyptLocation {
  return EGYPT_LOCATIONS.find((l) => l.key === key) ?? EGYPT_LOCATIONS[0]!;
}

export function getTemplate(id: MissionTemplateId): MissionTemplate {
  return MISSION_TEMPLATES.find((t) => t.id === id) ?? MISSION_TEMPLATES[0]!;
}

/** Stylised smart-city overlay geometry (roads + blocks) — illustrative, not survey data. */
export function smartCityFeatures(center: LatLng) {
  const roads: LatLng[][] = [];
  const kmLat = 1 / 110.9;
  const kmLng = 1 / (111.32 * Math.cos((center.lat * Math.PI) / 180));

  for (let i = -3; i <= 3; i++) {
    const lat = center.lat + i * 0.42 * kmLat * 1.1;
    roads.push([
      { lat: lat, lng: center.lng - 1.5 * kmLng },
      { lat: lat + 0.06 * kmLat, lng: center.lng + 1.5 * kmLng },
    ]);
  }
  for (let j = -3; j <= 3; j++) {
    const lng = center.lng + j * 0.45 * kmLng;
    roads.push([
      { lat: center.lat - 1.15 * kmLat, lng },
      { lat: center.lat + 1.15 * kmLat, lng: lng + 0.03 * kmLng },
    ]);
  }

  const corridor: LatLng[] = [
    { lat: center.lat - 1.2 * kmLat, lng: center.lng - 1.4 * kmLng },
    { lat: center.lat - 0.2 * kmLat, lng: center.lng - 0.2 * kmLng },
    { lat: center.lat + 0.5 * kmLat, lng: center.lng + 0.9 * kmLng },
    { lat: center.lat + 1.1 * kmLat, lng: center.lng + 1.5 * kmLng },
  ];

  const buildings: Array<{ id: string; label: string; polygon: LatLng[]; height: number }> = [];
  let n = 0;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if ((i + j) % 2 !== 0) continue;
      n += 1;
      const bLat = center.lat + i * 0.46 * kmLat * 1.1 + 0.16 * kmLat;
      const bLng = center.lng + j * 0.45 * kmLng + 0.1 * kmLng;
      const w = (0.09 + ((n * 7) % 5) * 0.012) * kmLng;
      const h = (0.08 + ((n * 5) % 4) * 0.011) * kmLat;
      buildings.push({
        id: `blk-${n}`,
        label: `Block ${String.fromCharCode(65 + (n % 6))}-${n}`,
        polygon: [
          { lat: bLat - h, lng: bLng - w },
          { lat: bLat - h, lng: bLng + w },
          { lat: bLat + h, lng: bLng + w },
          { lat: bLat + h, lng: bLng - w },
        ],
        height: 40 + ((n * 13) % 90),
      });
    }
  }

  return { roads, corridor, buildings };
}

export const EGYPT_DEMO_STATS = [
  { label: "Mission Areas Simulated", value: "24" },
  { label: "Total Survey Area", value: "128 km²" },
  { label: "Average Route Optimization", value: "18%" },
  { label: "Average Coverage", value: "95.7%" },
  { label: "Average Battery Saving", value: "13%" },
];

export const APPLICATION_AREAS = [
  {
    title: "Smart Infrastructure",
    text: "AI-assisted aerial planning for large-scale infrastructure programmes.",
  },
  {
    title: "Emergency Response",
    text: "Rapid mission planning for disaster assessment and emergency teams.",
  },
  { title: "Search & Rescue", text: "Systematic aerial coverage planning across wide areas." },
  {
    title: "Environmental Monitoring",
    text: "Large-area environmental and terrain survey missions.",
  },
  {
    title: "Infrastructure Security",
    text: "Simulation-based perimeter monitoring and anomaly detection concepts.",
  },
  {
    title: "Defense Technology Research",
    text: "A modular foundation for future autonomous drone mission systems.",
  },
];
