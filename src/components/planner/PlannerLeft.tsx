import { Trash2, Square, Pentagon, Ban, MapPin, Home, Layers } from "lucide-react";
import { useMission } from "@/store/mission-store";
import { Panel, Stat } from "@/components/hud/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { polygonAreaM2, polygonPerimeterM } from "@/lib/mission/geo";
import { EGYPT_LOCATIONS, MISSION_TEMPLATES } from "@/lib/mission/egypt";
import type { MissionObjective, ZoneKind } from "@/lib/mission/types";
import { cn } from "@/lib/utils";

const OBJECTIVES: Array<{ id: MissionObjective; label: string; hint: string }> = [
  { id: "survey", label: "Area Survey", hint: "Maximum coverage of a selected region" },
  { id: "mapping", label: "Mapping", hint: "Systematic overlapping flight lines" },
  { id: "inspection", label: "Inspection", hint: "Focus on structures and points" },
  { id: "search", label: "Search", hint: "Prioritise complete area coverage" },
  { id: "custom", label: "Custom", hint: "Operator-defined mission profile" },
];

const ZONE_KINDS: Array<{ id: ZoneKind; label: string }> = [
  { id: "no-fly", label: "No-Fly Zone" },
  { id: "restricted", label: "Restricted Area" },
  { id: "obstacle", label: "Obstacle" },
  { id: "sensitive", label: "Sensitive Area" },
];

export function PlannerLeft() {
  const {
    area,
    zones,
    config,
    drones,
    drawMode,
    setDrawMode,
    pendingZoneKind,
    setPendingZoneKind,
    removeZone,
    updateConfig,
    selectDrone,
    clearMission,
    settings,
    updateSettings,
    locationKey,
    setLocation,
    templateId,
    applyTemplate,
  } = useMission();
  const location = EGYPT_LOCATIONS.find((l) => l.key === locationKey) ?? EGYPT_LOCATIONS[0]!;

  const areaM2 = area.length > 2 ? polygonAreaM2(area) : 0;
  const perimeter = area.length > 2 ? polygonPerimeterM(area) : 0;
  const footprint = 2 * config.altitude * Math.tan(((config.fov / 2) * Math.PI) / 180);
  const spacing = footprint * (1 - config.sideOverlap);
  const estCoverage = area.length > 2 ? Math.min(99, 88 + config.sideOverlap * 12) : 0;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <Panel title="Egypt Mission Areas">
        <div className="grid grid-cols-2 gap-1.5">
          {EGYPT_LOCATIONS.slice(0, 6).map((l) => (
            <button
              key={l.key}
              onClick={() => setLocation(l.key)}
              className={cn(
                "rounded-sm border px-2 py-1.5 text-left transition-colors",
                l.key === locationKey
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 hover:border-border hover:bg-secondary/50",
              )}
            >
              <div className="text-[11.5px] font-medium leading-tight text-foreground">{l.name}</div>
              <div className="label-mono mt-0.5 text-[9px]">{l.region}</div>
            </button>
          ))}
        </div>
        <div className="label-mono mt-2 flex flex-wrap gap-1">
          {location.focusAreas.map((f) => (
            <span key={f} className="rounded-full border border-border/70 px-2 py-0.5 text-[9px]">
              {f}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Mission Templates">
        <div className="space-y-1">
          {MISSION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className={cn(
                "w-full rounded-sm border px-2.5 py-1.5 text-left transition-colors",
                templateId === t.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 hover:border-border hover:bg-secondary/50",
              )}
            >
              <div className="text-[12px] font-medium text-foreground">{t.name}</div>
              <div className="text-[10.5px] leading-snug text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Survey Area">
        <div className="grid grid-cols-2 gap-1.5">
          <ToolButton active={drawMode === "area"} onClick={() => setDrawMode("area")} icon={Pentagon} label="Draw Polygon" />
          <ToolButton active={drawMode === "rect"} onClick={() => setDrawMode("rect")} icon={Square} label="Draw Rectangle" />
          <ToolButton active={drawMode === "marker"} onClick={() => setDrawMode("marker")} icon={MapPin} label="Add Marker" />
          <ToolButton active={drawMode === "home"} onClick={() => setDrawMode("home")} icon={Home} label="Set Home" />
        </div>

        {area.length > 2 ? (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Stat label="Area" value={`${(areaM2 / 1e6).toFixed(2)} km²`} />
            <Stat label="Perimeter" value={`${(perimeter / 1000).toFixed(2)} km`} />
            <Stat label="Est. Coverage" value={`${estCoverage.toFixed(0)}%`} tone="primary" />
            <Stat label="Line Spacing" value={`${spacing.toFixed(0)} m`} sub="Adaptive Grid" />
          </div>
        ) : (
          <p className="mt-3 rounded-sm border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
            No survey area defined. Draw a polygon on the map to begin mission planning.
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Select value={locationKey} onValueChange={(v) => setLocation(v as never)}>
            <SelectTrigger className="h-8 flex-1 text-[12px]">
              <SelectValue placeholder="Egypt mission area…" />
            </SelectTrigger>
            <SelectContent>
              {EGYPT_LOCATIONS.map((l) => (
                <SelectItem key={l.key} value={l.key}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" onClick={clearMission}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">
          {location.region} — {location.summary}
        </p>
      </Panel>

      <Panel title="Restricted Airspace">
        <div className="flex gap-1.5">
          <Select value={pendingZoneKind} onValueChange={(v) => setPendingZoneKind(v as ZoneKind)}>
            <SelectTrigger className="h-8 flex-1 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZONE_KINDS.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={drawMode === "zone" ? "default" : "outline"}
            className="h-8"
            onClick={() => setDrawMode("zone")}
          >
            <Ban className="mr-1 h-3.5 w-3.5" /> Draw
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          {zones.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              No restricted zones defined. Zones are operator-declared — this prototype does not
              ingest authoritative airspace data.
            </p>
          )}
          {zones.map((z) => (
            <div
              key={z.id}
              className="flex items-center justify-between rounded-sm border border-border/70 bg-background/40 px-2 py-1.5"
            >
              <div>
                <div className="text-[12px] text-foreground">{z.name}</div>
                <div className="label-mono">
                  {(polygonAreaM2(z.polygon) / 1e6).toFixed(2)} km² · {z.kind}
                </div>
              </div>
              <button onClick={() => removeZone(z.id)} className="text-muted-foreground hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Mission Objective">
        <div className="space-y-1">
          {OBJECTIVES.map((o) => (
            <button
              key={o.id}
              onClick={() => updateConfig({ objective: o.id })}
              className={cn(
                "w-full rounded-sm border px-2.5 py-1.5 text-left transition-colors",
                config.objective === o.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/70 hover:border-border hover:bg-secondary/50",
              )}
            >
              <div className="text-[12px] font-medium text-foreground">{o.label}</div>
              <div className="text-[10.5px] text-muted-foreground">{o.hint}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Drone Configuration">
        <div className="space-y-2.5">
          <Field label="Drone Model">
            <Select value={config.droneId} onValueChange={selectDrone}>
              <SelectTrigger className="h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {drones.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Battery Capacity (mAh)">
            <Select
              value={String(config.batteryCapacity)}
              onValueChange={(v) => updateConfig({ batteryCapacity: Number(v) })}
            >
              <SelectTrigger className="h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5000, 10000, 12000, 15000].map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c.toLocaleString()} mAh
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Camera">
              <Select value={config.camera} onValueChange={(v) => updateConfig({ camera: v as never })}>
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rgb">RGB</SelectItem>
                  <SelectItem value="thermal">Thermal</SelectItem>
                  <SelectItem value="multispectral">Multispectral</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Payload">
              <Select value={config.payload} onValueChange={(v) => updateConfig({ payload: v as never })}>
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="sensor">Sensor Package</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start Battery %">
              <Input
                type="number"
                className="h-8 text-[12px]"
                value={config.startBattery}
                min={10}
                max={100}
                onChange={(e) => updateConfig({ startBattery: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max Flight Time (min)">
              <Input
                type="number"
                className="h-8 text-[12px]"
                value={config.maxFlightTime}
                min={5}
                max={90}
                onChange={(e) => updateConfig({ maxFlightTime: Number(e.target.value) })}
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Flight Parameters">
        <div className="space-y-3.5">
          <SliderField
            label="Altitude"
            value={config.altitude}
            min={20}
            max={120}
            step={5}
            unit="m"
            onChange={(v) => updateConfig({ altitude: v })}
          />
          <SliderField
            label="Cruising Speed"
            value={config.speed}
            min={1}
            max={20}
            step={0.5}
            unit="m/s"
            onChange={(v) => updateConfig({ speed: v })}
          />
          <SliderField
            label="Camera FOV"
            value={config.fov}
            min={40}
            max={110}
            step={1}
            unit="°"
            onChange={(v) => updateConfig({ fov: v })}
          />
          <SliderField
            label="Image Overlap"
            value={config.frontOverlap * 100}
            min={60}
            max={90}
            step={1}
            unit="%"
            onChange={(v) => updateConfig({ frontOverlap: v / 100 })}
          />
          <SliderField
            label="Side Overlap"
            value={config.sideOverlap * 100}
            min={40}
            max={80}
            step={1}
            unit="%"
            onChange={(v) => updateConfig({ sideOverlap: v / 100 })}
          />
          <SliderField
            label="Return-to-Home Battery"
            value={config.rthThreshold}
            min={10}
            max={40}
            step={1}
            unit="%"
            onChange={(v) => updateConfig({ rthThreshold: v })}
          />
          <SliderField
            label="Safety Battery Reserve"
            value={config.safetyReserve}
            min={5}
            max={35}
            step={1}
            unit="%"
            onChange={(v) => updateConfig({ safetyReserve: v })}
          />
          <Field label="Wind Condition">
            <Select value={config.wind} onValueChange={(v) => updateConfig({ wind: v as never })}>
              <SelectTrigger className="h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Panel>

      <Panel title="Map Layer">
        <div className="grid grid-cols-2 gap-1.5">
          {(["dark", "satellite", "standard", "terrain"] as const).map((m) => (
            <ToolButton
              key={m}
              icon={Layers}
              label={m[0]!.toUpperCase() + m.slice(1)}
              active={settings.mapStyle === m}
              onClick={() => updateSettings({ mapStyle: m })}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="label-mono">{label}</Label>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="label-mono">{label}</Label>
        <span className="font-mono text-[12px] tabular-nums text-primary">
          {value % 1 === 0 ? value : value.toFixed(1)}
          {unit}
        </span>
      </div>
      <Slider
        className="mt-2"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? value)}
      />
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-sm border px-2 py-1.5 text-[11.5px] transition-colors",
        active
          ? "border-primary/60 bg-primary/12 text-primary"
          : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
