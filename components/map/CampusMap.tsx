"use client";

import {
  useRef, useState, useCallback, useMemo, useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Building2 } from "lucide-react";
import {
  BUILDINGS, PATH_EDGES,
  BuildingCategory, CATEGORY_COLORS,
} from "@/data/buildings";
import { Building } from "@/types/navigation";
import { BuildingMarker } from "./BuildingMarker";
import { MapLegend } from "./MapLegend";
import { FloorSelector } from "./FloorSelector";

interface CampusMapProps {
  route:            string[];
  selectedBuilding: Building | null;
  currentStep:      number;
  isNavigating:     boolean;
  onBuildingClick:  (b: Building) => void;
  height?:          string;
}

function RouteSegment({
  x1, y1, x2, y2, index, routeKey,
}: {
  x1: number; y1: number; x2: number; y2: number;
  index: number; routeKey: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setDrawn(false);
    const t = setTimeout(() => setDrawn(true), index * 130 + 50);
    return () => clearTimeout(t);
  }, [routeKey, index]);

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.18)" strokeWidth={10}
        strokeLinecap="round"
        style={{ filter: "blur(5px)" }}
      />
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#00d4ff" strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        style={{
          strokeDashoffset: drawn ? 0 : len,
          transition: `stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1) ${index * 0.13}s`,
          filter: "drop-shadow(0 0 5px rgba(0,212,255,0.9))",
        }}
      />
      <circle
        cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={3}
        fill="#00d4ff" opacity={drawn ? 0.9 : 0}
        style={{
          transition: `opacity 0.3s ease ${index * 0.13 + 0.5}s`,
          filter: "drop-shadow(0 0 4px #00d4ff)",
        }}
      />
    </g>
  );
}

export function CampusMap({
  route = [], selectedBuilding, currentStep = 0,
  isNavigating = false, onBuildingClick,
  height = "calc(100vh - 95px)",
}: CampusMapProps) {
  const [zoom,        setZoom]        = useState(1);
  const [pan,         setPan]         = useState({ x: 0, y: 0 });
  const [dragging,    setDragging]    = useState(false);
  const [filter,      setFilter]      = useState<BuildingCategory | "all">("all");
  const [activeFloor, setActiveFloor] = useState(1);
  const lastPos  = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const routeKey  = route.join("-");

  // reset floor when selection changes
  useEffect(() => { setActiveFloor(1); }, [selectedBuilding?.id]);

  const routeSet = useMemo(() => new Set(route), [routeKey]);

  const isRouteEdge = useCallback((a: string, b: string) => {
    for (let i = 0; i < route.length - 1; i++) {
      if ((route[i] === a && route[i + 1] === b) ||
          (route[i] === b && route[i + 1] === a)) return true;
    }
    return false;
  }, [routeKey]);

  const visibleBuildings = useMemo(() =>
    filter === "all" ? BUILDINGS : BUILDINGS.filter((b) => b.type === filter),
    [filter]
  );

  // pan + zoom handlers
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.35, Math.min(4.5, z - e.deltaY * 0.0008)));
  }, []);
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [dragging]);
  const onMouseUp = () => setDragging(false);

  // touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const activeBuilding = isNavigating && route[currentStep]
    ? BUILDINGS.find((b) => b.id === route[currentStep])
    : null;

  const showFloorSelector = selectedBuilding && selectedBuilding.floors > 1;

  return (
    <div className="relative overflow-hidden" style={{ height, background: "var(--bg-1)", width: "100%" }}>

      {/* Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-20">
        {[
          { icon: ZoomIn,    fn: () => setZoom((z) => Math.min(4.5, z + 0.3)),  title: "Zoom In"   },
          { icon: ZoomOut,   fn: () => setZoom((z) => Math.max(0.35, z - 0.3)), title: "Zoom Out"  },
          { icon: RotateCcw, fn: () => { setZoom(1); setPan({ x: 0, y: 0 }); }, title: "Reset"     },
        ].map(({ icon: Icon, fn, title }) => (
          <motion.button
            key={title}
            whileHover={{ scale: 1.1, boxShadow: "0 0 14px rgba(0,212,255,0.3)" }}
            whileTap={{ scale: 0.93 }}
            onClick={fn}
            title={title}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "rgba(2,4,8,0.9)", border: "1px solid rgba(0,212,255,0.22)", color: "rgba(0,212,255,0.75)", backdropFilter: "blur(12px)", cursor: "pointer" }}
          >
            <Icon className="w-4 h-4" />
          </motion.button>
        ))}
        <div className="text-center text-[9px] font-mono mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Hint */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-[10px] px-3 py-1.5 rounded-full pointer-events-none"
        style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.14)", color: "rgba(0,212,255,0.5)", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}
      >
        Scroll to zoom · Drag to pan · Click a building
      </div>

      {/* Legend */}
      <MapLegend activeFilter={filter} onFilterChange={setFilter} />

      {/* Floor selector */}
      <AnimatePresence>
        {showFloorSelector && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{ opacity: 0, x: 10   }}
            className="absolute z-20"
            style={{ top: "50%", right: 20, transform: "translateY(-50%)" }}
          >
            <FloorSelector building={selectedBuilding} activeFloor={activeFloor} onFloorChange={setActiveFloor} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(6,13,24,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
        >
          <Building2 className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
          <span className="text-[11px] font-medium" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
            {visibleBuildings.length} buildings
          </span>
          {filter !== "all" && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${CATEGORY_COLORS[filter]}18`, border: `1px solid ${CATEGORY_COLORS[filter]}33`, color: CATEGORY_COLORS[filter], fontFamily: "var(--font-body)" }}
            >
              {filter}
            </span>
          )}
        </div>
      </div>

      {/* Active nav banner */}
      <AnimatePresence>
        {isNavigating && activeBuilding && (
          <motion.div
            key={activeBuilding.id}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{ opacity: 0, y: -10    }}
            transition={{ duration: 0.3   }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: "rgba(6,13,24,0.96)", border: "1px solid rgba(0,212,255,0.32)", backdropFilter: "blur(20px)", boxShadow: "0 0 30px rgba(0,212,255,0.12)", minWidth: 280 }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 animate-glow"
              style={{ background: "rgba(0,212,255,0.1)", border: "1.5px solid rgba(0,212,255,0.4)" }}
            >
              {activeBuilding.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[1px] mb-0.5" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>NAVIGATING TO</div>
              <div className="text-[14px] font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>{activeBuilding.name}</div>
              <div className="text-[11px]" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>Step {currentStep + 1} of {route.length}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG canvas */}
      <div
        className="w-full h-full"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { lastTouch.current = null; }}
      >
        <svg
          width="100%" height="100%"
          viewBox="0 0 620 620"
          style={{
            transform:       `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center",
            transition:      dragging ? "none" : "transform 0.08s ease-out",
          }}
        >
          <defs>
            <radialGradient id="map-bg-v2" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>
            <pattern id="map-grid-v2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width="620" height="620" fill="url(#map-bg-v2)" />
          <rect width="620" height="620" fill="url(#map-grid-v2)" />

          {/* Campus boundary */}
          <rect x="50" y="50" width="520" height="520" rx="20"
            fill="none" stroke="rgba(0,212,255,0.07)"
            strokeWidth="1.5" strokeDasharray="10 7" />

          {/* Zone labels */}
          <text x="175" y="155" textAnchor="middle" fill="rgba(139,92,246,0.25)" fontSize="8" letterSpacing="2" fontFamily="var(--font-display)">ACADEMIC WEST</text>
          <text x="445" y="132" textAnchor="middle" fill="rgba(59,130,246,0.22)" fontSize="8" letterSpacing="2" fontFamily="var(--font-display)">ACADEMIC EAST</text>

          {/* Roads */}
          {[{ x1: 310, y1: 65, x2: 310, y2: 555 }, { x1: 65, y1: 310, x2: 555, y2: 310 }].map((l, i) => (
            <g key={i}>
              <line {...l} stroke="rgba(255,255,255,0.025)" strokeWidth="28" />
              <line {...l} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="12 9" />
            </g>
          ))}

          <text x="310" y="36" textAnchor="middle" fill="rgba(0,212,255,0.25)" fontSize="9.5" letterSpacing="4" fontFamily="var(--font-display)">RIMT UNIVERSITY CAMPUS</text>
          <text x="310" y="602" textAnchor="middle" fill="rgba(0,212,255,0.15)" fontSize="8" letterSpacing="2" fontFamily="var(--font-display)">PRESENTED BY NIKHIL</text>

          {/* Inactive path edges */}
          {PATH_EDGES.map(({ from, to }, i) => {
            const bA = BUILDINGS.find((b) => b.id === from);
            const bB = BUILDINGS.find((b) => b.id === to);
            if (!bA || !bB || isRouteEdge(from, to)) return null;
            return (
              <line key={i}
                x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y}
                stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" strokeDasharray="4 5"
              />
            );
          })}

          {/* Route segments */}
          {route.length > 1 && route.map((id, i) => {
            if (i === route.length - 1) return null;
            const bA = BUILDINGS.find((b) => b.id === route[i]);
            const bB = BUILDINGS.find((b) => b.id === route[i + 1]);
            if (!bA || !bB) return null;
            return (
              <RouteSegment
                key={`${routeKey}-${i}`}
                x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y}
                index={i} routeKey={routeKey}
              />
            );
          })}

          {/* Dimmed buildings outside filter */}
          {filter !== "all" && BUILDINGS.filter((b) => b.type !== filter).map((b) => (
            <g key={`dim-${b.id}`} style={{ opacity: 0.15, pointerEvents: "none" }}>
              <circle cx={b.x} cy={b.y} r={10} fill="rgba(6,13,24,0.9)" stroke={`${b.color}44`} strokeWidth="1" />
              <text x={b.x} y={b.y + 4} textAnchor="middle" fontSize={9} style={{ userSelect: "none" }}>{b.icon}</text>
            </g>
          ))}

          {/* Visible markers */}
          {visibleBuildings.map((b) => (
            <BuildingMarker
              key={b.id}
              building={b}
              isSelected={selectedBuilding?.id === b.id}
              isOnRoute={routeSet.has(b.id)}
              isRouteStart={route[0] === b.id}
              isRouteEnd={route[route.length - 1] === b.id}
              isCurrentStep={isNavigating && route[currentStep] === b.id}
              zoom={zoom}
              onClick={() => onBuildingClick(b)}
            />
          ))}

          {/* Live dot */}
          {isNavigating && activeBuilding && (
            <g>
              <circle cx={activeBuilding.x} cy={activeBuilding.y} r={7} fill="#00d4ff"
                style={{ filter: "drop-shadow(0 0 8px #00d4ff)", animation: "glow-pulse 1.2s ease-in-out infinite" }}
              />
              <circle cx={activeBuilding.x} cy={activeBuilding.y} r={14}
                fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5"
                style={{ animation: "radar-ping 2s ease-out infinite" }}
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}