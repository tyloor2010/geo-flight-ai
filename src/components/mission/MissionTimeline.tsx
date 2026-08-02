import { useMemo } from "react";
import { AlertTriangle, CircleDot, Crosshair, Flag } from "lucide-react";
import { useMission } from "@/store/mission-store";
import { useDetections, useLiveDetections } from "@/store/detection-store";
import { cn } from "@/lib/utils";

function clock(sec: number) {
  const base = 14 * 3600 + 20 * 60; // mission start 14:20:00 (demo clock)
  const t = base + Math.round(sec);
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

type Item = {
  key: string;
  time: string;
  title: string;
  detail?: string;
  level: "info" | "warning" | "critical" | "detection";
  detectionId?: string;
};

export function MissionTimeline({ className }: { className?: string }) {
  const events = useMission((s) => s.events);
  const live = useLiveDetections();
  const select = useDetections((s) => s.select);

  const items = useMemo<Item[]>(() => {
    const evs: Item[] = events.map((e) => ({
      key: e.id,
      time: clock(e.t),
      title: e.title.toUpperCase(),
      detail: e.message,
      level: e.level,
    }));
    const dets: Item[] = live.map((d) => ({
      key: `det-${d.id}`,
      time: d.timestamp,
      title: `${d.objectClass.toUpperCase()} DETECTED`,
      detail: `${d.id} · Sector ${d.sector} · ${d.confidence.toFixed(1)}% confidence`,
      level: "detection",
      detectionId: d.id,
    }));
    return [...evs, ...dets].sort((a, b) => a.time.localeCompare(b.time));
  }, [events, live]);

  return (
    <section className={cn("tac-panel flex min-h-0 flex-col", className)}>
      <header className="flex items-center justify-between border-b border-border px-2.5 py-1.5">
        <h3 className="tac-header text-foreground/80">Mission Timeline</h3>
        <span className="tac-value text-[10px] text-muted-foreground">{items.length} ENTRIES</span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
            Timeline populates once the simulated mission starts.
          </p>
        ) : (
          <ol className="relative space-y-2 border-l border-border pl-4">
            {items.map((it) => {
              const tone =
                it.level === "critical"
                  ? "text-danger"
                  : it.level === "warning"
                    ? "text-warning"
                    : it.level === "detection"
                      ? "text-primary"
                      : "text-success";
              const Icon =
                it.level === "critical"
                  ? AlertTriangle
                  : it.level === "warning"
                    ? Flag
                    : it.level === "detection"
                      ? Crosshair
                      : CircleDot;
              return (
                <li key={it.key} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[22px] top-[2px] flex h-3.5 w-3.5 items-center justify-center bg-background",
                      tone,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <button
                    type="button"
                    disabled={!it.detectionId}
                    onClick={() => it.detectionId && select(it.detectionId)}
                    className={cn(
                      "w-full text-left",
                      it.detectionId && "cursor-pointer hover:opacity-80",
                    )}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="tac-value text-[10px] text-muted-foreground">{it.time}</span>
                      <span className={cn("text-[11px] font-semibold tracking-wide", tone)}>
                        {it.title}
                      </span>
                    </div>
                    {it.detail && (
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {it.detail}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
