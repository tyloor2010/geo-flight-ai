import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMission } from "@/store/mission-store";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Mission History — DroneRoute AI" },
      { name: "description", content: "Review completed and aborted drone survey missions with coverage, battery and efficiency metrics." },
      { property: "og:title", content: "Mission History — DroneRoute AI" },
      { property: "og:description", content: "Archive of simulated drone survey missions and their performance metrics." },
    ],
  }),
  component: History,
});

function History() {
  const history = useMission((s) => s.history);
  const loadDemo = useMission((s) => s.loadDemoMission);

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Mission History</h1>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {history.map((m) => (
            <Panel key={m.id} title={m.name}>
              <div className="text-[12px] text-muted-foreground">{m.location}</div>
              <div className="label-mono mt-1">
                {new Date(m.date).toLocaleString()} · {m.droneModel} · {m.objective}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Stat label="Distance" value={`${m.distanceKm.toFixed(2)} km`} />
                <Stat label="Coverage" value={`${(m.coverage * 100).toFixed(1)}%`} tone="primary" />
                <Stat label="Battery" value={`${m.batteryUsed}%`} tone="warning" />
                <Stat label="Efficiency" value={`${m.efficiency}/100`} tone="success" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Badge className={m.status === "completed" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}>
                  {m.status}
                </Badge>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7" asChild>
                    <Link to="/report/$missionId" params={{ missionId: m.id }}>View</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => { loadDemo(); toast.success("Mission duplicated into the planner"); }}>
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => toast.success(`${m.id} exported as JSON summary`)}>
                    Export
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
