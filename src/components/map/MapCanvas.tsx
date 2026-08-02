import { Suspense, lazy, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MissionMap = lazy(() => import("@/components/map/MissionMap"));

export function MapCanvas({ height = "100%" }: { height?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <MapSkeleton />;
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MissionMap height={height} />
    </Suspense>
  );
}

function MapSkeleton() {
  return (
    <div className="grid-bg relative flex h-full w-full items-center justify-center bg-background">
      <div className="w-64 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-52" />
        <div className="label-mono pt-2">Initialising geospatial engine…</div>
      </div>
    </div>
  );
}
