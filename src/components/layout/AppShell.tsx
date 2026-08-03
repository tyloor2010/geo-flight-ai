import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Camera,
  Cpu,
  Crosshair,
  FlaskConical,
  Gauge,
  Globe2,
  HeartPulse,
  History,
  LayoutDashboard,
  Map as MapIcon,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import { useMission } from "@/store/mission-store";
import { useThemeSync } from "@/lib/theme";
import { CommandBar } from "@/components/command/CommandBar";
import { DetectionDetail } from "@/components/detections/DetectionDetail";
import { ImageViewer } from "@/components/imagery/ImageViewer";
import { DeveloperCredit } from "@/components/brand/DeveloperCredit";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Cpu };
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Command",
    items: [
      { to: "/control", label: "Mission Control", icon: LayoutDashboard },
      { to: "/planner", label: "Mission Planner", icon: MapIcon },
      { to: "/live", label: "Live Mission", icon: Activity },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/detections", label: "Detections", icon: Crosshair },
      { to: "/imagery", label: "Aerial Imagery", icon: Camera },
      { to: "/egypt", label: "Reconnaissance", icon: Globe2 },
      { to: "/history", label: "Mission History", icon: History },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Fleet",
    items: [
      { to: "/fleet", label: "Drone Fleet", icon: Cpu },
      { to: "/live", label: "Telemetry", icon: Gauge },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", label: "Settings", icon: SettingsIcon },
      { to: "/system", label: "System Health", icon: HeartPulse },
    ],
  },
];

const SYSTEM_STATUS = [
  { label: "AI Engine", value: "ONLINE" },
  { label: "Map Engine", value: "ONLINE" },
  { label: "Simulation", value: "READY" },
  { label: "Database", value: "ONLINE" },
];

export function AppShell({ children }: { children: ReactNode }) {
  useThemeSync();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const presentation = useMission((s) => s.settings.presentationMode);
  const strategic = useMission((s) => s.settings.strategicMode);
  const updateSettings = useMission((s) => s.updateSettings);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!presentation && (
        <aside className="sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <nav className="flex-1 space-y-3 overflow-y-auto p-2 pt-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="tac-header px-2 pb-1 text-[8px]">{group.label}</div>
                <div className="space-y-px">
                  {group.items.map((item) => {
                    const active = pathname === item.to;
                    return (
                      <Link
                        key={`${group.label}-${item.to}-${item.label}`}
                        to={item.to as never}
                        className={cn(
                          "flex items-center gap-2 px-2 py-[7px] text-[12px] font-medium tracking-wide transition-colors",
                          active
                            ? "bg-sidebar-accent text-primary shadow-[inset_2px_0_0_0_var(--primary)]"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-sidebar-border p-2">
            <div className="tac-header pb-1 text-[8px]">System Status</div>
            <ul className="space-y-1">
              {SYSTEM_STATUS.map((s) => (
                <li key={s.label} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="tac-value text-[10px] text-muted-foreground">
                    {s.label.toUpperCase()}
                  </span>
                  <span className="tac-value ml-auto text-[10px] text-success">{s.value}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => updateSettings({ strategicMode: !strategic })}
              className={cn(
                "mt-2 flex w-full items-center gap-1.5 border px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors",
                strategic
                  ? "border-warning/60 bg-warning/10 text-warning"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary",
              )}
            >
              <ShieldAlert className="h-3 w-3" /> Strategic Mode
            </button>
            <p className="tac-header mt-2 text-[8px] leading-relaxed">
              Tactical Simulation Environment
              <br />
              Prototype v1.2 · No live aircraft
            </p>
            <div className="mt-3 border-t border-sidebar-border pt-3">
              <DeveloperCredit />
            </div>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!presentation && <CommandBar />}
        {strategic && (
          <div className="flex items-center justify-center gap-2 border-b border-warning/40 bg-warning/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-warning">
            <ShieldAlert className="h-3 w-3" />
            Simulation / Training Environment — No Classified or Operational Data
          </div>
        )}
        {presentation && (
          <button
            onClick={() => updateSettings({ presentationMode: false })}
            className="fixed bottom-4 left-4 z-[900] border border-border bg-panel/90 px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur hover:text-primary"
          >
            Exit Presentation Mode
          </button>
        )}
        {!presentation && <MobileNav pathname={pathname} />}
        <main className="flex-1">{children}</main>
        {!presentation && (
          <footer className="border-t border-border bg-background px-4 py-2.5">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <DeveloperCredit />
              <div className="text-[10px] text-muted-foreground">
                DroneRoute AI Egypt · ITC Prototype · Simulation Only
              </div>
            </div>
          </footer>
        )}
      </div>

      <DetectionDetail />
      <ImageViewer />
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const items: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-2 py-2 md:hidden">
      {items.map((item) => (
        <Link
          key={`${item.to}-${item.label}`}
          to={item.to as never}
          className={cn(
            "whitespace-nowrap px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider",
            pathname === item.to ? "bg-sidebar-accent text-primary" : "text-muted-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
