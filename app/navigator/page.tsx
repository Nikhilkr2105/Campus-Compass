"use client";

import { useState, useCallback } from "react";
import { CampusMap } from "@/components/map/CampusMap";
import { FloorMap } from "@/components/map/FloorMap";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Building } from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";

type NavigatorMode = "campus" | "indoor";

export default function NavigatorPage() {
  const [route,        setRoute]        = useState<NavigationRoute | null>(null);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selected,     setSelected]     = useState<Building | null>(null);
  const [mode,         setMode]         = useState<NavigatorMode>("campus");

  const handleBuildingClick = useCallback((b: Building) => {
    setSelected((prev) => prev?.id === b.id ? null : b);
  }, []);

  const handleCloseBuilding = useCallback(() => {
    setSelected(null);
  }, []);

  const handleNavigateTo = useCallback((name: string) => {
    // Sets destination; RoutePanel handles routing
    setSelected(null);
  }, []);

  const handleRouteFound = useCallback((r: NavigationRoute) => {
    setRoute(r);
    setCurrentStep(0);
    setIsNavigating(false);
  }, []);

  const handleStart = useCallback(() => {
    setIsNavigating(true);
    setCurrentStep(0);
  }, []);

  const handleStop = useCallback(() => {
    setIsNavigating(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, (route?.buildings.length ?? 1) - 1));
  }, [route]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleClear = useCallback(() => {
    setRoute(null);
    setCurrentStep(0);
    setIsNavigating(false);
  }, []);

  return (
    <div
      className="bg-grid"
      style={{
        height: "100vh",
        paddingTop: 95,
        background: "var(--bg-1)",
        overflow: "hidden",
      }}
    >
      <div className="flex h-full overflow-hidden">
        {mode === "campus" && (
          <Sidebar
            selectedBuilding={selected}
            route={route}
            isNavigating={isNavigating}
            currentStep={currentStep}
            onRouteFound={handleRouteFound}
            onStart={handleStart}
            onStop={handleStop}
            onNext={handleNext}
            onPrev={handlePrev}
            onClear={handleClear}
            onCloseBuilding={handleCloseBuilding}
            onNavigateTo={handleNavigateTo}
          />
        )}

        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute top-4 right-4 z-30 flex rounded-xl overflow-hidden"
            style={{
              background: "rgba(6,13,24,0.92)",
              border: "1px solid rgba(0,212,255,0.18)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {([
              { id: "campus", label: "Campus Map" },
              { id: "indoor", label: "Indoor Map" },
            ] as const).map((item) => {
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className="px-4 py-2 text-[12px] font-semibold transition-colors"
                  style={{
                    background: active ? "rgba(0,212,255,0.12)" : "transparent",
                    color: active ? "var(--cyan)" : "var(--text-2)",
                    border: "none",
                    borderRight: item.id === "campus" ? "1px solid rgba(255,255,255,0.06)" : "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {mode === "campus" ? (
            <CampusMap
              route={route?.path ?? []}
              selectedBuilding={selected}
              currentStep={currentStep}
              isNavigating={isNavigating}
              onBuildingClick={handleBuildingClick}
              height="100%"
            />
          ) : (
            <div className="h-full p-4 pt-16">
              <FloorMap />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
