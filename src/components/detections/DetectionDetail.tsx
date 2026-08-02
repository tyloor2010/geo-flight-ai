import { useEffect, useState } from "react";
import { Check, Flag, Maximize2, MapPin, StickyNote, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDetections } from "@/store/detection-store";
import { frameById } from "@/lib/mission/detections";
import { DetectionImage } from "./DetectionImage";
import { StatusChip } from "./DetectionCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DetectionDetail() {
  const selectedId = useDetections((s) => s.selectedId);
  const detections = useDetections((s) => s.detections);
  const select = useDetections((s) => s.select);
  const setStatus = useDetections((s) => s.setStatus);
  const addNote = useDetections((s) => s.addNote);
  const openViewer = useDetections((s) => s.openViewer);
  const [overlay, setOverlay] = useState(true);
  const [note, setNote] = useState("");

  const detection = detections.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    setOverlay(true);
    setNote("");
  }, [selectedId]);

  if (!detection) return null;
  const frame = frameById(detection.frameId);
  const frameDetections = frame
    ? detections.filter((d) => frame.detections.includes(d.id))
    : [detection];

  return (
    <Dialog open onOpenChange={(o) => !o && select(null)}>
      <DialogContent
        className="max-w-5xl gap-0 overflow-hidden border-border bg-panel p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <DialogTitle className="tac-header text-foreground/80">
            Detection Intelligence · {detection.id}
          </DialogTitle>
        </div>

        <div className="grid max-h-[78vh] gap-0 overflow-y-auto md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="border-border p-3 md:border-r">
            <div className="mb-2 flex items-center gap-1">
              <ToggleBtn active={!overlay} onClick={() => setOverlay(false)}>
                Original
              </ToggleBtn>
              <ToggleBtn active={overlay} onClick={() => setOverlay(true)}>
                AI Overlay
              </ToggleBtn>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-7 text-[11px]"
                onClick={() => openViewer(detection.frameId)}
              >
                <Maximize2 className="mr-1 h-3 w-3" /> Full Viewer
              </Button>
            </div>
            <DetectionImage
              image={detection.image}
              detections={frameDetections}
              overlay={overlay}
              highlightId={detection.id}
              eager
              className="aspect-[16/10] w-full border border-border"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <Meta label="Frame" value={detection.frameId} />
              <Meta label="Captured" value={detection.timestamp} />
              <Meta label="Altitude" value={`${detection.altitude} m AGL`} />
              <Meta label="Mode" value="Simulation" />
            </div>
          </div>

          <div className="space-y-3 p-3">
            <section>
              <h4 className="tac-header mb-1.5">Detection Details</h4>
              <dl className="space-y-1">
                <Field label="Detection ID" value={detection.id} />
                <Field label="Classification" value={detection.objectClass} />
                <Field label="Confidence" value={`${detection.confidence.toFixed(1)}%`} tone="primary" />
                <Field label="Timestamp" value={detection.timestamp} />
                <Field label="Altitude" value={`${detection.altitude} m`} />
                <Field
                  label="Coordinates"
                  value={`${detection.position.lat.toFixed(4)}, ${detection.position.lng.toFixed(4)}`}
                />
                <Field label="Mission" value="NAC Infrastructure Survey" />
                <Field label="Sector" value={detection.sector} />
              </dl>
              <div className="mt-2 flex items-center gap-2">
                <span className="tac-header text-[9px]">Status</span>
                <StatusChip status={detection.status} />
              </div>
            </section>

            <section className="tac-panel p-2">
              <h4 className="tac-header mb-1">AI Assessment</h4>
              <p className="text-[12px] leading-relaxed text-foreground/85">{detection.assessment}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <span className="tac-header text-[9px]">Reason · </span>
                {detection.reason}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-warning/90">
                Simulated detection layer — no live camera connected
              </p>
            </section>

            <section>
              <h4 className="tac-header mb-1.5">Review Workflow</h4>
              <div className="grid grid-cols-2 gap-1.5">
                <ActionBtn
                  tone="success"
                  onClick={() => {
                    setStatus(detection.id, "confirmed");
                    toast.success(`${detection.id} confirmed`);
                  }}
                >
                  <Check className="h-3 w-3" /> Confirm
                </ActionBtn>
                <ActionBtn
                  tone="muted"
                  onClick={() => {
                    setStatus(detection.id, "dismissed");
                    toast(`${detection.id} dismissed`);
                  }}
                >
                  <X className="h-3 w-3" /> Dismiss
                </ActionBtn>
                <ActionBtn
                  tone="danger"
                  onClick={() => {
                    setStatus(detection.id, "flagged");
                    toast.warning(`${detection.id} flagged`);
                  }}
                >
                  <Flag className="h-3 w-3" /> Flag
                </ActionBtn>
                <ActionBtn tone="warning" onClick={() => setStatus(detection.id, "review")}>
                  <MapPin className="h-3 w-3" /> Mark Review
                </ActionBtn>
              </div>
              <form
                className="mt-2 flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  addNote(detection.id, note.trim());
                  setNote("");
                  toast.success("Annotation added");
                }}
              >
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add operator note…"
                  className="h-8 text-[12px]"
                />
                <Button type="submit" size="sm" variant="secondary" className="h-8">
                  <StickyNote className="h-3 w-3" />
                </Button>
              </form>
              {detection.notes.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {detection.notes.map((n, i) => (
                    <li key={i} className="border-l-2 border-primary/50 pl-2 text-[11px] text-muted-foreground">
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleBtn({
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
        "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ActionBtn({
  tone,
  onClick,
  children,
}: {
  tone: "success" | "danger" | "warning" | "muted";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const tones = {
    success: "border-success/40 text-success hover:bg-success/10",
    danger: "border-danger/40 text-danger hover:bg-danger/10",
    warning: "border-warning/40 text-warning hover:bg-warning/10",
    muted: "border-border text-muted-foreground hover:bg-muted/40",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 border px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
        tones,
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1">
      <dt className="tac-header text-[9px]">{label}</dt>
      <dd className={cn("tac-value text-[12px]", tone === "primary" ? "text-primary" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="tac-header text-[9px]">{label}</span>
      <span className="tac-value text-[11px] text-foreground/85">{value}</span>
    </div>
  );
}
