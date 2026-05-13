"use client";

import { useState, useCallback } from "react";
import { CampusMap } from "@/components/map/CampusMap";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Building, NavigationRoute } from "@/types/navigation";

export default function NavigatorPage() {
  const [route,        setRoute]        = useState<NavigationRoute | null>(null);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selected,     setSelected]     = useState<Building | null>(null);

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
      className="flex bg-grid"
      style={{ height: "calc(100vh - 95px)", background: "var(--bg-1)", overflow: "hidden" }}
    >
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

      <div className="flex-1 overflow-hidden">
        <CampusMap
          route={route?.path ?? []}
          selectedBuilding={selected}
          currentStep={currentStep}
          isNavigating={isNavigating}
          onBuildingClick={handleBuildingClick}
          height="calc(100vh - 95px)"
        />
      </div>
    </div>
  );
}