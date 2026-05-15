"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation, ArrowUpDown, X,
  ChevronLeft, ChevronRight, StopCircle,
  MapPin, Search, Clock, Route, Zap,
  Accessibility, AlertCircle, CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { BUILDINGS, SEARCH_TERMS, Building, PATH_EDGES, getBuildingById } from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";
import { buildGraph, dijkstra, distToMinutes } from "@/lib/dijkstra";

interface RoutePanelProps {
  route:           NavigationRoute | null;
  isNavigating:    boolean;
  currentStep:     number;
  onRouteFound:    (r: NavigationRoute) => void;
  onStart:         () => void;
  onStop:          () => void;
  onNext:          () => void;
  onPrev:          () => void;
  onClear:         () => void;
  onDestChange:    (name: string) => void;
}

function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items
    .map((item) => {
      const itemLower = item.toLowerCase();
      let score = 0;
      let queryIdx = 0;

      for (let i = 0; i < itemLower.length && queryIdx < q.length; i++) {
        if (itemLower[i] === q[queryIdx]) {
          score += queryIdx === 0 ? 10 : 1;
          queryIdx++;
        }
      }

      if (queryIdx !== q.length) return null;
      if (itemLower.includes(q)) score += 5;
      if (itemLower.startsWith(q)) score += 15;

      return { item, score };
    })
    .filter((x): x is { item: string; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item)
    .slice(0, 8);
}

function SmartSearch({
  value, onChange, placeholder, color = "var(--cyan)",
  onHoverBuilding, onUnhoverBuilding,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  color?: string;
  onHoverBuilding?: (name: string | null) => void;
  onUnhoverBuilding?: () => void;
}) {
  const [focused,  setFocused]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return fuzzySearch(value, SEARCH_TERMS);
  }, [value]);

  const showDrop = focused && filtered.length > 0;

  const handleSelect = (s: string) => {
    setLoading(true);
    onChange(s);
    setActiveIdx(0);
    setTimeout(() => setLoading(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filtered[activeIdx]);
      setFocused(false);
    }
  };

  useEffect(() => {
    if (showDrop && filtered[activeIdx]) {
      onHoverBuilding?.(filtered[activeIdx]);
    }
  }, [activeIdx, showDrop, filtered, onHoverBuilding]);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-300"
        style={{
          background:  focused ? `${color}0a` : "rgba(255,255,255,0.04)",
          border:      `1px solid ${focused ? `${color}66` : "rgba(255,255,255,0.09)"}`,
          boxShadow:   focused ? `0 0 0 3px ${color}12` : "none",
        }}
      >
        {loading
          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent flex-shrink-0 animate-spin" style={{ borderColor: `${color}66`, borderTopColor: "transparent" }} />
          : <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: focused ? color : "var(--text-3)" }} />
        }
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setActiveIdx(0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); onUnhoverBuilding?.(); }, 180)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
        />
        {value && (
          <button
            onClick={() => { onChange(""); setActiveIdx(0); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDrop && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: -6, scale: 0.98    }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background:    "rgba(6,13,24,0.98)",
              border:        "1px solid rgba(0,212,255,0.2)",
              backdropFilter:"blur(24px)",
              boxShadow:     "0 16px 40px rgba(0,0,0,0.5)",
            }}
          >
            {filtered.map((s, i) => (
              <button
                key={s}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => { setActiveIdx(i); onHoverBuilding?.(s); }}
                onMouseLeave={() => onUnhoverBuilding?.()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors"
                style={{
                  color:        i === activeIdx ? color : "var(--text-1)",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  fontFamily:   "var(--font-body)",
                  background:   i === activeIdx ? `${color}0d` : "transparent",
                  border:       "none",
                  cursor:       "pointer",
                  fontWeight:   i === activeIdx ? 500 : 400,
                }}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: i === activeIdx ? color : "var(--cyan)" }} />
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BUILDING_CATEGORIES = {
  Academic: ["Central Library", "Central Seminar Hall", "Department Building"],
  Dining: ["Main Student Canteen", "Faculty Lounge"],
  Health: ["Medical Center & Dispensary", "Mental Health Center"],
  Administrative: ["Administrative Block", "Registrar Office"],
  Sports: ["Sports Complex & Gym"],
  Other: [],
};

const QUICK = [
  { name: "Central Library",         icon: "📚" },
  { name: "Main Student Canteen",    icon: "🍽️" },
  { name: "Medical Center & Dispensary", icon: "🏥" },
  { name: "Administrative Block",    icon: "🏢" },
  { name: "Sports Complex & Gym",    icon: "⚽" },
  { name: "Central Seminar Hall",    icon: "🎓" },
];

export function RoutePanel({
  route, isNavigating, currentStep,
  onRouteFound, onStart, onStop, onNext, onPrev, onClear, onDestChange,
}: RoutePanelProps) {
  const [source,      setSource]      = useState("");
  const [destination, setDestination] = useState("");
  const [finding,     setFinding]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [accessible,  setAccessible]  = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const handleDestChange = useCallback((v: string) => {
    setDestination(v);
    onDestChange(v);
    setError(null);
  }, [onDestChange]);

  const handleFindRoute = useCallback(async () => {
    if (!source || !destination) {
      setError("Please enter both start and destination.");
      return;
    }
    if (source.toLowerCase() === destination.toLowerCase()) {
      setError("Start and destination cannot be the same.");
      return;
    }

    setFinding(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 400));

    const srcB = BUILDINGS.find((b) =>
      b.name.toLowerCase().includes(source.toLowerCase()) ||
      b.shortName.toLowerCase().includes(source.toLowerCase())
    );
    const dstB = BUILDINGS.find((b) =>
      b.name.toLowerCase().includes(destination.toLowerCase()) ||
      b.shortName.toLowerCase().includes(destination.toLowerCase())
    );

    if (!srcB || !dstB) {
      setError("Could not find one or both locations. Try selecting from suggestions.");
      setFinding(false);
      return;
    }

    if (accessible && (!srcB.accessible || !dstB.accessible)) {
      setError("One or both locations are not wheelchair accessible.");
      setFinding(false);
      return;
    }

    const graph  = buildGraph(PATH_EDGES, BUILDINGS);
    let result;

    if (accessible) {
      result = dijkstra(graph, srcB.id, dstB.id, true);
    } else {
      result = dijkstra(graph, srcB.id, dstB.id);
    }

    if (!result.found || result.path.length < 2) {
      setError("No route found between these locations.");
      setFinding(false);
      return;
    }

    const buildings = result.path
      .map((id) => getBuildingById(id))
      .filter((b): b is Building => Boolean(b));

    onRouteFound({
      path: result.path,
      buildings,
      totalDistance: result.distance,
      estimatedMinutes: distToMinutes(result.distance),
    });

    setFinding(false);
  }, [source, destination, onRouteFound, accessible]);

  const handleSwap = useCallback(() => {
    setSource(destination);
    setDestination(source);
    onClear();
  }, [source, destination, onClear]);

  const handleQuickDest = useCallback((name: string) => {
    handleDestChange(name);
  }, [handleDestChange]);

  const handleClear = useCallback(() => {
    onClear();
    setError(null);
    setHoveredBuilding(null);
  }, [onClear]);

  const routeStats = useMemo(() => {
    if (!route) return null;
    return {
      distance: route.totalDistance,
      duration: distToMinutes(route.totalDistance),
      steps: route.buildings.length,
    };
  }, [route]);

  return (
    <div className="flex flex-col gap-3">

      {/* Route planner */}
      <GlassCard neon className="p-4">
        <div
          className="text-[10px] font-semibold tracking-[1.5px] mb-3.5 flex items-center gap-2"
          style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
        >
          <Route className="w-3 h-3" /> ROUTE PLANNER
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <div className="text-[10px] mb-1.5 px-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>FROM</div>
            <SmartSearch
              value={source}
              onChange={(v) => { setSource(v); setError(null); }}
              placeholder="Start point..."
              color="var(--cyan)"
              onHoverBuilding={setHoveredBuilding}
              onUnhoverBuilding={() => setHoveredBuilding(null)}
            />
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwap}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--cyan)", cursor: "pointer" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              title="Swap source and destination"
            >
              <ArrowUpDown className="w-3 h-3" />
            </motion.button>
          </div>

          <div>
            <div className="text-[10px] mb-1.5 px-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>TO</div>
            <SmartSearch
              value={destination}
              onChange={handleDestChange}
              placeholder="Destination..."
              color="var(--purple)"
              onHoverBuilding={setHoveredBuilding}
              onUnhoverBuilding={() => setHoveredBuilding(null)}
            />
          </div>

          {/* Accessibility toggle */}
          <motion.button
            onClick={() => setAccessible(!accessible)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] transition-all"
            style={{
              background: accessible ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
              border:     `1px solid ${accessible ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.09)"}`,
              color:      accessible ? "var(--purple)" : "var(--text-2)",
              fontFamily: "var(--font-body)",
              cursor:     "pointer",
              fontWeight: accessible ? 500 : 400,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Wheelchair Accessible Route</span>
            {accessible && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
          </motion.button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 py-2 rounded-lg text-[11px] flex items-start gap-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", fontFamily: "var(--font-body)" }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <NeonButton
            color="cyan"
            size="sm"
            fullWidth
            icon={finding
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(0,212,255,0.4)", borderTopColor: "var(--cyan)" }} />
              : <Navigation className="w-3.5 h-3.5" />
            }
            onClick={handleFindRoute}
            disabled={!source || !destination || finding}
          >
            {finding ? "Finding Route..." : "Find Route"}
          </NeonButton>
        </div>
      </GlassCard>

      {/* Quick nav */}
      <GlassCard className="p-4">
        <div className="text-[10px] font-semibold tracking-[1.5px] mb-3" style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>
          ⚡ QUICK NAVIGATE
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((q) => (
            <motion.button
              key={q.name}
              onClick={() => handleQuickDest(q.name)}
              onHoverStart={() => setHoveredBuilding(q.name)}
              onHoverEnd={() => setHoveredBuilding(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] transition-all"
              style={{
                background: destination === q.name ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                border:     `1px solid ${destination === q.name ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                color:      destination === q.name ? "var(--cyan)" : "var(--text-2)",
                fontFamily: "var(--font-body)",
                cursor:     "pointer",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{q.icon}</span>
              <span className="truncate">{q.name.split(" ").slice(0, 2).join(" ")}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Route result */}
      <AnimatePresence>
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0, y: 8     }}
            transition={{ duration: 0.3  }}
          >
            <GlassCard neon className="p-4">
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[10px] font-semibold tracking-[1.5px] flex items-center gap-1.5" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
                  ✅ ROUTE FOUND
                </div>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)" }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    ~{routeStats?.duration} min
                  </motion.span>
                  <motion.button
                    onClick={handleClear}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Route stats */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                  <div className="text-[10px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>DISTANCE</div>
                  <div className="text-[12px] font-semibold mt-1" style={{ color: "var(--cyan)", fontFamily: "var(--font-body)" }}>
                    {(routeStats?.distance || 0).toFixed(2)} m
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className="text-[10px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>WAYPOINTS</div>
                  <div className="text-[12px] font-semibold mt-1" style={{ color: "var(--purple)", fontFamily: "var(--font-body)" }}>
                    {routeStats?.steps}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col mb-3.5 max-h-[280px] overflow-y-auto pr-2">
                {route.buildings.map((b, i) => {
                  const isActive = isNavigating && i === currentStep;
                  const isPast   = isNavigating && i < currentStep;
                  const isStart  = i === 0;
                  const isEnd    = i === route.buildings.length - 1;

                  return (
                    <motion.div
                      key={b.id}
                      className="flex items-start gap-2.5"
                      onHoverStart={() => setHoveredBuilding(b.name)}
                      onHoverEnd={() => setHoveredBuilding(null)}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <motion.div
                          animate={isActive ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0px rgba(0,212,255,0)", "0 0 12px rgba(0,212,255,0.6)", "0 0 6px rgba(0,212,255,0.4)"] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{
                            background: isActive ? "rgba(0,212,255,0.25)" : isPast ? "rgba(16,185,129,0.15)" : isStart ? "rgba(0,212,255,0.12)" : isEnd ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${isActive ? "var(--cyan)" : isPast ? "var(--green)" : isStart ? "rgba(0,212,255,0.5)" : isEnd ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.12)"}`,
                            color: isActive ? "var(--cyan)" : isPast ? "var(--green)" : "var(--text-3)",
                          }}
                        >
                          {isPast ? "✓" : i + 1}
                        </motion.div>
                        {i < route.buildings.length - 1 && (
                          <div className="w-px" style={{ height: 20, background: isPast ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)", marginTop: 2, marginBottom: 2 }} />
                        )}
                      </div>
                      <div className="pt-0.5 pb-1 min-w-0 flex-1">
                        <div
                          className="text-[12px] truncate"
                          style={{ fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text-1)" : isPast ? "var(--text-3)" : "var(--text-2)", fontFamily: "var(--font-body)" }}
                        >
                          {b.name}
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px]"
                            style={{ color: "var(--cyan)", fontFamily: "var(--font-body)" }}
                          >
                            ● You are here
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Controls */}
              {!isNavigating ? (
                <NeonButton color="cyan" size="sm" fullWidth icon={<Navigation className="w-3.5 h-3.5" />} onClick={onStart}>
                  Start Navigation
                </NeonButton>
              ) : (
                <div className="flex gap-2">
                  <NeonButton color="purple" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />} onClick={onPrev}>Prev</NeonButton>
                  <NeonButton color="cyan"   size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />} iconPosition="right" onClick={onNext}>Next</NeonButton>
                  <NeonButton color="red"    size="sm" icon={<StopCircle className="w-3.5 h-3.5" />} onClick={onStop} />
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
