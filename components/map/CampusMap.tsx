"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Wifi, Clock } from "lucide-react";
import { BUILDINGS, PATH_EDGES } from "@/data/buildings";
import { Building } from "@/types/navigation";

// ─────────────────────────────────────────────────────────────
// TIME-BASED ATMOSPHERE
// ─────────────────────────────────────────────────────────────

type TimeOfDay = "morning" | "midday" | "afternoon" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6  && h < 10) return "morning";
  if (h >= 10 && h < 14) return "midday";
  if (h >= 14 && h < 18) return "afternoon";
  if (h >= 18 && h < 21) return "evening";
  return "night";
}

function getTimeLabel(t: TimeOfDay): string {
  return {
    morning:   "Morning Session",
    midday:    "Peak Hours",
    afternoon: "Afternoon Session",
    evening:   "Evening Wind-down",
    night:     "Campus Quiet Hours",
  }[t];
}

const TIME_PALETTE: Record<TimeOfDay, {
  bg:         string;
  grid:       string;
  orbA:       string;
  orbB:       string;
  accent:     string;
  mapBg:      string;
  centerGlow: string;
}> = {
  morning: {
    bg:         "radial-gradient(ellipse 120% 100% at 50% 50%, #0d1f38 0%, #080f1c 45%, #020408 100%)",
    grid:       "rgba(100,180,255,0.04)",
    orbA:       "rgba(100,180,255,0.06)",
    orbB:       "rgba(255,200,100,0.04)",
    accent:     "rgba(100,180,255,0.22)",
    mapBg:      "#0d2040",
    centerGlow: "rgba(100,180,255,0.05)",
  },
  midday: {
    bg:         "radial-gradient(ellipse 120% 100% at 50% 50%, #0a1e3a 0%, #060e1c 45%, #020408 100%)",
    grid:       "rgba(0,212,255,0.04)",
    orbA:       "rgba(0,212,255,0.06)",
    orbB:       "rgba(139,92,246,0.055)",
    accent:     "rgba(0,212,255,0.22)",
    mapBg:      "#0a1628",
    centerGlow: "rgba(0,212,255,0.05)",
  },
  afternoon: {
    bg:         "radial-gradient(ellipse 120% 100% at 50% 50%, #0d1a30 0%, #080d1a 45%, #020408 100%)",
    grid:       "rgba(0,200,240,0.035)",
    orbA:       "rgba(0,200,240,0.055)",
    orbB:       "rgba(120,80,220,0.05)",
    accent:     "rgba(0,200,240,0.2)",
    mapBg:      "#0a1422",
    centerGlow: "rgba(0,200,240,0.045)",
  },
  evening: {
    bg:         "radial-gradient(ellipse 120% 100% at 50% 50%, #160f2a 0%, #0c0818 45%, #020408 100%)",
    grid:       "rgba(180,130,255,0.03)",
    orbA:       "rgba(180,130,255,0.05)",
    orbB:       "rgba(255,120,80,0.035)",
    accent:     "rgba(160,100,255,0.22)",
    mapBg:      "#110a20",
    centerGlow: "rgba(160,100,255,0.04)",
  },
  night: {
    bg:         "radial-gradient(ellipse 120% 100% at 50% 50%, #080a14 0%, #040608 45%, #020408 100%)",
    grid:       "rgba(0,150,200,0.025)",
    orbA:       "rgba(0,150,200,0.035)",
    orbB:       "rgba(80,60,160,0.035)",
    accent:     "rgba(0,150,200,0.15)",
    mapBg:      "#060810",
    centerGlow: "rgba(0,150,200,0.03)",
  },
};

// ─────────────────────────────────────────────────────────────
// OCCUPANCY — deterministic per building + time
// ─────────────────────────────────────────────────────────────

type OccupancyLevel = "low" | "moderate" | "high" | "peak" | "closed";

const OCCUPANCY_COLOR: Record<OccupancyLevel, string> = {
  low:      "#22c55e",
  moderate: "#eab308",
  high:     "#f97316",
  peak:     "#ef4444",
  closed:   "#475569",
};

const OCCUPANCY_LABEL: Record<OccupancyLevel, string> = {
  low:      "Quiet",
  moderate: "Active",
  high:     "Busy",
  peak:     "Peak",
  closed:   "Closed",
};

// Seeded hash so occupancy is stable per building
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function getBuildingOccupancy(id: string, tod: TimeOfDay): OccupancyLevel {
  const seed = hashId(id) % 100;
  if (tod === "night")   return seed < 20 ? "low" : "closed";
  if (tod === "evening") return seed < 30 ? "low" : seed < 60 ? "moderate" : "high";
  if (tod === "morning") return seed < 20 ? "low" : seed < 65 ? "moderate" : "high";
  // midday / afternoon — peak campus activity
  if (seed < 15) return "low";
  if (seed < 45) return "moderate";
  if (seed < 75) return "high";
  return "peak";
}

// Estimated pct 0-100 matching level
function getOccupancyPct(id: string, tod: TimeOfDay): number {
  const seed = hashId(id) % 100;
  const level = getBuildingOccupancy(id, tod);
  const base: Record<OccupancyLevel, number> = {
    low: 15, moderate: 42, high: 68, peak: 88, closed: 0,
  };
  // small variance per building
  return Math.min(100, Math.max(0, base[level] + (seed % 18) - 9));
}

// ─────────────────────────────────────────────────────────────
// PEDESTRIAN FLOW DOTS on edges
// ─────────────────────────────────────────────────────────────

interface FlowDotProps {
  x1: number; y1: number;
  x2: number; y2: number;
  speed: number;   // seconds
  delay: number;   // seconds
  size:  number;
  opacity: number;
}

function FlowDot({ x1, y1, x2, y2, speed, delay, size, opacity }: FlowDotProps) {
  // Use CSS animation via keyframe in global style (injected once)
  const id = `fd-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}-${Math.round(delay * 10)}`;
  return (
    <circle
      r={size}
      fill="rgba(255,255,255,0.55)"
      opacity={opacity}
      style={{
        filter: "blur(0.4px)",
        offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
        offsetDistance: "0%",
        animation: `flow-dot-travel ${speed}s linear ${delay}s infinite`,
        willChange: "offset-distance",
      } as React.CSSProperties}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// ROUTE SEGMENT
// ─────────────────────────────────────────────────────────────

interface RouteSegmentProps {
  x1: number; y1: number;
  x2: number; y2: number;
  index:    number;
  routeKey: string;
}

function RouteSegment({ x1, y1, x2, y2, index, routeKey }: RouteSegmentProps) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setDrawn(false);
    const t = setTimeout(() => setDrawn(true), index * 110 + 40);
    return () => clearTimeout(t);
  }, [routeKey, index]);

  const delay = `${index * 0.11}s`;

  return (
    <g>
      {/* Outer ambient glow */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.07)"
        strokeWidth={24}
        strokeLinecap="round"
        style={{
          filter:     "blur(12px)",
          opacity:    drawn ? 1 : 0,
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        }}
      />
      {/* Mid glow */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.18)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          filter:     "blur(2.5px)",
          opacity:    drawn ? 1 : 0,
          transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        }}
      />
      {/* Main draw line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#00d4ff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        style={{
          strokeDashoffset: drawn ? 0 : len,
          transition:       `stroke-dashoffset 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}`,
          filter:
            "drop-shadow(0 0 5px rgba(0,212,255,0.9)) drop-shadow(0 0 12px rgba(0,212,255,0.45))",
          willChange: "stroke-dashoffset",
        }}
      />
      {/* Animated travel dash overlay — shows motion along drawn route */}
      {drawn && (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={`${len * 0.12} ${len * 0.88}`}
          style={{
            animation: `route-dash-travel ${1.8 + index * 0.15}s linear infinite`,
            willChange: "stroke-dashoffset",
          }}
        />
      )}
      {/* Waypoint dot */}
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3.5}
        fill="#00d4ff"
        style={{
          opacity:         drawn ? 0.85 : 0,
          transform:       drawn ? "scale(1)" : "scale(0)",
          transformOrigin: `${(x1 + x2) / 2}px ${(y1 + y2) / 2}px`,
          transition:      `opacity 0.25s ease ${index * 0.11 + 0.5}s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.11 + 0.5}s`,
          filter:          "drop-shadow(0 0 5px #00d4ff) drop-shadow(0 0 10px rgba(0,212,255,0.55))",
          willChange:      "transform, opacity",
        }}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// BUILDING NODE
// ─────────────────────────────────────────────────────────────

interface BuildingNodeProps {
  building:      Building;
  isOnRoute:     boolean;
  isSelected:    boolean;
  isCurrentStep: boolean;
  isStart:       boolean;
  isEnd:         boolean;
  occupancy:     OccupancyLevel;
  occupancyPct:  number;
  onClick:       () => void;
}

function BuildingNode({
  building, isOnRoute, isSelected, isCurrentStep,
  isStart, isEnd, occupancy, occupancyPct, onClick,
}: BuildingNodeProps) {
  const [hov, setHov] = useState(false);

  const r          = isSelected ? 18 : hov ? 16 : 13;
  const ringColor  = isStart ? "#00d4ff" : isEnd ? "#8b5cf6" : building.color;
  const occColor   = OCCUPANCY_COLOR[occupancy];
  const TRANSITION = "all 0.28s cubic-bezier(0.22,1,0.36,1)";

  const strokeColor = isSelected
    ? building.color
    : isCurrentStep
    ? "#00d4ff"
    : isOnRoute
    ? "rgba(0,212,255,0.65)"
    : hov
    ? `${building.color}bb`
    : `${building.color}66`;

  // Active buildings get a very subtle outer breathing ring
  const isActive = occupancy === "high" || occupancy === "peak";

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Occupancy ambient glow — only for busy buildings */}
      {isActive && !isSelected && (
        <circle
          cx={building.x} cy={building.y}
          r={r + 18}
          fill={occColor}
          style={{
            opacity:    0.04,
            filter:     "blur(14px)",
            animation:  "occ-breathe 3.5s ease-in-out infinite",
            willChange: "opacity",
          }}
        />
      )}

      {/* Radar rings — CSS animation */}
      {(isStart || isEnd || isCurrentStep) && (
        <>
          <circle
            cx={building.x} cy={building.y}
            r={r + 10}
            fill="none"
            stroke={ringColor}
            strokeWidth={1}
            style={{ animation: "radar-ping 2.2s cubic-bezier(0,0,0.2,1) infinite 0.3s" }}
          />
          <circle
            cx={building.x} cy={building.y}
            r={r + 10}
            fill="none"
            stroke={ringColor}
            strokeWidth={1.5}
            style={{ animation: "radar-ping 2.2s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        </>
      )}

      {/* Hover / selected glow bloom */}
      {(isSelected || hov) && (
        <circle
          cx={building.x} cy={building.y}
          r={r + 14}
          fill={building.color}
          style={{
            opacity:    isSelected ? 0.12 : 0.06,
            filter:     "blur(10px)",
            transition: TRANSITION,
            willChange: "opacity",
          }}
        />
      )}

      {/* Main circle */}
      <circle
        cx={building.x} cy={building.y}
        r={13}
        fill={
          isSelected
            ? `${building.color}28`
            : hov
            ? `${building.color}14`
            : "rgba(6,13,24,0.93)"
        }
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : hov ? 2 : 1.5}
        style={{
          transform:       `scale(${isSelected ? 1.385 : hov ? 1.23 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition:      TRANSITION,
          filter:          isSelected
            ? `drop-shadow(0 0 10px ${building.color}) drop-shadow(0 0 22px ${building.color}55)`
            : hov
            ? `drop-shadow(0 0 7px ${building.color}77)`
            : "none",
          willChange: "transform, filter",
        }}
      />

      {/* Icon */}
      <text
        x={building.x} y={building.y + 4}
        textAnchor="middle"
        fontSize={10}
        style={{
          userSelect:      "none",
          transform:       `scale(${isSelected ? 1.4 : hov ? 1.2 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition:      TRANSITION,
          willChange:      "transform",
        }}
      >
        {building.icon}
      </text>

      {/* Occupancy dot — bottom-right of node */}
      {occupancy !== "closed" && (
        <circle
          cx={building.x + 10}
          cy={building.y + 10}
          r={3.5}
          fill={occColor}
          style={{
            filter:    `drop-shadow(0 0 3px ${occColor})`,
            opacity:   isSelected || hov ? 1 : 0.75,
            transform: `scale(${isSelected ? 1.385 : hov ? 1.23 : 1})`,
            transformOrigin: `${building.x + 10}px ${building.y + 10}px`,
            transition: TRANSITION,
          }}
        />
      )}

      {/* Start / end badge */}
      {isRouteStartEnd(isStart, isEnd) && (
        <>
          <circle
            cx={building.x + r - 2} cy={building.y - r + 2}
            r={6}
            fill={isStart ? "#00d4ff" : "#8b5cf6"}
            style={{
              filter:     `drop-shadow(0 0 5px ${isStart ? "#00d4ff" : "#8b5cf6"})`,
              transition: TRANSITION,
            }}
          />
          <text
            x={building.x + r - 2} y={building.y - r + 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={7}
            fontWeight={700}
            fontFamily="var(--font-body)"
            style={{ userSelect: "none" }}
          >
            {isStart ? "S" : "E"}
          </text>
        </>
      )}

      {/* Name label */}
      <text
        x={building.x}
        y={building.y + (isSelected ? 33 : 27)}
        textAnchor="middle"
        fill={
          isSelected
            ? "#fff"
            : isCurrentStep
            ? "#00d4ff"
            : isOnRoute
            ? "rgba(0,212,255,0.85)"
            : hov
            ? "rgba(240,244,255,0.9)"
            : "rgba(240,244,255,0.52)"
        }
        fontSize={isSelected ? 9.5 : 8.5}
        fontWeight={isSelected ? 600 : 400}
        fontFamily="var(--font-body)"
        style={{
          userSelect: "none",
          transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {building.name}
      </text>

      {/* Occupancy label + bar — visible on hover or selected */}
      {(hov || isSelected) && occupancy !== "closed" && (
        <>
          {/* Bar track */}
          <rect
            x={building.x - 18}
            y={building.y + (isSelected ? 39 : 33)}
            width={36} height={3} rx={1.5}
            fill="rgba(255,255,255,0.08)"
          />
          {/* Bar fill */}
          <rect
            x={building.x - 18}
            y={building.y + (isSelected ? 39 : 33)}
            width={36 * (occupancyPct / 100)} height={3} rx={1.5}
            fill={occColor}
            style={{
              filter:     `drop-shadow(0 0 2px ${occColor})`,
              transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          {/* Label */}
          <text
            x={building.x}
            y={building.y + (isSelected ? 52 : 46)}
            textAnchor="middle"
            fill={occColor}
            fontSize={7}
            fontFamily="var(--font-body)"
            style={{ userSelect: "none", opacity: 0.9 }}
          >
            {OCCUPANCY_LABEL[occupancy]} · {occupancyPct}%
          </text>
        </>
      )}

      {/* Floor count */}
      {isSelected && (
        <text
          x={building.x} y={building.y + 62}
          textAnchor="middle"
          fill={building.color}
          fontSize={8}
          fontFamily="var(--font-body)"
          style={{
            userSelect: "none",
            opacity:    0.7,
            animation:  "fade-in-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {building.floors}F · {building.category ?? "Building"}
        </text>
      )}
    </g>
  );
}

function isRouteStartEnd(isStart: boolean, isEnd: boolean): boolean {
  return isStart || isEnd;
}

// ─────────────────────────────────────────────────────────────
// GLOBAL CSS KEYFRAMES — injected once
// ─────────────────────────────────────────────────────────────

const GLOBAL_KEYFRAMES = `
@keyframes radar-ping {
  0%   { r: 0;  opacity: 0.85; }
  100% { r: 28; opacity: 0; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-18px); }
}
@keyframes occ-breathe {
  0%, 100% { opacity: 0.03; }
  50%       { opacity: 0.07; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 1;   transform: scale(1);    }
  50%       { opacity: 0.8; transform: scale(1.18); }
}
@keyframes orb-travel {
  0%   { transform: translateX(0px)  translateY(0px);  }
  100% { transform: translateX(12px) translateY(-8px); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes flow-dot-travel {
  0%   { offset-distance: 0%;   opacity: 0;   }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0;   }
}
@keyframes route-dash-travel {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -200; }
}
@keyframes live-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.3; }
}
@keyframes scan-line {
  0%   { transform: translateY(-100%); opacity: 0;    }
  10%  { opacity: 0.4; }
  90%  { opacity: 0.4; }
  100% { transform: translateY(100vh); opacity: 0; }
}
`;

function GlobalStyles() {
  return <style suppressHydrationWarning>{GLOBAL_KEYFRAMES}</style>;
}

// ─────────────────────────────────────────────────────────────
// LIVE STATUS BAR
// ─────────────────────────────────────────────────────────────

function LiveStatusBar({ tod, buildingCount }: { tod: TimeOfDay; buildingCount: number }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  return (
    <div
      className="absolute top-4 left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl"
      style={{
        background:     "rgba(6,13,24,0.82)",
        border:         "1px solid rgba(0,212,255,0.14)",
        backdropFilter: "blur(16px)",
        boxShadow:      "0 2px 16px rgba(0,0,0,0.45)",
      }}
    >
      {/* Live dot */}
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
        style={{
          boxShadow: "0 0 6px #22c55e",
          animation: "live-blink 1.8s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <span
        className="font-mono text-[11px]"
        style={{ color: "rgba(240,244,255,0.75)", letterSpacing: "0.5px" }}
      >
        {hh}:{mm}:{ss}
      </span>
      <span
        className="text-[9px] px-1.5 py-0.5 rounded"
        style={{
          background: "rgba(0,212,255,0.08)",
          border:     "1px solid rgba(0,212,255,0.16)",
          color:      "rgba(0,212,255,0.7)",
          fontFamily: "var(--font-display)",
          letterSpacing: "1px",
        }}
      >
        {getTimeLabel(tod).toUpperCase()}
      </span>
      <span
        className="text-[9px]"
        style={{ color: "rgba(240,244,255,0.35)", fontFamily: "var(--font-body)" }}
      >
        {buildingCount} nodes
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY LEGEND
// ─────────────────────────────────────────────────────────────

function OccupancyLegend() {
  const items: OccupancyLevel[] = ["low", "moderate", "high", "peak"];
  return (
    <div
      className="absolute bottom-16 left-4 z-20 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{
        background:     "rgba(6,13,24,0.78)",
        border:         "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        className="text-[8px] tracking-widest mb-0.5"
        style={{ color: "rgba(240,244,255,0.3)", fontFamily: "var(--font-display)" }}
      >
        OCCUPANCY
      </div>
      {items.map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: OCCUPANCY_COLOR[level],
              boxShadow:  `0 0 4px ${OCCUPANCY_COLOR[level]}`,
            }}
          />
          <span
            className="text-[8.5px]"
            style={{ color: "rgba(240,244,255,0.5)", fontFamily: "var(--font-body)" }}
          >
            {OCCUPANCY_LABEL[level]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CampusMapProps {
  route:            string[];
  selectedBuilding: Building | null;
  currentStep:      number;
  isNavigating:     boolean;
  onBuildingClick:  (b: Building) => void;
  height?:          string;
}

// ─────────────────────────────────────────────────────────────
// CAMPUS MAP — main component
// ─────────────────────────────────────────────────────────────

export function CampusMap({
  route            = [],
  selectedBuilding,
  currentStep      = 0,
  isNavigating     = false,
  onBuildingClick,
  height           = "calc(100vh - 95px)",
}: CampusMapProps) {
  const [zoom,     setZoom]     = useState(1);
  const [pan,      setPan]      = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [tod,      setTod]      = useState<TimeOfDay>(getTimeOfDay);

  // Refresh time-of-day every minute
  useEffect(() => {
    const iv = setInterval(() => setTod(getTimeOfDay()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const palette = TIME_PALETTE[tod];

  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const routeKey = route.join("-");
  const routeSet = useMemo(() => new Set(route), [routeKey]);

  // Pre-compute occupancy once per render (stable per tod)
  const occupancyMap = useMemo(() => {
    const m: Record<string, { level: OccupancyLevel; pct: number }> = {};
    for (const b of BUILDINGS) {
      m[b.id] = {
        level: getBuildingOccupancy(b.id, tod),
        pct:   getOccupancyPct(b.id, tod),
      };
    }
    return m;
  }, [tod]);

  const isRouteEdge = useCallback(
    (a: string, b: string) => {
      for (let i = 0; i < route.length - 1; i++) {
        if (
          (route[i] === a && route[i + 1] === b) ||
          (route[i] === b && route[i + 1] === a)
        )
          return true;
      }
      return false;
    },
    [routeKey]
  );

  // ── Mouse handlers ───────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.35, Math.min(4.5, z - e.deltaY * 0.0008)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPan((p) => ({
        x: p.x + e.clientX - lastMouse.current.x,
        y: p.y + e.clientY - lastMouse.current.y,
      }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    },
    [dragging]
  );

  const onMouseUp = () => setDragging(false);

  // ── Touch handlers ───────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1)
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const onTouchEnd = () => { lastTouch.current = null; };

  // ── Controls ─────────────────────────────────────────────
  const zoomIn  = useCallback(() => setZoom((z) => Math.min(4.5, z + 0.3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.35, z - 0.3)), []);
  const reset   = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const activeBuilding = useMemo(
    () =>
      isNavigating && route[currentStep]
        ? BUILDINGS.find((b) => b.id === route[currentStep])
        : null,
    [isNavigating, route, currentStep]
  );

  // Pedestrian flow edges — a stable subset of PATH_EDGES
  const flowEdges = useMemo(() => {
    // Show flow on ~40% of edges, not on route edges
    return PATH_EDGES.filter((_, i) => i % 3 !== 0).slice(0, 18);
  }, []);

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <GlobalStyles />
      <div
        className="relative overflow-hidden"
        style={{
          height,
          width:      "100%",
          background: palette.bg,
          transition: "background 2s ease",
        }}
      >
        {/* ── Atmospheric background ── */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
          {/* Grid */}
          <div
            style={{
              position:        "absolute",
              inset:           0,
              backgroundImage:
                `linear-gradient(${palette.grid} 1px, transparent 1px), ` +
                `linear-gradient(90deg, ${palette.grid} 1px, transparent 1px)`,
              backgroundSize:  "60px 60px",
              transition:      "background-image 2s ease",
            }}
          />
          {/* Ambient orbs */}
          <div
            style={{
              position:     "absolute", top: "18%", left: "12%",
              width: 320, height: 320, borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.orbA} 0%, transparent 70%)`,
              animation:  "float 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position:     "absolute", bottom: "18%", right: "12%",
              width: 260, height: 260, borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.orbB} 0%, transparent 70%)`,
              animation:  "float 10s ease-in-out infinite 3s",
            }}
          />
          {/* Subtle scan line — night/evening only */}
          {(tod === "night" || tod === "evening") && (
            <div
              style={{
                position:   "absolute",
                inset:      0,
                background: "linear-gradient(transparent 49%, rgba(0,212,255,0.015) 50%, transparent 51%)",
                backgroundSize: "100% 6px",
                pointerEvents: "none",
                opacity:    0.6,
              }}
            />
          )}
        </div>

        {/* ── Live status bar ── */}
        <LiveStatusBar tod={tod} buildingCount={BUILDINGS.length} />

        {/* ── Occupancy legend ── */}
        <OccupancyLegend />

        {/* ── Zoom controls ── */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-20">
          {[
            { icon: ZoomIn,    fn: zoomIn,  title: "Zoom In"    },
            { icon: ZoomOut,   fn: zoomOut, title: "Zoom Out"   },
            { icon: RotateCcw, fn: reset,   title: "Reset View" },
          ].map(({ icon: Icon, fn, title }) => (
            <motion.button
              key={title}
              whileHover={{ scale: 1.1, boxShadow: "0 0 18px rgba(0,212,255,0.38)" }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={fn}
              title={title}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:     "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))",
                border:         "1px solid rgba(0,212,255,0.28)",
                color:          "rgba(0,212,255,0.85)",
                backdropFilter: "blur(16px)",
                cursor:         "pointer",
                boxShadow:      "0 2px 12px rgba(0,0,0,0.5)",
                willChange:     "transform",
              }}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
          <div
            className="text-center text-[9px] font-mono mt-0.5"
            style={{ color: "rgba(0,212,255,0.35)" }}
          >
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* ── Hint strip ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] px-4 py-1.5 rounded-full pointer-events-none flex items-center gap-2"
          style={{
            background:     "rgba(6,13,24,0.82)",
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

        {/* ── Navigation banner ── */}
        <AnimatePresence>
          {isNavigating && activeBuilding && (
            <motion.div
              key={activeBuilding.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -12,  scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.85 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-5 py-3.5 rounded-2xl"
              style={{
                background:     "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(6,13,24,0.97))",
                border:         "1px solid rgba(0,212,255,0.35)",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 0 40px rgba(0,212,255,0.15), 0 8px 32px rgba(0,0,0,0.55), " +
                  "inset 0 0 20px rgba(0,212,255,0.04)",
                minWidth: 300,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 8px rgba(0,212,255,0.4)",
                    "0 0 22px rgba(0,212,255,0.75)",
                    "0 0 8px rgba(0,212,255,0.4)",
                  ],
                }}
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
                <div
                  className="text-[9px] tracking-[2px] mb-0.5 font-semibold"
                  style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
                >
                  NAVIGATING TO
                </div>
                <div
                  className="text-[14px] font-bold truncate"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                >
                  {activeBuilding.name}
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: "rgba(240,244,255,0.5)", fontFamily: "var(--font-body)" }}
                >
                  Step {currentStep + 1} of {route.length} ·{" "}
                  <span style={{ color: OCCUPANCY_COLOR[occupancyMap[activeBuilding.id]?.level ?? "low"] }}>
                    {OCCUPANCY_LABEL[occupancyMap[activeBuilding.id]?.level ?? "low"]}
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: "var(--cyan)", boxShadow: "0 0 10px var(--cyan)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SVG Canvas ── */}
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
          onTouchEnd={onTouchEnd}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 620 620"
            style={{
              transform:       `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: "center",
              transition:      dragging ? "none" : "transform 0.18s cubic-bezier(0.22,1,0.36,1)",
              willChange:      "transform",
            }}
          >
            <defs>
              <radialGradient id="campus-bg-main" cx="50%" cy="50%" r="65%">
                <stop offset="0%"   stopColor={palette.mapBg} />
                <stop offset="50%"  stopColor="#070f1e" />
                <stop offset="100%" stopColor="#020408" />
              </radialGradient>
              <pattern id="campus-grid-main" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={palette.grid}
                  strokeWidth="0.5"
                />
              </pattern>
              <radialGradient id="campus-center-glow" cx="50%" cy="50%" r="40%">
                <stop offset="0%"   stopColor={palette.centerGlow} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* Route travel dash animation */}
              <style>{`
                @keyframes route-dash-travel {
                  from { stroke-dashoffset: 0;    }
                  to   { stroke-dashoffset: -200; }
                }
                @keyframes flow-dot-travel {
                  0%   { offset-distance: 0%;   opacity: 0; }
                  8%   { opacity: 0.7; }
                  92%  { opacity: 0.7; }
                  100% { offset-distance: 100%; opacity: 0; }
                }
              `}</style>
            </defs>

            {/* Background */}
            <rect width="620" height="620" fill="url(#campus-bg-main)" />
            <rect width="620" height="620" fill="url(#campus-grid-main)" />
            <rect width="620" height="620" fill="url(#campus-center-glow)" />

            {/* Campus boundary */}
            <rect
              x="48" y="48" width="524" height="524" rx="22"
              fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="4"
            />
            <rect
              x="50" y="50" width="520" height="520" rx="20"
              fill="none" stroke={palette.accent}
              strokeWidth="1" strokeDasharray="10 7"
            />

            {/* Zone shading */}
            <ellipse
              cx="175" cy="300" rx="110" ry="155"
              fill="rgba(139,92,246,0.025)"
              stroke="rgba(139,92,246,0.07)"
              strokeWidth="1" strokeDasharray="5 6"
            />
            <ellipse
              cx="445" cy="265" rx="100" ry="135"
              fill="rgba(59,130,246,0.02)"
              stroke="rgba(59,130,246,0.06)"
              strokeWidth="1" strokeDasharray="5 6"
            />

            {/* Zone labels */}
            <text
              x="175" y="148" textAnchor="middle"
              fill="rgba(139,92,246,0.28)" fontSize="8"
              letterSpacing="2.5" fontFamily="var(--font-display)"
            >
              ACADEMIC WEST
            </text>
            <text
              x="445" y="130" textAnchor="middle"
              fill="rgba(59,130,246,0.25)" fontSize="8"
              letterSpacing="2.5" fontFamily="var(--font-display)"
            >
              ACADEMIC EAST
            </text>

            {/* Road guides */}
            {[
              { x1: 310, y1: 62,  x2: 310, y2: 558 },
              { x1: 62,  y1: 310, x2: 558, y2: 310 },
            ].map((l, i) => (
              <g key={i}>
                <line {...l} stroke="rgba(255,255,255,0.02)"  strokeWidth="32" />
                <line {...l} stroke="rgba(0,212,255,0.04)" strokeWidth="1.5" strokeDasharray="14 10" />
              </g>
            ))}

            {/* Campus header */}
            <text
              x="310" y="34" textAnchor="middle"
              fill={palette.accent} fontSize="9.5"
              letterSpacing="5" fontFamily="var(--font-display)"
            >
              RIMT UNIVERSITY CAMPUS
            </text>
            <text
              x="310" y="604" textAnchor="middle"
              fill="rgba(0,212,255,0.12)" fontSize="8"
              letterSpacing="3" fontFamily="var(--font-display)"
            >
              PRESENTED BY NIKHIL
            </text>

            {/* ── Inactive path edges ── */}
            {PATH_EDGES.map(({ from, to }, i) => {
              const bA = BUILDINGS.find((b) => b.id === from);
              const bB = BUILDINGS.find((b) => b.id === to);
              if (!bA || !bB || isRouteEdge(from, to)) return null;
              return (
                <line
                  key={i}
                  x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y}
                  stroke="rgba(255,255,255,0.065)"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />
              );
            })}

            {/* ── Pedestrian flow dots on inactive edges ── */}
            {tod !== "night" &&
              flowEdges.map(({ from, to }, i) => {
                const bA = BUILDINGS.find((b) => b.id === from);
                const bB = BUILDINGS.find((b) => b.id === to);
                if (!bA || !bB) return null;
                // Activity level scales dot count with time-of-day
                const dotCount =
                  tod === "midday" ? 3 : tod === "afternoon" ? 2 : 1;
                return Array.from({ length: dotCount }, (_, d) => (
                  <FlowDot
                    key={`flow-${i}-${d}`}
                    x1={bA.x} y1={bA.y}
                    x2={bB.x} y2={bB.y}
                    speed={4 + (i % 4) + d * 0.8}
                    delay={(i * 0.55 + d * 1.6) % 6}
                    size={1 + (i % 2) * 0.5}
                    opacity={0.35 + (i % 3) * 0.08}
                  />
                ));
              })}

            {/* ── Animated route segments ── */}
            {route.length > 1 &&
              route.map((id, i) => {
                if (i === route.length - 1) return null;
                const bA = BUILDINGS.find((b) => b.id === route[i]);
                const bB = BUILDINGS.find((b) => b.id === route[i + 1]);
                if (!bA || !bB) return null;
                return (
                  <RouteSegment
                    key={`${routeKey}-seg-${i}`}
                    x1={bA.x} y1={bA.y}
                    x2={bB.x} y2={bB.y}
                    index={i}
                    routeKey={routeKey}
                  />
                );
              })}

            {/* ── Building nodes ── */}
            {BUILDINGS.map((b) => (
              <BuildingNode
                key={b.id}
                building={b}
                isOnRoute={routeSet.has(b.id)}
                isSelected={selectedBuilding?.id === b.id}
                isCurrentStep={isNavigating && route[currentStep] === b.id}
                isStart={route[0] === b.id}
                isEnd={route[route.length - 1] === b.id}
                occupancy={occupancyMap[b.id]?.level ?? "low"}
                occupancyPct={occupancyMap[b.id]?.pct ?? 0}
                onClick={() => onBuildingClick(b)}
              />
            ))}

            {/* ── Live navigation orb ── */}
            {isNavigating && route.length > 1 && (() => {
              const fromId = route[Math.max(0, currentStep)];
              const toId   = route[Math.min(currentStep + 1, route.length - 1)];
              const from   = BUILDINGS.find((b) => b.id === fromId);
              const to     = BUILDINGS.find((b) => b.id === toId);
              if (!from || !to) return null;

              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;

              return (
                <g style={{ animation: "orb-travel 3.2s cubic-bezier(0.45,0,0.55,1) infinite alternate" }}>
                  <circle cx={mx} cy={my} r={26}
                    fill="rgba(0,212,255,0.1)"
                    style={{ filter: "blur(14px)", willChange: "transform" }}
                  />
                  <circle cx={mx} cy={my} r={16}
                    fill="none" stroke="rgba(0,212,255,0.25)" strokeWidth={1.5}
                    style={{ animation: "radar-ping 2s cubic-bezier(0,0,0.2,1) infinite" }}
                  />
                  <circle cx={mx} cy={my} r={10}
                    fill="none" stroke="rgba(0,212,255,0.45)" strokeWidth={1}
                    style={{ animation: "radar-ping 2s cubic-bezier(0,0,0.2,1) infinite 0.45s" }}
                  />
                  <circle cx={mx} cy={my} r={6}
                    fill="#00d4ff"
                    style={{
                      filter:    "drop-shadow(0 0 10px #00d4ff) drop-shadow(0 0 22px rgba(0,212,255,0.5))",
                      animation: "glow-pulse 1.4s cubic-bezier(0.45,0,0.55,1) infinite",
                      willChange: "transform",
                    }}
                  />
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </>
  );
}