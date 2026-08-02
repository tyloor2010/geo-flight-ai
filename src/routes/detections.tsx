import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DetectionFilters } from "@/components/detections/DetectionFilters";
import { DetectionCard } from "@/components/detections/DetectionCard";
import { Stat } from "@/components/hud/primitives";
import { useDetections, useFilteredDetections } from "@/store/detection-store";
import { CLASS_COLORS, summarise } from "@/lib/mission/detections";

export const Route = createFileRoute("/detections")({
  head: () => ({
    meta: [
      { title: "Detection Intelligence — DroneRoute AI" },
      {
        name: "description",
        content:
          "Simulated aerial detection intelligence: object cards, AI overlays, confidence scores and operator review workflow.",
      },
      { property: "og:title", content: "Detection Intelligence — DroneRoute AI" },
      {
        property: "og:description",
        content: "Review simulated drone detections with original and AI-overlay imagery.",
      },
    ],
  }),
  component: DetectionsPage,
});

function DetectionsPage() {
  const all = useDetections((s) => s.detections);
  const filtered = useFilteredDetections();
  const select = useDetections((s) => s.select);
  const s = summarise(all);

  return (
    <AppShell>
      <div className="space-y-3 p-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide">Detection Intelligence</h1>
          <p className="text-[12px] text-muted-foreground">
            NAC Infrastructure Survey · Sector B/C/D ·{" "}
            <span className="font-mono uppercase tracking-widest text-warning">
              Simulated demo data
            </span>
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
          <Stat label="Frames Analyzed" value={s.framesAnalyzed} />
          <Stat label="Detections" value={s.total} tone="primary" />
          <Stat label="High Confidence" value={s.highConfidence} tone="success" />
          <Stat label="Review Required" value={s.reviewRequired} tone="warning" />
          <Stat label="Critical Alerts" value={s.critical} tone="danger" />
          <Stat label="Avg Confidence" value={`${s.avgConfidence}%`} tone="primary" />
          <Stat label="Coverage" value={`${s.coverage}%`} tone="success" />
        </div>

        <DetectionFilters />

        <section className="tac-panel p-3">
          <h3 className="tac-header mb-2">Detection Confidence</h3>
          <div className="space-y-1.5">
            {all.map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <span className="tac-value w-20 text-[10px] text-muted-foreground">{d.id}</span>
                <div className="h-2 flex-1 bg-muted">
                  <div
                    className="h-full"
                    style={{ width: `${d.confidence}%`, background: CLASS_COLORS[d.objectClass] }}
                  />
                </div>
                <span className="tac-value w-14 text-right text-[11px] text-foreground">
                  {d.confidence.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DetectionCard key={d.id} detection={d} onOpen={select} />
          ))}
          {filtered.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No detections match the filters.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
