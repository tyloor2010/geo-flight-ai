import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { FleetOps } from "@/components/fleet/FleetOps";

export const Route = createFileRoute("/fleet-ops")({
  head: () => ({
    meta: [
      { title: "Fleet Operations — DroneRoute AI" },
      { name: "description", content: "Simulated multi-drone sector allocation and synchronized fleet coverage progress." },
      { property: "og:title", content: "Fleet Operations — DroneRoute AI" },
      { property: "og:description", content: "Launch a simulated multi-drone survey with automatic sector allocation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FleetOpsPage,
});

function FleetOpsPage() {
  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Fleet Operations</h1>
        <FleetOps />
      </div>
    </AppShell>
  );
}
