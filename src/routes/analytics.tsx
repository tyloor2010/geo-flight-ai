import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Stat } from "@/components/hud/primitives";
import { useMission } from "@/store/mission-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — DroneRoute AI" },
      { name: "description", content: "Fleet-wide drone mission analytics: efficiency trends, coverage, battery consumption and flight distance." },
      { property: "og:title", content: "Analytics — DroneRoute AI" },
      { property: "og:description", content: "Efficiency, coverage and battery analytics across all simulated missions." },
    ],
  }),
  component: Analytics,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };

function Analytics() {
  const history = useMission((s) => s.history);
  const data = [...history].reverse().map((m) => ({
    name: m.id,
    efficiency: m.efficiency,
    coverage: Math.round(m.coverage * 100),
    battery: m.batteryUsed,
    distance: m.distanceKm,
  }));
  const totalKm = history.reduce((a, m) => a + m.distanceKm, 0);
  const totalTime = history.reduce((a, m) => a + m.durationSec, 0);
  const avgEff = Math.round(history.reduce((a, m) => a + m.efficiency, 0) / (history.length || 1));
  const avgCov = (history.reduce((a, m) => a + m.coverage, 0) / (history.length || 1)) * 100;
  const events = history.reduce((a, m) => a + m.events.filter((e) => e.level !== "info").length, 0);
  const success = Math.round((history.filter((m) => m.status === "completed").length / (history.length || 1)) * 100);

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Analytics</h1>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Stat label="Total Missions" value={history.length} />
          <Stat label="Flight Distance" value={`${totalKm.toFixed(1)} km`} tone="primary" />
          <Stat label="Flight Time" value={`${Math.round(totalTime / 60)} min`} />
          <Stat label="Avg Efficiency" value={`${avgEff}`} tone="success" />
          <Stat label="Avg Coverage" value={`${avgCov.toFixed(1)}%`} tone="primary" />
          <Stat label="Safety Events" value={events} tone="warning" />
          <Stat label="Success Rate" value={`${success}%`} tone="success" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Mission Efficiency Over Time">
            <ChartFrame>
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis domain={[60, 100]} {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="efficiency" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartFrame>
          </Panel>
          <Panel title="Coverage Percentage">
            <ChartFrame>
              <AreaChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis domain={[70, 100]} {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area dataKey="coverage" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
              </AreaChart>
            </ChartFrame>
          </Panel>
          <Panel title="Battery Consumption">
            <ChartFrame>
              <BarChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="battery" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartFrame>
          </Panel>
          <Panel title="Flight Distance">
            <ChartFrame>
              <BarChart data={data}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="distance" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartFrame>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

const tooltipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  fontSize: 12,
};

function ChartFrame({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
