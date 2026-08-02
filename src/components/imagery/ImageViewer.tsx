import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Flag, Minus, Plus, RotateCcw, StickyNote, X } from "lucide-react";
import { useDetections } from "@/store/detection-store";
import { frameById } from "@/lib/mission/detections";
import { DetectionImage } from "@/components/detections/DetectionImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MIN = 1;
const MAX = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Full-screen frame inspector with zoom / pan and AI overlay toggle. */
export function ImageViewer() {
  const frameId = useDetections((s) => s.viewerFrameId);
  const openViewer = useDetections((s) => s.openViewer);
  const detections = useDetections((s) => s.detections);
  const select = useDetections((s) => s.select);
  const setStatus = useDetections((s) => s.setStatus);

  const [overlay, setOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const frame = frameId ? frameById(frameId) : null;
  const frameDetections = frame ? detections.filter((d) => frame.detections.includes(d.id)) : [];

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
    setOverlay(true);
  }, [frameId, reset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const { zoom: z, offset: o } = stateRef.current;
      const next = clamp(z * Math.exp(-dy * 0.0018), MIN, MAX);
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const k = next / z;
      setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
      setZoom(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [frameId]);

  if (!frame) return null;

  const zoomBy = (factor: number) => {
    const el = containerRef.current;
    const { zoom: z, offset: o } = stateRef.current;
    const next = clamp(z * factor, MIN, MAX);
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    const k = next / z;
    setOffset({ x: w / 2 - (w / 2 - o.x) * k, y: h / 2 - (h / 2 - o.y) * k });
    setZoom(next);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-background/98 backdrop-blur-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2">
        <div>
          <h2 className="tac-header text-foreground/80">Aerial Frame Viewer</h2>
          <p className="tac-value text-[12px] text-primary">{frame.id}</p>
        </div>
        <div className="flex items-center gap-1">
          <ToggleBtn active={!overlay} onClick={() => setOverlay(false)}>
            Original
          </ToggleBtn>
          <ToggleBtn active={overlay} onClick={() => setOverlay(true)}>
            AI Overlay
          </ToggleBtn>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => zoomBy(1 / 1.3)}>
            <Minus className="h-3.5 w-3.5" />
          </IconBtn>
          <span className="tac-value w-12 text-center text-[11px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <IconBtn onClick={() => zoomBy(1.3)}>
            <Plus className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="secondary" className="h-7 text-[11px]" onClick={() => toast("Frame export queued (demo)")}>
            <Download className="mr-1 h-3 w-3" /> Export Frame
          </Button>
          <Button size="sm" variant="secondary" className="h-7 text-[11px]" onClick={() => toast("Annotation panel opens in the detection detail view")}>
            <StickyNote className="mr-1 h-3 w-3" /> Add Annotation
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-[11px]"
            onClick={() => {
              frameDetections.forEach((d) => setStatus(d.id, "review"));
              toast.warning(`${frame.id} marked for review`);
            }}
          >
            <Flag className="mr-1 h-3 w-3" /> Mark for Review
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => openViewer(null)}>
            <X className="mr-1 h-3 w-3" /> Return to Mission
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div
          ref={containerRef}
          className="relative min-h-0 overflow-hidden bg-black"
          style={{ cursor: drag.current ? "grabbing" : "grab" }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setOffset({
              x: drag.current.ox + (e.clientX - drag.current.x),
              y: drag.current.oy + (e.clientY - drag.current.y),
            });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
        >
          <div
            className="absolute inset-0 origin-top-left"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
          >
            <DetectionImage
              image={frame.image}
              detections={frameDetections}
              overlay={overlay}
              eager
              className="h-full w-full"
              onSelect={(id) => select(id)}
            />
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-[0.18em] text-warning/90">
            Simulated imagery · demo environment
          </div>
        </div>

        <aside className="space-y-3 overflow-y-auto border-t border-border p-3 lg:border-l lg:border-t-0">
          <section>
            <h3 className="tac-header mb-1.5">Frame Metadata</h3>
            <dl className="space-y-1">
              <Meta label="Frame ID" value={frame.id} />
              <Meta label="Mission" value="NAC-ISR-026" />
              <Meta label="Timestamp" value={frame.timestamp} />
              <Meta label="Altitude" value={`${frame.altitude} m AGL`} />
              <Meta label="Sector" value={frame.sector} />
              <Meta
                label="Coordinates"
                value={`${frame.position.lat.toFixed(4)}, ${frame.position.lng.toFixed(4)}`}
              />
              <Meta label="Detections" value={String(frameDetections.length)} />
            </dl>
          </section>
          <section>
            <h3 className="tac-header mb-1.5">Detections In Frame</h3>
            <div className="space-y-1">
              {frameDetections.map((d) => (
                <button
                  key={d.id}
                  onClick={() => select(d.id)}
                  className="flex w-full items-center justify-between border border-border px-2 py-1.5 text-left hover:border-primary/60"
                >
                  <span className="text-[11px] text-foreground">{d.objectClass}</span>
                  <span className="tac-value text-[11px] text-primary">{d.confidence.toFixed(1)}%</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
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

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-border p-1 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
    >
      {children}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1">
      <dt className="tac-header text-[9px]">{label}</dt>
      <dd className="tac-value text-[11px] text-foreground/90">{value}</dd>
    </div>
  );
}
