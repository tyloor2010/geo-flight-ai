import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ChangeCompare } from "@/components/imagery/ChangeCompare";

export const Route = createFileRoute("/change-detection")({
  head: () => ({
    meta: [
      { title: "Temporal Change Detection — DroneRoute AI" },
      { name: "description", content: "Compare two simulated survey passes over the same sector and review AI-highlighted changes." },
      { property: "og:title", content: "Temporal Change Detection — DroneRoute AI" },
      { property: "og:description", content: "Side-by-side, slider and overlay comparison of simulated aerial survey passes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChangeDetectionPage,
});

function ChangeDetectionPage() {
  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Temporal Change Detection</h1>
        <ChangeCompare />
      </div>
    </AppShell>
  );
}
