import type { Detection, DetectionStatus } from "@/lib/mission/detections";
import { CLASS_COLORS, STATUS_LABEL } from "@/lib/mission/detections";
import { DetectionImage } from "./DetectionImage";
import { cn } from "@/lib/utils";

export const STATUS_TONE: Record<DetectionStatus, string> = {
  new: "text-info border-info/40 bg-info/10",
  review: "text-warning border-warning/40 bg-warning/10",
  confirmed: "text-success border-success/40 bg-success/10",
  dismissed: "text-muted-foreground border-border bg-muted/30",
  flagged: "text-danger border-danger/40 bg-danger/10",
};

export function StatusChip({ status }: { status: DetectionStatus }) {
  return (
    <span
      className={cn(
        "border px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.14em]",
        STATUS_TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function DetectionCard({
  detection,
  onOpen,
}: {
  detection: Detection;
  onOpen: (id: string) => void;
}) {
  const color = CLASS_COLORS[detection.objectClass];
  return (
    <button
      type="button"
      onClick={() => onOpen(detection.id)}
      className="tac-panel tac-corners group w-full overflow-hidden text-left transition-colors hover:border-primary/60"
    >
      <div className="flex items-center justify-between border-b border-border px-2.5 py-1.5">
        <span className="tac-header text-foreground/80">
          Detection #{String(detection.index).padStart(3, "0")}
        </span>
        <StatusChip status={detection.status} />
      </div>

      <div className="relative aspect-[16/9]">
        <DetectionImage
          image={detection.image}
          detections={[detection]}
          overlay
          highlightId={detection.id}
          className="h-full w-full"
        />
      </div>

      <div className="space-y-1.5 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0"
            style={{ background: color }}
            aria-hidden
          />
          <span className="text-[13px] font-medium text-foreground">{detection.objectClass}</span>
          <span className="ml-auto tac-value text-[13px] font-semibold text-primary">
            {detection.confidence.toFixed(1)}%
          </span>
        </div>
        <div className="h-[3px] w-full bg-muted">
          <div
            className="h-full"
            style={{ width: `${detection.confidence}%`, background: color }}
          />
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
          <Row label="Sector" value={detection.sector} />
          <Row label="Time" value={detection.timestamp} />
          <Row label="Frame" value={detection.frameId} />
          <Row label="Alt" value={`${detection.altitude} m`} />
        </dl>
      </div>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="tac-header text-[9px]">{label}</dt>
      <dd className="tac-value text-[11px] text-foreground/90">{value}</dd>
    </div>
  );
}
