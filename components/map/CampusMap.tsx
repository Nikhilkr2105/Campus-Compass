"use client";

import {
  useRef, useState, useCallback, useMemo, useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Building2, Crosshair } from "lucide-react";
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
      {/* outer glow */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.12)" strokeWidth={18}
        strokeLinecap="round"
        style={{ filter: "blur(8px)" }}
      />
      {/* mid glow */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.22)" strokeWidth={8}
        strokeLinecap="round"
        style={{ filter: "blur(3px)" }}
      />
      {/* main line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#00d4ff" strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        style={{
          strokeDashoffset: drawn ? 0 : len,
          transition: `stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1) ${index * 0.13}s`,
          filter: "drop-shadow(0 0 6px rgba(0,212,255,1)) drop-shadow(0 0 12px rgba(0,212,255,0.5))",
        }}
      />
      {/* midpoint dot */}
      <circle
        cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={3.5}
        fill="#00d4ff" opacity={drawn ? 1 : 0}
        style={{
          transition: `opacity 0.3s ease ${index * 0.13 + 0.55}s`,
          filter: "drop-shadow(0 0 6px #00d4ff) drop-shadow(0 0 12px rgba(0,212,255,0.6))",
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
  const lastPos   = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const routeKey  = route.join("-");

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
    <div
      className="relative overflow-hidden"
      style={{
        height,
        width:      "100%",
        background: "radial-gradient(ellipse 120% 100% at 50% 50%, #0a1628 0%, #060d18 40%, #020408 100%)",
      }}
    >
      {/* ── Atmospheric background layers ── */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", animation: "float 10s ease-in-out infinite 3s" }} />
      </div>

      {/* ── Map zoom controls ── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-20">
        {[
          { icon: ZoomIn,    fn: () => setZoom((z) => Math.min(4.5, z + 0.3)),  title: "Zoom In"   },
          { icon: ZoomOut,   fn: () => setZoom((z) => Math.max(0.35, z - 0.3)), title: "Zoom Out"  },
          { icon: RotateCcw, fn: () => { setZoom(1); setPan({ x: 0, y: 0 }); }, title: "Reset"     },
        ].map(({ icon: Icon, fn, title }) => (
          <motion.button
            key={title}
            whileHover={{ scale: 1.12, boxShadow: "0 0 20px rgba(0,212,255,0.4)" }}
            whileTap={{ scale: 0.9 }}
            onClick={fn}
            title={title}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background:     "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))",
              border:         "1px solid rgba(0,212,255,0.28)",
              color:          "rgba(0,212,255,0.85)",
              backdropFilter: "blur(16px)",
              cursor:         "pointer",
              boxShadow:      "0 2px 12px rgba(0,0,0,0.4)",
              transition:     "all 0.2s ease",
            }}
          >
            <Icon className="w-4 h-4" />
          </motion.button>
        ))}
        <div
          className="text-center text-[9px] font-mono mt-0.5"
          style={{ color: "rgba(0,212,255,0.35)", fontFamily: "var(--font-mono, monospace)" }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* ── Hint ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] px-4 py-1.5 rounded-full pointer-events-none flex items-center gap-2"
        style={{
          background:     "rgba(6,13,24,0.8)",
          border:         "1px solid rgba(0,212,255,0.12)",
          color:          "rgba(0,212,255,0.4)",
          fontFamily:     "var(--font-body)",
          whiteSpace:     "nowrap",
          backdropFilter: "blur(12px)",
        }}
      >
        <Crosshair className="w-3 h-3" />
        Scroll to zoom · Drag to pan · Click a building
      </div>

      {/* ── Legend ── */}
      <MapLegend activeFilter={filter} onFilterChange={setFilter} />

      {/* ── Floor selector ── */}
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

      {/* ── Stats bar ── */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
          style={{
            background:     "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(6,13,24,0.9))",
            border:         "1px solid rgba(0,212,255,0.18)",
            backdropFilter: "blur(16px)",
            boxShadow:      "0 2px 16px rgba(0,0,0,0.4)",
          }}
        >
          <Building2 className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
          <span className="text-[11px] font-medium" style={{ color: "rgba(240,244,255,0.7)", fontFamily: "var(--font-body)" }}>
            {visibleBuildings.length} buildings
          </span>
          {filter !== "all" && (
            <span
              className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
              style={{
                background: `${CATEGORY_COLORS[filter]}18`,
                border:     `1px solid ${CATEGORY_COLORS[filter]}35`,
                color:       CATEGORY_COLORS[filter],
                fontFamily: "var(--font-body)",
              }}
            >
              {filter}
            </span>
          )}
        </motion.div>
      </div>

      {/* ── Active navigation banner ── */}
      <AnimatePresence>
        {isNavigating && activeBuilding && (
          <motion.div
            key={activeBuilding.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1     }}
            exit={{ opacity: 0, y: -12, scale: 0.97      }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-5 py-3.5 rounded-2xl"
            style={{
              background:     "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(6,13,24,0.97))",
              border:         "1px solid rgba(0,212,255,0.35)",
              backdropFilter: "blur(24px)",
              boxShadow:      "0 0 40px rgba(0,212,255,0.15), 0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,212,255,0.04)",
              minWidth:       300,
            }}
          >
            <motion.div
              animate={{ boxShadow: ["0 0 10px rgba(0,212,255,0.4)", "0 0 22px rgba(0,212,255,0.7)", "0 0 10px rgba(0,212,255,0.4)"] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.06))",
                border:     "1.5px solid rgba(0,212,255,0.5)",
              }}
            >
              {activeBuilding.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] tracking-[2px] mb-0.5 font-semibold" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
                NAVIGATING TO
              </div>
              <div className="text-[14px] font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                {activeBuilding.name}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(240,244,255,0.5)", fontFamily: "var(--font-body)" }}>
                Step {currentStep + 1} of {route.length}
              </div>
            </div>
            {/* pulsing dot */}
            <div className="flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--cyan)", boxShadow: "0 0 10px var(--cyan)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SVG canvas ── */}
      <div
        className="w-full h-full relative z-10"
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
            <radialGradient id="campus-bg" cx="50%" cy="50%" r="65%">
              <stop offset="0%"   stopColor="#0d1f38" />
              <stop offset="50%"  stopColor="#070f1e" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="center-glow" cx="50%" cy="50%" r="40%">
              <stop offset="0%"   stopColor="rgba(0,212,255,0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* background */}
          <rect width="620" height="620" fill="url(#campus-bg)" />
          <rect width="620" height="620" fill="url(#campus-grid)" />
          <rect width="620" height="620" fill="url(#center-glow)" />

          {/* campus boundary — double ring */}
          <rect x="48" y="48" width="524" height="524" rx="22"
            fill="none"
            stroke="rgba(0,212,255,0.05)"
            strokeWidth="3"
          />
          <rect x="50" y="50" width="520" height="520" rx="20"
            fill="none"
            stroke="rgba(0,212,255,0.1)"
            strokeWidth="1"
            strokeDasharray="10 7"
          />

          {/* zone shading */}
          <ellipse cx="175" cy="300" rx="110" ry="155"
            fill="rgba(139,92,246,0.02)"
            stroke="rgba(139,92,246,0.07)"
            strokeWidth="1" strokeDasharray="5 6"
          />
          <ellipse cx="445" cy="265" rx="100" ry="135"
            fill="rgba(59,130,246,0.02)"
            stroke="rgba(59,130,246,0.06)"
            strokeWidth="1" strokeDasharray="5 6"
          />

          {/* zone labels */}
          <text x="175" y="148" textAnchor="middle" fill="rgba(139,92,246,0.28)" fontSize="8" letterSpacing="2.5" fontFamily="var(--font-display)">ACADEMIC WEST</text>
          <text x="445" y="130" textAnchor="middle" fill="rgba(59,130,246,0.25)" fontSize="8" letterSpacing="2.5" fontFamily="var(--font-display)">ACADEMIC EAST</text>

          {/* main roads */}
          {[{ x1: 310, y1: 62, x2: 310, y2: 558 }, { x1: 62, y1: 310, x2: 558, y2: 310 }].map((l, i) => (
            <g key={i}>
              <line {...l} stroke="rgba(255,255,255,0.02)"  strokeWidth="32" />
              <line {...l} stroke="rgba(0,212,255,0.04)" strokeWidth="1.5" strokeDasharray="14 10" />
            </g>
          ))}

          {/* campus title */}
          <text x="310" y="34" textAnchor="middle" fill="rgba(0,212,255,0.22)" fontSize="9.5" letterSpacing="5" fontFamily="var(--font-display)">
            RIMT UNIVERSITY CAMPUS
          </text>
          <text x="310" y="604" textAnchor="middle" fill="rgba(0,212,255,0.12)" fontSize="8" letterSpacing="3" fontFamily="var(--font-display)">
            PRESENTED BY NIKHIL
          </text>

          {/* inactive path edges */}
          {PATH_EDGES.map(({ from, to }, i) => {
            const bA = BUILDINGS.find((b) => b.id === from);
            const bB = BUILDINGS.find((b) => b.id === to);
            if (!bA || !bB || isRouteEdge(from, to)) return null;
            return (
              <line key={i}
                x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.8"
                strokeDasharray="4 6"
              />
            );
          })}

          {/* animated route */}
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

          {/* dimmed buildings outside filter */}
          {filter !== "all" && BUILDINGS.filter((b) => b.type !== filter).map((b) => (
            <g key={`dim-${b.id}`} style={{ opacity: 0.12, pointerEvents: "none" }}>
              <circle cx={b.x} cy={b.y} r={10} fill="rgba(6,13,24,0.9)" stroke={`${b.color}33`} strokeWidth="1" />
              <text x={b.x} y={b.y + 4} textAnchor="middle" fontSize={9} style={{ userSelect: "none" }}>{b.icon}</text>
            </g>
          ))}

          {/* building markers */}
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

          {/* live navigation dot */}
          {isNavigating && activeBuilding && (
            <g>
              <circle cx={activeBuilding.x} cy={activeBuilding.y} r={10}
                fill="none"
                stroke="rgba(0,212,255,0.2)"
                strokeWidth="1"
                style={{ animation: "radar-ping 2s ease-out infinite 0.3s" }}
              />
              <circle cx={activeBuilding.x} cy={activeBuilding.y} r={7}
                fill="#00d4ff"
                style={{ filter: "drop-shadow(0 0 10px #00d4ff) drop-shadow(0 0 20px rgba(0,212,255,0.5))", animation: "glow-pulse 1.2s ease-in-out infinite" }}
              />
              <circle cx={activeBuilding.x} cy={activeBuilding.y} r={14}
                fill="none"
                stroke="rgba(0,212,255,0.35)"
                strokeWidth="1.5"
                style={{ animation: "radar-ping 2s ease-out infinite" }}
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}