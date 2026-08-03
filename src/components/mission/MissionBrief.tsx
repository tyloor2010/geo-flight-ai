import { Panel, Meter } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { buildBrief } from "@/lib/mission/intel";
import { getLocation, getTemplate } from "@/lib/mission/egypt";
import { Sparkles } from "lucide-react";

/**
 * Pre-flight AI Mission Brief. All figures are derived from the SIMULATED
 * planning engine — no operational authorisation is implied.
 */
export function MissionBrief() {
  const { routes, selectedStrategy, area, locationKey, templateId, missionName, drones, config, startSimulation, simStatus } =
    useMission();
  const route = routes.find((r) => r.strategy === selectedStrategy);
  if (!route) return null;

  const drone = drones.find((d) => d.id === config.droneId);
  const brief = buildBrief({
    missionName,
    locationName: getLocation(locationKey).name,
    missionType: getTemplate(templateId).name,
    droneModel: drone?.model ?? "—",
    area,
    route,
  });

  return (
    <Panel
      title="AI Mission Brief"
      action={<span className="label-mono text-primary">Pre-Flight · Simulated</span>}
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        {brief.rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-sm border border-border/70 bg-background/40 px-2.5 py-1.5"
          >
            <span className="label-mono">{r.label}</span>
            <span
              className={
                "font-mono text-[12px] font-semibold " +
                (r.tone === "primary"
                  ? "text-primary"
                  : r.tone === "success"
                    ? "text-success"
                    : r.tone === "warning"
                      ? "text-warning"
                      : r.tone === "danger"
                        ? "text-danger"
                        : "text-foreground")
              }
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2 rounded-sm border border-primary/25 bg-primary/5 p-2.5">
        <div className="flex items-center gap-1.5 label-mono text-primary">
          <Sparkles className="h-3 w-3" /> AI Recommendation
        </div>
        <p className="text-[12px] leading-relaxed text-muted-foreground">{brief.recommendation}</p>
      </div>

      <div className="mt-3 space-y-2">
        <div className="label-mono">Route Decision Factors</div>
        {brief.decision.map((d) => (
          <Meter key={d.label} label={d.label} value={d.value} />
        ))}
      </div>

      <Button
        className="mt-3 h-8 w-full"
        disabled={simStatus === "running"}
        onClick={() => startSimulation()}
      >
        {simStatus === "running" ? "Mission In Progress" : "Approve Brief & Start Simulation"}
      </Button>
    </Panel>
  );
}
