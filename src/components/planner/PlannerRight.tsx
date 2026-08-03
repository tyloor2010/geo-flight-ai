import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  CircleCheck,
  Info,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Brain,
  GitCompare,
} from "lucide-react";
import { Meter, Panel, ScoreRing, Stat, StatusDot } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OPTIMIZATION_STEPS, useMission } from "@/store/mission-store";
import { formatDuration, formatKm } from "@/lib/mission/planner";
import { explainRoute } from "@/lib/mission/comparison";
import { cn } from "@/lib/utils";

export function PlannerRight() {
  const {
    planStatus,
    planStep,
    planError,
    routes,
    selectedStrategy,
    selectStrategy,
    selectedWaypoint,
    simStatus,
    simElapsed,
    simDistance,
    simBattery,
    simCoverage,
    simHeading,
    simWaypoint,
    events,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    abortSimulation,
    resetSimulation,
    config,
    lastReportId,
    zones,
    manual,
    comparison,
    settings,
    updateSettings,
    applySuggestion,
    generate,
  } = useMission();
  const [whyOpen, setWhyOpen] = useState(false);
  const route = routes.find((r) => r.strategy === selectedStrategy) ?? null;

  if (planStatus === "optimizing") {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
        <Panel title="AI Route Engine">
          <div className="space-y-1.5">
            {OPTIMIZATION_STEPS.map((step, i) => (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 font-mono text-[11.5px] transition-all",
                  i < planStep && "text-success",
                  i === planStep && "bg-primary/10 text-primary",
                  i > planStep && "text-muted-foreground/45",
                )}
              >
                {i < planStep ? (
                  <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                ) : i === planStep ? (
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                )}
                {step}
              </div>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((planStep + 1) / OPTIMIZATION_STEPS.length) * 100}%` }}
            />
          </div>
        </Panel>
      </div>
    );
  }

  if (planStatus === "error" && planError) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
        <Panel title="Mission Cannot Be Generated">
          <div className="flex items-start gap-2 rounded-sm border border-danger/40 bg-danger/10 p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-[12px] leading-relaxed text-foreground">{planError.reason}</p>
          </div>
          <div className="label-mono mt-3">Suggested actions — click to apply</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {planError.suggestions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                className="h-7 border-border text-[11px] font-normal"
                onClick={() => applySuggestion(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => void generate()}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry Generation
          </Button>

        </Panel>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
        <Panel title="Mission Intelligence">
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Sparkles className="h-6 w-6 text-primary/70" />
            <p className="max-w-[220px] text-[12px] text-muted-foreground">
              Define a survey area and configure the aircraft, then run{" "}
              <span className="text-foreground">Generate AI Mission</span> to produce an optimised
              coverage route.
            </p>
          </div>
        </Panel>
        <Panel title="Planning Checklist">
          <ul className="space-y-1.5 text-[12px] text-muted-foreground">
            {["Survey area geometry", "Restricted airspace", "Drone selection", "Flight parameters", "Battery reserve policy"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-primary" /> {t}
                </li>
              ),
            )}
          </ul>
        </Panel>
      </div>
    );
  }

  const m = route.metrics;
  const running = simStatus === "running" || simStatus === "paused";
  const progress = m.distance ? Math.min(100, (simDistance / m.distance) * 100) : 0;
  const wp = route.waypoints[selectedWaypoint ?? -1];

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <Panel
        title="Mission Summary"
        action={
          <StatusDot
            tone={simStatus === "complete" ? "success" : running ? "warning" : "success"}
            label={
              simStatus === "complete"
                ? "Complete"
                : simStatus === "running"
                  ? "In Flight"
                  : simStatus === "paused"
                    ? "Holding"
                    : "Ready"
            }
            pulse={simStatus === "running"}
          />
        }
      >
        <div className="grid grid-cols-2 gap-1.5">
          <Stat label="Route Distance" value={formatKm(m.distance)} />
          <Stat label="Flight Time" value={formatDuration(m.duration)} />
          <Stat label="Battery Usage" value={`${Math.round(m.batteryUsage)}%`} tone="warning" />
          <Stat label="Remaining" value={`${Math.round(m.batteryRemaining)}%`} tone="success" />
          <Stat label="Coverage" value={`${(m.coverage * 100).toFixed(1)}%`} tone="primary" />
          <Stat label="Safety Margin" value={`${Math.round(m.safetyMargin)}%`} />
          <Stat label="Waypoints" value={m.waypointCount} />
          <Stat label="Est. Images" value={m.images} />
          <Stat
            label="Battery Sorties"
            value={m.sorties > 1 ? `${m.sorties} × swap` : "1 (single)"}
            tone={m.sorties > 1 ? "warning" : "success"}
          />
        </div>
        <div className="mt-2 flex items-center justify-between rounded-sm border border-border/70 bg-background/40 px-3 py-2">
          <span className="label-mono">Risk Level</span>
          <Badge
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              m.risk === "low" && "bg-success/15 text-success",
              m.risk === "moderate" && "bg-warning/15 text-warning",
              m.risk === "high" && "bg-danger/15 text-danger",
            )}
          >
            {m.risk}
          </Badge>
        </div>
        <div className="mt-1.5 flex items-center justify-between rounded-sm border border-border/70 bg-background/40 px-3 py-2">
          <span className="label-mono">Return-to-Home</span>
          <span
            className={cn(
              "font-mono text-[11px]",
              m.rthFeasible ? "text-success" : "text-warning",
            )}
          >
            {m.rthFeasible ? "✓ Safe" : "⚠ Battery Margin Low"} · {formatKm(m.rthDistance)}
          </span>
        </div>
      </Panel>

      <Panel
        title="AI Mission Score"
        action={
          <button className="label-mono hover:text-primary" onClick={() => setWhyOpen(true)}>
            Why this score?
          </button>
        }
      >
        <div className="flex items-center gap-4">
          <ScoreRing score={route.score.overall} />
          <div className="flex-1 space-y-2">
            <Meter label="Route Efficiency" value={route.score.routeEfficiency} />
            <Meter label="Battery Efficiency" value={route.score.batteryEfficiency} tone="warning" />
            <Meter label="Coverage" value={route.score.coverage} tone="success" />
            <Meter label="Safety" value={route.score.safety} tone="primary" />
          </div>
        </div>
      </Panel>

      <Panel
        title="Why did the AI choose this route?"
        action={<Brain className="h-3.5 w-3.5 text-primary" />}
      >
        <ol className="space-y-1.5">
          {explainRoute(route, config, zones, comparison).map((line, i) => (
            <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <span className="label-mono shrink-0 text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </Panel>

      {manual && comparison && (
        <Panel
          title="Manual vs AI Optimized"
          action={
            <button
              className="label-mono hover:text-primary"
              onClick={() => updateSettings({ showComparison: !settings.showComparison })}
            >
              <GitCompare className="mr-1 inline h-3 w-3" />
              {settings.showComparison ? "Hide on map" : "Show on map"}
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-sm border border-border/70 bg-background/40 px-2 py-2">
              <div className="label-mono">Manual</div>
              <div className="mt-1 font-mono text-[12px] text-muted-foreground">
                {formatKm(manual.distance)}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {formatDuration(manual.duration)}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {(manual.coverage * 100).toFixed(1)}% cov
              </div>
            </div>
            <div className="rounded-sm border border-primary/50 bg-primary/10 px-2 py-2">
              <div className="label-mono text-primary">AI Optimized</div>
              <div className="mt-1 font-mono text-[12px] text-foreground">{formatKm(m.distance)}</div>
              <div className="font-mono text-[11px] text-foreground">{formatDuration(m.duration)}</div>
              <div className="font-mono text-[11px] text-foreground">
                {(m.coverage * 100).toFixed(1)}% cov
              </div>
            </div>
            <div className="rounded-sm border border-success/40 bg-success/10 px-2 py-2">
              <div className="label-mono text-success">Improvement</div>
              <div className="mt-1 font-mono text-[12px] text-success">
                −{comparison.distanceSaved}%
              </div>
              <div className="font-mono text-[11px] text-success">−{comparison.timeSaved}% time</div>
              <div className="font-mono text-[11px] text-success">
                +{comparison.coverageGain} pts
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">
            Baseline is a conventional manual lawnmower pattern with a full boundary lap and no
            zone awareness ({comparison.conflictsAvoided} simulated zone conflicts avoided by the AI
            route). Battery saving: {comparison.batterySaved}%.
          </p>
        </Panel>
      )}

      <Panel title="Route Alternatives">
        <div className="space-y-1.5">
          {routes.map((r) => (
            <button
              key={r.strategy}
              onClick={() => selectStrategy(r.strategy)}
              disabled={running}
              className={cn(
                "w-full rounded-sm border px-2.5 py-2 text-left transition-colors disabled:opacity-50",
                r.strategy === selectedStrategy
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 hover:border-border hover:bg-secondary/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-foreground">{r.label}</span>
                <span className="font-mono text-[12px] tabular-nums text-primary">
                  {r.score.overall}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
                {r.description}
              </p>
              <div className="label-mono mt-1">
                {formatKm(r.metrics.distance)} · {(r.metrics.coverage * 100).toFixed(1)}% cov ·{" "}
                {Math.round(r.metrics.batteryUsage)}% batt
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Mission Simulation">
        <div className="flex gap-1.5">
          {simStatus === "idle" || simStatus === "complete" || simStatus === "aborted" ? (
            <Button size="sm" className="h-8 flex-1" onClick={startSimulation}>
              <Play className="mr-1 h-3.5 w-3.5" />
              {simStatus === "idle" ? "Start Simulation" : "Replay Mission"}
            </Button>
          ) : simStatus === "running" ? (
            <Button size="sm" variant="outline" className="h-8 flex-1" onClick={pauseSimulation}>
              <Pause className="mr-1 h-3.5 w-3.5" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="h-8 flex-1" onClick={resumeSimulation}>
              <Play className="mr-1 h-3.5 w-3.5" /> Resume
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={abortSimulation}
            disabled={!running}
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={resetSimulation}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {simStatus !== "idle" && (
          <div className="mt-3 space-y-2">
            <Meter label={`Progress · ${simStatus.toUpperCase()}`} value={progress} />
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="Distance" value={`${(simDistance / 1000).toFixed(2)} km`} sub={`of ${formatKm(m.distance)}`} />
              <Stat
                label="Battery"
                value={`${Math.round(simBattery)}%`}
                tone={simBattery < config.rthThreshold ? "danger" : simBattery < 40 ? "warning" : "success"}
              />
              <Stat label="Coverage" value={`${(simCoverage * 100).toFixed(1)}%`} tone="primary" />
              <Stat label="Elapsed" value={formatDuration(simElapsed)} />
              <Stat label="Heading" value={simHeading} />
              <Stat label="Waypoint" value={route.waypoints[simWaypoint]?.id ?? "—"} />
            </div>
          </div>
        )}

        {simStatus === "complete" && (
          <div className="mt-3 animate-rise-in rounded-sm border border-success/40 bg-success/10 p-3 text-center">
            <div className="font-display text-[18px] font-semibold uppercase tracking-widest text-success">
              Mission Complete
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {m.waypointCount}/{m.waypointCount} waypoints executed · {m.images} images captured
            </p>
            <div className="mt-2 flex gap-1.5">
              <Button size="sm" className="h-7 flex-1" asChild>
                <Link to="/report/$missionId" params={{ missionId: lastReportId ?? "latest" }}>
                  View Report
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="h-7 flex-1" onClick={startSimulation}>
                Replay
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {wp && (
        <Panel title={`Waypoint ${wp.id}`}>
          <div className="grid grid-cols-2 gap-1.5">
            <Stat label="Latitude" value={wp.position.lat.toFixed(5)} />
            <Stat label="Longitude" value={wp.position.lng.toFixed(5)} />
            <Stat label="Altitude" value={`${wp.altitude} m`} />
            <Stat label="Battery" value={`${Math.round(wp.battery)}%`} />
            <Stat label="ETA" value={formatDuration(wp.etaSeconds)} />
            <Stat label="Distance" value={formatKm(wp.distanceFromStart)} />
          </div>
          <div className="mt-1.5 rounded-sm border border-border/70 bg-background/40 px-3 py-2">
            <div className="label-mono">Action</div>
            <div className="text-[12px] text-foreground">{wp.action}</div>
          </div>
        </Panel>
      )}

      <Panel title="Safety & Event Log">
        {events.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground">
            No events. Safety monitoring is simulated and does not reflect real airspace conditions.
          </p>
        ) : (
          <div className="space-y-1.5">
            {[...events].reverse().map((e) => (
              <div
                key={e.id}
                className={cn(
                  "rounded-sm border px-2.5 py-1.5",
                  e.level === "info" && "border-border/70 bg-background/40",
                  e.level === "warning" && "border-warning/40 bg-warning/10",
                  e.level === "critical" && "border-danger/40 bg-danger/10",
                )}
              >
                <div className="flex items-center gap-1.5">
                  {e.level === "info" ? (
                    <Info className="h-3 w-3 text-primary" />
                  ) : (
                    <AlertTriangle
                      className={cn("h-3 w-3", e.level === "warning" ? "text-warning" : "text-danger")}
                    />
                  )}
                  <span className="text-[12px] font-medium text-foreground">{e.title}</span>
                  <span className="label-mono ml-auto">T+{Math.round(e.t)}s</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{e.message}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Dialog open={whyOpen} onOpenChange={setWhyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Why this score?</DialogTitle>
            <DialogDescription>
              Deterministic scoring from the mission optimisation engine.
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            The route was optimised to reduce unnecessary travel while maintaining the required
            survey coverage and battery reserve. Line spacing is derived from altitude
            ({config.altitude} m), camera field of view ({config.fov}°) and side overlap
            ({Math.round(config.sideOverlap * 100)}%). Restricted airspace is inflated by a safety
            buffer and removed from the coverage grid, then transits are re-routed around the
            remaining obstruction.
          </p>
          <div className="space-y-2 rounded-sm border border-border p-3">
            <Meter label="Route Efficiency (28%)" value={route.score.routeEfficiency} />
            <Meter label="Battery Efficiency (22%)" value={route.score.batteryEfficiency} tone="warning" />
            <Meter label="Coverage (28%)" value={route.score.coverage} tone="success" />
            <Meter label="Safety (22%)" value={route.score.safety} tone="primary" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
