"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation, ArrowUpDown, X,
  ChevronLeft, ChevronRight, StopCircle,
  MapPin, Search, Clock, Accessibility,
  AlertCircle, CheckCircle2, Footprints,
  Flag, CircleDot, ChevronDown,
} from "lucide-react";
import { BUILDINGS, SEARCH_TERMS, Building, PATH_EDGES, getBuildingById } from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";
import { buildGraph, dijkstra, distToMinutes } from "@/lib/dijkstra";

/* ─── Types ─────────────────────────────────────────────────────── */
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

/* ─── Fuzzy search (unchanged logic) ────────────────────────────── */
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

/* ─── Quick destinations ─────────────────────────────────────────── */
const QUICK = [
  { name: "Central Library",              icon: "📚", short: "Library"     },
  { name: "Main Student Canteen",         icon: "🍽️", short: "Canteen"     },
  { name: "Medical Center & Dispensary",  icon: "🏥", short: "Medical"     },
  { name: "Administrative Block",         icon: "🏢", short: "Admin"       },
  { name: "Sports Complex & Gym",         icon: "⚽", short: "Sports"      },
  { name: "Central Seminar Hall",         icon: "🎓", short: "Seminar"     },
];

/* ─── Premium Search Input ───────────────────────────────────────── */
function SmartSearch({
  value, onChange, placeholder, variant = "origin",
  onHoverBuilding, onUnhoverBuilding,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  variant?: "origin" | "destination";
  onHoverBuilding?: (name: string | null) => void;
  onUnhoverBuilding?: () => void;
}) {
  const [focused,   setFocused]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const filtered = useMemo(() => fuzzySearch(value, SEARCH_TERMS), [value]);
  const showDrop = focused && filtered.length > 0;

  const isOrigin = variant === "origin";
  const accentColor = isOrigin ? "#0ea5e9" : "#f59e0b"; // sky-500 : amber-400

  const handleSelect = (s: string) => {
    setLoading(true);
    onChange(s);
    setActiveIdx(0);
    setTimeout(() => setLoading(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(p => (p + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(p => (p - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter") { e.preventDefault(); handleSelect(filtered[activeIdx]); setFocused(false); }
  };

  useEffect(() => {
    if (showDrop && filtered[activeIdx]) onHoverBuilding?.(filtered[activeIdx]);
  }, [activeIdx, showDrop, filtered, onHoverBuilding]);

  return (
    <div className={focused ? "relative z-[80]" : "relative z-0"}>
      {/* Input pill */}
      <motion.div
        animate={{
          boxShadow: focused
            ? `0 0 0 3px ${accentColor}20, 0 4px 16px rgba(0,0,0,0.08)`
            : "0 1px 4px rgba(0,0,0,0.06)",
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white border transition-colors duration-200"
        style={{
          borderColor: focused ? `${accentColor}60` : "rgba(148,163,184,0.25)",
        }}
      >
        {/* Dot indicator */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: value ? accentColor : "#cbd5e1" }}
        />

        {loading ? (
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
            style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }}
          />
        ) : null}

        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setActiveIdx(0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); onUnhoverBuilding?.(); }, 180)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={() => { onChange(""); setActiveIdx(0); }}
              className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3 text-slate-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: -8, scale: 0.97    }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-[100] bg-white shadow-2xl border border-slate-100"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)" }}
          >
            {filtered.map((s, i) => (
              <motion.button
                key={s}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => { setActiveIdx(i); onHoverBuilding?.(s); }}
                onMouseLeave={() => onUnhoverBuilding?.()}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                style={{
                  background: i === activeIdx ? "#f0f9ff" : "transparent",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: i === activeIdx ? `${accentColor}15` : "#f8fafc" }}
                >
                  <MapPin className="w-3 h-3" style={{ color: i === activeIdx ? accentColor : "#94a3b8" }} />
                </div>
                <span
                  className="flex-1 truncate font-medium"
                  style={{ color: i === activeIdx ? "#0f172a" : "#475569" }}
                >
                  {s}
                </span>
                {i === activeIdx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-400"
                  >
                    ↵
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function RoutePanel({
  route, isNavigating, currentStep,
  onRouteFound, onStart, onStop, onNext, onPrev, onClear, onDestChange,
}: RoutePanelProps) {
  const [source,          setSource]          = useState("");
  const [destination,     setDestination]     = useState("");
  const [finding,         setFinding]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [accessible,      setAccessible]      = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const handleSourceChange = useCallback((v: string) => {
    setSource(v); setError(null);
    if (!v) onClear();
  }, [onClear]);

  const handleDestChange = useCallback((v: string) => {
    setDestination(v); onDestChange(v); setError(null);
    if (!v) onClear();
  }, [onDestChange, onClear]);

  const handleFindRoute = useCallback(async () => {
    if (!source || !destination) { setError("Please enter both start and destination."); return; }
    if (source.toLowerCase() === destination.toLowerCase()) { setError("Start and destination cannot be the same."); return; }

    setFinding(true); setError(null);
    await new Promise(r => setTimeout(r, 400));

    const srcB = BUILDINGS.find(b =>
      b.name.toLowerCase().includes(source.toLowerCase()) ||
      b.shortName.toLowerCase().includes(source.toLowerCase())
    );
    const dstB = BUILDINGS.find(b =>
      b.name.toLowerCase().includes(destination.toLowerCase()) ||
      b.shortName.toLowerCase().includes(destination.toLowerCase())
    );

    if (!srcB || !dstB) {
      setError("Could not find one or both locations. Try selecting from suggestions.");
      setFinding(false); return;
    }

    const graph = buildGraph(PATH_EDGES, BUILDINGS, accessible);
    const result = dijkstra(graph, srcB.id, dstB.id);

    if (!result.found || result.path.length < 2) {
      setError("No route found between these locations.");
      setFinding(false); return;
    }

    const buildings = result.path
      .map(id => getBuildingById(id))
      .filter((b): b is Building => Boolean(b));

    onRouteFound({ path: result.path, buildings, totalDistance: result.distance, estimatedMinutes: distToMinutes(result.distance), accessible });
    setFinding(false);
  }, [source, destination, onRouteFound, accessible]);

  const handleSwap = useCallback(() => {
    setSource(destination); setDestination(source); onClear();
  }, [source, destination, onClear]);

  const handleQuickDest = useCallback((name: string) => handleDestChange(name), [handleDestChange]);

  const handleClear = useCallback(() => { onClear(); setError(null); setHoveredBuilding(null); }, [onClear]);

  const routeStats = useMemo(() => {
    if (!route) return null;
    return {
      distance: route.totalDistance,
      duration: distToMinutes(route.totalDistance),
      steps: route.buildings.length,
    };
  }, [route]);

  const progress = route ? ((currentStep) / Math.max(route.buildings.length - 1, 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Journey Planner Card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 overflow-visible rounded-3xl bg-white border border-slate-200/80 shadow-sm"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">Journey Planner</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Campus navigation assistant</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
            <Navigation className="w-4 h-4 text-sky-500" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
          {/* FROM */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block px-1">
              From
            </label>
            <SmartSearch
              value={source}
              onChange={handleSourceChange}
              placeholder="Starting point…"
              variant="origin"
              onHoverBuilding={setHoveredBuilding}
              onUnhoverBuilding={() => setHoveredBuilding(null)}
            />
          </div>

          {/* Swap + line connector */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex flex-col items-center gap-0.5 pl-1">
              <div className="w-px h-3 bg-slate-200" />
              <div className="w-px h-3 bg-slate-200" />
            </div>
            <motion.button
              whileHover={{ scale: 1.08, rotate: 180 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSwap}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              title="Swap start and destination"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors ml-auto"
            >
              <ArrowUpDown className="w-3 h-3" />
              Swap
            </motion.button>
          </div>

          {/* TO */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block px-1">
              To
            </label>
            <SmartSearch
              value={destination}
              onChange={handleDestChange}
              placeholder="Where are you headed?"
              variant="destination"
              onHoverBuilding={setHoveredBuilding}
              onUnhoverBuilding={() => setHoveredBuilding(null)}
            />
          </div>

          {/* Accessibility toggle */}
          <motion.button
            onClick={() => setAccessible(!accessible)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-[12px] font-medium transition-all duration-200"
            style={{
              background:   accessible ? "#ecfdf5" : "#f8fafc",
              borderColor:  accessible ? "#6ee7b7" : "#e2e8f0",
              color:        accessible ? "#059669" : "#64748b",
            }}
          >
            <Accessibility className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left">Accessible route (ramp-friendly)</span>
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: accessible ? "#059669" : "#cbd5e1",
                background:  accessible ? "#059669" : "transparent",
              }}
            >
              {accessible && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3.5 py-2.5 rounded-xl text-[12px] flex items-start gap-2 bg-red-50 border border-red-200 text-red-600"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Find Route CTA */}
          <motion.button
            onClick={handleFindRoute}
            disabled={!source || !destination || finding}
            whileHover={{ scale: !source || !destination || finding ? 1 : 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.15 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: (!source || !destination || finding)
                ? "#f1f5f9"
                : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              color: (!source || !destination || finding) ? "#94a3b8" : "white",
              boxShadow: (!source || !destination || finding)
                ? "none"
                : "0 4px 16px rgba(14,165,233,0.35), 0 1px 4px rgba(14,165,233,0.2)",
            }}
          >
            {finding ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white/40 border-t-white animate-spin" />
                Calculating route…
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Find Route
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Quick Destinations ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl bg-white border border-slate-200/80 p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Popular destinations
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((q, i) => {
            const isSelected = destination === q.name;
            return (
              <motion.button
                key={q.name}
                onClick={() => handleQuickDest(q.name)}
                onHoverStart={() => setHoveredBuilding(q.name)}
                onHoverEnd={() => setHoveredBuilding(null)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[12px] font-medium transition-all duration-150 border"
                style={{
                  background:  isSelected ? "#f0f9ff" : "#f8fafc",
                  borderColor: isSelected ? "#bae6fd" : "#f1f5f9",
                  color:       isSelected ? "#0284c7" : "#475569",
                  boxShadow:   isSelected ? "0 2px 8px rgba(14,165,233,0.12)" : "none",
                }}
              >
                <span className="text-base leading-none">{q.icon}</span>
                <span className="truncate">{q.short}</span>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ml-auto flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Route Result ─────────────────────────────────────────── */}
      <AnimatePresence>
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
          >
            {/* Route header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Route ready</span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight leading-snug">
                    {route.buildings[0]?.name} →{" "}
                    <span className="text-amber-600">{route.buildings[route.buildings.length - 1]?.name}</span>
                  </h3>
                </div>
                <motion.button
                  onClick={handleClear}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-3.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-100">
                  <Clock className="w-3 h-3 text-sky-500" />
                  <span className="text-[12px] font-semibold text-sky-700">~{routeStats?.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Footprints className="w-3 h-3 text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-600">{(routeStats?.distance || 0).toFixed(0)} m</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CircleDot className="w-3 h-3 text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-600">{routeStats?.steps} stops</span>
                </div>
                {route.accessible && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <Accessibility className="w-3 h-3 text-emerald-500" />
                    <span className="text-[12px] font-semibold text-emerald-600">Accessible</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active navigation progress bar */}
            <AnimatePresence>
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-3 border-b border-slate-100 bg-sky-50/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">Navigating</span>
                    <span className="text-[11px] text-slate-500">
                      Step {currentStep + 1} of {route.buildings.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Steps — timeline */}
            <div className="px-5 py-4 max-h-[280px] overflow-y-auto">
              <div className="flex flex-col">
                {route.buildings.map((b, i) => {
                  const isActive = isNavigating && i === currentStep;
                  const isPast   = isNavigating && i < currentStep;
                  const isStart  = i === 0;
                  const isEnd    = i === route.buildings.length - 1;
                  const isLast   = i === route.buildings.length - 1;

                  return (
                    <motion.div
                      key={b.id}
                      className="flex items-stretch gap-3.5"
                      onHoverStart={() => setHoveredBuilding(b.name)}
                      onHoverEnd={() => setHoveredBuilding(null)}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.12 }}
                    >
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
                        {/* Node */}
                        <motion.div
                          animate={isActive ? {
                            boxShadow: [
                              "0 0 0px rgba(14,165,233,0)",
                              "0 0 10px rgba(14,165,233,0.5)",
                              "0 0 6px rgba(14,165,233,0.3)",
                            ]
                          } : {}}
                          transition={{ duration: 1.8, repeat: Infinity }}
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive
                              ? "#0ea5e9"
                              : isPast
                              ? "#10b981"
                              : isEnd
                              ? "#f59e0b"
                              : isStart
                              ? "#0ea5e9"
                              : "white",
                            border: `2px solid ${
                              isActive ? "#0ea5e9"
                              : isPast  ? "#10b981"
                              : isEnd   ? "#f59e0b"
                              : isStart ? "#0ea5e9"
                              : "#e2e8f0"
                            }`,
                          }}
                        >
                          {isPast ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : isEnd ? (
                            <Flag className="w-2.5 h-2.5 text-white" />
                          ) : isActive ? (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          ) : (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: isStart ? "#0ea5e9" : "#cbd5e1" }}
                            />
                          )}
                        </motion.div>
                        {/* Connector line */}
                        {!isLast && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{
                              minHeight: 20,
                              background: isPast
                                ? "linear-gradient(to bottom, #10b981, #10b98140)"
                                : "#e2e8f0",
                            }}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className={`pt-0.5 ${isLast ? "pb-0" : "pb-4"} flex-1 min-w-0`}>
                        <motion.div
                          className="text-[12.5px] truncate font-medium leading-snug"
                          style={{
                            color: isActive ? "#0f172a"
                              : isPast ? "#94a3b8"
                              : "#374151",
                            fontWeight: isActive ? 600 : isPast ? 400 : 500,
                          }}
                        >
                          {b.name}
                        </motion.div>

                        {isStart && !isActive && (
                          <div className="text-[10px] text-sky-500 font-medium mt-0.5">Start</div>
                        )}
                        {isEnd && !isActive && (
                          <div className="text-[10px] text-amber-500 font-medium mt-0.5">Destination</div>
                        )}
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-0.5"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span className="text-[10px] font-semibold text-sky-500">You are here</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="px-5 pb-5">
              {!isNavigating ? (
                <motion.button
                  onClick={onStart}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    boxShadow:  "0 4px 16px rgba(14,165,233,0.35)",
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  Start Navigation
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    onClick={onPrev}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </motion.button>

                  <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.03, y: -0.5 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                      boxShadow:  "0 3px 12px rgba(14,165,233,0.3)",
                    }}
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    onClick={onStop}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center justify-center w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}