import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/hud/primitives";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMission } from "@/store/mission-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DroneRoute AI" },
      { name: "description", content: "Configure units, map style, default flight parameters, safety thresholds and simulation speed." },
      { property: "og:title", content: "Settings — DroneRoute AI" },
      { property: "og:description", content: "Operator preferences and safety thresholds for DroneRoute AI." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useMission();
  const row = (label: string, node: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <Label className="text-[13px] text-foreground">{label}</Label>
      <div className="w-[220px]">{node}</div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="font-display text-2xl uppercase tracking-wide">Settings</h1>
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Display">
            {row(
              "Units",
              <Select value={settings.units} onValueChange={(v) => updateSettings({ units: v as never })}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>,
            )}
            {row(
              "Map Style",
              <Select value={settings.mapStyle} onValueChange={(v) => updateSettings({ mapStyle: v as never })}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["dark", "satellite", "standard", "terrain"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>,
            )}
            {row("Presentation Mode", <Switch checked={settings.presentationMode} onCheckedChange={(v) => updateSettings({ presentationMode: v })} />)}
            {row("Camera Follows Drone", <Switch checked={settings.followDrone} onCheckedChange={(v) => updateSettings({ followDrone: v })} />)}
          </Panel>
          <Panel title="Flight Defaults & Safety">
            {row("Default Altitude", <SliderRow value={settings.defaultAltitude} min={20} max={120} unit="m" onChange={(v) => updateSettings({ defaultAltitude: v })} />)}
            {row("Default Speed", <SliderRow value={settings.defaultSpeed} min={1} max={20} unit="m/s" onChange={(v) => updateSettings({ defaultSpeed: v })} />)}
            {row("Battery Reserve", <SliderRow value={settings.batteryReserve} min={5} max={35} unit="%" onChange={(v) => updateSettings({ batteryReserve: v })} />)}
            {row("RTH Threshold", <SliderRow value={settings.rthThreshold} min={10} max={40} unit="%" onChange={(v) => updateSettings({ rthThreshold: v })} />)}
            {row("Simulation Speed", <SliderRow value={settings.simulationSpeed} min={1} max={60} unit="×" onChange={(v) => updateSettings({ simulationSpeed: v })} />)}
            {row("Safety Alerts", <Switch checked={settings.safetyAlerts} onCheckedChange={(v) => updateSettings({ safetyAlerts: v })} />)}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function SliderRow({ value, min, max, unit, onChange }: { value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Slider className="flex-1" value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v ?? value)} />
      <span className="w-14 text-right font-mono text-[12px] text-primary">{value}{unit}</span>
    </div>
  );
}
