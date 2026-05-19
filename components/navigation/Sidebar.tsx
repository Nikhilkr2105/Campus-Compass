"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Layers, ChevronLeft, ChevronRight,
  Clock, Users, MapPin, Wifi, Signal, Navigation2,
} from "lucide-react";
import { RoutePanel }  from "@/components/navigation/RoutePanel";
import { Building }    from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface SidebarProps {
  selectedBuilding: Building | null;
  route:            NavigationRoute | null;
  isNavigating:     boolean;
  currentStep:      number;
  onRouteFound:     (r: NavigationRoute) => void;
  onStart:          () => void;
  onStop:           () => void;
  onNext:           () => void;
  onPrev:           () => void;
  onClear:          () => void;
  onCloseBuilding:  () => void;
  onNavigateTo:     (name: string) => void;
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY — mirrors CampusMap logic (no shared import needed)
// ─────────────────────────────────────────────────────────────

type OccupancyLevel = "low" | "moderate" | "high" | "peak" | "closed";

const OCC_COLOR: Record<OccupancyLevel, string> = {
  low:      "#22c55e",
  moderate: "#eab308",
  high:     "#f97316",
  peak:     "#ef4444",
  closed:   "#475569",
};
const OCC_LABEL: Record<OccupancyLevel, string> = {
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

function getOccupancy(id: string): OccupancyLevel {
  const h   = new Date().getHours();
  const seed = hashId(id) % 100;
  if (h < 6 || h >= 23) return "closed";
  if (h >= 20)          return seed < 40 ? "low" : "closed";
  if (h >= 18)          return seed < 30 ? "low" : seed < 65 ? "moderate" : "high";
  if (h >= 9 && h < 17) {
    if (seed < 15) return "low";
    if (seed < 45) return "moderate";
    if (seed < 75) return "high";
    return "peak";
  }
  return seed < 50 ? "low" : "moderate";
}

function getOccupancyPct(id: string): number {
  const seed  = hashId(id) % 100;
  const level = getOccupancy(id);
  const base: Record<OccupancyLevel, number> = {
    low: 15, moderate: 42, high: 68, peak: 88, closed: 0,
  };
  return Math.min(100, Math.max(0, base[level] + (seed % 18) - 9));
}

// ─────────────────────────────────────────────────────────────
// BUILDING HOURS — simple time-aware open/close
// ─────────────────────────────────────────────────────────────

type BuildingHours = { open: number; close: number; label: string };

const DEFAULT_HOURS: BuildingHours = { open: 8, close: 20, label: "8:00 AM – 8:00 PM" };

const BUILDING_HOURS: Record<string, BuildingHours> = {
  library:    { open: 7,  close: 22, label: "7:00 AM – 10:00 PM" },
  cafeteria:  { open: 7,  close: 21, label: "7:00 AM – 9:00 PM"  },
  sports:     { open: 6,  close: 22, label: "6:00 AM – 10:00 PM" },
  hostel:     { open: 0,  close: 24, label: "24 / 7"              },
  admin:      { open: 9,  close: 17, label: "9:00 AM – 5:00 PM"   },
};

function getBuildingHours(id: string): BuildingHours {
  return BUILDING_HOURS[id] ?? DEFAULT_HOURS;
}

function isBuildingOpen(id: string): boolean {
  const h   = new Date().getHours();
  const hrs = getBuildingHours(id);
  return h >= hrs.open && h < hrs.close;
}

// ─────────────────────────────────────────────────────────────
// SYSTEM STATUS — header indicators
// ─────────────────────────────────────────────────────────────

type SysStatus = { gps: boolean; wifi: boolean; signal: number };

function useSystemStatus(): SysStatus {
  // Stable mock — always "healthy" during daytime, degraded at night
  return useMemo(() => {
    const h = new Date().getHours();
    return {
      gps:    true,
      wifi:   true,
      signal: h >= 6 && h < 23 ? 3 : 2,
    };
  }, []);
}

// ─────────────────────────────────────────────────────────────
// SIGNAL BARS
// ─────────────────────────────────────────────────────────────

function SignalBars({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width:        3,
            height:       4 + i * 3,
            borderRadius: 1,
            background:   i <= level
              ? "#22c55e"
              : "rgba(255,255,255,0.12)",
            transition:   "background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <span className="font-mono text-[10px]" style={{ color: "rgba(240,244,255,0.45)" }}>
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY BAR
// ─────────────────────────────────────────────────────────────

function OccupancyBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{
          background: color,
          boxShadow:  `0 0 6px ${color}88`,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FACILITY TAG — with subtle availability state
// ─────────────────────────────────────────────────────────────

function FacilityTag({
  label,
  color,
  available,
}: {
  label:     string;
  color:     string;
  available: boolean;
}) {
  return (
    <span
      className="text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5"
      style={{
        background: available ? `${color}10` : "rgba(255,255,255,0.03)",
        border:     `1px solid ${available ? `${color}28` : "rgba(255,255,255,0.06)"}`,
        color:      available ? color : "rgba(240,244,255,0.3)",
        fontFamily: "var(--font-body)",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          width:        5,
          height:       5,
          borderRadius: "50%",
          background:   available ? color : "rgba(255,255,255,0.15)",
          display:      "inline-block",
          flexShrink:   0,
          boxShadow:    available ? `0 0 4px ${color}` : "none",
        }}
      />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// ROUTE SUMMARY BAR — shown when route is active
// ─────────────────────────────────────────────────────────────

function RouteSummaryBar({
  route,
  currentStep,
  isNavigating,
}: {
  route:        NavigationRoute;
  currentStep:  number;
  isNavigating: boolean;
}) {
  const pct      = ((currentStep + 1) / route.buildings.length) * 100;
  const minsLeft = Math.max(1, route.estimatedMinutes - currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl px-3.5 py-3"
      style={{
        background: "rgba(0,212,255,0.04)",
        border:     "1px solid rgba(0,212,255,0.14)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isNavigating && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00d4ff",
                boxShadow:  "0 0 5px #00d4ff",
                animation:  "live-blink 1.8s ease-in-out infinite",
              }}
            />
          )}
          <span
            className="text-[9.5px] font-semibold tracking-wider"
            style={{
              color:      isNavigating ? "var(--cyan)" : "rgba(240,244,255,0.5)",
              fontFamily: "var(--font-display)",
            }}
          >
            {isNavigating ? "EN ROUTE" : "ROUTE READY"}
          </span>
        </div>
        <span
          className="text-[9px] font-mono"
          style={{ color: "rgba(240,244,255,0.4)" }}
        >
          ~{minsLeft}m · {route.buildings.length} stops
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
            boxShadow:  "0 0 8px rgba(0,212,255,0.4)",
          }}
        />
      </div>

      {/* From → To */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] truncate max-w-[100px]"
          style={{ color: "rgba(240,244,255,0.45)", fontFamily: "var(--font-body)" }}
        >
          {route.buildings[0]?.shortName}
        </span>
        <span className="text-[8px]" style={{ color: "rgba(0,212,255,0.3)" }}>→</span>
        <span className="text-[9px] truncate max-w-[100px] text-right"
          style={{ color: "rgba(240,244,255,0.45)", fontFamily: "var(--font-body)" }}
        >
          {route.buildings[route.buildings.length - 1]?.shortName}
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// SELECTED BUILDING PANEL
// ─────────────────────────────────────────────────────────────

function BuildingPanel({
  building,
  onClose,
  onNavigateTo,
}: {
  building:     Building;
  onClose:      () => void;
  onNavigateTo: (name: string) => void;
}) {
  const occupancy    = getOccupancy(building.id);
  const occupancyPct = getOccupancyPct(building.id);
  const occColor     = OCC_COLOR[occupancy];
  const hours        = getBuildingHours(building.id);
  const isOpen       = isBuildingOpen(building.id);

  // Facilities with pseudo-availability (seeded per facility + time)
  const facilitiesWithAvail = useMemo(() => {
    const h = new Date().getHours();
    return building.facilities.slice(0, 5).map((f, i) => ({
      label:     f,
      available: isOpen && (hashId(f + building.id) % 10) > (h >= 12 && h < 14 ? 4 : 2),
    }));
  }, [building.id, building.facilities, isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 8,  scale: 0.98  }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:     `linear-gradient(135deg, ${building.color}0a, rgba(255,255,255,0.02))`,
          border:         `1px solid ${building.color}30`,
          backdropFilter: "blur(20px)",
          boxShadow:      `0 0 24px ${building.color}10, inset 0 0 20px ${building.color}05`,
        }}
      >
        {/* ── Panel header ── */}
        <div
          className="px-4 pt-3.5 pb-2.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${building.color}18` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[8.5px] font-semibold tracking-[2px]"
              style={{ color: building.color, fontFamily: "var(--font-display)", opacity: 0.75 }}
            >
              SELECTED BUILDING
            </span>
            {/* Open / closed pill */}
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-semibold"
              style={{
                background: isOpen ? "rgba(34,197,94,0.12)" : "rgba(71,85,105,0.2)",
                border:     `1px solid ${isOpen ? "rgba(34,197,94,0.25)" : "rgba(71,85,105,0.3)"}`,
                color:      isOpen ? "#22c55e" : "#94a3b8",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.5px",
              }}
            >
              {isOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
            transition={{ duration: 0.15 }}
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* ── Building identity ── */}
        <div className="px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 10px ${building.color}44`,
                  `0 0 20px ${building.color}66`,
                  `0 0 10px ${building.color}44`,
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${building.color}22, ${building.color}0a)`,
                border:     `1.5px solid ${building.color}44`,
              }}
            >
              {building.icon}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div
                className="text-[13px] font-semibold truncate mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
              >
                {building.name}
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full inline-block"
                style={{
                  background:    `${building.color}18`,
                  border:        `1px solid ${building.color}30`,
                  color:          building.color,
                  fontFamily:    "var(--font-body)",
                  fontWeight:    500,
                  textTransform: "capitalize",
                }}
              >
                {building.type}
              </span>
            </div>
          </div>

          {/* ── Occupancy row ── */}
          <div
            className="rounded-xl px-3 py-2.5 mb-3"
            style={{
              background: "rgba(255,255,255,0.025)",
              border:     "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" style={{ color: occColor, opacity: 0.8 }} />
                <span
                  className="text-[9.5px] font-semibold"
                  style={{ color: occColor, fontFamily: "var(--font-display)" }}
                >
                  {OCC_LABEL[occupancy]}
                </span>
              </div>
              <span
                className="text-[9px] font-mono"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                {occupancyPct}% capacity
              </span>
            </div>
            <OccupancyBar pct={occupancyPct} color={occColor} />
          </div>

          {/* ── Hours row ── */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
            style={{
              background: "rgba(255,255,255,0.025)",
              border:     "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(240,244,255,0.35)" }} />
            <div className="flex-1 min-w-0">
              <div
                className="text-[8.5px] tracking-wider mb-0.5"
                style={{ color: "rgba(240,244,255,0.3)", fontFamily: "var(--font-display)" }}
              >
                HOURS
              </div>
              <div
                className="text-[11px]"
                style={{ color: "rgba(240,244,255,0.65)", fontFamily: "var(--font-body)" }}
              >
                {hours.label}
              </div>
            </div>
            {/* countdown to close if open */}
            {isOpen && (
              <div
                className="text-[9px] px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border:     "1px solid rgba(34,197,94,0.18)",
                  color:      "#22c55e",
                  fontFamily: "var(--font-body)",
                }}
              >
                {hours.close - new Date().getHours()}h left
              </div>
            )}
          </div>

          {/* ── Description ── */}
          <p
            className="text-[11.5px] leading-relaxed mb-3"
            style={{
              color:      "rgba(240,244,255,0.48)",
              fontFamily: "var(--font-body)",
              fontWeight: 300,
            }}
          >
            {building.description}
          </p>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "FLOORS",    value: building.floors,       icon: Layers    },
              { label: "LOCATION",  value: building.type,         icon: MapPin    },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border:     "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(240,244,255,0.25)" }} />
                <div>
                  <div
                    className="text-[8px] mb-0.5 tracking-[1px]"
                    style={{ color: "rgba(240,244,255,0.28)", fontFamily: "var(--font-display)" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[12px] font-semibold capitalize"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Facilities ── */}
          <div className="mb-3">
            <div
              className="text-[8.5px] tracking-[1.5px] mb-2"
              style={{ color: "rgba(240,244,255,0.28)", fontFamily: "var(--font-display)" }}
            >
              FACILITIES
            </div>
            <div className="flex flex-wrap gap-1.5">
              {facilitiesWithAvail.map(({ label, available }) => (
                <FacilityTag
                  key={label}
                  label={label}
                  color={building.color}
                  available={available}
                />
              ))}
              {building.facilities.length > 5 && (
                <span
                  className="text-[10px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border:     "1px solid rgba(255,255,255,0.07)",
                    color:      "var(--text-3)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  +{building.facilities.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* ── Navigate button ── */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,212,255,0.22)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTo(building.name)}
            className="w-full py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.06))",
              border:     "1px solid rgba(0,212,255,0.32)",
              color:      "var(--cyan)",
              cursor:     "pointer",
              fontFamily: "var(--font-body)",
              boxShadow:  "0 0 12px rgba(0,212,255,0.08)",
              transition: "all 0.25s ease",
            }}
          >
            <Navigation2 className="w-3.5 h-3.5" />
            Navigate Here
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────

export function Sidebar({
  selectedBuilding, route, isNavigating, currentStep,
  onRouteFound, onStart, onStop, onNext, onPrev, onClear,
  onCloseBuilding, onNavigateTo,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sys = useSystemStatus();

  const handleDestChange = useCallback((_name: string) => {}, []);

  return (
    <div className="relative flex h-full">

      {/* ── Collapse toggle ── */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        whileHover={{ scale: 1.12, boxShadow: "0 0 20px rgba(0,212,255,0.35)" }}
        whileTap={{ scale: 0.93 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-30
                   flex items-center justify-center"
        style={{
          background:     "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.12))",
          border:         "1.5px solid rgba(0,212,255,0.4)",
          color:          "var(--cyan)",
          cursor:         "pointer",
          backdropFilter: "blur(16px)",
          boxShadow:      "0 0 16px rgba(0,212,255,0.2), 0 4px 16px rgba(0,0,0,0.4)",
          transition:     "all 0.25s ease",
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />
        }
      </motion.button>

      {/* ── Main panel ── */}
      <motion.aside
        animate={{ width: collapsed ? 0 : 320, opacity: collapsed ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col overflow-hidden h-full flex-shrink-0"
        style={{
          borderRight:    "1px solid rgba(0,212,255,0.1)",
          background:     "linear-gradient(180deg, rgba(6,13,24,0.96) 0%, rgba(2,4,8,0.98) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow:      "4px 0 24px rgba(0,0,0,0.4), inset -1px 0 0 rgba(0,212,255,0.07)",
        }}
      >
        {!collapsed && (
          <>
            {/* ── Header ── */}
            <div
              className="px-5 py-4 flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(0,212,255,0.09)",
                background:   "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(139,92,246,0.025))",
              }}
            >
              {/* Top row — brand + live */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.1))",
                    border:     "1.5px solid rgba(0,212,255,0.3)",
                    boxShadow:  "0 0 14px rgba(0,212,255,0.18)",
                  }}
                >
                  <Layers className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-bold leading-tight"
                    style={{
                      fontFamily:           "var(--font-display)",
                      background:           "linear-gradient(90deg, #fff 30%, #00d4ff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor:  "transparent",
                    }}
                  >
                    Campus Navigator
                  </div>
                  <div
                    className="text-[8.5px] tracking-[1.5px] mt-0.5"
                    style={{ color: "rgba(0,212,255,0.4)", fontFamily: "var(--font-display)" }}
                  >
                    SMART ROUTING SYSTEM
                  </div>
                </div>

                {/* Live pill */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.09)",
                    border:     "1px solid rgba(16,185,129,0.22)",
                  }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full inline-block"
                    style={{
                      background: "#22c55e",
                      boxShadow:  "0 0 6px #22c55e",
                      animation:  "live-blink 1.8s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: "#22c55e", fontFamily: "var(--font-display)" }}
                  >
                    LIVE
                  </span>
                </div>
              </div>

              {/* ── System status row ── */}
              <div
                className="flex items-center justify-between px-2.5 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border:     "1px solid rgba(255,255,255,0.055)",
                }}
              >
                {/* GPS */}
                <div className="flex items-center gap-1.5">
                  <Navigation2
                    className="w-3 h-3"
                    style={{ color: sys.gps ? "#22c55e" : "#ef4444", opacity: 0.85 }}
                  />
                  <span
                    className="text-[9px]"
                    style={{
                      color:      sys.gps ? "rgba(34,197,94,0.75)" : "rgba(239,68,68,0.75)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    GPS
                  </span>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.07)" }} />

                {/* Wi-Fi */}
                <div className="flex items-center gap-1.5">
                  <Wifi
                    className="w-3 h-3"
                    style={{ color: sys.wifi ? "#22c55e" : "#94a3b8", opacity: 0.85 }}
                  />
                  <span
                    className="text-[9px]"
                    style={{
                      color:      sys.wifi ? "rgba(34,197,94,0.75)" : "rgba(148,163,184,0.6)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Wi-Fi
                  </span>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.07)" }} />

                {/* Signal */}
                <div className="flex items-center gap-1.5">
                  <SignalBars level={sys.signal} />
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(240,244,255,0.4)", fontFamily: "var(--font-body)" }}
                  >
                    {sys.signal === 3 ? "Strong" : sys.signal === 2 ? "Good" : "Weak"}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.07)" }} />

                {/* Clock */}
                <LiveClock />
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">

              {/* Route summary bar — shown when route exists */}
              <AnimatePresence>
                {route && (
                  <RouteSummaryBar
                    route={route}
                    currentStep={currentStep}
                    isNavigating={isNavigating}
                  />
                )}
              </AnimatePresence>

              <RoutePanel
                route={route}
                isNavigating={isNavigating}
                currentStep={currentStep}
                onRouteFound={onRouteFound}
                onStart={onStart}
                onStop={onStop}
                onNext={onNext}
                onPrev={onPrev}
                onClear={onClear}
                onDestChange={handleDestChange}
              />

              {/* Building detail */}
              <AnimatePresence>
                {selectedBuilding && (
                  <BuildingPanel
                    building={selectedBuilding}
                    onClose={onCloseBuilding}
                    onNavigateTo={onNavigateTo}
                  />
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}