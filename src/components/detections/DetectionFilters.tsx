import { useDetections } from "@/store/detection-store";
import type { DetectionClass, DetectionStatus } from "@/lib/mission/detections";
import { cn } from "@/lib/utils";

const TYPES: (DetectionClass | "all")[] = [
  "all",
  "Vehicle",
  "Structure",
  "Obstacle",
  "Infrastructure Anomaly",
  "Equipment",
  "Unknown Object",
];
const CONFIDENCE: { value: 0 | 50 | 70 | 90; label: string }[] = [
  { value: 0, label: "All" },
  { value: 50, label: "≥50%" },
  { value: 70, label: "≥70%" },
  { value: 90, label: "≥90%" },
];
const STATUSES: (DetectionStatus | "all")[] = [
  "all",
  "new",
  "review",
  "confirmed",
  "flagged",
  "dismissed",
];

export function DetectionFilters() {
  const filters = useDetections((s) => s.filters);
  const setFilters = useDetections((s) => s.setFilters);

  return (
    <div className="tac-panel flex flex-wrap items-center gap-x-6 gap-y-2 px-3 py-2">
      <Group label="Type">
        {TYPES.map((t) => (
          <Chip key={t} active={filters.type === t} onClick={() => setFilters({ type: t })}>
            {t === "all" ? "All" : t}
          </Chip>
        ))}
      </Group>
      <Group label="Confidence">
        {CONFIDENCE.map((c) => (
          <Chip
            key={c.value}
            active={filters.confidence === c.value}
            onClick={() => setFilters({ confidence: c.value })}
          >
            {c.label}
          </Chip>
        ))}
      </Group>
      <Group label="Status">
        {STATUSES.map((s) => (
          <Chip key={s} active={filters.status === s} onClick={() => setFilters({ status: s })}>
            {s === "all" ? "All" : s}
          </Chip>
        ))}
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="tac-header text-[9px]">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
