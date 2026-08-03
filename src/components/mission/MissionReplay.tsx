import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, Stat } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { projector } from "@/lib/mission/geo";
import { formatDuration } from "@/lib/mission/planner";
import type { MissionRecord } from "@/lib/mission/types";
import { Pause, Play, RotateCcw } from "lucide-react";

const SPEEDS = [1, 2, 4, 8];

/** Replays a completed SIMULATED mission from its recorded telemetry. */
export function MissionReplay() {
  const history = useMission((s) => s.history);
  const [recordId, setRecordId] = useState(history[0]?.id ?? "");
  const record = history.find((r) => r.id === recordId) ?? history[0];
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = record?.durationSec ?? 0;

  useEffect(() => {
    if (raf.current) clearInterval(raf.current);
    if (!playing) return;
    raf.current = setInterval(() => {
      setT((prev) => {
        const next = prev + 0.25 * speed;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
    }, 100);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [playing, speed, duration]);

  useEffect(() => {
    setT(0);
    setPlaying(false);
  }, [recordId]);

  const geometry = useMemo(() => (record ? projectRecord(record) : null), [record]);
  const frac = duration ? Math.min(1, t / duration) : 0;
  const idx = geometry ? Math.min(geometry.path.length - 1, Math.floor(frac * (geometry.path.length - 1))) : 0;
  const dronePt = geometry?.path[idx];

  const sample = record?.telemetry.reduce(
    (acc, s) => (s.t <= t ? s : acc),
    record?.telemetry[0],
  );
  const shownEvents = record?.events.filter((e) => e.t <= t) ?? [];

  if (!record || !geometry) {
    return (
      <Panel title="Mission Replay">
        <p className="text-[12px] text-muted-foreground">No completed missions available to replay.</p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel
        title={`Replay · ${record.name}`}
        action={<span className="label-mono">{record.date} · simulated</span>}
      >
        <div className="relative overflow-hidden rounded-sm border border-border bg-background/60">
          <svg viewBox="0 0 600 360" className="h-auto w-full">
            <defs>
              <pattern id="replay-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0H0V30" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="600" height="360" fill="url(#replay-grid)" />
            <polygon
              points={geometry.area.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="var(--primary)"
              fillOpacity={0.06}
              stroke="var(--primary)"
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            <polyline
              points={geometry.path.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.35}
              strokeWidth={1.2}
            />
            <polyline
              points={geometry.path.slice(0, idx + 1).map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2}
            />
            {dronePt && (
              <>
                <circle cx={dronePt.x} cy={dronePt.y} r={9} fill="var(--primary)" fillOpacity={0.18} />
                <circle cx={dronePt.x} cy={dronePt.y} r={4} fill="var(--primary)" />
              </>
            )}
          </svg>
          <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warning/90">
            Simulated replay
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" className="h-7" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => {
              setT(0);
              setPlaying(false);
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <input
            type="range"
            min={0}
            max={duration}
            value={t}
            onChange={(e) => setT(Number(e.target.value))}
            className="flex-1 accent-[var(--primary)]"
            aria-label="Replay position"
          />
          <span className="label-mono w-24 text-right">
            {formatDuration(Math.round(t))} / {formatDuration(duration)}
          </span>
          {SPEEDS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === speed ? "secondary" : "ghost"}
              className="h-7 px-2 font-mono text-[11px]"
              onClick={() => setSpeed(s)}
            >
              {s}×
            </Button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {history.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant={r.id === record.id ? "default" : "outline"}
              className="h-7"
              onClick={() => setRecordId(r.id)}
            >
              {r.id}
            </Button>
          ))}
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel title="Replay Telemetry">
          <div className="grid grid-cols-2 gap-1.5">
            <Stat label="Battery" value={`${sample?.battery ?? record.telemetry[0]?.battery ?? 0}%`} />
            <Stat label="Altitude" value={`${sample?.altitude ?? 0} m`} />
            <Stat label="Speed" value={`${sample?.speed ?? 0} m/s`} />
            <Stat label="Coverage" value={`${sample?.coverage ?? 0}%`} tone="primary" />
            <Stat label="Distance" value={`${sample?.distance ?? 0} km`} />
            <Stat label="Progress" value={`${Math.round(frac * 100)}%`} />
          </div>
        </Panel>
        <Panel title="Events Up To Cursor">
          {shownEvents.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No events yet at this point of the replay.</p>
          ) : (
            <div className="space-y-1.5">
              {[...shownEvents].reverse().map((e) => (
                <div key={e.id} className="rounded-sm border border-border/70 bg-background/40 px-2.5 py-1.5">
                  <div className="flex items-center justify-between text-[12px] text-foreground">
                    {e.title}
                    <span className="label-mono">T+{Math.round(e.t)}s</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{e.message}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function projectRecord(record: MissionRecord) {
  const pts = record.path.length > 1 ? record.path : record.area;
  const origin = pts[0]!;
  const proj = projector(origin);
  const all = [...record.area, ...pts].map(proj.to);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const scale = Math.min(560 / Math.max(1, maxX - minX), 320 / Math.max(1, maxY - minY));
  const map = (p: { lat: number; lng: number }) => {
    const q = proj.to(p);
    return {
      x: 20 + (q.x - minX) * scale,
      y: 340 - (q.y - minY) * scale,
    };
  };
  return { area: record.area.map(map), path: pts.map(map) };
}
