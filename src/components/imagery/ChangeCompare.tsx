import { useState } from "react";
import { CHANGE_KIND_COLORS, CHANGE_PAIRS, type ChangePair } from "@/lib/mission/changes";
import { Panel } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "side" | "slider" | "overlay" | "changes";

/** SIMULATED temporal change comparison between two synthetic survey passes. */
export function ChangeCompare() {
  const [pairId, setPairId] = useState(CHANGE_PAIRS[0]!.id);
  const [mode, setMode] = useState<Mode>("side");
  const [split, setSplit] = useState(50);
  const pair = CHANGE_PAIRS.find((p) => p.id === pairId)!;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {CHANGE_PAIRS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            className="h-7"
            variant={p.id === pairId ? "default" : "outline"}
            onClick={() => setPairId(p.id)}
          >
            Sector {p.sector}
          </Button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["side", "slider", "overlay", "changes"] as Mode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              className="h-7 capitalize"
              variant={m === mode ? "secondary" : "ghost"}
              onClick={() => setMode(m)}
            >
              {m === "side" ? "Side by side" : m}
            </Button>
          ))}
        </div>
      </div>

      {mode === "side" && (
        <div className="grid gap-3 md:grid-cols-2">
          <FrameCard label={`${pair.missionA.id} · ${pair.missionA.label}`} image={pair.missionA.image} />
          <FrameCard
            label={`${pair.missionB.id} · ${pair.missionB.label}`}
            image={pair.missionB.image}
            pair={pair}
            annotate
          />
        </div>
      )}

      {mode === "slider" && (
        <Panel title={`Slider Compare · Sector ${pair.sector}`}>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-border">
            <img src={pair.missionA.image} alt="Baseline survey pass" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
              <img
                src={pair.missionB.image}
                alt="Later survey pass"
                className="h-full w-full object-cover"
                style={{ width: `${100 / (split / 100)}%`, maxWidth: "none" }}
              />
            </div>
            <div className="absolute inset-y-0 w-[2px] bg-primary" style={{ left: `${split}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--primary)]"
            aria-label="Compare slider"
          />
        </Panel>
      )}

      {mode === "overlay" && (
        <Panel title={`Overlay Compare · Sector ${pair.sector}`}>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-border">
            <img src={pair.missionA.image} alt="Baseline survey pass" className="absolute inset-0 h-full w-full object-cover" />
            <img
              src={pair.missionB.image}
              alt="Later survey pass overlay"
              className="absolute inset-0 h-full w-full object-cover mix-blend-difference"
            />
            <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warning/90">
              Simulated difference composite
            </span>
          </div>
        </Panel>
      )}

      {mode === "changes" && (
        <Panel title={`Detected Changes · Sector ${pair.sector}`}>
          <FrameCard label={`${pair.missionB.id} · ${pair.missionB.label}`} image={pair.missionB.image} pair={pair} annotate />
        </Panel>
      )}

      <Panel title="Change Report" action={<span className="label-mono">Simulated analysis</span>}>
        <p className="text-[12px] text-muted-foreground">
          {pair.changes.length} changes detected between {pair.missionA.id} ({pair.missionA.label}) and{" "}
          {pair.missionB.id} ({pair.missionB.label}) over sector {pair.sector}.
        </p>
        <div className="mt-2 space-y-1.5">
          {pair.changes.map((c) => (
            <div key={c.id} className="rounded-sm border border-border/70 bg-background/40 px-2.5 py-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHANGE_KIND_COLORS[c.kind] }} />
                  {c.id} · {c.kind}
                </span>
                <span className="label-mono">{c.confidence.toFixed(1)}%</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function FrameCard({
  label,
  image,
  pair,
  annotate,
  className,
}: {
  label: string;
  image: string;
  pair?: ChangePair;
  annotate?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-sm border border-border", className)}>
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-2.5 py-1.5">
        <span className="label-mono">{label}</span>
        {annotate && <span className="label-mono text-warning">Changes highlighted</span>}
      </div>
      <div className="relative aspect-[16/9]">
        <img src={image} alt={`Survey frame ${label}`} className="h-full w-full object-cover" />
        {annotate &&
          pair?.changes.map((c) => (
            <div
              key={c.id}
              className="absolute"
              style={{
                left: `${c.box.x * 100}%`,
                top: `${c.box.y * 100}%`,
                width: `${c.box.w * 100}%`,
                height: `${c.box.h * 100}%`,
                border: `1.5px dashed ${CHANGE_KIND_COLORS[c.kind]}`,
                background: `${CHANGE_KIND_COLORS[c.kind]}1a`,
              }}
            >
              <span
                className="absolute -top-[16px] left-[-1.5px] whitespace-nowrap px-1 font-mono text-[9px] font-semibold uppercase tracking-wider"
                style={{ background: CHANGE_KIND_COLORS[c.kind], color: "#0b0f0d" }}
              >
                {c.id}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
