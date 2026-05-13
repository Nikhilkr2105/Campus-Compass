"use client";

import {
  useRef, useState, useEffect,
  useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Locate } from "lucide-react";
import { BUILDINGS, PATH_EDGES } from "@/data/buildings";
import { Building } from "@/types/navigation";

interface CampusMapProps {
  route:            string[];
  selectedBuilding: Building | null;
  currentStep:      number;
  isNavigating:     boolean;
  onBuildingClick:  (b: Building) => void;
}

// ── Animated route segment ──────────────────────────
function RouteSegment({
  x1, y1, x2, y2, index,
}: {
  x1: number; y1: number; x2: number; y2: number; index: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <g>
      {/* Glow layer */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.2)"
        strokeWidth={8}
        strokeLinecap="round"
        style={{ filter: "blur(4px)" }}
      />
      {/* Main line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#00d4ff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        style={{
          strokeDashoffset: drawn ? 0 : len,
          transition: `stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1)`,
          filter: "drop-shadow(0 0 4px rgba(0,212,255,0.9))",
        }}
      />
      {/* Midpoint dot */}
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3}
        fill="#00d4ff"
        opacity={drawn ? 0.9 : 0}
        style={{ transition: `opacity 0.3s ease ${index * 0.12 + 0.4}s`, filter: "drop-shadow(0 0 4px #00d4ff)" }}
      />
    </g>
  );
}

// ── Building node ────────────────────────────────────
function BuildingNode({
  building, isOnRoute, isSelected,
  isCurrentStep, isStart, isEnd,
  onClick,
}: {
  building: Building;
  isOnRoute: boolean; isSelected: boolean;
  isCurrentStep: boolean; isStart: boolean; isEnd: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const r = isSelected ? 17 : hovered ? 15 : 12;
  const ringColor = isStart ? "#00d4ff" : isEnd ? "#8b5cf6" : building.color;

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Pulse rings */}
      {(isStart || isEnd || isCurrentStep) && (
        <>
          <circle cx={building.x} cy={building.y} r={r + 12}
            fill="none" stroke={ringColor} strokeWidth={1}
            opacity={0.3}
            style={{ animation: "radar-ping 2s ease-out infinite" }}
          />
          <circle cx={building.x} cy={building.y} r={r + 6}
            fill="none" stroke={ringColor} strokeWidth={1.5}
            opacity={0.5}
            style={{ animation: "radar-ping 2s ease-out infinite 0.4s" }}
          />
        </>
      )}

      {/* Ambient glow */}
      {(isSelected || isCurrentStep) && (
        <circle
          cx={building.x} cy={building.y} r={r + 10}
          fill={building.color}
          opacity={0.08}
          style={{ filter: "blur(8px)" }}
        />
      )}

      {/* Main circle */}
      <circle
        cx={building.x}
        cy={building.y}
        r={r}
        fill={isSelected ? `${building.color}25` : "rgba(6,13,24,0.92)"}
        stroke={
          isSelected    ? building.color
          : isCurrentStep ? "#00d4ff"
          : isOnRoute     ? "rgba(0,212,255,0.6)"
          : hovered       ? `${building.color}99`
          : `${building.color}55`
        }
        strokeWidth={isSelected ? 2 : 1.5}
        style={{
          transition: "all 0.2s ease",
          filter:     isSelected ? `drop-shadow(0 0 8px ${building.color})` : "none",
        }}
      />

      {/* Icon */}
      <text
        x={building.x} y={building.y + 4}
        textAnchor="middle"
        fontSize={isSelected ? 13 : 10}
        style={{ userSelect: "none", transition: "font-size 0.2s ease" }}
      >
        {building.icon}
      </text>

      {/* Label */}
      <text
        x={building.x}
        y={building.y + (isSelected ? 32 : 26)}
        textAnchor="middle"
        fill={
          isSelected    ? "#fff"
          : isCurrentStep ? "#00d4ff"
          : isOnRoute     ? "rgba(0,212,255,0.8)"
          : hovered       ? "rgba(240,244,255,0.85)"
          : "rgba(240,244,255,0.55)"
        }
        fontSize={isSelected ? 9 : 8}
        fontWeight={isSelected ? 600 : 400}
        fontFamily="var(--font-body)"
        style={{ userSelect: "none", transition: "all 0.2s" }}
      >
        {building.short}
      </text>
    </g>
  );
}

// ── Main CampusMap ───────────────────────────────────
export function CampusMap({
  route, selectedBuilding, currentStep,
  isNavigating, onBuildingClick,
}: CampusMapProps) {
  const [zoom,     setZoom]     = useState(1);
  const [pan,      setPan]      = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [tooltip,  setTooltip]  = useState<{ building: Building; cx: number; cy: number } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const routeKey = route.join("-");

  const routeSet = useMemo(() => new Set(route), [routeKey]);

  const isRouteEdge = useCallback(
    (a: string, b: string) => {
      for (let i = 0; i < route.length - 1; i++) {
        if ((route[i] === a && route[i + 1] === b) ||
            (route[i] === b && route[i + 1] === a)) return true;
      }
      return false;
    },
    [routeKey]
  );

  const zoomIn  = () => setZoom((z) => Math.min(4,   z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.4, z - 0.25));
  const reset   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.4, Math.min(4, z - e.deltaY * 0.0008)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan((p) => ({
      x: p.x + e.clientX - lastPos.current.x,
      y: p.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [dragging]);
  const onMouseUp = () => setDragging(false);

  // Active nav step badge
  const activeBuilding = isNavigating && route[currentStep]
    ? BUILDINGS.find((b) => b.id === route[currentStep])
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "var(--bg-1)" }}>

      {/* ── Map canvas ── */}
      <div
        className="w-full h-full"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
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
            <radialGradient id="map-bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor="#0a1628" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.035)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* BG */}
          <rect width="620" height="620" fill="url(#map-bg)" />
          <rect width="620" height="620" fill="url(#map-grid)" />

          {/* Campus boundary */}
          <rect x="52" y="52" width="516" height="516" rx="18"
            fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="1.5" strokeDasharray="8 6" />

          {/* Road guides */}
          {[
            { x1: 315, y1: 70, x2: 315, y2: 550 },
            { x1: 70,  y1: 315, x2: 550, y2: 315 },
          ].map((l, i) => (
            <g key={i}>
              <line {...l} stroke="rgba(255,255,255,0.025)" strokeWidth="26" />
              <line {...l} stroke="rgba(255,255,255,0.04)"  strokeWidth="0.8" strokeDasharray="10 8" />
            </g>
          ))}

          {/* Campus label */}
          <text x="315" y="36" textAnchor="middle"
            fill="rgba(0,212,255,0.28)" fontSize="9" letterSpacing="3.5"
            fontFamily="var(--font-display)">
            RIMT UNIVERSITY CAMPUS
          </text>

          {/* ── All path edges (inactive) ── */}
          {PATH_EDGES.map(({ from, to }, i) => {
            const bA = BUILDINGS.find((b) => b.id === from);
            const bB = BUILDINGS.find((b) => b.id === to);
            if (!bA || !bB) return null;
            if (isRouteEdge(from, to)) return null; // rendered separately
            return (
              <line key={i}
                x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            );
          })}

          {/* ── Animated route segments ── */}
          {route.length > 1 && route.map((id, i) => {
            if (i === route.length - 1) return null;
            const bA = BUILDINGS.find((b) => b.id === route[i]);
            const bB = BUILDINGS.find((b) => b.id === route[i + 1]);
            if (!bA || !bB) return null;
            return (
              <RouteSegment key={`${routeKey}-${i}`}
                x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y} index={i}
              />
            );
          })}

          {/* ── Buildings ── */}
          {BUILDINGS.map((b) => (
            <BuildingNode
              key={b.id}
              building={b}
              isOnRoute={routeSet.has(b.id)}
              isSelected={selectedBuilding?.id === b.id}
              isCurrentStep={isNavigating && route[currentStep] === b.id}
              isStart={route[0] === b.id}
              isEnd={route[route.length - 1] === b.id}
              onClick={() => onBuildingClick(b)}
            />
          ))}

          {/* ── Live position dot at current step ── */}
          {isNavigating && activeBuilding && (
            <g>
              <circle
                cx={activeBuilding.x}
                cy={activeBuilding.y}
                r={7}
                fill="#00d4ff"
                style={{ filter: "drop-shadow(0 0 8px #00d4ff)", animation: "glow-pulse 1.2s ease-in-out infinite" }}
              />
              <circle
                cx={activeBuilding.x}
                cy={activeBuilding.y}
                r={13}
                fill="none"
                stroke="rgba(0,212,255,0.4)"
                strokeWidth="1.5"
                style={{ animation: "radar-ping 1.8s ease-out infinite" }}
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── Map Controls ── */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-10">
        {[
          { icon: ZoomIn,    onClick: zoomIn,  title: "Zoom in"   },
          { icon: ZoomOut,   onClick: zoomOut, title: "Zoom out"  },
          { icon: RotateCcw, onClick: reset,   title: "Reset view"},
        ].map(({ icon: Icon, onClick, title }) => (
          <motion.button
            key={title}
            whileHover={{ scale: 1.1, boxShadow: "0 0 14px rgba(0,212,255,0.25)" }}
            whileTap={{ scale: 0.93 }}
            onClick={onClick}
            title={title}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{
              background:    "rgba(2,4,8,0.88)",
              border:        "1px solid rgba(0,212,255,0.2)",
              color:         "rgba(0,212,255,0.7)",
              backdropFilter:"blur(10px)",
              cursor:        "pointer",
            }}
          >
            <Icon className="w-4 h-4" />
          </motion.button>
        ))}
        <div
          className="text-center text-[9px] font-mono mt-0.5"
          style={{ color: "rgba(0,212,255,0.4)" }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* ── Zoom hint (first load) ── */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1.5 rounded-full pointer-events-none"
        style={{
          background:   "rgba(0,212,255,0.06)",
          border:       "1px solid rgba(0,212,255,0.15)",
          color:        "rgba(0,212,255,0.5)",
          fontFamily:   "var(--font-body)",
        }}
      >
        Scroll to zoom · Drag to pan · Click a building
      </div>

      {/* ── Active navigation step banner ── */}
      <AnimatePresence>
        {isNavigating && activeBuilding && (
          <motion.div
            key={activeBuilding.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0, y: 10    }}
            transition={{ duration: 0.3  }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl z-20"
            style={{
              background:    "rgba(6,13,24,0.95)",
              border:        "1px solid rgba(0,212,255,0.3)",
              backdropFilter:"blur(20px)",
              boxShadow:     "0 0 30px rgba(0,212,255,0.1)",
              minWidth:      280,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 animate-glow"
              style={{
                background: "rgba(0,212,255,0.1)",
                border:     "1.5px solid rgba(0,212,255,0.4)",
              }}
            >
              {activeBuilding.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[1px] mb-0.5" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
                NAVIGATING TO
              </div>
              <div className="text-[14px] font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>
                {activeBuilding.name}
              </div>
              <div className="text-[11px]" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
                Step {currentStep + 1} of {route.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}