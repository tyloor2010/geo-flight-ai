import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
  dense,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section className={cn("glass-panel rounded-md", className)}>
      {title && (
        <header className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="label-mono text-foreground/80">{title}</h3>
          {action}
        </header>
      )}
      <div className={dense ? "p-2" : "p-3"}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];
  return (
    <div className="rounded-sm border border-border/70 bg-background/40 px-3 py-2">
      <div className="label-mono">{label}</div>
      <div className={cn("mt-1 font-mono text-[17px] font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function StatusDot({
  tone = "success",
  label,
  pulse,
}: {
  tone?: "success" | "warning" | "danger" | "muted";
  label: string;
  pulse?: boolean;
}) {
  const color = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-muted-foreground",
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", color, pulse && "animate-pulse")} />
      {label}
    </span>
  );
}

export function Meter({
  label,
  value,
  tone = "primary",
  suffix = "%",
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "warning" | "danger";
  suffix?: string;
}) {
  const bar = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", bar)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const tone = score >= 90 ? "var(--success)" : score >= 75 ? "var(--primary)" : "var(--warning)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--secondary)" strokeWidth="7" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, score)) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[30px] font-bold leading-none tabular-nums text-foreground">
          {Math.round(score)}
        </span>
        <span className="label-mono mt-1">/ 100</span>
      </div>
    </div>
  );
}
