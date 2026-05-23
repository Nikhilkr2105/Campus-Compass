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
  BuildingUtilization,
  NavigationIntelligence,
  PredictiveInsights,
} from "@/components/navigation/AnalyticsCards";
import {
  TrafficChart,
  BuildingSparklines,
  CampusFlowAnalysis,
  StudentActivityTrends,
  RecentTrends,
  OperationalMetrics,
} from "@/components/navigation/TrafficChart";

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════════════════════ */

const T = {
  sky:    "#0ea5e9",
  gold:   "#f59e0b",
  navy:   "#0f172a",
  muted:  "#64748b",
  faint:  "#94a3b8",
  green:  "#10b981",
  purple: "#8b5cf6",
  bgPage: "#f0f4f8",
};

/* ════════════════════════════════════════════════════════════════
   TIME-AWARE CAMPUS STATE
════════════════════════════════════════════════════════════════ */

type CampusPhase = {
  label:       string;
  shortLabel:  string;
  loadPct:     number;
  color:       string;
  description: string;
};

function getCampusPhase(): CampusPhase {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return { label: "Morning Commute",   shortLabel: "MORNING",   loadPct: 42, color: T.sky,    description: "Campus filling — classes starting" };
  if (h >= 9  && h < 12) return { label: "Peak Morning",      shortLabel: "PEAK AM",   loadPct: 87, color: T.gold,   description: "High foot traffic — all zones active" };
  if (h >= 12 && h < 14) return { label: "Lunch Rush",        shortLabel: "LUNCH",     loadPct: 94, color: "#ef4444",description: "Peak occupancy — cafeteria & commons" };
  if (h >= 14 && h < 17) return { label: "Afternoon Session", shortLabel: "AFTERNOON", loadPct: 78, color: T.sky,    description: "Classes in progress — steady traffic" };
  if (h >= 17 && h < 20) return { label: "Evening Wind-down", shortLabel: "EVENING",   loadPct: 45, color: T.purple, description: "Reducing activity — labs & library" };
  if (h >= 20 && h < 23) return { label: "Quiet Hours",       shortLabel: "QUIET",     loadPct: 18, color: T.muted,  description: "Limited services — security active" };
  return                         { label: "Night Mode",        shortLabel: "NIGHT",     loadPct: 6,  color: T.faint,  description: "Campus secured — minimal presence" };
}

const HOURLY_ACTIVITY = [
   4,  3,  2,  2,  3,  8,
  22, 38, 55, 82, 91, 88,
  96, 94, 85, 82, 79, 65,
  48, 35, 24, 16,  9,  5,
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

function useLiveCounter(base: number, variance = 3, interval = 4000, timeWeight = 1) {
  const phase      = useMemo(() => getCampusPhase(), []);
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
   LIVE EVENT FEED
════════════════════════════════════════════════════════════════ */

type FeedEvent = { id: string; time: string; type: "nav" | "alert" | "system" | "occupancy"; message: string };

const EVENT_TEMPLATES = [
  { type: "nav"       as const, messages: ["Route calculated: Main Gate → Library","Route calculated: Hostel Block A → CSE Dept","Route calculated: Cafeteria → Admin Block","Navigation session started — 3 waypoints","Route recalculated — path congestion detected"] },
  { type: "occupancy" as const, messages: ["Library occupancy crossed 80%","Cafeteria at peak capacity","CSE Lab 3 — seats available","Admin Block — low activity","Seminar Hall B — session starting"] },
  { type: "system"    as const, messages: ["Sensor node SN-14 heartbeat OK","Data pipeline sync — 847 records","Analytics cache refreshed","GPS anchor point verified","Sensor grid latency nominal — 8ms"] },
  { type: "alert"     as const, messages: ["Unusual traffic spike — East Zone","Path SN-7 → SN-12 load elevated","Crowd density advisory: Quad Area"] },
];

const FEED_META: Record<FeedEvent["type"], { color: string; label: string; bg: string }> = {
  nav:       { color: T.sky,    label: "NAV", bg: `rgba(14,165,233,0.08)`  },
  occupancy: { color: T.gold,   label: "OCC", bg: `rgba(245,158,11,0.08)` },
  system:    { color: T.green,  label: "SYS", bg: `rgba(16,185,129,0.08)` },
  alert:     { color: "#ef4444",label: "ALT", bg: `rgba(239,68,68,0.08)`  },
};

function generateEvent(): FeedEvent {
  const now     = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const weights = [6, 5, 4, 1];
  const total   = weights.reduce((a, b) => a + b, 0);
  let rand      = Math.random() * total;
  let idx       = 0;
  for (let i = 0; i < weights.length; i++) { rand -= weights[i]; if (rand <= 0) { idx = i; break; } }
  const t       = EVENT_TEMPLATES[idx];
  return { id: `${Date.now()}-${Math.random()}`, time: timeStr, type: t.type, message: t.messages[Math.floor(Math.random() * t.messages.length)] };
}

function LiveEventFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(() => Array.from({ length: 6 }, generateEvent));
  useEffect(() => {
    const phase    = getCampusPhase();
    const interval = Math.round(3500 - (phase.loadPct / 100) * 1800);
    const id = setInterval(() => setEvents((prev) => [generateEvent(), ...prev].slice(0, 8)), interval);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {events.map((ev) => {
          const meta = FEED_META[ev.type];
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -8, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl overflow-hidden"
              style={{ background: meta.bg, border: `1px solid ${meta.color}18` }}
            >
              <span
                className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: `${meta.color}15`, color: meta.color, minWidth: 28, textAlign: "center" }}
              >
                {meta.label}
              </span>
              <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color: T.muted }}>
                {ev.message}
              </span>
              <span className="text-[9.5px] font-mono flex-shrink-0" style={{ color: T.faint }}>
                {ev.time}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   24H ACTIVITY BAR
════════════════════════════════════════════════════════════════ */

function ActivityBar24h() {
  const currentHour = new Date().getHours();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: T.muted }}>24h Campus Activity</span>
        <span className="text-[10px]" style={{ color: T.faint }}>Today</span>
      </div>
      <div className="flex items-end gap-[2px] h-8">
        {HOURLY_ACTIVITY.map((val, hr) => {
          const isPast    = hr < currentHour;
          const isCurrent = hr === currentHour;
          return (
            <motion.div
              key={hr}
              title={`${hr}:00 — ${val}% activity`}
              className="flex-1 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: hr * 0.015, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: `${Math.max(8, val)}%`,
                transformOrigin: "bottom",
                background: isCurrent ? T.sky : isPast ? `rgba(14,165,233,${0.25 + (val / 100) * 0.4})` : "rgba(15,23,42,0.07)",
                boxShadow: isCurrent ? `0 0 6px ${T.sky}66` : "none",
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {["12AM", "6AM", "12PM", "6PM", "11PM"].map((l) => (
          <span key={l} className="text-[8.5px] font-mono" style={{ color: T.faint }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CAMPUS LOAD GAUGE
════════════════════════════════════════════════════════════════ */

function CampusLoadGauge({ phase }: { phase: CampusPhase }) {
  const [displayPct, setDisplayPct] = useState(phase.loadPct);
  useEffect(() => {
    const id = setInterval(() => {
      const drift = (Math.random() - 0.48) * 3;
      setDisplayPct((p) => Math.max(0, Math.min(100, Math.round(p + drift))));
    }, 2800);
    return () => clearInterval(id);
  }, [phase.loadPct]);

  const r = 38, cx = 56, cy = 56;
  const startDeg = -210, sweepDeg = 240;
  const toRad    = (d: number) => (d * Math.PI) / 180;
  const arcPath  = (pct: number) => {
    const sweep = (pct / 100) * sweepDeg;
    const endDeg = startDeg + sweep;
    const x1 = cx + r * Math.cos(toRad(startDeg)), y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg)),   y2 = cy + r * Math.sin(toRad(endDeg));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={112} height={90} viewBox="0 0 112 90">
        <path d={arcPath(100)} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={6} strokeLinecap="round" />
        <motion.path
          d={arcPath(displayPct)}
          fill="none"
          stroke={phase.color}
          strokeWidth={6}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: displayPct / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${phase.color}55)` }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={T.navy} fontSize={18} fontWeight={700}>
          {displayPct}%
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill={T.muted} fontSize={7} letterSpacing={1.5}>
          CAMPUS LOAD
        </text>
      </svg>
      <div className="text-[11px] font-bold text-center -mt-1" style={{ color: phase.color }}>
        {phase.shortLabel}
      </div>
      <div className="text-[10px] text-center mt-0.5 max-w-[110px] leading-relaxed" style={{ color: T.muted }}>
        {phase.description}
      </div>
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
          style={{ background: T.green }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex rounded-full h-[7px] w-[7px]" style={{ background: T.green }} />
      </span>
      <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: T.green }}>
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
  const [dir, setDir]   = useState(0);
  useEffect(() => {
    setDir(value > prev ? 1 : value < prev ? -1 : 0);
    setPrev(value);
  }, [value]);
  return (
    <div className="text-center">
      <div className="flex items-center gap-1 justify-center">
        <motion.span
          key={value}
          className="text-[17px] font-bold tabular-nums"
          style={{ color, fontVariantNumeric: "tabular-nums" }}
          initial={{ y: dir * -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {value.toLocaleString()}
        </motion.span>
        {dir !== 0 && (
          <motion.span
            className="text-[10px]"
            style={{ color: dir > 0 ? T.green : "#ef4444" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {dir > 0 ? "↑" : "↓"}
          </motion.span>
        )}
      </div>
      <div className="text-[9px] tracking-wider uppercase mt-0.5" style={{ color: T.muted }}>
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE HEADER — clean executive, light
════════════════════════════════════════════════════════════════ */

function PageHeader({ time, date, phase }: { time: string; date: string; phase: CampusPhase }) {
  const activeNodes = useLiveCounter(24, 2, 5000);
  const sessions    = useLiveCounter(847, 15, 3500);

  return (
    <motion.div
      className="mb-7"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div
        className="rounded-2xl px-7 py-5"
        style={{
          background:     "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          border:         "1px solid rgba(15,23,42,0.08)",
          boxShadow:      "0 1px 3px rgba(15,23,42,0.06), 0 8px 32px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.9) inset",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${T.sky}, ${T.purple}55, transparent)` }}
        />

        <div className="flex flex-wrap items-center justify-between gap-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${T.sky}18, ${T.purple}12)`,
                border:     `1px solid ${T.sky}22`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.sky} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-[20px] font-bold tracking-tight leading-none" style={{ color: T.navy, letterSpacing: "-0.02em" }}>
                  Analytics
                </h1>
                <span className="text-[20px] font-light leading-none" style={{ color: "rgba(15,23,42,0.15)" }}>/</span>
                <span
                  className="text-[20px] font-bold tracking-tight leading-none"
                  style={{
                    background:           `linear-gradient(90deg, ${T.sky}, ${T.purple})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:  "transparent",
                    backgroundClip:       "text",
                    letterSpacing:        "-0.02em",
                  }}
                >
                  Intelligence Center
                </span>
              </div>
              <p className="text-[11px] leading-none" style={{ color: T.muted }}>
                RIMT University · Campus Navigation System
              </p>
            </div>
          </div>

          {/* Right: stats + clock */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <AnimatedStatPill label="Active Nodes" value={activeNodes} color={T.sky} />
              <div className="w-px h-8" style={{ background: "rgba(15,23,42,0.08)" }} />
              <AnimatedStatPill label="Sessions Today" value={sessions} color={T.purple} />
              <div className="w-px h-8" style={{ background: "rgba(15,23,42,0.08)" }} />
              {/* Phase pill */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ background: `${phase.color}0f`, border: `1px solid ${phase.color}28` }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: phase.color }} />
                <span className="text-[10px] font-semibold tracking-wider" style={{ color: phase.color }}>
                  {phase.shortLabel}
                </span>
              </div>
              <div className="w-px h-8" style={{ background: "rgba(15,23,42,0.08)" }} />
            </div>

            <LiveBadge label="Live Feed" />

            <div className="hidden sm:block w-px h-8" style={{ background: "rgba(15,23,42,0.08)" }} />
            <div className="hidden sm:block text-right">
              <div className="text-[19px] font-bold tabular-nums leading-none" style={{ color: T.navy, letterSpacing: "0.04em" }}>
                {time || "──:──:──"}
              </div>
              <div className="text-[10px] mt-0.5 leading-none" style={{ color: T.faint, letterSpacing: "0.06em" }}>
                {date.split(",")[0]?.toUpperCase() || ""}
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          className="mt-5 pt-4 flex flex-wrap items-center gap-6"
          style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
        >
          {[
            { icon: "🕐", label: "Updated", value: "Every 30 seconds" },
            { icon: "📅", label: "Period",  value: "Last 7 days" },
            { icon: "📍", label: "Coverage",value: "Full campus" },
            { icon: "⚡", label: "System",  value: "Nominal", highlight: true },
            { icon: "🕐", label: "Phase",   value: phase.label, phaseColor: phase.color },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="text-[11px]">{item.icon}</span>
              <span className="text-[11px]" style={{ color: T.faint }}>{item.label}</span>
              <span
                className="text-[11px] font-medium"
                style={{
                  color: (item as any).highlight
                    ? T.green
                    : (item as any).phaseColor
                    ? (item as any).phaseColor
                    : T.muted,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECTION HEADER — clean executive
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
        <div className="flex items-center gap-2.5 mb-0.5">
          <div
            className="w-[3px] h-4 rounded-full"
            style={{ background: `linear-gradient(180deg, ${T.sky}, ${T.purple}66)` }}
          />
          <h2 className="text-[13px] font-semibold" style={{ color: T.navy, letterSpacing: "0.01em" }}>
            {label}
          </h2>
          {live && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-widest"
              style={{
                background: "rgba(16,185,129,0.1)",
                border:     "1px solid rgba(16,185,129,0.2)",
                color:      T.green,
              }}
            >
              LIVE
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] ml-[19px]" style={{ color: T.muted }}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            color:      T.sky,
            background: `rgba(14,165,233,0.07)`,
            border:     `1px solid rgba(14,165,233,0.15)`,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND — light, subtle
════════════════════════════════════════════════════════════════ */

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0" style={{ background: "#f0f4f8" }} />
      {/* Subtle gradient blobs */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 60% 50% at 10% 10%, ${T.sky}0a 0%, transparent 60%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 50% 40% at 90% 90%, ${T.purple}07 0%, transparent 60%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 40% 30% at 80% 10%, ${T.gold}06 0%, transparent 50%)` }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize:  "28px 28px",
          maskImage:       "radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAGGER VARIANTS
════════════════════════════════════════════════════════════════ */

const staggerContainer = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18, scale: 0.99 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.52, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const { time, date }        = useClock();
  const [mounted, setMounted] = useState(false);
  const phase                 = useMemo(() => getCampusPhase(), []);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ paddingTop: "95px" }}
    >
      <AmbientBackground />

      <motion.div
        className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-7 py-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── PAGE HEADER ── */}
        <PageHeader time={time} date={date} phase={phase} />

        {/* ── ALL SECTIONS ── */}
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
        >

          {/* 1. CAMPUS PULSE — KPI cards */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Campus Pulse"
              description="Live performance indicators across the navigation ecosystem"
              action="Export"
              live
            />
            <KPICards />
          </motion.section>

          {/* 2. NAVIGATION INTELLIGENCE */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Navigation Intelligence"
              description="Route patterns, busiest buildings, travel time and demand signals"
            />
            <NavigationIntelligence />
          </motion.section>

          {/* 3. BUILDING UTILIZATION */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Building Utilization"
              description="Real-time occupancy and 7-day activity trends by facility"
              live
            />
            <BuildingUtilization />
          </motion.section>

          {/* 4. STUDENT ACTIVITY TRENDS + TRAFFIC CHART */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Student Activity Trends"
              description="Academic, social, and sports engagement across the week"
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <StudentActivityTrends />
              </div>
              <div>
                <TrafficChart />
              </div>
            </div>
          </motion.section>

          {/* 5. CAMPUS FLOW ANALYSIS */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Campus Flow Analysis"
              description="Movement patterns and zone activity by time of day"
            />
            <CampusFlowAnalysis />
          </motion.section>

          {/* 6. OPERATIONAL METRICS */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Operational Metrics"
              description="System health, infrastructure performance, and uptime indicators"
            />
            <OperationalMetrics />
          </motion.section>

          {/* 7. RECENT TRENDS + BUILDING SPARKLINES */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Recent Trends"
              description="Week-over-week navigation shifts and demand changes"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RecentTrends />
              <BuildingSparklines />
            </div>
          </motion.section>

          {/* 8. PREDICTIVE INSIGHTS */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Predictive Insights"
              description="AI-powered demand forecasting and campus intelligence alerts"
            />
            <PredictiveInsights />
          </motion.section>

          {/* 9. LOCATIONS + ROUTES (preserved) */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Campus Intelligence"
              description="Top destinations and highest-demand navigation route patterns"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TopLocations />
              <PopularRoutes />
            </div>
          </motion.section>

          {/* 10. LIVE OPERATIONS */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Live Campus Operations"
              description="Real-time event feed, 24h activity profile, and campus load"
              live
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl p-5 h-full"
                  style={{
                    background:     "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(16px)",
                    border:         "1px solid rgba(15,23,42,0.07)",
                    boxShadow:      "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                    <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: T.green }}>
                      Live Event Feed
                    </span>
                  </div>
                  <LiveEventFeed />
                  <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                    <ActivityBar24h />
                  </div>
                </div>
              </div>
              <div>
                <div
                  className="rounded-2xl p-5 h-full flex flex-col items-center justify-center"
                  style={{
                    background:     "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(16px)",
                    border:         "1px solid rgba(15,23,42,0.07)",
                    boxShadow:      "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
                  }}
                >
                  <div className="text-[10px] font-semibold tracking-wider uppercase mb-4 self-start" style={{ color: T.muted }}>
                    Campus Utilization
                  </div>
                  <CampusLoadGauge phase={phase} />
                </div>
              </div>
            </div>
          </motion.section>

        </motion.div>

        <div className="h-12" />
      </motion.div>
    </div>
  );
}