import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DroneCamera } from "@/components/live/DroneCamera";
import { ReplanPanel } from "@/components/mission/ReplanPanel";
import { MissionBrief } from "@/components/mission/MissionBrief";
import { MissionScorePanel } from "@/components/mission/MissionScore";

import { Meter, Panel, Stat, StatusDot } from "@/components/hud/primitives";
import { useMission } from "@/store/mission-store";
import { formatDuration, formatKm } from "@/lib/mission/planner";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Mission — DroneRoute AI" },
      { name: "description", content: "Simulated live telemetry, drone status and safety events for the active DroneRoute AI mission." },
      { property: "og:title", content: "Live Mission — DroneRoute AI" },
      { property: "og:description", content: "Simulated telemetry, progress and safety monitoring for the active mission." },
    ],
  }),
  component: Live,
});

function Live() {
  const s = useMission();
  const route = s.routes.find((r) => r.strategy === s.selectedStrategy) ?? null;
  const progress = route ? Math.min(100, (s.simDistance / route.metrics.distance) * 100) : 0;

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-0px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-h-[400px] grid-rows-2 border-r border-border">
          <div className="border-b border-border">
            <MapCanvas />
          </div>
          <DroneCamera className="h-full w-full" />
        </div>
        <div className="space-y-3 overflow-y-auto p-3">
          {s.simStatus === "idle" && <MissionBrief />}
          <ReplanPanel />

          <Panel
            title="Drone Status"
            action={<StatusDot tone={s.simStatus === "running" ? "warning" : "success"} label={s.simStatus} pulse={s.simStatus === "running"} />}
          >
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="GPS" value="LOCKED" tone="success" />
              <Stat label="Connection" value="STABLE" tone="success" />
              <Stat label="Battery" value={`${Math.round(s.simBattery)}%`} tone={s.simBattery < 30 ? "danger" : "success"} />
              <Stat label="Altitude" value={`${route?.waypoints[1]?.altitude ?? s.config.altitude} m`} />
              <Stat label="Speed" value={`${s.config.speed.toFixed(1)} m/s`} />
              <Stat label="Heading" value={s.simHeading} />
              <Stat label="Waypoint" value={route?.waypoints[s.simWaypoint]?.id ?? "—"} />
              <Stat label="Mission" value={s.simStatus.toUpperCase()} tone="primary" />
            </div>
          </Panel>
          {route ? (
            <Panel title="Mission Progress">
              <Meter label="Progress" value={progress} />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Stat label="Distance" value={`${(s.simDistance / 1000).toFixed(2)} km`} sub={`of ${formatKm(route.metrics.distance)}`} />
                <Stat label="Elapsed" value={formatDuration(s.simElapsed)} />
                <Stat label="Coverage" value={`${(s.simCoverage * 100).toFixed(1)}%`} tone="primary" />
                <Stat label="ETA" value={formatDuration(Math.max(0, route.metrics.duration - s.simElapsed))} />
              </div>
            </Panel>
          ) : (
            <Panel title="Mission Progress">
              <p className="text-[12px] text-muted-foreground">
                No mission loaded. Generate a mission in the planner to stream simulated telemetry.
              </p>
            </Panel>
          )}
          <Panel title="Event Log">
            {s.events.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No simulated events recorded.</p>
            ) : (
              <div className="space-y-1.5">
                {[...s.events].reverse().map((e) => (
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
      {s.simStatus === "complete" && (
        <div className="p-3">
          <MissionScorePanel />
        </div>
      )}
    </AppShell>
  );
}
