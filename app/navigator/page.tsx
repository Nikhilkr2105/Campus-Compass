"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CampusMap }      from "@/components/map/CampusMap";
import { FloorMap }       from "@/components/map/FloorMap";
import { Sidebar }        from "@/components/navigation/Sidebar";
import { CommandPalette } from "@/components/navigation/CommandPalette";

import { Building }         from "@/data/buildings";
import { NavigationRoute }  from "@/types/navigation";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type NavigatorMode = "campus" | "indoor";

type CampusCondition = {
  label:   string;
  detail:  string;
  color:   string;
  dot:     string;
};

// ─────────────────────────────────────────────────────────────
// CAMPUS CONDITIONS — time-aware ambient context
// ─────────────────────────────────────────────────────────────

function getCampusCondition(): CampusCondition {
  const h = new Date().getHours();

  if (h >= 6  && h < 9)  return { label: "Morning Commute",  detail: "Campus filling up",         color: "rgba(100,180,255,0.75)", dot: "#60b4ff" };
  if (h >= 9  && h < 12) return { label: "Peak Activity",    detail: "High foot traffic",          color: "rgba(251,191,36,0.85)",  dot: "#fbbf24" };
  if (h >= 12 && h < 14) return { label: "Lunch Rush",       detail: "Cafeteria & commons busy",   color: "rgba(249,115,22,0.85)",  dot: "#f97316" };
  if (h >= 14 && h < 17) return { label: "Afternoon Session",detail: "Classes in progress",        color: "rgba(0,212,255,0.8)",    dot: "#00d4ff" };
  if (h >= 17 && h < 20) return { label: "Evening Wind-down",detail: "Reducing activity",          color: "rgba(139,92,246,0.8)",   dot: "#8b5cf6" };
  if (h >= 20 && h < 23) return { label: "Quiet Hours",      detail: "Limited services active",    color: "rgba(148,163,184,0.7)",  dot: "#94a3b8" };
  return                         { label: "Night Mode",       detail: "Campus security active",     color: "rgba(100,116,139,0.65)", dot: "#64748b" };
}

// ─────────────────────────────────────────────────────────────
// STEP COUNTDOWN — progress ring for auto-advance
// ─────────────────────────────────────────────────────────────

function StepCountdown({
  isNavigating,
  currentStep,
  totalSteps,
  intervalMs = 4000,
}: {
  isNavigating: boolean;
  currentStep:  number;
  totalSteps:   number;
  intervalMs?:  number;
}) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | null>(null);
  const isLast   = currentStep >= totalSteps - 1;

  useEffect(() => {
    if (!isNavigating || isLast) {
      setProgress(0);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      setProgress(Math.min(elapsed / intervalMs, 1));
      if (elapsed < intervalMs) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isNavigating, currentStep, isLast, intervalMs]);

  if (!isNavigating || isLast) return null;

  const r   = 10;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative w-7 h-7 flex items-center justify-center flex-shrink-0" title="Auto-advancing">
      <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="14" cy="14" r={r}
          fill="none"
          stroke="rgba(0,212,255,0.12)"
          strokeWidth="2"
        />
        {/* Progress */}
        <circle cx="14" cy="14" r={r}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{
            filter:     "drop-shadow(0 0 3px rgba(0,212,255,0.8))",
            transition: "stroke-dashoffset 0.08s linear",
          }}
        />
      </svg>
      {/* Inner dot */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          background: "#00d4ff",
          boxShadow:  "0 0 6px #00d4ff",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONDITION STRIP — ambient campus status bar
// ─────────────────────────────────────────────────────────────

function ConditionStrip({ condition }: { condition: CampusCondition }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="absolute bottom-14 left-1/2 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full pointer-events-none"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:     "rgba(6,13,24,0.78)",
        border:         "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(14px)",
        transform:      "translateX(-50%)",
        whiteSpace:     "nowrap",
      }}
    >
      {/* Condition dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: condition.dot,
          boxShadow:  `0 0 5px ${condition.dot}`,
          animation:  "cond-blink 2.5s ease-in-out infinite",
        }}
      />
      <span
        className="text-[10px] font-semibold"
        style={{ color: condition.color, fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
      >
        {condition.label}
      </span>
      <span
        className="text-[9px]"
        style={{ color: "rgba(240,244,255,0.35)", fontFamily: "var(--font-body)" }}
      >
        ·
      </span>
      <span
        className="text-[9px]"
        style={{ color: "rgba(240,244,255,0.45)", fontFamily: "var(--font-body)" }}
      >
        {condition.detail}
      </span>
    </motion.div>
  );
}




// ─────────────────────────────────────────────────────────────
// KEYFRAMES — injected once
// ─────────────────────────────────────────────────────────────

const NAV_KEYFRAMES = `
@keyframes live-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.3; }
}
@keyframes cond-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.45; }
}
`;

// ─────────────────────────────────────────────────────────────
// NAVIGATOR PAGE
// ─────────────────────────────────────────────────────────────

export default function NavigatorPage() {
  const [route,      setRoute]      = useState<NavigationRoute | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selected,   setSelected]   = useState<Building | null>(null);
  const [mode,       setMode]       = useState<NavigatorMode>("campus");
  const [condition,  setCondition]  = useState<CampusCondition>(getCampusCondition);
  const [plannerSource, setPlannerSource] = useState("");
  const [plannerDestination, setPlannerDestination] = useState("");

  // Refresh condition every 60s
  useEffect(() => {
    const iv = setInterval(() => setCondition(getCampusCondition()), 60_000);
    return () => clearInterval(iv);
  }, []);

  // ─────────────────────────────────────────────
  // BUILDING
  // ─────────────────────────────────────────────

  const handleBuildingClick = useCallback((b: Building) => {
    setSelected((prev) => (prev?.id === b.id ? null : b));
  }, []);

  const handleCloseBuilding = useCallback(() => setSelected(null), []);

  const handlePlannerDestinationChange = useCallback((name: string) => {
    setPlannerDestination(name);
    setMode("campus");
  }, []);

  const handleNavigateTo = useCallback((name: string) => {
    handlePlannerDestinationChange(name);
    setSelected(null);
  }, [handlePlannerDestinationChange]);

  // ─────────────────────────────────────────────
  // ROUTE
  // ─────────────────────────────────────────────

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

 

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <>
      <style suppressHydrationWarning>{NAV_KEYFRAMES}</style>

      <motion.div
        className="bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          height:     "100vh",
          paddingTop: 95,
          background: "var(--bg-1)",
          overflow:   "hidden",
          willChange: "opacity",
        }}
      >
        <div className="relative flex h-full overflow-hidden">

          {/* ── SIDEBAR ── */}
          <AnimatePresence mode="wait">
            {mode === "campus" && (
              <motion.div
                key="sidebar"
                className="absolute inset-y-0 left-0 z-30 md:relative md:inset-auto md:z-auto"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0,   opacity: 1 }}
                exit={{    x: -24, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", willChange: "transform, opacity" }}
              >
                <Sidebar
                  selectedBuilding={selected}
                  plannerSource={plannerSource}
                  plannerDestination={plannerDestination}
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
                  onPlannerSourceChange={setPlannerSource}
                  onPlannerDestinationChange={setPlannerDestination}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── MAIN ── */}
          <div className="relative flex-1 overflow-hidden">

            

            {/* ── MODE TOGGLE ── */}
            <div
              className="absolute top-4 right-4 z-30 flex rounded-2xl overflow-hidden p-1"
              style={{
                background:     "rgba(6,13,24,0.85)",
                border:         "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                boxShadow:      "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {([ { id: "campus", label: "Campus Map" }, { id: "indoor", label: "Indoor Map" } ] as const).map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className="relative px-4 py-2 text-[11px] font-semibold transition-all duration-300"
                    style={{
                      background: "transparent",
                      color:      active ? "#ffffff" : "rgba(240,244,255,0.5)",
                      border:     "none",
                      cursor:     "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ 
                          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", 
                          zIndex: -1,
                          boxShadow: "0 2px 10px rgba(14,165,233,0.3)"
                        }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* ── MAP CONTENT ── */}
            <AnimatePresence mode="wait">
              {mode === "campus" ? (
                <motion.div
                  key="campus"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{    opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  style={{ willChange: "opacity" }}
                >
                  <CampusMap
                    route={route?.path ?? []}
                    selectedBuilding={selected}
                    currentStep={currentStep}
                    isNavigating={isNavigating}
                    onBuildingClick={handleBuildingClick}
                    height="100%"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="indoor"
                  className="h-full p-4 pt-16"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1    }}
                  exit={{    opacity: 0, scale: 0.99  }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <FloorMap />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CONDITION STRIP ── */}
            {mode === "campus" && (
              <ConditionStrip condition={condition} />
            )}

            {/* ── COMMAND PALETTE ── */}
            <CommandPalette
              onSelectDestination={handlePlannerDestinationChange}
              onSelectBuilding={(b)  => setSelected(b)}
              onSetSource={(name) => {
                setPlannerSource(name);
                setMode("campus");
              }}
              currentSource={plannerSource}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
