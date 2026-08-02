import { useEffect } from "react";
import { Radar } from "lucide-react";
import { useDetections, useLiveDetections } from "@/store/detection-store";
import { useMission } from "@/store/mission-store";
import { CLASS_COLORS } from "@/lib/mission/detections";
import { DetectionImage } from "./DetectionImage";
import { cn } from "@/lib/utils";

/**
 * Right-hand live intelligence feed. Detections are revealed in step with the
 * simulated flight progress — all records are synthetic demo data.
 */
export function LiveDetectionFeed({ className }: { className?: string }) {
  const simStatus = useMission((s) => s.simStatus);
  const simCoverage = useMission((s) => s.simCoverage);
  const revealUpTo = useDetections((s) => s.revealUpTo);
  const resetLive = useDetections((s) => s.resetLive);
  const select = useDetections((s) => s.select);
  const live = useLiveDetections();

  useEffect(() => {
    if (simStatus === "idle") {
      resetLive();
      return;
    }
    revealUpTo(simCoverage);
  }, [simStatus, simCoverage, revealUpTo, resetLive]);

  return (
    <section className={cn("tac-panel flex min-h-0 flex-col", className)}>
      <header className="flex items-center justify-between border-b border-border px-2.5 py-1.5">
        <h3 className="tac-header flex items-center gap-1.5 text-foreground/80">
          <Radar className={cn("h-3 w-3", simStatus === "running" && "animate-blip text-success")} />
          Live Detection Feed
        </h3>
        <span className="tac-value text-[10px] text-muted-foreground">{live.length} EVENTS</span>
      </header>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {live.length === 0 && (
          <p className="px-1 py-6 text-center text-[11px] text-muted-foreground">
            No detections yet. Launch the mission simulation to stream simulated intelligence.
          </p>
        )}
        {[...live].reverse().map((d) => (
          <button
            key={d.id}
            onClick={() => select(d.id)}
            className="animate-detect-in flex w-full items-stretch gap-2 border border-border bg-background/40 p-1.5 text-left transition-colors hover:border-primary/60"
          >
            <DetectionImage
              image={d.image}
              detections={[d]}
              overlay
              highlightId={d.id}
              className="h-12 w-16 shrink-0 border border-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 shrink-0"
                  style={{ background: CLASS_COLORS[d.objectClass] }}
                />
                <span className="tac-value text-[10px] text-muted-foreground">{d.timestamp}</span>
                <span className="ml-auto tac-value text-[11px] font-semibold text-primary">
                  {d.confidence.toFixed(1)}%
                </span>
              </div>
              <div className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-foreground">
                {d.objectClass}
              </div>
              <div className="tac-header text-[9px]">
                {d.id} · Sector {d.sector}
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="border-t border-border px-2.5 py-1.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-warning/80">
          Simulated AI detection stream
        </p>
      </footer>
    </section>
  );
}
