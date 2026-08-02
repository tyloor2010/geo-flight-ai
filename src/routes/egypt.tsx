import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Building2, ShieldAlert, Radar, Rocket } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_AREAS,
  EGYPT_DEMO_STATS,
  EGYPT_LOCATIONS,
  MISSION_TEMPLATES,
} from "@/lib/mission/egypt";
import { useMission } from "@/store/mission-store";

export const Route = createFileRoute("/egypt")({
  head: () => ({
    meta: [
      { title: "Egypt Mission Intelligence — DroneRoute AI" },
      {
        name: "description",
        content:
          "Egypt-focused drone mission intelligence: New Administrative Capital, smart cities, infrastructure corridors and simulated national coverage scenarios.",
      },
      { property: "og:title", content: "Egypt Mission Intelligence — DroneRoute AI" },
      {
        property: "og:description",
        content:
          "Simulated Egyptian mission areas, smart-city mapping templates and infrastructure survey scenarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EgyptPage,
});

function EgyptPage() {
  const setLocation = useMission((s) => s.setLocation);
  const applyTemplate = useMission((s) => s.applyTemplate);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wide text-foreground">
              Egypt Mission Intelligence
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
              A simulation-based view of how autonomous aerial survey planning could support Egypt's
              smart cities and national infrastructure programmes.
            </p>
          </div>
          <Button asChild>
            <Link to="/planner" search={{ demo: true }}>
              <Rocket className="mr-1.5 h-4 w-4" /> Run NAC Demo
            </Link>
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-sm border border-warning/40 bg-warning/10 px-3 py-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-[12px] leading-relaxed text-foreground">
            All zones, perimeters and facility labels shown here are fictional and generated for
            simulation only. DroneRoute AI does not access classified information, military
            databases, real telemetry, or operational airspace permissions.
          </p>
        </div>

        <Panel title="Simulated National Coverage">
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-5">
            {EGYPT_DEMO_STATS.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} tone="primary" />
            ))}
          </div>
        </Panel>

        <Panel title="Mission Areas" action={<Globe2 className="h-3.5 w-3.5 text-primary" />}>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {EGYPT_LOCATIONS.map((l) => (
              <div key={l.key} className="rounded-sm border border-border/70 bg-background/40 p-3">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[13px] font-medium text-foreground">{l.name}</span>
                </div>
                <div className="label-mono mt-1">{l.region}</div>
                <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{l.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {l.focusAreas.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-7 w-full"
                  asChild
                  onClick={() => setLocation(l.key)}
                >
                  <Link to="/planner">Open in Planner</Link>
                </Button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Use-Case Templates" action={<Radar className="h-3.5 w-3.5 text-primary" />}>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {MISSION_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="rounded-sm border border-border/70 bg-background/40 p-3 text-left transition-colors hover:border-primary/60"
              >
                <div className="text-[13px] font-medium text-foreground">{t.name}</div>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {t.description}
                </p>
                <div className="label-mono mt-2">
                  {t.altitude} m · {t.speed} m/s · {Math.round(t.sideOverlap * 100)}% overlap
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Application Areas">
          <div className="grid gap-2 md:grid-cols-3">
            {APPLICATION_AREAS.map((a) => (
              <div key={a.title} className="rounded-sm border border-border/70 bg-background/40 p-3">
                <div className="text-[13px] font-medium text-foreground">{a.title}</div>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{a.text}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Built for Egypt — Scalable Beyond">
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Egypt is rapidly building new cities, transport corridors and national infrastructure.
            Aerial data collection is becoming essential — but planning safe, efficient drone
            missions is still largely manual. DroneRoute AI turns an operator-defined survey area
            into an optimized, safety-aware autonomous mission in seconds. The same engine scales
            from a single construction site to a governorate-level programme, and from Egypt to the
            wider MENA region.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
