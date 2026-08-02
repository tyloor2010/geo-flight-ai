import { Link } from "@tanstack/react-router";
import { Cpu, Radio, Satellite } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useMission } from "@/store/mission-store";
import { cn } from "@/lib/utils";

function Light({ tone }: { tone: "success" | "warning" | "danger" | "info" }) {
  const c = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  }[tone];
  return <span className={cn("h-1.5 w-1.5 rounded-full", c)} />;
}

function Readout({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
  icon?: typeof Cpu;
}) {
  const text = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  }[tone];
  return (
    <div className="flex items-center gap-1.5 border-l border-border/70 px-2.5 first:border-l-0">
      {Icon ? <Icon className={cn("h-3 w-3", text)} /> : <Light tone={tone} />}
      <div className="leading-none">
        <div className="tac-header text-[8px]">{label}</div>
        <div className={cn("tac-value mt-0.5 text-[11px] font-semibold", text)}>{value}</div>
      </div>
    </div>
  );
}

export function CommandBar() {
  const missionName = useMission((s) => s.missionName);
  const simStatus = useMission((s) => s.simStatus);
  const simBattery = useMission((s) => s.simBattery);
  const config = useMission((s) => s.config);
  const drones = useMission((s) => s.drones);
  const drone = drones.find((d) => d.id === config.droneId);
  const battery = Math.round(simStatus === "idle" ? config.startBattery : simBattery);

  return (
    <header className="sticky top-0 z-[600] flex flex-wrap items-center gap-y-2 border-b border-border bg-sidebar/95 px-3 py-2 backdrop-blur">
      <Link to="/" className="flex items-center gap-2 pr-4">
        <span className="flex h-7 w-7 items-center justify-center border border-primary/50 bg-primary/10">
          <Satellite className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="leading-none">
          <span className="block font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-foreground">
            DroneRoute AI
          </span>
          <span className="tac-header mt-0.5 block text-[8px]">Aerial Mission Control</span>
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 items-center justify-center px-3 lg:flex">
        <div className="tac-corners max-w-full truncate border border-border/70 bg-background/40 px-3 py-1">
          <span className="tac-header text-[8px]">Mission</span>
          <span className="tac-value ml-2 text-[12px] uppercase text-foreground">{missionName}</span>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-y-2">
        <div className="flex items-center">
          <Readout label="GPS" value="LOCKED" tone="success" />
          <Readout label="Link" value="STABLE" tone="success" icon={Radio} />
          <Readout label="AI Engine" value="READY" tone="info" icon={Cpu} />
          <Readout
            label="Drone"
            value={(drone?.model ?? "Surveyor X1").toUpperCase()}
            tone="info"
          />
          <Readout
            label="Battery"
            value={`${battery}%`}
            tone={battery > 40 ? "success" : battery > 20 ? "warning" : "danger"}
          />
          <Readout
            label="Mission"
            value={simStatus === "running" ? "ACTIVE" : simStatus.toUpperCase()}
            tone={simStatus === "running" ? "warning" : "info"}
          />
        </div>
        <div className="pl-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
