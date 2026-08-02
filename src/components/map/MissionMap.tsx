import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Check, X } from "lucide-react";
import { useMission } from "@/store/mission-store";
import { polygonAreaM2 } from "@/lib/mission/geo";
import type { LatLng } from "@/lib/mission/types";
import { Button } from "@/components/ui/button";

const TILES: Record<string, { url: string; attr: string }> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; OpenStreetMap &copy; CARTO',
  },
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenStreetMap contributors",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Imagery &copy; Esri",
  },
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    attr: "Terrain &copy; Esri",
  },
};

const ZONE_COLORS: Record<string, string> = {
  "no-fly": "#ef4444",
  restricted: "#f59e0b",
  obstacle: "#fb923c",
  sensitive: "#a78bfa",
};

function droneIcon(heading: string) {
  return L.divIcon({
    className: "drone-marker",
    html: `<div style="position:relative;width:34px;height:34px">
      <div style="position:absolute;inset:0;border-radius:9999px;border:1px solid rgba(56,189,248,.5);animation:pulse-ring 2s ease-out infinite"></div>
      <div style="position:absolute;inset:9px;border-radius:9999px;background:#38bdf8;box-shadow:0 0 14px #38bdf8"></div>
      <div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);font:600 9px/1 ui-monospace,monospace;color:#7dd3fc;white-space:nowrap">${heading}</div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border:2px solid #4ade80;border-radius:3px;background:rgba(74,222,128,.18);display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:#4ade80"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const poiIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border:2px solid #38bdf8;border-radius:9999px;background:rgba(56,189,248,.25)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function DrawLayer({
  draft,
  setDraft,
}: {
  draft: LatLng[];
  setDraft: (p: LatLng[]) => void;
}) {
  const drawMode = useMission((s) => s.drawMode);
  const setArea = useMission((s) => s.setArea);
  const addZone = useMission((s) => s.addZone);
  const addMarker = useMission((s) => s.addMarker);
  const setHome = useMission((s) => s.setHome);

  useMapEvents({
    click(e) {
      const p = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (drawMode === "none") return;
      if (drawMode === "home") return setHome(p);
      if (drawMode === "marker") return addMarker(p);
      if (drawMode === "rect") {
        if (draft.length === 0) return setDraft([p]);
        const a = draft[0]!;
        setArea([
          a,
          { lat: a.lat, lng: p.lng },
          p,
          { lat: p.lat, lng: a.lng },
        ]);
        setDraft([]);
        return;
      }
      setDraft([...draft, p]);
    },
    dblclick() {
      if (draft.length < 3) return;
      if (drawMode === "area") setArea(draft);
      if (drawMode === "zone") addZone(draft);
      setDraft([]);
    },
  });

  if (draft.length === 0) return null;
  const color = drawMode === "zone" ? ZONE_COLORS["no-fly"]! : "#38bdf8";
  return (
    <>
      {draft.length > 1 && (
        <Polyline positions={draft.map((p) => [p.lat, p.lng])} pathOptions={{ color, weight: 2, dashArray: "6 6" }} />
      )}
      {draft.map((p, i) => (
        <Circle
          key={i}
          center={[p.lat, p.lng]}
          radius={12}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1 }}
        />
      ))}
    </>
  );
}

function MapController({ follow }: { follow: LatLng | null }) {
  const map = useMap();
  const area = useMission((s) => s.area);
  const followDrone = useMission((s) => s.settings.followDrone);
  const simStatus = useMission((s) => s.simStatus);

  useEffect(() => {
    if (area.length > 2) {
      map.fitBounds(area.map((p) => [p.lat, p.lng] as [number, number]), { padding: [70, 70] });
    }
  }, [area, map]);

  useEffect(() => {
    if (follow && followDrone && simStatus === "running") {
      map.panTo([follow.lat, follow.lng], { animate: true, duration: 0.4 });
    }
  }, [follow, followDrone, simStatus, map]);

  return null;
}

export default function MissionMap({ height = "100%" }: { height?: string }) {
  const {
    area,
    zones,
    markers,
    home,
    routes,
    selectedStrategy,
    selectedWaypoint,
    selectWaypoint,
    simPosition,
    simHeading,
    simStatus,
    drawMode,
    setDrawMode,
    setArea,
    addZone,
    settings,
  } = useMission();
  const [draft, setDraft] = useState<LatLng[]>([]);
  const route = routes.find((r) => r.strategy === selectedStrategy) ?? null;
  const tiles = TILES[settings.mapStyle] ?? TILES["dark"]!;

  useEffect(() => {
    if (drawMode === "none") setDraft([]);
  }, [drawMode]);

  const waypointDots = useMemo(() => {
    if (!route) return [];
    const step = Math.max(1, Math.floor(route.waypoints.length / 70));
    return route.waypoints.filter((_, i) => i % step === 0);
  }, [route]);

  const center: [number, number] = area.length
    ? [area[0]!.lat, area[0]!.lng]
    : [31.2156, 29.9553];

  return (
    <div className="relative h-full w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        zoomControl
        doubleClickZoom={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={tiles.url} attribution={tiles.attr} />
        <MapController follow={simPosition} />
        <DrawLayer draft={draft} setDraft={setDraft} />

        {area.length > 2 && (
          <Polygon
            positions={area.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#38bdf8", weight: 1.5, fillColor: "#38bdf8", fillOpacity: 0.07 }}
          >
            <Tooltip sticky>Survey Area — {(polygonAreaM2(area) / 1e6).toFixed(2)} km²</Tooltip>
          </Polygon>
        )}

        {zones.map((z) => (
          <Polygon
            key={z.id}
            positions={z.polygon.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: ZONE_COLORS[z.kind] ?? "#ef4444",
              weight: 1.5,
              fillColor: ZONE_COLORS[z.kind] ?? "#ef4444",
              fillOpacity: 0.18,
              dashArray: "5 5",
            }}
          >
            <Tooltip sticky>{z.name}</Tooltip>
          </Polygon>
        ))}

        {route && (
          <>
            <Polyline
              positions={route.path.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#0ea5e9", weight: 5, opacity: 0.18 }}
            />
            <Polyline
              className="route-dash"
              positions={route.path.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#38bdf8", weight: 2 }}
            />
            <Polyline
              positions={route.rthPath.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#4ade80", weight: 2, dashArray: "8 6" }}
            >
              <Tooltip sticky>Return-to-Home path</Tooltip>
            </Polyline>
            {waypointDots.map((w) => (
              <Circle
                key={w.id}
                center={[w.position.lat, w.position.lng]}
                radius={simStatus === "idle" ? 9 : 8}
                eventHandlers={{ click: () => selectWaypoint(w.index) }}
                pathOptions={{
                  color: selectedWaypoint === w.index ? "#fbbf24" : "#7dd3fc",
                  fillColor: selectedWaypoint === w.index ? "#fbbf24" : "#0ea5e9",
                  fillOpacity: 0.9,
                  weight: 1,
                }}
              >
                <Tooltip>{`${w.id} · ${w.altitude}m · ${Math.round(w.battery)}%`}</Tooltip>
              </Circle>
            ))}
          </>
        )}

        {markers.map((m) => (
          <Marker key={m.id} position={[m.position.lat, m.position.lng]} icon={poiIcon}>
            <Tooltip>{m.label}</Tooltip>
          </Marker>
        ))}

        {home && (
          <Marker position={[home.lat, home.lng]} icon={homeIcon}>
            <Tooltip>Home / Launch Point</Tooltip>
          </Marker>
        )}

        {simPosition && simStatus !== "idle" && (
          <Marker position={[simPosition.lat, simPosition.lng]} icon={droneIcon(simHeading)} />
        )}
      </MapContainer>

      {drawMode !== "none" && (
        <div className="pointer-events-auto absolute left-1/2 top-4 z-[500] -translate-x-1/2">
          <div className="glass-panel flex items-center gap-3 rounded-md px-3 py-2">
            <span className="label-mono">
              {drawMode === "area" && "Click to add vertices · double-click to finish"}
              {drawMode === "rect" && (draft.length ? "Click opposite corner" : "Click first corner")}
              {drawMode === "zone" && "Draw restricted zone · double-click to finish"}
              {drawMode === "home" && "Click to place home point"}
              {drawMode === "marker" && "Click to place point of interest"}
            </span>
            {(drawMode === "area" || drawMode === "zone") && draft.length > 2 && (
              <Button
                size="sm"
                className="h-7"
                onClick={() => {
                  if (drawMode === "area") setArea(draft);
                  else addZone(draft);
                  setDraft([]);
                }}
              >
                <Check className="mr-1 h-3 w-3" /> Finish
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() => {
                setDraft([]);
                setDrawMode("none");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
