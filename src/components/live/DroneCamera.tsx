import { useMemo } from "react";
import { useMission } from "@/store/mission-store";
import { useDetections } from "@/store/detection-store";
import { FRAMES, CLASS_COLORS } from "@/lib/mission/detections";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

/**
 * SIMULATED drone camera feed. Frames are pre-rendered synthetic aerial
 * imagery cycled by mission progress — this is not a real video downlink.
 */
export function DroneCamera({ className }: { className?: string }) {
  const { simStatus, simBattery, simElapsed, simPosition, simCoverage, config, routes, selectedStrategy, simDistance } =
    useMission();
  const detections = useDetections((s) => s.detections);
  const liveIds = useDetections((s) => s.liveIds);
  const select = useDetections((s) => s.select);

  const route = routes.find((r) => r.strategy === selectedStrategy);
  const frac = route ? Math.min(1, simDistance / Math.max(1, route.metrics.distance)) : 0;
  const frame = FRAMES[Math.min(FRAMES.length - 1, Math.floor(frac * FRAMES.length))] ?? FRAMES[0]!;

  const visible = useMemo(
    () => detections.filter((d) => frame.detections.includes(d.id) && liveIds.includes(d.id)),
    [detections, frame, liveIds],
  );

  const clock = new Date(simElapsed * 1000).toISOString().substring(11, 19);
  const altitude = route?.waypoints[1]?.altitude ?? config.altitude;

  return (
    <div className={cn("relative overflow-hidden border border-border bg-black", className)}>
      <img
        src={frame.image}
        alt="Simulated drone camera frame"
        className={cn(
          "h-full w-full object-cover transition-transform duration-[4000ms]",
          simStatus === "running" ? "scale-105" : "scale-100",
        )}
      />

      {/* detection overlays */}
      <div className="absolute inset-0">
        {visible.map((d) => (
          <button
            key={d.id}
            onClick={() => select(d.id)}
            className="absolute cursor-pointer"
            style={{
              left: `${d.box.x * 100}%`,
              top: `${d.box.y * 100}%`,
              width: `${d.box.w * 100}%`,
              height: `${d.box.h * 100}%`,
              border: `1.5px solid ${CLASS_COLORS[d.objectClass]}`,
              boxShadow: `0 0 18px -6px ${CLASS_COLORS[d.objectClass]}`,
            }}
          >
            <span
              className="absolute -top-[16px] left-[-1.5px] whitespace-nowrap px-1 font-mono text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: CLASS_COLORS[d.objectClass], color: "#0b0f0d" }}
            >
              {d.objectClass} · {d.confidence.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>

      {/* crosshair */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border border-primary/30" />
        <div className="absolute h-[1px] w-24 bg-primary/25" />
        <div className="absolute h-24 w-[1px] bg-primary/25" />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 p-3 font-mono text-[10px] uppercase tracking-wider text-primary/90">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div>ALT {Math.round(altitude)} M AGL</div>
            <div>SPD {config.speed.toFixed(1)} M/S</div>
            <div>GPS {simStatus === "running" ? "LOCKED · 18 SAT" : "STANDBY"}</div>
          </div>
          <div className="space-y-0.5 text-right">
            <div className="flex items-center justify-end gap-1 text-danger">
              <Circle className={cn("h-2 w-2 fill-current", simStatus === "running" && "animate-pulse")} />
              REC
            </div>
            <div>BAT {Math.round(simBattery)}%</div>
            <div>T+{clock}</div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 space-y-0.5">
          <div>
            {simPosition
              ? `${simPosition.lat.toFixed(5)}° N  ${simPosition.lng.toFixed(5)}° E`
              : "AWAITING POSITION"}
          </div>
          <div>SECTOR {frame.sector} · FRAME {frame.id}</div>
        </div>
        <div className="absolute bottom-3 right-3 space-y-0.5 text-right">
          <div>COVERAGE {(simCoverage * 100).toFixed(1)}%</div>
          <div className="text-warning/90">SIMULATED CAMERA FEED</div>
        </div>
      </div>

      {/* scanline sweep */}
      {simStatus === "running" && (
        <div className="pointer-events-none absolute inset-0 tac-scan opacity-40" />
      )}
    </div>
  );
}
