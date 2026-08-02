import { create } from "zustand";
import {
  DETECTIONS,
  type Detection,
  type DetectionClass,
  type DetectionStatus,
} from "@/lib/mission/detections";

export type DetectionFilters = {
  type: DetectionClass | "all";
  confidence: 0 | 50 | 70 | 90;
  status: DetectionStatus | "all";
};

type DetectionState = {
  detections: Detection[];
  filters: DetectionFilters;
  selectedId: string | null;
  viewerFrameId: string | null;
  /** ids revealed by the running simulation, newest last */
  liveIds: string[];
  heatmap: boolean;
  setFilters: (p: Partial<DetectionFilters>) => void;
  select: (id: string | null) => void;
  openViewer: (frameId: string | null) => void;
  setStatus: (id: string, status: DetectionStatus) => void;
  addNote: (id: string, note: string) => void;
  toggleHeatmap: () => void;
  revealUpTo: (seconds: number) => void;
  revealAll: () => void;
  resetLive: () => void;
};

export const useDetections = create<DetectionState>((set, get) => ({
  detections: DETECTIONS.map((d) => ({ ...d })),
  filters: { type: "all", confidence: 0, status: "all" },
  selectedId: null,
  viewerFrameId: null,
  liveIds: [],
  heatmap: false,
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
  select: (id) => set({ selectedId: id }),
  openViewer: (frameId) => set({ viewerFrameId: frameId }),
  setStatus: (id, status) =>
    set((s) => ({
      detections: s.detections.map((d) => (d.id === id ? { ...d, status } : d)),
    })),
  addNote: (id, note) =>
    set((s) => ({
      detections: s.detections.map((d) =>
        d.id === id ? { ...d, notes: [...d.notes, note] } : d,
      ),
    })),
  toggleHeatmap: () => set((s) => ({ heatmap: !s.heatmap })),
  revealUpTo: (seconds) => {
    const { detections, liveIds } = get();
    const span = Math.max(...detections.map((d) => d.t));
    const due = detections
      .filter((d) => (d.t / span) * 0.92 <= seconds)
      .map((d) => d.id);
    if (due.length !== liveIds.length) set({ liveIds: due });
  },
  revealAll: () => set((s) => ({ liveIds: s.detections.map((d) => d.id) })),
  resetLive: () => set({ liveIds: [] }),
}));

export function useFilteredDetections() {
  const detections = useDetections((s) => s.detections);
  const f = useDetections((s) => s.filters);
  return detections.filter(
    (d) =>
      (f.type === "all" || d.objectClass === f.type) &&
      d.confidence >= f.confidence &&
      (f.status === "all" || d.status === f.status),
  );
}

/** Detections currently surfaced by the live simulation feed. */
export function useLiveDetections() {
  const detections = useDetections((s) => s.detections);
  const liveIds = useDetections((s) => s.liveIds);
  return liveIds
    .map((id) => detections.find((d) => d.id === id))
    .filter((d): d is Detection => Boolean(d));
}
