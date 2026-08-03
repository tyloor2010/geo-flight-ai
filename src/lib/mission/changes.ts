/**
 * SIMULATED temporal change detection dataset.
 * Two synthetic survey passes over the same demo sector, with fabricated
 * change annotations. No real satellite/drone imagery comparison is performed.
 */
import frame1 from "@/assets/aerial-frame-1.jpg";
import frame2 from "@/assets/aerial-frame-2.jpg";
import frame3 from "@/assets/aerial-frame-3.jpg";
import frame4 from "@/assets/aerial-frame-4.jpg";

export type ChangeKind = "Infrastructure change" | "Surface change" | "New object detected" | "Vegetation change";

export type ImageChange = {
  id: string;
  kind: ChangeKind;
  confidence: number;
  box: { x: number; y: number; w: number; h: number };
  note: string;
};

export type ChangePair = {
  id: string;
  sector: string;
  missionA: { id: string; label: string; image: string };
  missionB: { id: string; label: string; image: string };
  changes: ImageChange[];
};

export const CHANGE_KIND_COLORS: Record<ChangeKind, string> = {
  "Infrastructure change": "#f59e0b",
  "Surface change": "#38bdf8",
  "New object detected": "#4ade80",
  "Vegetation change": "#a3b18a",
};

export const CHANGE_PAIRS: ChangePair[] = [
  {
    id: "CHG-SECTOR-B12",
    sector: "B-12",
    missionA: { id: "MSN-018", label: "July 2026", image: frame1 },
    missionB: { id: "MSN-026", label: "August 2026", image: frame3 },
    changes: [
      {
        id: "CHANGE #001",
        kind: "Infrastructure change",
        confidence: 91.2,
        box: { x: 0.18, y: 0.22, w: 0.2, h: 0.24 },
        note: "New paved access spur extending from the primary boulevard.",
      },
      {
        id: "CHANGE #002",
        kind: "Surface change",
        confidence: 87.6,
        box: { x: 0.56, y: 0.55, w: 0.24, h: 0.2 },
        note: "Ground surface reflectance shifted across the eastern lot.",
      },
      {
        id: "CHANGE #003",
        kind: "New object detected",
        confidence: 93.4,
        box: { x: 0.42, y: 0.12, w: 0.11, h: 0.12 },
        note: "Object present in the later pass with no equivalent in the baseline frame.",
      },
    ],
  },
  {
    id: "CHG-SECTOR-C07",
    sector: "C-07",
    missionA: { id: "MSN-019", label: "July 2026", image: frame2 },
    missionB: { id: "MSN-026", label: "August 2026", image: frame4 },
    changes: [
      {
        id: "CHANGE #001",
        kind: "Infrastructure change",
        confidence: 89.8,
        box: { x: 0.3, y: 0.4, w: 0.24, h: 0.22 },
        note: "Structure footprint expanded along the service corridor.",
      },
      {
        id: "CHANGE #002",
        kind: "Vegetation change",
        confidence: 84.1,
        box: { x: 0.68, y: 0.18, w: 0.18, h: 0.26 },
        note: "Simulated vegetation index variation on the northern strip.",
      },
    ],
  },
];
