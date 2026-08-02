import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DetectionImage } from "@/components/detections/DetectionImage";
import { useDetections } from "@/store/detection-store";
import { FRAMES } from "@/lib/mission/detections";

export const Route = createFileRoute("/imagery")({
  head: () => ({
    meta: [
      { title: "Aerial Imagery — DroneRoute AI" },
      {
        name: "description",
        content:
          "Intelligence gallery of simulated aerial frames captured during the NAC infrastructure survey.",
      },
      { property: "og:title", content: "Aerial Imagery — DroneRoute AI" },
      {
        property: "og:description",
        content: "Browse simulated drone frames with metadata and detection counts.",
      },
    ],
  }),
  component: ImageryPage,
});

function ImageryPage() {
  const detections = useDetections((s) => s.detections);
  const openViewer = useDetections((s) => s.openViewer);

  return (
    <AppShell>
      <div className="space-y-3 p-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide">Aerial Imagery</h1>
          <p className="text-[12px] text-muted-foreground">
            Captured frame archive ·{" "}
            <span className="font-mono uppercase tracking-widest text-warning">
              Simulated imagery — demo environment
            </span>
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FRAMES.map((f) => {
            const frameDetections = detections.filter((d) => f.detections.includes(d.id));
            return (
              <button
                key={f.id}
                onClick={() => openViewer(f.id)}
                className="tac-panel tac-corners overflow-hidden text-left transition-colors hover:border-primary/60"
              >
                <DetectionImage
                  image={f.image}
                  detections={frameDetections}
                  overlay={false}
                  className="aspect-[16/9] w-full"
                />
                <div className="space-y-1 px-2.5 py-2">
                  <div className="flex items-center justify-between">
                    <span className="tac-value text-[12px] text-primary">{f.id}</span>
                    <span className="tac-value text-[11px] text-muted-foreground">{f.timestamp}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="tac-header text-[9px]">{f.altitude}m AGL</span>
                    <span className="tac-header text-[9px]">Sector {f.sector}</span>
                    <span className="tac-header text-[9px] text-primary">
                      {frameDetections.length} detections
                    </span>
                    <span className="tac-header text-[9px]">
                      {f.position.lat.toFixed(4)}, {f.position.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
