"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin, Clock } from "lucide-react";
import { BUILDINGS, CATEGORY_LABELS, PATH_EDGES } from "@/data/buildings";
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

// Light palette — maps to Landing Page tokens
const TIME_PALETTE: Record<TimeOfDay, {
  bg:         string;
  mapBg:      string;
  gridColor:  string;
  orbA:       string;
  orbB:       string;
  accent:     string;
  pathEdge:   string;
  zone:       string;
}> = {
  morning: {
    bg:        "linear-gradient(160deg, #eef4ff 0%, #f4f7fd 40%, #fdf8f0 100%)",
    mapBg:     "#f0f5ff",
    gridColor: "rgba(56,130,246,0.055)",
    orbA:      "rgba(56,130,246,0.10)",
    orbB:      "rgba(201,146,42,0.08)",
    accent:    "rgba(56,130,246,0.55)",
    pathEdge:  "rgba(13,26,46,0.10)",
    zone:      "rgba(56,130,246,0.04)",
  },
  midday: {
    bg:        "linear-gradient(160deg, #eaf3ff 0%, #f3f7fd 40%, #fff9ee 100%)",
    mapBg:     "#eef4ff",
    gridColor: "rgba(56,130,246,0.06)",
    orbA:      "rgba(56,130,246,0.12)",
    orbB:      "rgba(201,146,42,0.09)",
    accent:    "rgba(56,130,246,0.6)",
    pathEdge:  "rgba(13,26,46,0.11)",
    zone:      "rgba(56,130,246,0.045)",
  },
  afternoon: {
    bg:        "linear-gradient(160deg, #edf3ff 0%, #f5f8fd 40%, #fff7ec 100%)",
    mapBg:     "#f1f5ff",
    gridColor: "rgba(56,130,246,0.05)",
    orbA:      "rgba(56,130,246,0.09)",
    orbB:      "rgba(201,146,42,0.10)",
    accent:    "rgba(56,130,246,0.52)",
    pathEdge:  "rgba(13,26,46,0.09)",
    zone:      "rgba(56,130,246,0.038)",
  },
  evening: {
    bg:        "linear-gradient(160deg, #f0eaff 0%, #f5f3fd 40%, #fff4e8 100%)",
    mapBg:     "#f3f0ff",
    gridColor: "rgba(107,79,207,0.045)",
    orbA:      "rgba(107,79,207,0.09)",
    orbB:      "rgba(201,146,42,0.10)",
    accent:    "rgba(107,79,207,0.5)",
    pathEdge:  "rgba(13,26,46,0.09)",
    zone:      "rgba(107,79,207,0.038)",
  },
  night: {
    bg:        "linear-gradient(160deg, #e8edf8 0%, #f0f3fa 40%, #f8f6ff 100%)",
    mapBg:     "#eef0f8",
    gridColor: "rgba(13,26,46,0.04)",
    orbA:      "rgba(56,130,246,0.07)",
    orbB:      "rgba(107,79,207,0.06)",
    accent:    "rgba(13,26,46,0.35)",
    pathEdge:  "rgba(13,26,46,0.08)",
    zone:      "rgba(13,26,46,0.025)",
  },
};

// ─────────────────────────────────────────────────────────────
// OCCUPANCY — deterministic per building + time
// ─────────────────────────────────────────────────────────────

type OccupancyLevel = "low" | "moderate" | "high" | "peak" | "closed";

// Premium semantic colors — no neon, matches design token palette
const OCCUPANCY_COLOR: Record<OccupancyLevel, string> = {
  low:      "#0d9e6e",   // --green
  moderate: "#c9922a",   // --amber
  high:     "#e07a20",
  peak:     "#d94040",   // --red
  closed:   "#8a9ab8",   // --silver
};

const OCCUPANCY_LABEL: Record<OccupancyLevel, string> = {
  low:      "Quiet",
  moderate: "Active",
  high:     "Busy",
  peak:     "Peak",
  closed:   "Closed",
};

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
  if (seed < 15) return "low";
  if (seed < 45) return "moderate";
  if (seed < 75) return "high";
  return "peak";
}

function getOccupancyPct(id: string, tod: TimeOfDay): number {
  const seed = hashId(id) % 100;
  const level = getBuildingOccupancy(id, tod);
  const base: Record<OccupancyLevel, number> = {
    low: 15, moderate: 42, high: 68, peak: 88, closed: 0,
  };
  return Math.min(100, Math.max(0, base[level] + (seed % 18) - 9));
}

// ─────────────────────────────────────────────────────────────
// PEDESTRIAN FLOW DOTS
// ─────────────────────────────────────────────────────────────

interface FlowDotProps {
  x1: number; y1: number;
  x2: number; y2: number;
  speed: number;
  delay: number;
  size:  number;
  opacity: number;
}

function FlowDot({ x1, y1, x2, y2, speed, delay, size, opacity }: FlowDotProps) {
  return (
    <circle
      r={size}
      fill="rgba(56,130,246,0.7)"
      opacity={opacity}
      style={{
        offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
        offsetDistance: "0%",
        animation: `flow-dot-travel ${speed}s linear ${delay}s infinite`,
        willChange: "offset-distance",
      } as React.CSSProperties}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// ROUTE SEGMENT — premium light design
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
      {/* Soft shadow blur */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(56,130,246,0.12)"
        strokeWidth={18}
        strokeLinecap="round"
        style={{
          filter:     "blur(10px)",
          opacity:    drawn ? 1 : 0,
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        }}
      />
      {/* Mid glow — sky blue, soft */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(56,130,246,0.22)"
        strokeWidth={5}
        strokeLinecap="round"
        style={{
          filter:     "blur(2px)",
          opacity:    drawn ? 1 : 0,
          transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        }}
      />
      {/* Main draw line — premium sky */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#3882f6"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        style={{
          strokeDashoffset: drawn ? 0 : len,
          transition:       `stroke-dashoffset 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}`,
          filter:           "drop-shadow(0 1px 3px rgba(56,130,246,0.35))",
          willChange:       "stroke-dashoffset",
        }}
      />
      {/* Animated travel dash overlay */}
      {drawn && (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={`${len * 0.10} ${len * 0.90}`}
          style={{
            animation: `route-dash-travel ${1.8 + index * 0.15}s linear infinite`,
            willChange: "stroke-dashoffset",
          }}
        />
      )}
      {/* Midpoint waypoint dot */}
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3}
        fill="#ffffff"
        stroke="#3882f6"
        strokeWidth={1.5}
        style={{
          opacity:         drawn ? 1 : 0,
          transform:       drawn ? "scale(1)" : "scale(0)",
          transformOrigin: `${(x1 + x2) / 2}px ${(y1 + y2) / 2}px`,
          transition:      `opacity 0.25s ease ${index * 0.11 + 0.5}s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.11 + 0.5}s`,
          filter:          "drop-shadow(0 1px 4px rgba(56,130,246,0.4))",
          willChange:      "transform, opacity",
        }}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// BUILDING NODE — premium light design
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

  const occColor   = OCCUPANCY_COLOR[occupancy];
  const TRANSITION = "all 0.28s cubic-bezier(0.22,1,0.36,1)";

  // Fill colors — white surface, blue accent
  const fillColor = isSelected
    ? "rgba(56,130,246,0.10)"
    : hov
    ? "rgba(56,130,246,0.06)"
    : "rgba(255,255,255,0.92)";

  const strokeColor = isSelected
    ? "#3882f6"
    : isCurrentStep
    ? "#3882f6"
    : isOnRoute
    ? "rgba(56,130,246,0.7)"
    : hov
    ? "rgba(56,130,246,0.5)"
    : "rgba(13,26,46,0.14)";

  const labelColor = isSelected
    ? "#0d1a2e"
    : isCurrentStep
    ? "#1a4fa8"
    : isOnRoute
    ? "#3882f6"
    : hov
    ? "#0d1a2e"
    : "rgba(13,26,46,0.5)";

  const ringColor = isStart ? "#3882f6" : isEnd ? "#6b4fcf" : building.color;
  const isActive  = occupancy === "high" || occupancy === "peak";

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${building.name}`}
      style={{ cursor: "pointer" }}
    >
      {/* Occupancy ambient glow — soft, no neon */}
      {isActive && !isSelected && (
        <circle
          cx={building.x} cy={building.y}
          r={32}
          fill={occColor}
          style={{
            opacity:    0.06,
            filter:     "blur(12px)",
            animation:  "occ-breathe 3.5s ease-in-out infinite",
            willChange: "opacity",
          }}
        />
      )}

      {/* Radar rings — route start/end/active step */}
      {(isStart || isEnd || isCurrentStep) && (
        <>
          <circle
            cx={building.x} cy={building.y}
            r={14}
            fill="none"
            stroke={ringColor}
            strokeWidth={0.8}
            style={{
              opacity: 0.35,
              animation: "radar-ping-light 2.4s cubic-bezier(0,0,0.2,1) infinite 0.3s",
            }}
          />
          <circle
            cx={building.x} cy={building.y}
            r={14}
            fill="none"
            stroke={ringColor}
            strokeWidth={1.2}
            style={{
              opacity: 0.45,
              animation: "radar-ping-light 2.4s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
        </>
      )}

      {/* Hover / selected glow — soft shadow, not neon */}
      {(isSelected || hov) && (
        <circle
          cx={building.x} cy={building.y}
          r={22}
          fill="rgba(56,130,246,1)"
          style={{
            opacity:    isSelected ? 0.08 : 0.04,
            filter:     "blur(8px)",
            transition: TRANSITION,
          }}
        />
      )}

      {/* Drop shadow for elevation */}
      <circle
        cx={building.x} cy={building.y + 1.5}
        r={13}
        fill="rgba(13,26,46,0.08)"
        style={{
          filter:     "blur(4px)",
          transform:  `scale(${isSelected ? 1.38 : hov ? 1.22 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition: TRANSITION,
        }}
      />

      {/* Main circle — white glass surface */}
      <circle
        cx={building.x} cy={building.y}
        r={13}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2 : hov ? 1.5 : 1}
        style={{
          transform:       `scale(${isSelected ? 1.385 : hov ? 1.23 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition:      TRANSITION,
          filter:          isSelected
            ? "drop-shadow(0 2px 8px rgba(56,130,246,0.25)) drop-shadow(0 1px 3px rgba(13,26,46,0.12))"
            : hov
            ? "drop-shadow(0 2px 6px rgba(56,130,246,0.18)) drop-shadow(0 1px 2px rgba(13,26,46,0.08))"
            : "drop-shadow(0 1px 2px rgba(13,26,46,0.06))",
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

      {/* Occupancy dot — bottom-right */}
      {occupancy !== "closed" && (
        <circle
          cx={building.x + 10}
          cy={building.y + 10}
          r={3}
          fill={occColor}
          stroke="white"
          strokeWidth={1}
          style={{
            opacity:   isSelected || hov ? 1 : 0.8,
            transform: `scale(${isSelected ? 1.385 : hov ? 1.23 : 1})`,
            transformOrigin: `${building.x + 10}px ${building.y + 10}px`,
            transition: TRANSITION,
            filter:    "drop-shadow(0 1px 2px rgba(13,26,46,0.15))",
          }}
        />
      )}

      {/* Start / end badge */}
      {(isStart || isEnd) && (
        <>
          <circle
            cx={building.x + 11} cy={building.y - 11}
            r={6}
            fill={isStart ? "#3882f6" : "#6b4fcf"}
            stroke="white"
            strokeWidth={1.5}
            style={{
              filter:     "drop-shadow(0 1px 4px rgba(13,26,46,0.2))",
              transition: TRANSITION,
            }}
          />
          <text
            x={building.x + 11} y={building.y - 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={7}
            fontWeight={700}
            fontFamily="var(--font-sans)"
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
        fill={labelColor}
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

      {/* Occupancy bar + label on hover/selected */}
      {(hov || isSelected) && occupancy !== "closed" && (
        <>
          <rect
            x={building.x - 18}
            y={building.y + (isSelected ? 39 : 33)}
            width={36} height={3} rx={1.5}
            fill="rgba(13,26,46,0.08)"
          />
          <rect
            x={building.x - 18}
            y={building.y + (isSelected ? 39 : 33)}
            width={36 * (occupancyPct / 100)} height={3} rx={1.5}
            fill={occColor}
            style={{
              filter:     "drop-shadow(0 0 2px rgba(13,26,46,0.1))",
              transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
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

      {/* Floor count — selected only */}
      {isSelected && (
        <text
          x={building.x} y={building.y + 62}
          textAnchor="middle"
          fill="rgba(13,26,46,0.4)"
          fontSize={8}
          fontFamily="var(--font-body)"
          style={{
            userSelect: "none",
            animation:  "fade-in-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {building.floors}F · {CATEGORY_LABELS[building.type]}
        </text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// GLOBAL KEYFRAMES — injected once
// ─────────────────────────────────────────────────────────────

const GLOBAL_KEYFRAMES = `
@keyframes radar-ping-light {
  0%   { r: 0;  opacity: 0.6; }
  100% { r: 28; opacity: 0;   }
}
@keyframes float-gentle {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-16px); }
}
@keyframes occ-breathe {
  0%, 100% { opacity: 0.04; }
  50%       { opacity: 0.09; }
}
@keyframes glow-pulse-sky {
  0%, 100% { opacity: 1;   transform: scale(1);    }
  50%       { opacity: 0.8; transform: scale(1.18); }
}
@keyframes orb-travel {
  0%   { transform: translateX(0px)  translateY(0px);  }
  100% { transform: translateX(10px) translateY(-6px); }
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
  from { stroke-dashoffset: 0;    }
  to   { stroke-dashoffset: -200; }
}
@keyframes live-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.3; }
}
@keyframes badge-appear {
  from { opacity: 0; transform: translateY(4px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes sunrise-shimmer {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1;   }
}
`;

function GlobalStyles() {
  return <style suppressHydrationWarning>{GLOBAL_KEYFRAMES}</style>;
}

// ─────────────────────────────────────────────────────────────
// LIVE STATUS BAR — premium light glass
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
        background:     "rgba(255,255,255,0.82)",
        border:         "1px solid rgba(56,130,246,0.14)",
        backdropFilter: "blur(20px)",
        boxShadow:      "0 2px 12px rgba(13,26,46,0.07), 0 1px 3px rgba(13,26,46,0.05)",
      }}
    >
      {/* Live dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: "#0d9e6e",
          boxShadow:  "0 0 5px rgba(13,158,110,0.5)",
          animation:  "live-blink 1.8s ease-in-out infinite",
        }}
      />
      <span
        className="font-mono text-[11px]"
        style={{ color: "rgba(13,26,46,0.6)", letterSpacing: "0.5px" }}
      >
        {hh}:{mm}:{ss}
      </span>
      <span
        className="text-[9px] px-1.5 py-0.5 rounded-lg"
        style={{
          background:    "rgba(56,130,246,0.08)",
          border:        "1px solid rgba(56,130,246,0.16)",
          color:         "var(--sky)",
          fontFamily:    "var(--font-sans)",
          letterSpacing: "0.6px",
          fontWeight:    600,
        }}
      >
        {getTimeLabel(tod).toUpperCase()}
      </span>
      <span
        className="text-[9px]"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
      >
        {buildingCount} nodes - simulated occupancy
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY LEGEND — premium glass
// ─────────────────────────────────────────────────────────────

function OccupancyLegend() {
  const items: OccupancyLevel[] = ["low", "moderate", "high", "peak"];
  return (
    <div
      className="absolute bottom-16 left-4 z-20 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{
        background:     "rgba(255,255,255,0.78)",
        border:         "1px solid rgba(13,26,46,0.07)",
        backdropFilter: "blur(18px)",
        boxShadow:      "0 2px 12px rgba(13,26,46,0.06), 0 1px 3px rgba(13,26,46,0.04)",
      }}
    >
      <div
        className="text-[8px] tracking-widest mb-0.5 font-semibold"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-sans)" }}
      >
        OCCUPANCY
      </div>
      {items.map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: OCCUPANCY_COLOR[level],
              boxShadow:  `0 0 3px ${OCCUPANCY_COLOR[level]}66`,
            }}
          />
          <span
            className="text-[8.5px]"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
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

  useEffect(() => {
    const iv = setInterval(() => setTod(getTimeOfDay()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const palette = TIME_PALETTE[tod];

  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const routeKey = route.join("-");
  const routeSet = useMemo(() => new Set(route), [route]);

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
    [route]
  );

  // ── Mouse handlers ────────────────────────────────────────
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

  // ── Touch handlers ────────────────────────────────────────
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

  // ── Controls ──────────────────────────────────────────────
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

  const flowEdges = useMemo(() => {
    return PATH_EDGES.filter((_, i) => i % 3 !== 0).slice(0, 18);
  }, []);

  // ── Render ─────────────────────────────────────────────────
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
          {/* Subtle grid — light, not cyberpunk */}
          <div
            style={{
              position:        "absolute",
              inset:           0,
              backgroundImage:
                `linear-gradient(${palette.gridColor} 1px, transparent 1px), ` +
                `linear-gradient(90deg, ${palette.gridColor} 1px, transparent 1px)`,
              backgroundSize:  "64px 64px",
              transition:      "background-image 2s ease",
            }}
          />
          {/* Ambient orbs — sky + gold, soft */}
          <div
            style={{
              position:     "absolute", top: "15%", left: "10%",
              width: 380, height: 380, borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.orbA} 0%, transparent 68%)`,
              animation:  "float-gentle 9s ease-in-out infinite",
              filter:     "blur(1px)",
            }}
          />
          <div
            style={{
              position:     "absolute", bottom: "16%", right: "10%",
              width: 300, height: 300, borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.orbB} 0%, transparent 68%)`,
              animation:  "float-gentle 11s ease-in-out infinite 3s",
              filter:     "blur(1px)",
            }}
          />
        </div>

        {/* ── Live status bar ── */}
        <LiveStatusBar tod={tod} buildingCount={BUILDINGS.length} />

        {/* ── Occupancy legend ── */}
        <OccupancyLegend />

        {/* ── Zoom controls — premium glass ── */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
          {[
            { icon: ZoomIn,    fn: zoomIn,  title: "Zoom In"    },
            { icon: ZoomOut,   fn: zoomOut, title: "Zoom Out"   },
            { icon: RotateCcw, fn: reset,   title: "Reset View" },
          ].map(({ icon: Icon, fn, title }) => (
            <motion.button
              key={title}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              onClick={fn}
              title={title}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:     "rgba(255,255,255,0.88)",
                border:         "1px solid rgba(56,130,246,0.18)",
                color:          "var(--sky)",
                backdropFilter: "blur(18px)",
                cursor:         "pointer",
                boxShadow:      "0 2px 10px rgba(13,26,46,0.08), 0 1px 3px rgba(13,26,46,0.05)",
                willChange:     "transform",
              }}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
          <div
            className="text-center text-[9px] font-mono mt-0.5"
            style={{ color: "var(--text-3)" }}
          >
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* ── Hint strip ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] px-4 py-1.5 rounded-full pointer-events-none flex items-center gap-2"
          style={{
            background:     "rgba(255,255,255,0.8)",
            border:         "1px solid rgba(56,130,246,0.12)",
            color:          "var(--text-3)",
            fontFamily:     "var(--font-body)",
            whiteSpace:     "nowrap",
            backdropFilter: "blur(14px)",
            boxShadow:      "0 1px 6px rgba(13,26,46,0.06)",
          }}
        >
          <Crosshair className="w-3 h-3 opacity-60" />
          Scroll to zoom · Drag to pan · Click a building
        </div>

        {/* ── Navigation banner — premium glass ── */}
        <AnimatePresence>
          {isNavigating && activeBuilding && (
            <motion.div
              key={activeBuilding.id}
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -10,  scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.85 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-5 py-3.5 rounded-2xl"
              style={{
                background:     "rgba(255,255,255,0.92)",
                border:         "1px solid rgba(56,130,246,0.22)",
                backdropFilter: "blur(28px)",
                boxShadow:
                  "0 8px 32px rgba(13,26,46,0.10), 0 2px 8px rgba(13,26,46,0.06), " +
                  "0 0 0 1px rgba(56,130,246,0.06)",
                minWidth: 300,
              }}
            >
              {/* Icon container */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 2px 10px rgba(56,130,246,0.18)",
                    "0 4px 20px rgba(56,130,246,0.32)",
                    "0 2px 10px rgba(56,130,246,0.18)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(56,130,246,0.12), rgba(56,130,246,0.05))",
                  border:     "1px solid rgba(56,130,246,0.22)",
                }}
              >
                {activeBuilding.icon}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[9px] tracking-[2px] mb-0.5 font-semibold"
                  style={{ color: "var(--sky)", fontFamily: "var(--font-sans)" }}
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
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  Step {currentStep + 1} of {route.length} ·{" "}
                  <span style={{ color: OCCUPANCY_COLOR[occupancyMap[activeBuilding.id]?.level ?? "low"] }}>
                    {OCCUPANCY_LABEL[occupancyMap[activeBuilding.id]?.level ?? "low"]}
                  </span>
                </div>
              </div>

              {/* Live pulse dot */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  background: "var(--sky)",
                  boxShadow:  "0 0 8px rgba(56,130,246,0.5)",
                }}
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
              {/* Main map background — warm white */}
              <radialGradient id="campus-bg-main" cx="50%" cy="50%" r="65%">
                <stop offset="0%"   stopColor={palette.mapBg} />
                <stop offset="55%"  stopColor="#f4f7fd" />
                <stop offset="100%" stopColor="#eef1f8" />
              </radialGradient>

              {/* Grid pattern */}
              <pattern id="campus-grid-main" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={palette.gridColor}
                  strokeWidth="0.5"
                />
              </pattern>

              {/* Center vignette — very subtle */}
              <radialGradient id="campus-center-vignette" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(56,130,246,0.025)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Edge vignette — soft frame */}
              <radialGradient id="campus-edge-vignette" cx="50%" cy="50%" r="70%">
                <stop offset="60%"  stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(13,26,46,0.04)" />
              </radialGradient>

              {/* Route travel animation */}
              <style>{`
                @keyframes route-dash-travel {
                  from { stroke-dashoffset: 0;    }
                  to   { stroke-dashoffset: -200; }
                }
                @keyframes flow-dot-travel {
                  0%   { offset-distance: 0%;   opacity: 0; }
                  8%   { opacity: 0.65; }
                  92%  { opacity: 0.65; }
                  100% { offset-distance: 100%; opacity: 0; }
                }
              `}</style>
            </defs>

            {/* Background layers */}
            <rect width="620" height="620" fill="url(#campus-bg-main)" />
            <rect width="620" height="620" fill="url(#campus-grid-main)" />
            <rect width="620" height="620" fill="url(#campus-center-vignette)" />
            <rect width="620" height="620" fill="url(#campus-edge-vignette)" />

            {/* Campus boundary — elegant dashed border */}
            <rect
              x="48" y="48" width="524" height="524" rx="22"
              fill="none"
              stroke="rgba(13,26,46,0.06)"
              strokeWidth="8"
              style={{ filter: "blur(4px)" }}
            />
            <rect
              x="50" y="50" width="520" height="520" rx="20"
              fill="none"
              stroke={palette.accent}
              strokeWidth="0.75"
              strokeDasharray="10 8"
              style={{ opacity: 0.45 }}
            />

            {/* Zone shading — blueprint-inspired, very soft */}
            <ellipse
              cx="175" cy="300" rx="110" ry="155"
              fill={palette.zone}
              stroke="rgba(107,79,207,0.09)"
              strokeWidth="0.75"
              strokeDasharray="5 7"
            />
            <ellipse
              cx="445" cy="265" rx="100" ry="135"
              fill={palette.zone}
              stroke="rgba(56,130,246,0.09)"
              strokeWidth="0.75"
              strokeDasharray="5 7"
            />

            {/* Zone labels */}
            <text
              x="175" y="148" textAnchor="middle"
              fill="rgba(107,79,207,0.35)" fontSize="7.5"
              letterSpacing="2.5" fontFamily="var(--font-sans)"
              fontWeight="600"
            >
              ACADEMIC WEST
            </text>
            <text
              x="445" y="130" textAnchor="middle"
              fill="rgba(56,130,246,0.32)" fontSize="7.5"
              letterSpacing="2.5" fontFamily="var(--font-sans)"
              fontWeight="600"
            >
              ACADEMIC EAST
            </text>

            {/* Road guides — clean, minimal */}
            {[
              { x1: 310, y1: 62,  x2: 310, y2: 558 },
              { x1: 62,  y1: 310, x2: 558, y2: 310 },
            ].map((l, i) => (
              <g key={i}>
                <line {...l} stroke="rgba(13,26,46,0.04)"  strokeWidth="28" />
                <line
                  {...l}
                  stroke="rgba(56,130,246,0.08)"
                  strokeWidth="1"
                  strokeDasharray="16 12"
                />
              </g>
            ))}

            {/* Campus header */}
            <text
              x="310" y="34" textAnchor="middle"
              fill={palette.accent} fontSize="9"
              letterSpacing="4.5" fontFamily="var(--font-sans)"
              fontWeight="700" style={{ opacity: 0.6 }}
            >
              RIMT UNIVERSITY CAMPUS
            </text>
            <text
              x="310" y="604" textAnchor="middle"
              fill="rgba(13,26,46,0.18)" fontSize="7.5"
              letterSpacing="3" fontFamily="var(--font-sans)"
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
                  stroke={palette.pathEdge}
                  strokeWidth="0.75"
                  strokeDasharray="3.5 6"
                />
              );
            })}

            {/* ── Pedestrian flow dots ── */}
            {tod !== "night" &&
              flowEdges.map(({ from, to }, i) => {
                const bA = BUILDINGS.find((b) => b.id === from);
                const bB = BUILDINGS.find((b) => b.id === to);
                if (!bA || !bB) return null;
                const dotCount =
                  tod === "midday" ? 3 : tod === "afternoon" ? 2 : 1;
                return Array.from({ length: dotCount }, (_, d) => (
                  <FlowDot
                    key={`flow-${i}-${d}`}
                    x1={bA.x} y1={bA.y}
                    x2={bB.x} y2={bB.y}
                    speed={4 + (i % 4) + d * 0.8}
                    delay={(i * 0.55 + d * 1.6) % 6}
                    size={1 + (i % 2) * 0.4}
                    opacity={0.28 + (i % 3) * 0.07}
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
                  {/* Soft bloom */}
                  <circle cx={mx} cy={my} r={24}
                    fill="rgba(56,130,246,0.08)"
                    style={{ filter: "blur(12px)", willChange: "transform" }}
                  />
                  {/* Outer ring */}
                  <circle cx={mx} cy={my} r={16}
                    fill="none"
                    stroke="rgba(56,130,246,0.18)"
                    strokeWidth={1.5}
                    style={{ animation: "radar-ping-light 2.2s cubic-bezier(0,0,0.2,1) infinite" }}
                  />
                  {/* Inner ring */}
                  <circle cx={mx} cy={my} r={10}
                    fill="none"
                    stroke="rgba(56,130,246,0.32)"
                    strokeWidth={1}
                    style={{ animation: "radar-ping-light 2.2s cubic-bezier(0,0,0.2,1) infinite 0.45s" }}
                  />
                  {/* Core dot — white with sky border */}
                  <circle cx={mx} cy={my} r={5.5}
                    fill="white"
                    stroke="#3882f6"
                    strokeWidth={2}
                    style={{
                      filter:     "drop-shadow(0 2px 8px rgba(56,130,246,0.4)) drop-shadow(0 1px 3px rgba(13,26,46,0.12))",
                      animation:  "glow-pulse-sky 1.4s cubic-bezier(0.45,0,0.55,1) infinite",
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
