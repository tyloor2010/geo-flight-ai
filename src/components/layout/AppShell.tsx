import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Cpu,
  History,
  LayoutDashboard,
  Map as MapIcon,
  Presentation,
  Settings as SettingsIcon,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { useMission } from "@/store/mission-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/control", label: "Mission Control", icon: LayoutDashboard },
  { to: "/planner", label: "Mission Planner", icon: MapIcon },
  { to: "/live", label: "Live Mission", icon: Activity },
  { to: "/history", label: "Mission History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/fleet", label: "Drone Fleet", icon: Cpu },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const presentation = useMission((s) => s.settings.presentationMode);
  const updateSettings = useMission((s) => s.updateSettings);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!presentation && (
        <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="border-b border-sidebar-border px-4 py-4">
            <Link to="/">
              <Wordmark />
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 p-2">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-primary shadow-[inset_2px_0_0_0_var(--primary)]"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={() => updateSettings({ presentationMode: true })}
              className="flex w-full items-center gap-2 rounded-sm border border-border px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              <Presentation className="h-3.5 w-3.5" /> Presentation Mode
            </button>
            <p className="label-mono mt-3 leading-relaxed">
              Simulation Prototype · v1.0
              <br />
              Not connected to a live aircraft
            </p>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {presentation && (
          <button
            onClick={() => updateSettings({ presentationMode: false })}
            className="fixed bottom-4 left-4 z-[900] rounded-sm border border-border bg-panel/90 px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur hover:text-primary"
          >
            Exit Presentation Mode
          </button>
        )}
        {!presentation && <MobileNav pathname={pathname} />}
        {children}
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-2 py-2 md:hidden">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "whitespace-nowrap rounded-sm px-3 py-1.5 text-[12px]",
            pathname === item.to ? "bg-sidebar-accent text-primary" : "text-muted-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
