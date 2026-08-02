import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  Brain,
  Cpu,
  Layers,
  Radar,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Logo, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/hud/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DroneRoute AI — AI-Powered Drone Mission Planning" },
      {
        name: "description",
        content:
          "Turn a survey area into an optimized autonomous drone flight mission: AI route optimization, safety-aware planning, battery estimation and live mission simulation.",
      },
      { property: "og:title", content: "DroneRoute AI — Plan Smarter. Fly Safer. Cover More." },
      {
        property: "og:description",
        content:
          "AI-powered drone mission planning: coverage grids, restricted airspace avoidance, battery modelling and mission simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CAPABILITIES = [
  {
    icon: Brain,
    title: "AI Route Optimization",
    text: "Automatically calculate efficient coverage flight paths from a drawn survey area.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-Aware Planning",
    text: "Respect operator-declared restricted zones, obstacles and operational limits.",
  },
  {
    icon: Radar,
    title: "Mission Intelligence",
    text: "Estimate coverage, battery, time, distance and mission risk before launch.",
  },
];

const STEPS = [
  "Define Area",
  "Configure Drone",
  "Set Constraints",
  "Generate Route",
  "Simulate Mission",
  "Analyze Results",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Wordmark />
          <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
            <a href="#capabilities" className="hover:text-foreground">Capabilities</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link to="/about" className="hover:text-foreground">Technology</Link>
            <Link to="/control" className="hover:text-foreground">Mission Control</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/planner" search={{ demo: true }}>Explore Demo</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/planner">Launch Mission Planner</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0">
          <svg className="h-full w-full" viewBox="0 0 1200 560" preserveAspectRatio="none">
            <path
              d="M40 480 L200 480 L200 400 L420 400 L420 320 L640 320 L640 240 L860 240 L860 160 L1120 160"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="10 8"
              opacity="0.5"
              className="route-dash"
            />
            <circle r="5" fill="var(--primary)">
              <animateMotion
                dur="12s"
                repeatCount="indefinite"
                path="M40 480 L200 480 L200 400 L420 400 L420 320 L640 320 L640 240 L860 240 L860 160 L1120 160"
              />
            </circle>
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="max-w-2xl animate-rise-in">
            <span className="label-mono rounded-full border border-primary/40 px-3 py-1 text-primary">
              AI-Powered Autonomous Drone Mission Planning
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[1.05] tracking-tight text-foreground md:text-7xl">
              Drone<span className="text-primary">Route</span> AI
            </h1>
            <p className="mt-4 font-display text-xl uppercase tracking-[0.2em] text-muted-foreground">
              Plan Smarter. Fly Safer. Cover More.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Turn a survey area into an optimized autonomous flight mission. The operator defines
              what must be covered — DroneRoute AI determines how the aircraft should fly it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/planner">
                  Launch Mission Planner <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/planner" search={{ demo: true }}>Explore Demo</Link>
              </Button>
            </div>
            <p className="mt-6 text-[11px] uppercase tracking-widest text-muted-foreground/70">
              Simulation prototype — not connected to a physical aircraft
            </p>
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Panel key={c.title} className="p-5">
              <c.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{c.text}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-border bg-panel/40 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-3xl uppercase tracking-wide text-foreground">How it works</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((s, i) => (
              <div key={s} className="glass-panel rounded-md p-4">
                <div className="label-mono text-primary">Step {i + 1}</div>
                <div className="mt-2 text-[14px] font-medium text-foreground">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Workflow, title: "Coverage Engine", text: "Boustrophedon survey grids derived from altitude, FOV and overlap." },
            { icon: BatteryCharging, title: "Energy Model", text: "Battery, RTH feasibility and safety reserve validated per route." },
            { icon: Layers, title: "Route Alternatives", text: "Compare recommended, shortest, maximum coverage and maximum safety." },
          ].map((c) => (
            <Panel key={c.title} className="p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-[15px] font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{c.text}</p>
            </Panel>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Logo size={20} className="text-primary" />
            <span className="text-[13px]">DroneRoute AI · ITC Prototype</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About the Technology</Link>
            <Link to="/analytics" className="hover:text-foreground">Analytics</Link>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Simulation Layer v1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
