import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat, StatusDot } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { MapCanvas } from "@/components/map/MapCanvas";

export const Route = createFileRoute("/control")({
  head: () => ({
    meta: [
      { title: "Mission Control — DroneRoute AI" },
      { name: "description", content: "Operational overview of drone fleet readiness, active mission state and recent survey missions." },
      { property: "og:title", content: "Mission Control — DroneRoute AI" },
      { property: "og:description", content: "Fleet readiness, mission state and survey history at a glance." },
    ],
  }),
  component: Control,
});

function Control() {
  const { history, drones, simStatus, missionName } = useMission();
  const totalKm = history.reduce((a, m) => a + m.distanceKm, 0);
  const avgEff = Math.round(history.reduce((a, m) => a + m.efficiency, 0) / (history.length || 1));

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wide">Mission Control</h1>
            <p className="text-[13px] text-muted-foreground">{missionName}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusDot tone={simStatus === "running" ? "warning" : "success"} label={`Sim ${simStatus}`} pulse={simStatus === "running"} />
            <Button size="sm" asChild><Link to="/planner">Open Mission Planner</Link></Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Missions" value={history.length} />
          <Stat label="Total Distance" value={`${totalKm.toFixed(1)} km`} tone="primary" />
          <Stat label="Average Efficiency" value={`${avgEff}/100`} tone="success" />
          <Stat label="Fleet Ready" value={`${drones.filter((d) => d.status === "ready").length}/${drones.length}`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Panel title="Operational Map" className="overflow-hidden">
            <div className="h-[420px] overflow-hidden rounded-sm">
              <MapCanvas />
            </div>
          </Panel>
          <Panel title="Recent Missions">
            <div className="space-y-1.5">
              {history.slice(0, 6).map((m) => (
                <Link
                  key={m.id}
                  to="/report/$missionId"
                  params={{ missionId: m.id }}
                  className="block rounded-sm border border-border/70 bg-background/40 px-2.5 py-2 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground">{m.name}</span>
                    <span className="font-mono text-primary">{m.efficiency}</span>
                  </div>
                  <div className="label-mono mt-0.5">{m.location}</div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
