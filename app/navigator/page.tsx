"use client";

import { useState, useCallback } from "react";
import { CampusMap } from "@/components/CampusMap";
import { Sidebar } from "@/components/Sidebar";
import { BUILDINGS, PATH_EDGES } from "@/data/buildings";
import { buildGraph, dijkstra, distToMinutes } from "@/lib/dijkstra";
import { Building, NavigationRoute } from "@/types/navigation";

export default function NavigatorPage() {
  const [source,       setSource]       = useState("");
  const [destination,  setDestination]  = useState("");
  const [route,        setRoute]        = useState<NavigationRoute | null>(null);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selected,     setSelected]     = useState<Building | null>(null);

  const findRoute = useCallback(() => {
    const srcB = BUILDINGS.find((b) =>
      b.name.toLowerCase().includes(source.toLowerCase()) || b.id === source
    );
    const dstB = BUILDINGS.find((b) =>
      b.name.toLowerCase().includes(destination.toLowerCase()) || b.id === destination
    );
    if (!srcB || !dstB) return;

    const graph  = buildGraph(PATH_EDGES, BUILDINGS, false);
    const result = dijkstra(graph, srcB.id, dstB.id);
    if (!result.found) return;

    const buildings = result.path
      .map((id) => BUILDINGS.find((b) => b.id === id)!)
      .filter(Boolean);

    setRoute({
      path: result.path, buildings,
      totalDistance: result.distance,
      estimatedMinutes: distToMinutes(result.distance),
      accessible: false,
    });
    setCurrentStep(0);
    setIsNavigating(false);
  }, [source, destination]);

  return (
    <div
      className="flex bg-grid"
      style={{ height: "calc(100vh - 95px)", background: "var(--bg-1)" }}
    >
      {/* Sidebar */}
      <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <Sidebar
          source={source}
          destination={destination}
          route={route}
          isNavigating={isNavigating}
          currentStep={currentStep}
          selectedBuilding={selected}
          onSourceChange={setSource}
          onDestChange={setDestination}
          onFindRoute={findRoute}
          onSwap={() => { setSource(destination); setDestination(source); setRoute(null); }}
          onStart={() => setIsNavigating(true)}
          onStop={() => setIsNavigating(false)}
          onNext={() => setCurrentStep((s) => Math.min(s + 1, (route?.buildings.length ?? 1) - 1))}
          onPrev={() => setCurrentStep((s) => Math.max(0, s - 1))}
          onClear={() => { setRoute(null); setIsNavigating(false); setCurrentStep(0); }}
          onCloseBuilding={() => setSelected(null)}
          onNavigateTo={(name) => { setDestination(name); setSelected(null); }}
        />
      </div>

      {/* Map */}
      <div className="flex-1">
        <CampusMap
          route={route?.path ?? []}
          selectedBuilding={selected}
          currentStep={currentStep}
          isNavigating={isNavigating}
          onBuildingClick={(b) => {
            setSelected((prev) => prev?.id === b.id ? null : b);
          }}
        />
      </div>
    </div>
  );
}