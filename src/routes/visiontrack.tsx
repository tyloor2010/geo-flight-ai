import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Camera,
  Clock,
  Eye,
  Fingerprint,
  GitBranch,
  Globe2,
  Layers,
  Lock,
  Scan,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/hud/primitives";

export const Route = createFileRoute("/visiontrack")({
  head: () => ({
    meta: [
      { title: "VisionTrack AI — Assistant Lab | DroneRoute AI Egypt" },
      {
        name: "description",
        content:
          "VisionTrack AI is an integrated assistant lab for AI-powered facial recognition and missing-person search, designed to complement DroneRoute AI Egypt operations.",
      },
      {
        property: "og:title",
        content: "VisionTrack AI — Assistant Lab | DroneRoute AI Egypt",
      },
      {
        property: "og:description",
        content:
          "AI-powered facial recognition and missing-person search system, optimized for Egyptian and Arabic faces.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisionTrackLab,
});

const METRICS = [
  { value: "92.4%", label: "Overall Accuracy", icon: ShieldCheck },
  { value: "< 3s", label: "Scan Speed", icon: Clock },
  { value: "84%", label: "Low-Quality Accuracy", icon: Camera },
  { value: "4.8%", label: "False Positive Rate", icon: Eye },
];

const FEATURES = [
  {
    icon: Scan,
    title: "Real-Time Facial Scanning",
    text: "AI recognition across CCTV, mobile uploads and drone-mounted camera feeds.",
  },
  {
    icon: Brain,
    title: "Arabic Face Optimization",
    text: "CNN model trained on Egyptian and Arab facial features to reduce regional bias.",
  },
  {
    icon: Zap,
    title: "Low-Quality Recovery",
    text: "84% accuracy on poor lighting, low-resolution and angled surveillance footage.",
  },
  {
    icon: Lock,
    title: "Privacy-First Design",
    text: "128-dim embeddings, anonymized storage, and consent-aware search.",
  },
];

const INTEGRATION_STEPS = [
  {
    icon: Globe2,
    title: "Drone Capture",
    text: "DroneRoute AI missions stream aerial imagery from search zones.",
  },
  {
    icon: Scan,
    title: "Face Extraction",
    text: "VisionTrack AI detects, aligns and encodes faces in the frames.",
  },
  {
    icon: Fingerprint,
    title: "Match Search",
    text: "Embeddings are compared against missing-person reports.",
  },
  {
    icon: Zap,
    title: "Alert Dispatch",
    text: "Instant notifications with location, confidence and timestamp.",
  },
];

const TEAM = [
  { name: "Youssef Salama", role: "Lead AI Engineer" },
  { name: "Ahmed Walid", role: "Full-Stack Developer" },
  { name: "Mohamed Nasser", role: "Computer Vision Specialist" },
  { name: "Mohamed Sayyad", role: "Data Scientist" },
  { name: "Ahmed Yasser", role: "Backend Engineer" },
];

function VisionTrackLab() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="tac-header mb-2 text-[10px] uppercase tracking-[0.2em] text-primary">
              Assistant Lab · ITC-EGYPT 2026
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Vision<span className="text-primary">Track</span> AI
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              Finding missing persons faster, smarter and safer. An integrated AI assistant lab that
              combines computer vision with DroneRoute AI aerial search to support public-safety
              operations in Egypt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://visiontrackcom.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open VisionTrack AI <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button size="sm" asChild>
              <a
                href="https://visiontrackcom.lovable.app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                Launch Dashboard
              </a>
            </Button>
          </div>
        </div>

        {/* Simulation banner */}
        <div className="mb-6 border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-warning">
          Simulation / Prototype Integration — No operational aircraft or live surveillance feeds
        </div>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {METRICS.map((m) => (
            <Panel key={m.label} className="p-4">
              <div className="flex items-center gap-2">
                <m.icon className="h-4 w-4 text-primary" />
                <span className="tac-header text-[9px] uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-foreground">{m.value}</div>
            </Panel>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Features */}
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  Core Capabilities
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-md border border-border bg-sidebar/50 p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center gap-2">
                      <f.icon className="h-4 w-4 text-primary" />
                      <h3 className="text-[13px] font-semibold text-foreground">{f.title}</h3>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Integration flow */}
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  DroneRoute + VisionTrack Integration
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {INTEGRATION_STEPS.map((step, idx) => (
                  <div key={step.title} className="relative">
                    <div className="rounded-md border border-border bg-sidebar/50 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {idx + 1}
                        </div>
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="mt-2 text-[12px] font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] italic text-muted-foreground">
                * This integration is conceptual for the ITC prototype. Production deployment would
                require secure API contracts and data-privacy compliance.
              </p>
            </Panel>

            {/* Tech stack */}
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  Team & Technology
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {TEAM.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 rounded-md border border-border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-[12px] font-bold text-primary">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-muted-foreground md:grid-cols-4">
                <div className="rounded border border-border p-2 text-center">React + TypeScript</div>
                <div className="rounded border border-border p-2 text-center">Python (Flask)</div>
                <div className="rounded border border-border p-2 text-center">TensorFlow + PyTorch</div>
                <div className="rounded border border-border p-2 text-center">OpenCV + CNN</div>
              </div>
            </Panel>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Panel className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                  Lab Status
                </h2>
              </div>
              <ul className="space-y-2 text-[12px]">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Integration</span>
                  <span className="tac-value text-success">CONCEPTUAL</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vision Engine</span>
                  <span className="tac-value text-success">ONLINE</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Privacy</span>
                  <span className="tac-value text-success">COMPLIANT</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deployment</span>
                  <span className="tac-value text-warning">PROTOTYPE</span>
                </li>
              </ul>
            </Panel>

            <Panel className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                  External Links
                </h2>
              </div>
              <div className="space-y-2">
                <a
                  href="https://visiontrackcom.lovable.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-2 text-[12px] text-foreground hover:border-primary/40 hover:text-primary"
                >
                  VisionTrack Home <ArrowRight className="h-3 w-3" />
                </a>
                <a
                  href="https://visiontrackcom.lovable.app/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-2 text-[12px] text-foreground hover:border-primary/40 hover:text-primary"
                >
                  Live Dashboard <ArrowRight className="h-3 w-3" />
                </a>
                <a
                  href="https://visiontrackcom.lovable.app/cases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-2 text-[12px] text-foreground hover:border-primary/40 hover:text-primary"
                >
                  Cases Demo <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                  Use Cases
                </h2>
              </div>
              <ul className="space-y-2 text-[12px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">›</span>
                  <span>Missing-person search after natural disasters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">›</span>
                  <span>Crowd scanning at large public events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">›</span>
                  <span>Aerial search coordination with DroneRoute AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">›</span>
                  <span>Border and perimeter security monitoring</span>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
