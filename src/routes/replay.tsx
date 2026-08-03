import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MissionReplay } from "@/components/mission/MissionReplay";

export const Route = createFileRoute("/replay")({
  head: () => ({
    meta: [
      { title: "Mission Replay — DroneRoute AI" },
      { name: "description", content: "Replay completed simulated drone missions with synchronized telemetry, events and flight path." },
      { property: "og:title", content: "Mission Replay — DroneRoute AI" },
      { property: "og:description", content: "Scrub through recorded simulated missions with telemetry and event playback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReplayPage,
});

function ReplayPage() {
  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Mission Replay</h1>
        <MissionReplay />
      </div>
    </AppShell>
  );
}
