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
          {isNavigating && route && (
  <div
    className="absolute top-4 left-1/2 -translate-x-1/2 z-40"
    style={{
      width: "min(520px, calc(100vw - 40px))",
    }}
  >
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(6,13,24,0.88)",
        border: "1px solid rgba(0,212,255,0.18)",
        backdropFilter: "blur(20px)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(0,212,255,0.08)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <div
            className="text-[11px] tracking-[0.24em]"
            style={{
              color: "var(--cyan)",
              fontFamily: "var(--font-body)",
            }}
          >
            LIVE NAVIGATION
          </div>

          <div
            className="mt-1 text-lg font-semibold"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-display)",
            }}
          >
            Proceed to{" "}
            {route.buildings[
              Math.min(
                currentStep + 1,
                route.buildings.length - 1
              )
            ]?.name ?? "Destination"}
          </div>
        </div>

        <div
          className="px-3 py-1 rounded-full text-sm"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.16)",
            color: "var(--cyan)",
          }}
        >
          {Math.max(
            1,
            route.estimatedMinutes - currentStep
          )} min
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${
                ((currentStep + 1) /
                  route.buildings.length) *
                100
              }%`,
              background:
                "linear-gradient(90deg,#00d4ff,#8b5cf6)",
              boxShadow:
                "0 0 16px rgba(0,212,255,0.35)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mt-4">
          {route.buildings.map((b, idx) => {
            const active = idx <= currentStep;

            return (
              <div
                key={b.id}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: active
                      ? "var(--cyan)"
                      : "rgba(255,255,255,0.12)",
                    boxShadow: active
                      ? "0 0 14px rgba(0,212,255,0.45)"
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />

                <div
                  className="text-[10px] text-center max-w-[72px]"
                  style={{
                    color: active
                      ? "var(--text-1)"
                      : "var(--text-3)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {b.shortName}
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrival state */}
        {currentStep >=
          route.buildings.length - 1 && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-center"
            style={{
              background:
                "rgba(16,185,129,0.08)",
              border:
                "1px solid rgba(16,185,129,0.18)",
              color: "#10b981",
              fontWeight: 600,
              boxShadow:
                "0 0 24px rgba(16,185,129,0.12)",
            }}
          >
            ✨ You have arrived at your destination
          </div>
        )}
      </div>
    </div>
  </div>
)}
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
