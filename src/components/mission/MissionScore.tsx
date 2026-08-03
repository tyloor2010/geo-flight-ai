import { Panel, ScoreRing, Meter } from "@/components/hud/primitives";
import { useMission } from "@/store/mission-store";
import { useDetections } from "@/store/detection-store";
import { buildRecommendations, computeMissionScore } from "@/lib/mission/intel";
import { polygonAreaM2 } from "@/lib/mission/geo";
import { Lightbulb } from "lucide-react";

/** Post-mission AI scoring + recommendations for the SIMULATED mission. */
export function MissionScorePanel() {
  const { routes, selectedStrategy, simBattery, simCoverage, adaptations, events, area } = useMission();
  const detections = useDetections((s) => s.detections);
  const liveIds = useDetections((s) => s.liveIds);
  const route = routes.find((r) => r.strategy === selectedStrategy);
  if (!route) return null;

  const found = detections.filter((d) => liveIds.includes(d.id));
  const avgConfidence = found.length ? found.reduce((a, d) => a + d.confidence, 0) / found.length : 0;
  const criticalAlerts = events.filter((e) => e.level === "critical").length;

  const score = computeMissionScore({
    route,
    batteryRemaining: simBattery,
    coverage: simCoverage || route.metrics.coverage,
    detections: found.length,
    avgConfidence,
    criticalAlerts,
    adaptations,
  });

  const recs = buildRecommendations({
    areaKm2: polygonAreaM2(area) / 1e6,
    batteryRemaining: simBattery,
    coverage: simCoverage || route.metrics.coverage,
    sorties: route.metrics.sorties,
    detections: found.map((d) => ({ sector: d.sector, confidence: d.confidence })),
    adaptations,
    criticalAlerts,
  });

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="AI Mission Score" action={<span className="label-mono">Simulated</span>}>
        <div className="flex items-center gap-4">
          <ScoreRing score={score.overall} />
          <div className="flex-1 space-y-2">
            {score.breakdown.map((b) => (
              <Meter key={b.label} label={b.label} value={b.value} />
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="AI Recommendations">
        <ul className="space-y-2">
          {recs.map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 rounded-sm border border-border/70 bg-background/40 px-2.5 py-2 text-[12px] text-muted-foreground"
            >
              <Lightbulb className="mt-[2px] h-3.5 w-3.5 shrink-0 text-warning" />
              {r}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
