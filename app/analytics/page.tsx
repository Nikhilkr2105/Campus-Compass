"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  KPICards,
  TopLocations,
  PopularRoutes,
} from "@/components/navigation/AnalyticsCards";
import {
  TrafficChart,
  BuildingSparklines,
} from "@/components/navigation/TrafficChart";

/* ════════════════════════════════════════════════════════════════
   TIME-AWARE CAMPUS STATE
════════════════════════════════════════════════════════════════ */

type CampusPhase = {
  label:       string;
  shortLabel:  string;
  loadPct:     number;   // 0-100 overall campus utilization
  color:       string;
  accentColor: string;
  description: string;
};

function getCampusPhase(): CampusPhase {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return { label: "Morning Commute",   shortLabel: "MORNING",   loadPct: 42, color: "#60b4ff", accentColor: "rgba(96,180,255,0.8)",  description: "Campus filling — classes starting" };
  if (h >= 9  && h < 12) return { label: "Peak Morning",      shortLabel: "PEAK AM",   loadPct: 87, color: "#f97316", accentColor: "rgba(249,115,22,0.8)",  description: "High foot traffic — all zones active" };
  if (h >= 12 && h < 14) return { label: "Lunch Rush",        shortLabel: "LUNCH",     loadPct: 94, color: "#ef4444", accentColor: "rgba(239,68,68,0.8)",   description: "Peak occupancy — cafeteria & commons" };
  if (h >= 14 && h < 17) return { label: "Afternoon Session", shortLabel: "AFTERNOON", loadPct: 78, color: "#00d4ff", accentColor: "rgba(0,212,255,0.8)",   description: "Classes in progress — steady traffic" };
  if (h >= 17 && h < 20) return { label: "Evening Wind-down", shortLabel: "EVENING",   loadPct: 45, color: "#8b5cf6", accentColor: "rgba(139,92,246,0.8)", description: "Reducing activity — labs & library" };
  if (h >= 20 && h < 23) return { label: "Quiet Hours",       shortLabel: "QUIET",     loadPct: 18, color: "#94a3b8", accentColor: "rgba(148,163,184,0.7)", description: "Limited services — security active" };
  return                         { label: "Night Mode",        shortLabel: "NIGHT",     loadPct: 6,  color: "#475569", accentColor: "rgba(71,85,105,0.7)",   description: "Campus secured — minimal presence" };
}

// 24-hour activity profile (0-100 per hour) — believable bell curve
const HOURLY_ACTIVITY = [
   4,  3,  2,  2,  3,  8,   // 00-05
  22, 38, 55, 82, 91, 88,   // 06-11
  96, 94, 85, 82, 79, 65,   // 12-17
  48, 35, 24, 16,  9,  5,   // 18-23
];

/* ════════════════════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════════════════════ */

function useClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

function useMouseParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 25 });
  const springY = useSpring(y, { stiffness: 40, damping: 25 });
  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth  - 0.5) * 24);
      y.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return { x: springX, y: springY };
}

// Believable live counter — drifts naturally around a time-weighted base
function useLiveCounter(
  base: number,
  variance = 3,
  interval = 4000,
  timeWeight = 1,
) {
  const phase     = useMemo(() => getCampusPhase(), []);
  const scaledBase = Math.round(base * (0.4 + (phase.loadPct / 100) * 0.6) * timeWeight);
  const [value, setValue] = useState(scaledBase);

  useEffect(() => {
    const id = setInterval(() => {
      const drift = Math.floor((Math.random() - 0.48) * variance * 2);
      setValue((v) => Math.max(0, v + drift));
    }, interval);
    return () => clearInterval(id);
  }, [scaledBase, variance, interval]);

  return value;
}

/* ════════════════════════════════════════════════════════════════
   LIVE EVENT FEED — realistic campus event ticker
════════════════════════════════════════════════════════════════ */

type FeedEvent = {
  id:      string;
  time:    string;
  type:    "nav" | "alert" | "system" | "occupancy";
  message: string;
};

const EVENT_TEMPLATES = [
  { type: "nav"       as const, messages: [
    "Route calculated: Main Gate → Library",
    "Route calculated: Hostel Block A → CSE Dept",
    "Route calculated: Cafeteria → Admin Block",
    "Navigation session started — 3 waypoints",
    "Route recalculated — path congestion detected",
    "New session: Sports Complex → Block B",
  ]},
  { type: "occupancy" as const, messages: [
    "Library occupancy crossed 80%",
    "Cafeteria at peak capacity",
    "CSE Lab 3 — seats available",
    "Admin Block — low activity",
    "Seminar Hall B — session starting",
    "Hostel common room — moderate activity",
  ]},
  { type: "system"    as const, messages: [
    "Sensor node SN-14 heartbeat OK",
    "Data pipeline sync — 847 records",
    "Analytics cache refreshed",
    "GPS anchor point verified",
    "Sensor grid latency nominal — 8ms",
    "Backup sync completed",
  ]},
  { type: "alert"     as const, messages: [
    "Unusual traffic spike — East Zone",
    "Path SN-7 → SN-12 load elevated",
    "Crowd density advisory: Quad Area",
  ]},
];

function generateEvent(): FeedEvent {
  const now       = new Date();
  const timeStr   = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  // Weight toward nav + occupancy, rarely alert
  const weights   = [6, 5, 4, 1];
  const total     = weights.reduce((a, b) => a + b, 0);
  let rand        = Math.random() * total;
  let idx         = 0;
  for (let i = 0; i < weights.length; i++) { rand -= weights[i]; if (rand <= 0) { idx = i; break; } }
  const template  = EVENT_TEMPLATES[idx];
  const message   = template.messages[Math.floor(Math.random() * template.messages.length)];
  return { id: `${Date.now()}-${Math.random()}`, time: timeStr, type: template.type, message };
}

const FEED_TYPE_COLOR: Record<FeedEvent["type"], string> = {
  nav:       "#00d4ff",
  occupancy: "#eab308",
  system:    "#22c55e",
  alert:     "#f97316",
};

const FEED_TYPE_LABEL: Record<FeedEvent["type"], string> = {
  nav:       "NAV",
  occupancy: "OCC",
  system:    "SYS",
  alert:     "ALT",
};

function LiveEventFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(() =>
    Array.from({ length: 5 }, generateEvent)
  );

  useEffect(() => {
    // Phase-aware interval — faster during peak hours
    const phase    = getCampusPhase();
    const interval = Math.round(3500 - (phase.loadPct / 100) * 1800); // 1700ms–3500ms
    const id = setInterval(() => {
      setEvents((prev) => [generateEvent(), ...prev].slice(0, 8));
    }, interval);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -10, height: 0 }}
            animate={{ opacity: 1,  x: 0,   height: "auto" }}
            exit={{    opacity: 0,           height: 0       }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg overflow-hidden"
            style={{
              background: `${FEED_TYPE_COLOR[ev.type]}08`,
              border:     `1px solid ${FEED_TYPE_COLOR[ev.type]}18`,
            }}
          >
            {/* Type badge */}
            <span
              className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                background: `${FEED_TYPE_COLOR[ev.type]}18`,
                color:       FEED_TYPE_COLOR[ev.type],
                fontFamily: "var(--font-display)",
                minWidth:   28,
                textAlign:  "center",
              }}
            >
              {FEED_TYPE_LABEL[ev.type]}
            </span>
            {/* Message */}
            <span
              className="text-[10.5px] flex-1 min-w-0 truncate"
              style={{ color: "rgba(203,213,225,0.75)", fontFamily: "var(--font-body)" }}
            >
              {ev.message}
            </span>
            {/* Time */}
            <span
              className="text-[9px] font-mono flex-shrink-0"
              style={{ color: "rgba(100,116,139,0.65)" }}
            >
              {ev.time}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   24H ACTIVITY BAR — today's rhythm at a glance
════════════════════════════════════════════════════════════════ */

function ActivityBar24h() {
  const currentHour = new Date().getHours();

  return (
    <div>
      <div
        className="text-[8.5px] tracking-[1.5px] mb-2 flex items-center justify-between"
        style={{ color: "rgba(100,116,139,0.7)", fontFamily: "var(--font-display)" }}
      >
        <span>24H CAMPUS ACTIVITY</span>
        <span>TODAY</span>
      </div>
      <div className="flex items-end gap-[2px] h-8">
        {HOURLY_ACTIVITY.map((val, hr) => {
          const isPast    = hr < currentHour;
          const isCurrent = hr === currentHour;
          const height    = `${Math.max(8, val)}%`;

          return (
            <motion.div
              key={hr}
              title={`${hr}:00 — ${val}% activity`}
              className="flex-1 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: hr * 0.018, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height,
                transformOrigin: "bottom",
                background: isCurrent
                  ? "#00d4ff"
                  : isPast
                  ? `rgba(14,165,233,${0.25 + (val / 100) * 0.45})`
                  : "rgba(255,255,255,0.07)",
                boxShadow: isCurrent ? "0 0 6px rgba(0,212,255,0.6)" : "none",
              }}
            />
          );
        })}
      </div>
      {/* Hour labels — every 6h */}
      <div className="flex justify-between mt-1">
        {["12AM", "6AM", "12PM", "6PM", "11PM"].map((l) => (
          <span
            key={l}
            className="text-[8px] font-mono"
            style={{ color: "rgba(100,116,139,0.5)" }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CAMPUS LOAD GAUGE
════════════════════════════════════════════════════════════════ */

function CampusLoadGauge({ phase }: { phase: CampusPhase }) {
  // Small live variance on the load %
  const [displayPct, setDisplayPct] = useState(phase.loadPct);

  useEffect(() => {
    const id = setInterval(() => {
      const drift = (Math.random() - 0.48) * 3;
      setDisplayPct((p) => Math.max(0, Math.min(100, Math.round(p + drift))));
    }, 2800);
    return () => clearInterval(id);
  }, [phase.loadPct]);

  // Arc geometry
  const r        = 38;
  const cx       = 56;
  const cy       = 56;
  const startDeg = -210;
  const sweepDeg = 240;
  const toRad    = (d: number) => (d * Math.PI) / 180;
  const arcPath  = (pct: number) => {
    const sweep = (pct / 100) * sweepDeg;
    const endDeg = startDeg + sweep;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const trackPath = arcPath(100);
  const fillPath  = arcPath(displayPct);
  const circ      = 2 * Math.PI * r * (sweepDeg / 360);

  return (
    <div className="flex flex-col items-center">
      <svg width={112} height={90} viewBox="0 0 112 90">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.path
          d={fillPath}
          fill="none"
          stroke={phase.color}
          strokeWidth={6}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${phase.color}88)`,
          }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: displayPct / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Center text */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={18}
          fontWeight={700}
          fontFamily="var(--font-display)"
        >
          {displayPct}%
        </text>
        <text
          x={cx} y={cy + 11}
          textAnchor="middle"
          fill="rgba(100,116,139,0.7)"
          fontSize={7}
          fontFamily="var(--font-display)"
          letterSpacing={1.5}
        >
          CAMPUS LOAD
        </text>
      </svg>
      <div
        className="text-[10px] font-semibold text-center -mt-1"
        style={{ color: phase.color, fontFamily: "var(--font-display)" }}
      >
        {phase.shortLabel}
      </div>
      <div
        className="text-[9px] text-center mt-0.5 max-w-[110px]"
        style={{ color: "rgba(100,116,139,0.65)", fontFamily: "var(--font-body)", lineHeight: 1.4 }}
      >
        {phase.description}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND
════════════════════════════════════════════════════════════════ */

function AmbientBackground({
  mouseX,
  mouseY,
  phase,
}: {
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  phase:  CampusPhase;
}) {
  const bgX = useTransform(mouseX, (v) => `${50 + v * 0.3}%`);
  const bgY = useTransform(mouseY, (v) => `${30 + v * 0.2}%`);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#080c14" }} />

      {/* Primary — mouse reactive, tinted by campus phase */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${bgX} ${bgY}, ${phase.color}0d 0%, transparent 65%)`,
        }}
      />

      {/* Phase-tinted secondary accent */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 45% 50% at 85% 5%, rgba(139,92,246,0.04) 0%, transparent 60%)`,
          transition: "background 3s ease",
        }}
      />

      {/* Floor glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 30% at 50% 100%, rgba(14,165,233,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.055) 1px, transparent 1px)",
          backgroundSize:  "32px 32px",
          maskImage:       "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Top streak */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.15) 30%, rgba(139,92,246,0.12) 70%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(4,6,10,0.7) 100%)",
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SURFACE SYSTEM
════════════════════════════════════════════════════════════════ */

function Surface({
  children,
  className = "",
  delay = 0,
  accent = false,
}: {
  children:   React.ReactNode;
  className?: string;
  delay?:     number;
  accent?:    boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background:   "rgba(255,255,255,0.025)",
        border:       `1px solid ${hovered ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.06)"}`,
        transition:   "border-color 0.4s ease",
      }}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.5), rgba(139,92,246,0.3), transparent)",
          }}
        />
      )}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 70%)",
        }}
      />
      {children}
    </motion.div>
  );
}

function CommandSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border:     "1px solid rgba(255,255,255,0.07)",
        boxShadow:  "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LIVE BADGE
════════════════════════════════════════════════════════════════ */

function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-[7px] w-[7px]">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{ background: "#22c55e" }}
          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex rounded-full h-[7px] w-[7px]" style={{ background: "#22c55e" }} />
      </span>
      <span
        className="text-[10px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "#22c55e", fontFamily: "var(--font-display)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ANIMATED STAT PILL
════════════════════════════════════════════════════════════════ */

function AnimatedStatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const [prev, setPrev] = useState(value);
  const [dir,  setDir]  = useState(0);

  useEffect(() => {
    setDir(value > prev ? 1 : value < prev ? -1 : 0);
    setPrev(value);
  }, [value]);

  return (
    <div className="text-center">
      <div className="flex items-center gap-1.5 justify-center">
        <motion.span
          key={value}
          className="text-[17px] font-bold tabular-nums"
          style={{ fontFamily: "var(--font-display)", color }}
          initial={{ y: dir * -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {value.toLocaleString()}
        </motion.span>
        {dir !== 0 && (
          <motion.span
            className="text-[10px]"
            style={{ color: dir > 0 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {dir > 0 ? "↑" : "↓"}
          </motion.span>
        )}
      </div>
      <div
        className="text-[9px] tracking-wider uppercase mt-0.5"
        style={{ color: "rgba(100,116,139,0.7)", fontFamily: "var(--font-display)" }}
      >
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMMAND HEADER
════════════════════════════════════════════════════════════════ */

function CommandHeader({
  time,
  date,
  phase,
}: {
  time:  string;
  date:  string;
  phase: CampusPhase;
}) {
  const activeNodes = useLiveCounter(24,  2,  5000);
  const sessions    = useLiveCounter(847, 15, 3500);

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1,  y: 0   }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <CommandSurface>
        <div className="px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-5">

            {/* Left: identity */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.1))",
                    border:     "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(14,165,233,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl"
                  style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15), transparent 70%)" }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1
                    className="text-[22px] font-bold tracking-tight leading-none"
                    style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}
                  >
                    Analytics
                  </h1>
                  <span
                    className="text-[22px] font-light leading-none"
                    style={{ color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-display)" }}
                  >
                    /
                  </span>
                  <span
                    className="text-[22px] font-bold tracking-tight leading-none"
                    style={{
                      fontFamily:           "var(--font-display)",
                      background:           "linear-gradient(90deg, rgba(14,165,233,0.9), rgba(139,92,246,0.8))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor:  "transparent",
                      backgroundClip:       "text",
                      letterSpacing:        "-0.02em",
                    }}
                  >
                    Intelligence Center
                  </span>
                </div>
                <p
                  className="text-[12px] leading-none"
                  style={{ color: "rgba(148,163,184,0.7)", fontFamily: "var(--font-body)", letterSpacing: "0.01em" }}
                >
                  RIMT University · Campus Navigation System
                </p>
              </div>
            </div>

            {/* Right: live metrics + clock */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <AnimatedStatPill label="Active Nodes" value={activeNodes} color="rgba(14,165,233,0.9)" />
                <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />
                <AnimatedStatPill label="Sessions Today" value={sessions} color="rgba(139,92,246,0.9)" />
                <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Campus phase pill — NEW */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: `${phase.color}12`,
                    border:     `1px solid ${phase.color}28`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: phase.color,
                      boxShadow:  `0 0 5px ${phase.color}`,
                      animation:  "live-blink 2s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold tracking-wider"
                    style={{ color: phase.accentColor, fontFamily: "var(--font-display)" }}
                  >
                    {phase.shortLabel}
                  </span>
                </div>
                <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <LiveBadge label="Live Feed" />

              <div className="hidden sm:block w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />

              <div className="hidden sm:block text-right">
                <motion.div
                  className="text-[20px] font-bold tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em" }}
                  key={time}
                >
                  {time || "──:──:──"}
                </motion.div>
                <div
                  className="text-[10px] mt-1 leading-none"
                  style={{ color: "rgba(148,163,184,0.5)", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
                >
                  {date.split(",")[0]?.toUpperCase() || ""}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div
            className="mt-5 pt-4 flex flex-wrap items-center gap-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            {[
              {
                icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                label: "Updated", value: "Every 30 seconds",
              },
              {
                icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                label: "Period", value: "Last 7 days",
              },
              {
                icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                label: "Coverage", value: "Full campus",
              },
              {
                icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                label: "System", value: "Nominal", highlight: true,
              },
              // NEW — campus phase in status bar
              {
                icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
                label: "Phase", value: phase.label, phaseColor: phase.color,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ color: (item as any).highlight ? "rgba(34,197,94,0.7)" : (item as any).phaseColor ? `${(item as any).phaseColor}88` : "rgba(100,116,139,0.7)" }}>
                  {item.icon}
                </span>
                <span className="text-[11px]" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "var(--font-body)" }}>
                  {item.label}
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: (item as any).highlight
                      ? "rgba(34,197,94,0.9)"
                      : (item as any).phaseColor
                      ? (item as any).phaseColor
                      : "rgba(203,213,225,0.7)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CommandSurface>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECTION HEADER
════════════════════════════════════════════════════════════════ */

function SectionHeader({
  label,
  description,
  action,
  live = false,
}: {
  label:        string;
  description?: string;
  action?:      string;
  live?:        boolean;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-[3px] h-4 rounded-full"
            style={{ background: "linear-gradient(180deg, rgba(14,165,233,0.9), rgba(139,92,246,0.6))" }}
          />
          <h2
            className="text-[13px] font-semibold tracking-wide"
            style={{ color: "rgba(203,213,225,0.9)", fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}
          >
            {label}
          </h2>
          {live && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-widest"
              style={{
                background: "rgba(34,197,94,0.1)",
                border:     "1px solid rgba(34,197,94,0.2)",
                color:      "#22c55e",
                fontFamily: "var(--font-display)",
                animation:  "live-blink 2s ease-in-out infinite",
              }}
            >
              LIVE
            </span>
          )}
        </div>
        {description && (
          <p
            className="text-[11px] ml-[19px]"
            style={{ color: "rgba(100,116,139,0.8)", fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
          style={{
            color:      "rgba(14,165,233,0.8)",
            background: "rgba(14,165,233,0.07)",
            border:     "1px solid rgba(14,165,233,0.12)",
            fontFamily: "var(--font-body)",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPERATIONAL RIBBON — live system health
════════════════════════════════════════════════════════════════ */

function OperationalRibbon({ phase }: { phase: CampusPhase }) {
  const uptime = useLiveCounter(9998, 1, 8000);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4500);
    return () => clearInterval(id);
  }, []);

  // Latency drifts realistically — higher during peak
  const baseLatency = Math.round(8 + (phase.loadPct / 100) * 18);
  const systems = useMemo(() => [
    { name: "Navigation Engine", latency: `${baseLatency + 4}ms`,             status: "operational" },
    { name: "Sensor Grid",       latency: `${baseLatency}ms`,                  status: "operational" },
    { name: "Data Pipeline",     latency: `${baseLatency + 26}ms`,             status: "operational" },
    { name: "Analytics API",     latency: `${baseLatency + 13}ms`,             status: "operational" },
  ], [tick, baseLatency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <Surface accent className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Systems */}
            <div className="flex flex-wrap items-center gap-5">
              {systems.map((sys, i) => (
                <motion.div
                  key={sys.name}
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: 0.85 + i * 0.06 }}
                >
                  <span className="relative flex h-[6px] w-[6px]">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full"
                      style={{ background: "#22c55e" }}
                      animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                    />
                    <span className="relative inline-flex rounded-full h-[6px] w-[6px]" style={{ background: "#22c55e" }} />
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.7)", fontFamily: "var(--font-body)" }}>
                    {sys.name}
                  </span>
                  <motion.span
                    key={sys.latency}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      color:      "rgba(100,116,139,0.8)",
                      border:     "1px solid rgba(255,255,255,0.04)",
                    }}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1   }}
                    transition={{ duration: 0.3 }}
                  >
                    {sys.latency}
                  </motion.span>
                </motion.div>
              ))}
            </div>

            {/* Right: uptime + load */}
            <div className="flex items-center gap-4">
              {/* Campus load mini */}
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: `${phase.color}0e`,
                  border:     `1px solid ${phase.color}22`,
                }}
              >
                <span className="text-[9px] tracking-wider" style={{ color: "rgba(100,116,139,0.7)", fontFamily: "var(--font-display)" }}>
                  LOAD
                </span>
                <span className="text-[12px] font-bold tabular-nums" style={{ color: phase.color, fontFamily: "var(--font-display)" }}>
                  {phase.loadPct}%
                </span>
                <span className="text-[9px]" style={{ color: `${phase.color}99`, fontFamily: "var(--font-display)" }}>
                  {phase.shortLabel}
                </span>
              </div>

              <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.05)" }} />

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(100,116,139,0.6)", fontFamily: "var(--font-display)" }}>
                  Uptime
                </div>
                <div className="text-[13px] font-bold tabular-nums" style={{ color: "rgba(34,197,94,0.9)", fontFamily: "var(--font-display)" }}>
                  {(uptime / 100).toFixed(2)}%
                </div>
              </div>

              <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.05)" }} />

              <LiveBadge label="All Systems Nominal" />
            </div>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAGGER VARIANTS
════════════════════════════════════════════════════════════════ */

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* ════════════════════════════════════════════════════════════════
   KEYFRAMES
════════════════════════════════════════════════════════════════ */

const ANALYTICS_KEYFRAMES = `
@keyframes live-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.35; }
}
`;

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const { time, date }       = useClock();
  const { x: mouseX, y: mouseY } = useMouseParallax();
  const [mounted, setMounted] = useState(false);
  const phase                = useMemo(() => getCampusPhase(), []);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{ANALYTICS_KEYFRAMES}</style>

      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ background: "#080c14", paddingTop: "95px" }}
      >
        <AmbientBackground mouseX={mouseX} mouseY={mouseY} phase={phase} />

        <motion.div
          className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-7 py-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── COMMAND HEADER ── */}
          <CommandHeader time={time} date={date} phase={phase} />

          {/* ── CONTENT ── */}
          <motion.div
            className="space-y-7"
            variants={staggerContainer}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
          >
            {/* KPI ROW */}
            <motion.section variants={staggerItem}>
              <SectionHeader
                label="Key Performance Indicators"
                description="Live campus navigation metrics"
                action="Export"
                live
              />
              <KPICards />
            </motion.section>

            {/* TRAFFIC CHART + SPARKLINES */}
            <motion.section variants={staggerItem}>
              <SectionHeader
                label="Traffic & Activity Streams"
                description="Hourly movement patterns across campus zones"
                live
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Surface accent delay={0.2} className="h-full">
                    <div className="p-1"><TrafficChart /></div>
                  </Surface>
                </div>
                <div>
                  <Surface delay={0.28} className="h-full">
                    <div className="p-1"><BuildingSparklines /></div>
                  </Surface>
                </div>
              </div>
            </motion.section>

            {/* 24H ACTIVITY + LIVE FEED + GAUGE — NEW ROW */}
            <motion.section variants={staggerItem}>
              <SectionHeader
                label="Live Campus Operations"
                description="Real-time activity feed, 24h profile, and campus load"
                live
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Event feed */}
                <div className="lg:col-span-2">
                  <Surface delay={0.3} className="h-full">
                    <div className="p-5">
                      <div
                        className="text-[9px] tracking-[2px] mb-3 flex items-center gap-2"
                        style={{ color: "rgba(100,116,139,0.65)", fontFamily: "var(--font-display)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#22c55e", boxShadow: "0 0 5px #22c55e", animation: "live-blink 1.8s infinite" }}
                        />
                        LIVE EVENT FEED
                      </div>
                      <LiveEventFeed />
                      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <ActivityBar24h />
                      </div>
                    </div>
                  </Surface>
                </div>

                {/* Campus load gauge */}
                <div>
                  <Surface delay={0.36} className="h-full">
                    <div className="p-5 flex flex-col items-center justify-center h-full gap-4">
                      <div
                        className="text-[9px] tracking-[2px] self-start"
                        style={{ color: "rgba(100,116,139,0.65)", fontFamily: "var(--font-display)" }}
                      >
                        CAMPUS UTILIZATION
                      </div>
                      <CampusLoadGauge phase={phase} />
                    </div>
                  </Surface>
                </div>
              </div>
            </motion.section>

            {/* LOCATIONS + ROUTES */}
            <motion.section variants={staggerItem}>
              <SectionHeader
                label="Campus Intelligence"
                description="Top destinations and navigation route patterns"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Surface delay={0.3}><TopLocations /></Surface>
                <Surface delay={0.36}><PopularRoutes /></Surface>
              </div>
            </motion.section>

            {/* OPERATIONAL RIBBON */}
            <motion.section variants={staggerItem}>
              <OperationalRibbon phase={phase} />
            </motion.section>
          </motion.div>

          <div className="h-12" />
        </motion.div>
      </div>
    </>
  );
}