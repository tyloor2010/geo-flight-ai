import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { DEMO_MISSIONS } from "@/lib/mission/demo";
import type { MissionEvent } from "@/lib/mission/types";

export const Route = createFileRoute("/report/$missionId")({
  loader: ({ params }) => {
    const mission = DEMO_MISSIONS.find((m) => m.id === params.missionId);
    if (!mission) throw notFound();
    return { mission };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Report unavailable — DroneRoute AI" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.mission.name} Report — DroneRoute AI`;
    const d = `Post-flight report for ${loaderData.mission.name} at ${loaderData.mission.location}: coverage, battery and efficiency results.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: Report,
});

function Report() {
  const { mission: m } = Route.useLoaderData();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wide">{m.name}</h1>
            <p className="label-mono">{m.location} · {new Date(m.date).toLocaleString()} · {m.droneModel}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Print / PDF</Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Distance" value={`${m.distanceKm.toFixed(2)} km`} tone="primary" />
          <Stat label="Duration" value={`${Math.round(m.durationSec / 60)} min`} />
          <Stat label="Coverage" value={`${(m.coverage * 100).toFixed(1)}%`} tone="success" />
          <Stat label="Battery Used" value={`${m.batteryUsed}%`} tone="warning" />
        </div>
        <Panel title="Event Log">
          <div className="space-y-1.5">
            {m.events.map((e: MissionEvent) => (
              <div key={e.id} className="rounded-sm border border-border/70 bg-background/40 px-2.5 py-1.5">
                <div className="flex items-center justify-between text-[12px] text-foreground">
                  {e.title}
                  <span className="label-mono">T+{Math.round(e.t)}s</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{e.message}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Button asChild variant="outline"><Link to="/history">Back to Mission History</Link></Button>
      </div>
    </AppShell>
  );
}
