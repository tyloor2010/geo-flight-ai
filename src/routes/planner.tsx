import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Play, Rocket, Satellite, Signal, BatteryFull, Presentation } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MapCanvas } from "@/components/map/MapCanvas";
import { PlannerLeft } from "@/components/planner/PlannerLeft";
import { PlannerRight } from "@/components/planner/PlannerRight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusDot } from "@/components/hud/primitives";
import { useMission } from "@/store/mission-store";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  validateSearch: (s: Record<string, unknown>): { demo?: boolean } =>
    s["demo"] === true || s["demo"] === "true" ? { demo: true } : {},
  head: () => ({
    meta: [
      { title: "Mission Planner — DroneRoute AI" },
      { name: "description", content: "Draw a survey area, configure the aircraft and generate an AI-optimized drone coverage mission." },
      { property: "og:title", content: "Mission Planner — DroneRoute AI" },
      { property: "og:description", content: "AI coverage route generation, restricted-airspace avoidance and mission simulation." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { demo } = Route.useSearch();
  const {
    missionName,
    setMissionName,
    area,
    generate,
    planStatus,
    simBattery,
    simStatus,
    config,
    runDemoSequence,
    settings,
    updateSettings,
  } = useMission();

  useEffect(() => {
    if (demo) void runDemoSequence();
  }, [demo, runDemoSequence]);

  const battery = simStatus === "idle" ? config.startBattery : simBattery;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-0px)] flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-panel/60 px-3 py-2 backdrop-blur">
          <Input
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            className="h-8 w-[280px] border-border bg-background/60 text-[13px]"
          />
          <div className="flex items-center gap-4">
            <StatusDot tone="success" label="Link Stable" pulse />
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Satellite className="h-3.5 w-3.5 text-success" /> GPS Locked
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <BatteryFull className="h-3.5 w-3.5 text-success" /> {Math.round(battery)}%
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Signal className="h-3.5 w-3.5 text-primary" /> Simulation Layer
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => updateSettings({ presentationMode: !settings.presentationMode })}
            >
              <Presentation className="mr-1 h-3.5 w-3.5" /> Presentation
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => void runDemoSequence()}>
              <Play className="mr-1 h-3.5 w-3.5" /> ITC Demo Mode
            </Button>
            <Button
              size="sm"
              className="h-8"
              disabled={planStatus === "optimizing"}
              onClick={() => {
                if (area.length < 3) {
                  toast.error("No survey area selected", {
                    description: "Draw a polygon or rectangle on the map first.",
                  });
                  return;
                }
                void generate();
              }}
            >
              <Rocket className="mr-1 h-3.5 w-3.5" />
              {planStatus === "optimizing" ? "Optimizing…" : "Generate AI Mission"}
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
          <div className="hidden min-h-0 border-r border-border lg:block">
            {!settings.presentationMode && <PlannerLeft />}
          </div>
          <div className="relative min-h-[420px]">
            <MapCanvas />
          </div>
          <div className="min-h-0 border-l border-border">
            <PlannerRight />
          </div>
        </div>
        <div className="border-t border-border px-3 py-1.5 text-[10.5px] text-muted-foreground">
          Deterministic simulation prototype · no live aircraft control ·{" "}
          <Link to="/about" className="text-primary hover:underline">
            about the technology
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
