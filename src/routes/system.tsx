import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat } from "@/components/hud/primitives";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Health — DroneRoute AI" },
      {
        name: "description",
        content:
          "Subsystem health readout for the DroneRoute AI simulation environment: AI engine, map engine, telemetry and database.",
      },
      { property: "og:title", content: "System Health — DroneRoute AI" },
      { property: "og:description", content: "Simulation subsystem status and diagnostics." },
    ],
  }),
  component: SystemPage,
});

const SUBSYSTEMS = [
  { name: "AI Route Engine", status: "ONLINE", latency: "34 ms", note: "Coverage planner nominal" },
  { name: "Detection Model (Simulated)", status: "ONLINE", latency: "58 ms", note: "Demo inference layer" },
  { name: "Map Engine", status: "ONLINE", latency: "22 ms", note: "Tile services reachable" },
  { name: "Telemetry Bus", status: "READY", latency: "12 ms", note: "Simulated stream" },
  { name: "Mission Database", status: "ONLINE", latency: "9 ms", note: "Local archive" },
  { name: "Flight Hardware Link", status: "NOT CONNECTED", latency: "—", note: "No live aircraft attached" },
];

function SystemPage() {
  return (
    <AppShell>
      <div className="space-y-3 p-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide">System Health</h1>
          <p className="text-[12px] text-muted-foreground">
            Tactical Simulation Environment · Mode:{" "}
            <span className="font-mono uppercase tracking-widest text-warning">Simulation</span>
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Mission ID" value="NAC-ISR-026" />
          <Stat label="Operation" value="Infrastructure Survey" />
          <Stat label="Zone" value="NAC / Demo" tone="primary" />
          <Stat label="Data" value="Synced" tone="success" />
        </div>

        <Panel title="Subsystems">
          <div className="space-y-1">
            {SUBSYSTEMS.map((s) => (
              <div
                key={s.name}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-border/70 bg-background/40 px-2.5 py-2"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    s.status === "ONLINE"
                      ? "bg-success"
                      : s.status === "READY"
                        ? "bg-info"
                        : "bg-muted-foreground"
                  }`}
                />
                <span className="text-[12px] text-foreground">{s.name}</span>
                <span className="tac-value ml-auto text-[11px] text-muted-foreground">
                  {s.latency}
                </span>
                <span
                  className={`tac-value w-32 text-right text-[11px] ${
                    s.status === "NOT CONNECTED" ? "text-muted-foreground" : "text-success"
                  }`}
                >
                  {s.status}
                </span>
                <span className="w-full text-[11px] text-muted-foreground">{s.note}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
