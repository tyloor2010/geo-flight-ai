import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Technology — DroneRoute AI" },
      { name: "description", content: "How DroneRoute AI plans coverage routes: boustrophedon grids, obstacle avoidance, battery modelling and mission scoring." },
      { property: "og:title", content: "About the Technology — DroneRoute AI" },
      { property: "og:description", content: "The optimization algorithms and safety model behind DroneRoute AI." },
    ],
  }),
  component: About,
});

const SECTIONS = [
  {
    title: "Coverage Path Planning",
    body: "Survey areas are projected to a local metric plane, rotated onto the dominant edge angle and swept with a boustrophedon (serpentine) grid whose spacing derives from sensor footprint and the requested image overlap.",
  },
  {
    title: "Obstacle & Airspace Avoidance",
    body: "Restricted zones are inflated by a safety buffer. Any leg intersecting a zone is re-routed around its convex boundary, and waypoints inside a zone are discarded before the path is re-stitched.",
  },
  {
    title: "Battery & Energy Model",
    body: "Consumption is modelled from cruise draw, climb cost, turn penalties, payload mass and headwind component, then compared with the reserve threshold to produce a feasibility verdict and RTH margin.",
  },
  {
    title: "Mission Scoring",
    body: "Each candidate strategy is scored deterministically across efficiency, battery margin, coverage completeness and safety clearance. The weighted composite selects the recommended route.",
  },
];

function About() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">The Technology</h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          DroneRoute AI is a deterministic mission-planning simulator. Every metric shown in the product is computed
          in-browser from documented geometry and energy models — there is no live aircraft link and no random data.
        </p>
        {SECTIONS.map((s) => (
          <Panel key={s.title} title={s.title}>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
          </Panel>
        ))}
        <Button asChild><Link to="/planner">Open the Mission Planner</Link></Button>
      </div>
    </AppShell>
  );
}
