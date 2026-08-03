import { Panel } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { useMission } from "@/store/mission-store";
import { REPLAN_STAGES } from "@/lib/mission/intel";
import { AlertTriangle, Brain, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Autonomous replanning console — triggers a SIMULATED in-flight obstacle and
 * shows how the planner adapts the route.
 */
export function ReplanPanel() {
  const {
    triggerObstacle,
    clearAdaptation,
    replanning,
    replanStage,
    originalSnapshot,
    adaptedSnapshot,
    aiDecision,
    routes,
    adaptations,
  } = useMission();

  const hasRoute = routes.length > 0;

  return (
    <Panel
      title="Autonomous Replanning"
      action={<span className="label-mono">{adaptations} adaptation(s)</span>}
    >
      <p className="text-[12px] text-muted-foreground">
        Injects a simulated obstacle onto the active corridor and lets the AI planner recompute a
        valid path in flight.
      </p>

      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          className="h-7 flex-1"
          variant="destructive"
          disabled={!hasRoute || replanning}
          onClick={() => void triggerObstacle()}
        >
          <AlertTriangle className="mr-1 h-3 w-3" /> Simulate Obstacle
        </Button>
        {aiDecision && (
          <Button size="sm" variant="outline" className="h-7" onClick={clearAdaptation}>
            Clear
          </Button>
        )}
      </div>

      {(replanning || replanStage >= 0) && (
        <div className="mt-3 space-y-1">
          {REPLAN_STAGES.map((stage, i) => {
            const done = replanStage > i || (!replanning && replanStage >= REPLAN_STAGES.length);
            const active = replanning && replanStage === i;
            return (
              <div
                key={stage}
                className={cn(
                  "flex items-center gap-2 rounded-sm border border-border/70 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider",
                  done ? "text-success" : active ? "text-primary" : "text-muted-foreground/60",
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-current opacity-50" />
                )}
                {stage}
              </div>
            );
          })}
        </div>
      )}

      {originalSnapshot && adaptedSnapshot && (
        <div className="mt-3 overflow-hidden rounded-sm border border-border">
          <table className="w-full text-[11px]">
            <thead className="bg-secondary/50">
              <tr className="label-mono">
                <th className="px-2 py-1.5 text-left">Metric</th>
                <th className="px-2 py-1.5 text-right">Original</th>
                <th className="px-2 py-1.5 text-right">Adapted</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {[
                ["Distance", `${originalSnapshot.distanceKm} km`, `${adaptedSnapshot.distanceKm} km`],
                ["Coverage", `${originalSnapshot.coverage}%`, `${adaptedSnapshot.coverage}%`],
                ["Battery Use", `${originalSnapshot.battery}%`, `${adaptedSnapshot.battery}%`],
                ["Reserve", `${originalSnapshot.reserve}%`, `${adaptedSnapshot.reserve}%`],
                ["Waypoints", originalSnapshot.waypoints, adaptedSnapshot.waypoints],
                ["Efficiency", originalSnapshot.efficiency, adaptedSnapshot.efficiency],
              ].map((row) => (
                <tr key={String(row[0])} className="border-t border-border/70">
                  <td className="px-2 py-1.5 font-sans text-muted-foreground">{row[0]}</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground line-through">{row[1]}</td>
                  <td className="px-2 py-1.5 text-right text-primary">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aiDecision && (
        <div className="mt-3 space-y-2 rounded-sm border border-primary/25 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5 label-mono text-primary">
            <Brain className="h-3 w-3" /> AI Decision Card
          </div>
          <div className="space-y-1 text-[12px] text-muted-foreground">
            <div>
              <span className="text-foreground">Event:</span> {aiDecision.event}
            </div>
            <div>
              <span className="text-foreground">Action:</span> {aiDecision.action}
            </div>
            <div>
              <span className="text-foreground">Reason:</span> {aiDecision.reason}
            </div>
            <div>
              <span className="text-foreground">Priorities:</span> {aiDecision.priorities.join(" → ")}
            </div>
            <ul className="mt-1 space-y-0.5">
              {aiDecision.results.map((r) => (
                <li key={r} className="flex items-start gap-1.5">
                  <Check className="mt-[3px] h-3 w-3 shrink-0 text-success" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="pt-1 text-[11px] italic text-muted-foreground/80">{aiDecision.summary}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}
