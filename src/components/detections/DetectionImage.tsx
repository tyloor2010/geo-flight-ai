import { useMemo } from "react";
import type { Detection } from "@/lib/mission/detections";
import { CLASS_COLORS } from "@/lib/mission/detections";
import { cn } from "@/lib/utils";

/**
 * Aerial frame renderer. `overlay` draws the SIMULATED AI detection boxes on
 * top of the original captured frame.
 */
export function DetectionImage({
  image,
  detections,
  overlay,
  highlightId,
  className,
  eager,
  onSelect,
}: {
  image: string;
  detections: Detection[];
  overlay: boolean;
  highlightId?: string | null;
  className?: string;
  eager?: boolean;
  onSelect?: (id: string) => void;
}) {
  const boxes = useMemo(() => detections, [detections]);

  return (
    <div className={cn("relative overflow-hidden bg-black/40", className)}>
      <img
        src={image}
        alt="Simulated aerial survey frame"
        width={1280}
        height={768}
        loading={eager ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
      {overlay && (
        <div className="pointer-events-none absolute inset-0">
          {boxes.map((d) => {
            const color = CLASS_COLORS[d.objectClass];
            const active = highlightId === d.id;
            return (
              <div
                key={d.id}
                onClick={() => onSelect?.(d.id)}
                className={cn("absolute", onSelect && "pointer-events-auto cursor-pointer")}
                style={{
                  left: `${d.box.x * 100}%`,
                  top: `${d.box.y * 100}%`,
                  width: `${d.box.w * 100}%`,
                  height: `${d.box.h * 100}%`,
                  border: `1.5px solid ${color}`,
                  boxShadow: active ? `0 0 0 1px ${color}, 0 0 18px -4px ${color}` : "none",
                  background: active ? `${color}1a` : "transparent",
                }}
              >
                <div
                  className="absolute -top-[17px] left-[-1.5px] whitespace-nowrap px-1 py-[1px] font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: color, color: "#0b0f0d" }}
                >
                  {d.objectClass} · {d.confidence.toFixed(1)}%
                </div>
                <div
                  className="absolute -bottom-[15px] right-[-1.5px] whitespace-nowrap font-mono text-[9px] tracking-wider"
                  style={{ color }}
                >
                  {d.id}
                </div>
              </div>
            );
          })}
          <div className="absolute bottom-1.5 left-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warning/90">
            Simulated AI Detection
          </div>
        </div>
      )}
    </div>
  );
}
