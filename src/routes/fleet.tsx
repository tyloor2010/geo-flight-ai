import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat, StatusDot } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { toast } from "sonner";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Drone Fleet — DroneRoute AI" },
      { name: "description", content: "Fleet readiness, battery state, GPS status and health for every survey aircraft." },
      { property: "og:title", content: "Drone Fleet — DroneRoute AI" },
      { property: "og:description", content: "Aircraft readiness and health across the DroneRoute AI fleet." },
    ],
  }),
  component: Fleet,
});

function Fleet() {
  const { drones, config, selectDrone } = useMission();
  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Drone Fleet</h1>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {drones.map((d) => (
            <Panel
              key={d.id}
              title={d.model}
              action={
                <StatusDot
                  tone={d.status === "ready" ? "success" : d.status === "charging" ? "warning" : "danger"}
                  label={d.status}
                />
              }
            >
              <div className="grid grid-cols-2 gap-1.5">
                <Stat label="Battery" value={`${d.battery}%`} tone={d.battery > 60 ? "success" : "warning"} />
                <Stat label="GPS" value={d.gps.toUpperCase()} />
                <Stat label="Health" value={d.health} />
                <Stat label="Flight Time" value={`${d.maxFlightTime} min`} />
                <Stat label="Cruise" value={`${d.cruiseSpeed} m/s`} />
                <Stat label="Payload" value={d.payload} />
              </div>
              <Button
                size="sm"
                className="mt-2 h-7 w-full"
                variant={config.droneId === d.id ? "default" : "outline"}
                onClick={() => {
                  selectDrone(d.id);
                  toast.success(`${d.model} assigned to mission`);
                }}
              >
                {config.droneId === d.id ? "Assigned to Mission" : "Select for Mission"}
              </Button>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
