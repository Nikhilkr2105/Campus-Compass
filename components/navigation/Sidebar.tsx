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
  plannerSource:    string;
  plannerDestination: string;
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
  onPlannerSourceChange: (name: string) => void;
  onPlannerDestinationChange: (name: string) => void;
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY
// ─────────────────────────────────────────────────────────────

type OccupancyLevel = "low" | "moderate" | "high" | "peak" | "closed";

const OCC_COLOR: Record<OccupancyLevel, string> = {
  low:      "#0d9e6e",
  moderate: "#c9922a",
  high:     "#d97706",
  peak:     "#d94040",
  closed:   "#8a9ab8",
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
// BUILDING HOURS
// ─────────────────────────────────────────────────────────────

type BuildingHours = { open: number; close: number; label: string };

const DEFAULT_HOURS: BuildingHours = { open: 8, close: 20, label: "8:00 AM – 8:00 PM" };

const BUILDING_HOURS: Record<string, BuildingHours> = {
  "main-gate":      { open: 0, close: 24, label: "24 / 7" },
  library:          { open: 7, close: 22, label: "7:00 AM – 10:00 PM" },
  "canteen-main":   { open: 7, close: 21, label: "7:00 AM – 9:00 PM" },
  "canteen-north":  { open: 7, close: 21, label: "7:00 AM – 9:00 PM" },
  "sports-complex": { open: 6, close: 22, label: "6:00 AM – 10:00 PM" },
  "hostel-boys-a":  { open: 0, close: 24, label: "24 / 7" },
  "hostel-boys-b":  { open: 0, close: 24, label: "24 / 7" },
  "hostel-girls":   { open: 0, close: 24, label: "24 / 7" },
  "admin-block":    { open: 9, close: 17, label: "9:00 AM – 5:00 PM" },
  medical:          { open: 0, close: 24, label: "24 / 7" },
  "fire-station":   { open: 0, close: 24, label: "24 / 7" },
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
// SYSTEM STATUS
// ─────────────────────────────────────────────────────────────

type SysStatus = { gps: boolean; wifi: boolean; signal: number };

function useSystemStatus(): SysStatus {
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
// SIGNAL BARS — sky palette
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
              ? "var(--sky)"
              : "rgba(13,26,46,0.12)",
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
    <span
      className="font-mono text-[10px]"
      style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
    >
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// OCCUPANCY BAR — light theme
// ─────────────────────────────────────────────────────────────

function OccupancyBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(13,26,46,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ background: color }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FACILITY TAG — light theme
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
        background: available ? `${color}10` : "rgba(13,26,46,0.04)",
        border:     `1px solid ${available ? `${color}30` : "rgba(13,26,46,0.08)"}`,
        color:      available ? color : "var(--text-3)",
        fontFamily: "var(--font-body)",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          width:        5,
          height:       5,
          borderRadius: "50%",
          background:   available ? color : "rgba(13,26,46,0.18)",
          display:      "inline-block",
          flexShrink:   0,
        }}
      />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// ROUTE SUMMARY BAR — light theme, sky accent
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
      className="rounded-2xl px-4 py-3.5"
      style={{
        background:     "rgba(255,255,255,0.85)",
        border:         "1px solid var(--border-sky)",
        backdropFilter: "blur(20px)",
        boxShadow:      "var(--shadow-sm), 0 0 0 1px rgba(56,130,246,0.04)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {isNavigating && (
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: "var(--green)",
                animation:  "sunrise-pulse 1.8s ease-in-out infinite",
              }}
            />
          )}
          <span
            className="text-[10px] font-semibold tracking-wider"
            style={{
              color:      isNavigating ? "var(--sky)" : "var(--text-3)",
              fontFamily: "var(--font-display)",
              letterSpacing: "1.5px",
            }}
          >
            {isNavigating ? "EN ROUTE" : "ROUTE READY"}
          </span>
        </div>
        <span
          className="text-[10px]"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
        >
          ~{minsLeft} min · {route.buildings.length} stops
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden mb-2.5"
        style={{ background: "rgba(13,26,46,0.07)" }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--sky), var(--sky-deep))",
          }}
        />
      </div>

      {/* From → To */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] truncate max-w-[100px]"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
        >
          {route.buildings[0]?.shortName}
        </span>
        <span style={{ color: "var(--sky)", fontSize: 10, opacity: 0.5 }}>→</span>
        <span
          className="text-[10px] truncate max-w-[100px] text-right"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
        >
          {route.buildings[route.buildings.length - 1]?.shortName}
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// SELECTED BUILDING PANEL — light glass
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

  const facilitiesWithAvail = useMemo(() => {
    const h = new Date().getHours();
    return building.facilities.slice(0, 5).map((f) => ({
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
          background:     "rgba(255,255,255,0.88)",
          border:         "1px solid var(--border)",
          backdropFilter: "blur(24px)",
          boxShadow:      "var(--shadow-md)",
        }}
      >
        {/* ── Panel header ── */}
        <div
          className="px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-semibold tracking-[2px]"
              style={{
                color:      "var(--text-3)",
                fontFamily: "var(--font-display)",
                letterSpacing: "1.5px",
              }}
            >
              BUILDING DETAILS
            </span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: isOpen ? "rgba(13,158,110,0.1)" : "rgba(138,154,184,0.12)",
                border:     `1px solid ${isOpen ? "rgba(13,158,110,0.25)" : "rgba(138,154,184,0.2)"}`,
                color:      isOpen ? "var(--green)" : "var(--silver)",
                fontFamily: "var(--font-body)",
              }}
            >
              {isOpen ? "Open" : "Closed"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.12, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: "none",
              border:     "none",
              cursor:     "pointer",
              color:      "var(--text-3)",
              padding:    4,
              borderRadius: 6,
            }}
            transition={{ duration: 0.15 }}
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* ── Building identity ── */}
        <div className="px-4 pt-4 pb-4">

          {/* Icon + name */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: `${building.color}12`,
                border:     `1.5px solid ${building.color}28`,
                boxShadow:  `0 2px 12px ${building.color}18`,
              }}
            >
              {building.icon}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div
                className="text-[14px] font-semibold truncate mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
              >
                {building.name}
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full inline-block capitalize"
                style={{
                  background: `${building.color}10`,
                  border:     `1px solid ${building.color}22`,
                  color:      building.color,
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                }}
              >
                {building.type}
              </span>
            </div>
          </div>

          {/* ── Occupancy ── */}
          <div
            className="rounded-xl px-3.5 py-3 mb-3"
            style={{
              background: "var(--bg-1)",
              border:     "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" style={{ color: occColor }} />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: occColor, fontFamily: "var(--font-body)" }}
                >
                  {OCC_LABEL[occupancy]}
                </span>
              </div>
              <span
                className="text-[10px]"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
              >
                {occupancyPct}% capacity
              </span>
            </div>
            <OccupancyBar pct={occupancyPct} color={occColor} />
          </div>

          {/* ── Hours ── */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-3"
            style={{
              background: "var(--bg-1)",
              border:     "1px solid var(--border)",
            }}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-3)" }} />
            <div className="flex-1 min-w-0">
              <div
                className="text-[8.5px] tracking-wider mb-0.5"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-display)", letterSpacing: "1px" }}
              >
                HOURS
              </div>
              <div
                className="text-[11px]"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                {hours.label}
              </div>
            </div>
            {isOpen && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: "rgba(13,158,110,0.08)",
                  border:     "1px solid rgba(13,158,110,0.2)",
                  color:      "var(--green)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {hours.close - new Date().getHours()}h left
              </span>
            )}
          </div>

          {/* ── Description ── */}
          <p
            className="text-[11.5px] leading-relaxed mb-4"
            style={{
              color:      "var(--text-2)",
              fontFamily: "var(--font-body)",
              fontWeight: 400,
            }}
          >
            {building.description}
          </p>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "FLOORS",   value: building.floors, icon: Layers  },
              { label: "LOCATION", value: building.type,   icon: MapPin  },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{
                  background: "var(--bg-1)",
                  border:     "1px solid var(--border)",
                }}
              >
                <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "var(--text-3)" }} />
                <div>
                  <div
                    className="text-[8px] mb-0.5"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-display)", letterSpacing: "1px" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[12px] font-semibold capitalize"
                    style={{ fontFamily: "var(--font-sans)", color: "var(--text-1)" }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Facilities ── */}
          <div className="mb-4">
            <div
              className="text-[8.5px] tracking-widest mb-2"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
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
                    background: "var(--bg-2)",
                    border:     "1px solid var(--border)",
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
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(56,130,246,0.28)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTo(building.name)}
            className="w-full py-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--sky), var(--sky-deep))",
              border:     "none",
              color:      "#fff",
              cursor:     "pointer",
              fontFamily: "var(--font-sans)",
              boxShadow:  "0 4px 20px rgba(56,130,246,0.28), 0 1px 4px rgba(56,130,246,0.2)",
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
  selectedBuilding, plannerSource, plannerDestination, route, isNavigating, currentStep,
  onRouteFound, onStart, onStop, onNext, onPrev, onClear,
  onCloseBuilding, onNavigateTo, onPlannerSourceChange, onPlannerDestinationChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sys = useSystemStatus();

  return (
    <div className="relative flex h-full">

      {/* ── Collapse toggle ── */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        whileHover={{ scale: 1.1, boxShadow: "var(--shadow-md)" }}
        whileTap={{ scale: 0.93 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-30
                   flex items-center justify-center"
        style={{
          background:     "rgba(255,255,255,0.92)",
          border:         "1px solid var(--border-sky)",
          color:          "var(--sky)",
          cursor:         "pointer",
          backdropFilter: "blur(16px)",
          boxShadow:      "var(--shadow-md)",
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
          maxWidth:       "calc(100vw - 36px)",
          borderRight:    "1px solid var(--border)",
          background:     "rgba(248,249,252,0.94)",
          backdropFilter: "blur(24px)",
          boxShadow:      "4px 0 24px rgba(13,26,46,0.07)",
        }}
      >
        {!collapsed && (
          <>
            {/* ── Header ── */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 py-4 flex-shrink-0"
              style={{
                borderBottom: "1px solid var(--border)",
                background:   "rgba(255,255,255,0.7)",
              }}
            >
              {/* Brand row */}
              <div className="flex items-center gap-3 mb-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--sky), var(--sky-deep))",
                    boxShadow:  "0 4px 16px rgba(56,130,246,0.28)",
                  }}
                >
                  <Layers className="w-4 h-4" style={{ color: "#fff" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-[15px] font-semibold leading-tight"
                    style={{
                      fontFamily: "var(--font-display)",
                      color:      "var(--text-1)",
                    }}
                  >
                    Navigation Center
                  </div>
                  <div
                    className="text-[9.5px] tracking-widest mt-0.5"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
                  >
                    SMART ROUTING
                  </div>
                </div>

                {/* Live pill */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: "rgba(13,158,110,0.08)",
                    border:     "1px solid rgba(13,158,110,0.2)",
                  }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full inline-block"
                    style={{
                      background: "var(--green)",
                      animation:  "sunrise-pulse 1.8s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: "var(--green)", fontFamily: "var(--font-body)" }}
                  >
                    Demo Data
                  </span>
                </div>
              </div>

              {/* ── System status row ── */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{
                  background: "var(--bg-1)",
                  border:     "1px solid var(--border)",
                }}
              >
                {/* GPS */}
                <div className="flex items-center gap-1.5">
                  <Navigation2
                    className="w-3 h-3"
                    style={{ color: sys.gps ? "var(--green)" : "var(--red)" }}
                  />
                  <span
                    className="text-[9.5px]"
                    style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                  >
                    GPS
                  </span>
                </div>

                <div style={{ width: 1, height: 12, background: "var(--border)" }} />

                {/* Wi-Fi */}
                <div className="flex items-center gap-1.5">
                  <Wifi
                    className="w-3 h-3"
                    style={{ color: sys.wifi ? "var(--sky)" : "var(--silver)" }}
                  />
                  <span
                    className="text-[9.5px]"
                    style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                  >
                    Wi-Fi
                  </span>
                </div>

                <div style={{ width: 1, height: 12, background: "var(--border)" }} />

                {/* Signal */}
                <div className="flex items-center gap-1.5">
                  <SignalBars level={sys.signal} />
                  <span
                    className="text-[9.5px]"
                    style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                  >
                    {sys.signal === 3 ? "Strong" : sys.signal === 2 ? "Good" : "Weak"}
                  </span>
                </div>

                <div style={{ width: 1, height: 12, background: "var(--border)" }} />

                <LiveClock />
              </div>
            </motion.div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">

              {/* Route summary */}
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
                source={plannerSource}
                destination={plannerDestination}
                route={route}
                isNavigating={isNavigating}
                currentStep={currentStep}
                onRouteFound={onRouteFound}
                onStart={onStart}
                onStop={onStop}
                onNext={onNext}
                onPrev={onPrev}
                onClear={onClear}
                onSourceChange={onPlannerSourceChange}
                onDestChange={onPlannerDestinationChange}
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
