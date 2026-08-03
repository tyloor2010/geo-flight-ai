import { useState } from "react";
import { Panel, Meter, StatusDot } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { FLEET_COLORS, useFleet } from "@/store/fleet-store";
import { Play, RotateCcw, Square } from "lucide-react";

/** SIMULATED multi-drone sector operations. */
export function FleetOps() {
  const { area, drones, config } = useMission();
  const { units, active, message, launch, pause, resume, reset } = useFleet();
  const [launched, setLaunched] = useState(false);

  const complete = units.filter((u) => u.status === "complete").length;
  const avgCoverage = units.length ? units.reduce((a, u) => a + u.coverage, 0) / units.length : 0;

  return (
    <Panel
      title="Fleet Command"
      action={<StatusDot tone={active ? "warning" : units.length ? "success" : "muted"} label={active ? "in flight" : units.length ? "standby" : "idle"} pulse={active} />}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-7"
          onClick={() => {
            launch(area, drones, config);
            setLaunched(true);
          }}
        >
          <Play className="mr-1 h-3 w-3" /> Launch Fleet
        </Button>
        {launched && (
          <>
            <Button size="sm" variant="outline" className="h-7" onClick={() => (active ? pause() : resume())}>
              {active ? <Square className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
              {active ? "Hold" : "Resume"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() => {
                reset();
                setLaunched(false);
              }}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          </>
        )}
      </div>

      {message && <p className="mt-2 text-[12px] text-muted-foreground">{message}</p>}

      {units.length > 0 && (
        <>
          <div className="mt-3">
            <Meter label={`Fleet Coverage · ${complete}/${units.length} sectors complete`} value={avgCoverage * 100} />
          </div>
          <div className="mt-3 space-y-2">
            {units.map((u, i) => (
              <div key={u.id} className="rounded-sm border border-border/70 bg-background/40 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] text-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: FLEET_COLORS[i % FLEET_COLORS.length] }}
                    />
                    {u.model}
                  </span>
                  <span className="label-mono">
                    {u.sector.label} · {u.sector.areaKm2} km²
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <Meter label="Progress" value={u.coverage * 100} />
                  <Meter
                    label="Battery"
                    value={u.battery}
                    tone={u.battery > 40 ? "success" : u.battery > 20 ? "warning" : "danger"}
                  />
                </div>
                <div className="mt-1 label-mono">
                  {u.status.toUpperCase()} · share {u.sector.share}% · est {u.sector.estMinutes} min
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
