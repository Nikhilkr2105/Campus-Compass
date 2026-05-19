"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from "lucide-react";
import { BUILDINGS, PATH_EDGES } from "@/data/buildings";
import { Building } from "@/types/navigation";

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
// ROUTE SEGMENT — animated draw on mount and routeKey change
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
      {/* Outer ambient glow — fades in with line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.08)"
        strokeWidth={22}
        strokeLinecap="round"
        style={{
          filter: "blur(10px)",
          opacity: drawn ? 1 : 0,
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}`,
        }}
      />
      {/* Mid glow */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,212,255,0.2)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          filter: "blur(2.5px)",
          opacity: drawn ? 1 : 0,
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
          transition: `stroke-dashoffset 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}`,
          filter: "drop-shadow(0 0 5px rgba(0,212,255,0.9)) drop-shadow(0 0 12px rgba(0,212,255,0.45))",
          willChange: "stroke-dashoffset",
        }}
      />
      {/* Waypoint dot */}
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3.5}
        fill="#00d4ff"
        style={{
          opacity: drawn ? 0.85 : 0,
          transform: drawn ? "scale(1)" : "scale(0)",
          transformOrigin: `${(x1 + x2) / 2}px ${(y1 + y2) / 2}px`,
          transition: `opacity 0.25s ease ${index * 0.11 + 0.5}s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.11 + 0.5}s`,
          filter: "drop-shadow(0 0 5px #00d4ff) drop-shadow(0 0 10px rgba(0,212,255,0.55))",
          willChange: "transform, opacity",
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
  onClick:       () => void;
}

function BuildingNode({
  building, isOnRoute, isSelected, isCurrentStep, isStart, isEnd, onClick,
}: BuildingNodeProps) {
  const [hov, setHov] = useState(false);

  const r = isSelected ? 18 : hov ? 16 : 13;
  const ringColor = isStart ? "#00d4ff" : isEnd ? "#8b5cf6" : building.color;

  const strokeColor = isSelected
    ? building.color
    : isCurrentStep
    ? "#00d4ff"
    : isOnRoute
    ? "rgba(0,212,255,0.65)"
    : hov
    ? `${building.color}bb`
    : `${building.color}66`;

  const TRANSITION = "all 0.28s cubic-bezier(0.22,1,0.36,1)";

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Radar rings — CSS animation, no JS interval */}
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
            opacity: isSelected ? 0.12 : 0.06,
            filter: "blur(10px)",
            transition: TRANSITION,
            willChange: "opacity",
          }}
        />
      )}

      {/* Main circle — GPU transform for radius change */}
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
          transform: `scale(${isSelected ? 1.385 : hov ? 1.23 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition: TRANSITION,
          filter: isSelected
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
          userSelect: "none",
          transform: `scale(${isSelected ? 1.4 : hov ? 1.2 : 1})`,
          transformOrigin: `${building.x}px ${building.y}px`,
          transition: TRANSITION,
          willChange: "transform",
        }}
      >
        {building.icon}
      </text>

      {/* Start / end badge */}
      {isRouteStartEnd(isStart, isEnd) && (
        <>
          <circle
            cx={building.x + r - 2} cy={building.y - r + 2}
            r={6}
            fill={isStart ? "#00d4ff" : "#8b5cf6"}
            style={{
              filter: `drop-shadow(0 0 5px ${isStart ? "#00d4ff" : "#8b5cf6"})`,
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
      />

      {/* Floor count */}
      {isSelected && (
        <text
          x={building.x} y={building.y + 45}
          textAnchor="middle"
          fill={building.color}
          fontSize={8}
          fontFamily="var(--font-body)"
          style={{
            userSelect: "none",
            opacity: 0.8,
            animation: "fade-in-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {building.floors}F
        </text>
      )}
    </g>
  );
}

// Helper — avoids inline logical expression in JSX
function isRouteStartEnd(isStart: boolean, isEnd: boolean): boolean {
  return isStart || isEnd;
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

  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const routeKey = route.join("-");
  const routeSet = useMemo(() => new Set(route), [routeKey]);

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

  // ── Mouse handlers ──────────────────────────────────────
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
    if (e.touches.length === 1) {
      lastTouch.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const onTouchEnd = () => {
    lastTouch.current = null;
  };

  // ── Controls ─────────────────────────────────────────────
  const zoomIn  = useCallback(() => setZoom((z) => Math.min(4.5, z + 0.3)),  []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.35, z - 0.3)), []);
  const reset   = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Active building during navigation
  const activeBuilding = useMemo(
    () =>
      isNavigating && route[currentStep]
        ? BUILDINGS.find((b) => b.id === route[currentStep])
        : null,
    [isNavigating, route, currentStep]
  );

  // ── Render ───────────────────────────────────────────────
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height,
        width:      "100%",
        background: "radial-gradient(ellipse 120% 100% at 50% 50%, #0a1628 0%, #060d18 45%, #020408 100%)",
      }}
    >
      {/* ── Atmospheric background layers ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* Grid */}
        <div
          style={{
            position:        "absolute",
            inset:           0,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Floating ambient orbs */}
        <div
          style={{
            position:     "absolute",
            top:          "18%",
            left:         "12%",
            width:         320,
            height:        320,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(0,212,255,0.055) 0%, transparent 70%)",
            animation:    "float 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position:     "absolute",
            bottom:       "18%",
            right:        "12%",
            width:         260,
            height:        260,
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(139,92,246,0.055) 0%, transparent 70%)",
            animation:    "float 10s ease-in-out infinite 3s",
          }}
        />
      </div>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-20">
        {[
          { icon: ZoomIn,    fn: zoomIn,  title: "Zoom In"   },
          { icon: ZoomOut,   fn: zoomOut, title: "Zoom Out"  },
          { icon: RotateCcw, fn: reset,   title: "Reset View"},
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

      {/* ── Active navigation banner ── */}
      <AnimatePresence>
        {isNavigating && activeBuilding && (
          <motion.div
            key={activeBuilding.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1,  y: 0,   scale: 1    }}
            exit={{ opacity: 0, y: -12, scale: 0.97      }}
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
                Step {currentStep + 1} of {route.length}
              </div>
            </div>

            {/* Pulsing indicator dot */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: "var(--cyan)",
                boxShadow:  "0 0 10px var(--cyan)",
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
    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
    transformOrigin: "center",
    transition: dragging ? "none" : "transform 0.18s cubic-bezier(0.22,1,0.36,1)",
    willChange: "transform",
  }}
>
          <defs>
            <radialGradient id="campus-bg-main" cx="50%" cy="50%" r="65%">
              <stop offset="0%"   stopColor="#0d1f38" />
              <stop offset="50%"  stopColor="#070f1e" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>
            <pattern id="campus-grid-main" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0,212,255,0.04)"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="campus-center-glow" cx="50%" cy="50%" r="40%">
              <stop offset="0%"   stopColor="rgba(0,212,255,0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background layers */}
          <rect width="620" height="620" fill="url(#campus-bg-main)" />
          <rect width="620" height="620" fill="url(#campus-grid-main)" />
          <rect width="620" height="620" fill="url(#campus-center-glow)" />

          {/* Campus boundary — double ring */}
          <rect
            x="48" y="48" width="524" height="524" rx="22"
            fill="none"
            stroke="rgba(0,212,255,0.04)"
            strokeWidth="4"
          />
          <rect
            x="50" y="50" width="520" height="520" rx="20"
            fill="none"
            stroke="rgba(0,212,255,0.1)"
            strokeWidth="1"
            strokeDasharray="10 7"
          />

          {/* Zone shading — academic clusters */}
          <ellipse
            cx="175" cy="300" rx="110" ry="155"
            fill="rgba(139,92,246,0.025)"
            stroke="rgba(139,92,246,0.07)"
            strokeWidth="1"
            strokeDasharray="5 6"
          />
          <ellipse
            cx="445" cy="265" rx="100" ry="135"
            fill="rgba(59,130,246,0.02)"
            stroke="rgba(59,130,246,0.06)"
            strokeWidth="1"
            strokeDasharray="5 6"
          />

          {/* Zone labels */}
          <text
            x="175" y="148"
            textAnchor="middle"
            fill="rgba(139,92,246,0.28)"
            fontSize="8"
            letterSpacing="2.5"
            fontFamily="var(--font-display)"
          >
            ACADEMIC WEST
          </text>
          <text
            x="445" y="130"
            textAnchor="middle"
            fill="rgba(59,130,246,0.25)"
            fontSize="8"
            letterSpacing="2.5"
            fontFamily="var(--font-display)"
          >
            ACADEMIC EAST
          </text>

          {/* Main road guides */}
          {[
            { x1: 310, y1: 62, x2: 310, y2: 558 },
            { x1: 62,  y1: 310, x2: 558, y2: 310 },
          ].map((l, i) => (
            <g key={i}>
              <line {...l} stroke="rgba(255,255,255,0.02)"  strokeWidth="32" />
              <line {...l} stroke="rgba(0,212,255,0.04)" strokeWidth="1.5" strokeDasharray="14 10" />
            </g>
          ))}

          {/* Campus title */}
          <text
            x="310" y="34"
            textAnchor="middle"
            fill="rgba(0,212,255,0.22)"
            fontSize="9.5"
            letterSpacing="5"
            fontFamily="var(--font-display)"
          >
            RIMT UNIVERSITY CAMPUS
          </text>
          <text
            x="310" y="604"
            textAnchor="middle"
            fill="rgba(0,212,255,0.12)"
            fontSize="8"
            letterSpacing="3"
            fontFamily="var(--font-display)"
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
                x1={bA.x} y1={bA.y}
                x2={bB.x} y2={bB.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="0.8"
                strokeDasharray="4 6"
              />
            );
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

          {/* ── Building markers ── */}
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

          {/* ── Live navigation orb ── */}
{isNavigating && route.length > 1 && (() => {
  const fromId = route[Math.max(0, currentStep)];
  const toId   = route[Math.min(currentStep + 1, route.length - 1)];
  const from   = BUILDINGS.find((b) => b.id === fromId);
  const to     = BUILDINGS.find((b) => b.id === toId);
  if (!from || !to) return null;

  // mid-point static anchor — real animation via CSS
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
          filter: "drop-shadow(0 0 10px #00d4ff) drop-shadow(0 0 22px rgba(0,212,255,0.5))",
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
  );
}
