"use client";

import { motion, useSpring, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — light executive palette
═══════════════════════════════════════════════════════════ */

const T = {
  sky:    "#0ea5e9",
  skyDim: "#38bdf8",
  gold:   "#f59e0b",
  navy:   "#0f172a",
  slate:  "#334155",
  muted:  "#64748b",
  faint:  "#94a3b8",
  green:  "#10b981",
  red:    "#ef4444",
  purple: "#8b5cf6",
  white:  "#ffffff",
  surface:    "rgba(255,255,255,0.72)",
  surfaceSm:  "rgba(255,255,255,0.55)",
  border:     "rgba(14,165,233,0.12)",
  borderSoft: "rgba(15,23,42,0.07)",
};

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

interface KPI {
  label:   string;
  value:   string;
  change:  string;
  up:      boolean;
  color:   string;
  accentBg: string;
  spark:   number[];
  insight: string;
  sub:     string;
}

const KPIS: KPI[] = [
  {
    label:    "Total Navigations",
    value:    "4,892",
    change:   "+18%",
    up:       true,
    color:    T.sky,
    accentBg: "rgba(14,165,233,0.07)",
    spark:    [28, 42, 38, 55, 61, 58, 72, 80, 76, 88, 84, 95],
    insight:  "Highest week since Oct",
    sub:      "vs 4,146 last week",
  },
  {
    label:    "Active Users",
    value:    "342",
    change:   "+5%",
    up:       true,
    color:    T.purple,
    accentBg: "rgba(139,92,246,0.07)",
    spark:    [210, 225, 218, 240, 255, 260, 278, 290, 300, 310, 330, 342],
    insight:  "Steady growth trend",
    sub:      "vs 326 last week",
  },
  {
    label:    "Routes Created",
    value:    "1,204",
    change:   "+31%",
    up:       true,
    color:    T.green,
    accentBg: "rgba(16,185,129,0.07)",
    spark:    [320, 410, 390, 520, 600, 580, 700, 750, 820, 900, 980, 1204],
    insight:  "New semester demand",
    sub:      "vs 919 last week",
  },
  {
    label:    "Avg Journey Time",
    value:    "6.4 min",
    change:   "-12%",
    up:       false,
    color:    T.gold,
    accentBg: "rgba(245,158,11,0.07)",
    spark:    [9.2, 8.8, 8.1, 7.9, 7.4, 7.8, 7.2, 7.0, 6.9, 6.7, 6.5, 6.4],
    insight:  "Route optimization active",
    sub:      "vs 7.3 min last week",
  },
];

interface TopLocation {
  name:  string;
  count: number;
  pct:   number;
  icon:  string;
  trend: string;
  up:    boolean;
}

const TOP_LOCATIONS: TopLocation[] = [
  { name: "Central Library",  count: 892, pct: 92, icon: "📚", trend: "+14%", up: true  },
  { name: "Main Canteen",     count: 756, pct: 78, icon: "🍽️", trend: "+8%",  up: true  },
  { name: "Block A — CSE",    count: 634, pct: 65, icon: "💻", trend: "+21%", up: true  },
  { name: "Admin Block",      count: 421, pct: 43, icon: "🏢", trend: "-3%",  up: false },
  { name: "Sports Complex",   count: 310, pct: 32, icon: "⚽", trend: "+6%",  up: true  },
  { name: "Seminar Hall",     count: 287, pct: 29, icon: "🎓", trend: "+11%", up: true  },
];

interface PopularRoute {
  from:  string;
  to:    string;
  count: number;
  trend: string;
  up:    boolean;
  time:  string;
}

const POPULAR_ROUTES: PopularRoute[] = [
  { from: "Main Gate",  to: "Block A",  count: 234, trend: "+12%", up: true,  time: "4.2 min" },
  { from: "Block A",    to: "Library",  count: 189, trend: "+8%",  up: true,  time: "3.8 min" },
  { from: "Hostel",     to: "Canteen",  count: 156, trend: "+23%", up: true,  time: "5.1 min" },
  { from: "Block B",    to: "Seminar",  count: 98,  trend: "-4%",  up: false, time: "2.9 min" },
  { from: "Library",    to: "Sports",   count: 74,  trend: "+6%",  up: true,  time: "6.7 min" },
];

/* ═══════════════════════════════════════════════════════════
   INLINE SPARKLINE
═══════════════════════════════════════════════════════════ */

function MiniSparkline({ vals, color }: { vals: number[]; color: string }) {
  const W = 72, H = 28;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - 4 - ((v - min) / range) * (H - 8);
    return [x, y] as [number, number];
  });
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
  const lastPt = pts[pts.length - 1];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNT-UP
═══════════════════════════════════════════════════════════ */

function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ═══════════════════════════════════════════════════════════
   KPI CARDS — Stripe-inspired, light executive
═══════════════════════════════════════════════════════════ */

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KPIS.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div
            className="relative rounded-2xl p-5 h-full flex flex-col gap-3 overflow-hidden"
            style={{
              background:  "rgba(255,255,255,0.82)",
              backdropFilter: "blur(16px)",
              border:      `1px solid ${k.color}22`,
              boxShadow:   `0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04), 0 0 0 1px rgba(255,255,255,0.8) inset`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${k.color}, ${k.color}44)` }}
            />

            {/* Header row */}
            <div className="flex items-center justify-between">
              <span
                className="text-[10.5px] font-semibold tracking-wider uppercase"
                style={{ color: T.muted, letterSpacing: "0.08em" }}
              >
                {k.label}
              </span>
              {/* Trend badge */}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: k.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color:      k.up ? T.green : T.red,
                  border:     `1px solid ${k.up ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                {k.up ? "↑" : "↓"} {k.change}
              </span>
            </div>

            {/* Value + sparkline */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <div
                  className="text-[30px] font-bold leading-none tracking-tight"
                  style={{ color: T.navy, fontVariantNumeric: "tabular-nums" }}
                >
                  {k.value}
                </div>
                <div className="text-[11px] mt-1.5" style={{ color: T.faint }}>
                  {k.sub}
                </div>
              </div>
              <MiniSparkline vals={k.spark} color={k.color} />
            </div>

            {/* Insight chip */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg self-start"
              style={{ background: k.accentBg, border: `1px solid ${k.color}18` }}
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill={k.color}>
                <circle cx="8" cy="8" r="7" fillOpacity="0.2" />
                <path d="M8 4v4l3 2" stroke={k.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-medium" style={{ color: k.color }}>
                {k.insight}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP LOCATIONS — executive utilization list
═══════════════════════════════════════════════════════════ */

export function TopLocations() {
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background:  "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        border:      `1px solid ${T.borderSoft}`,
        boxShadow:   "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>
            Top Destinations
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
            Most visited locations · last 7 days
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(14,165,233,0.08)", color: T.sky, border: `1px solid ${T.border}` }}
        >
          6 locations
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {TOP_LOCATIONS.map((loc, i) => (
          <motion.div
            key={loc.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-center gap-3 group"
          >
            {/* Rank */}
            <div
              className="w-5 text-[11px] font-semibold text-right flex-shrink-0"
              style={{ color: i === 0 ? T.gold : T.faint }}
            >
              {i + 1}
            </div>

            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: "rgba(15,23,42,0.04)",
                border:     "1px solid rgba(15,23,42,0.07)",
              }}
            >
              {loc.icon}
            </div>

            {/* Bar + label */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-medium truncate" style={{ color: T.navy }}>
                  {loc.name}
                </span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: loc.up ? T.green : T.red }}
                  >
                    {loc.up ? "↑" : "↓"} {loc.trend}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: T.sky }}>
                    {loc.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div
                className="h-[4px] rounded-full overflow-hidden"
                style={{ background: "rgba(15,23,42,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: i === 0
                      ? `linear-gradient(90deg, ${T.sky}, ${T.purple})`
                      : `linear-gradient(90deg, ${T.sky}cc, ${T.sky}55)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${loc.pct}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPULAR ROUTES — navigation intelligence table
═══════════════════════════════════════════════════════════ */

export function PopularRoutes() {
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background:  "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        border:      `1px solid ${T.borderSoft}`,
        boxShadow:   "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>
            Popular Routes
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
            Highest-demand navigation paths
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(245,158,11,0.08)", color: T.gold, border: "1px solid rgba(245,158,11,0.18)" }}
        >
          Live demand
        </span>
      </div>

      <div className="flex flex-col divide-y" style={{ borderColor: "rgba(15,23,42,0.05)" }}>
        {POPULAR_ROUTES.map((r, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            {/* Index */}
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                background: "rgba(14,165,233,0.08)",
                border:     `1px solid ${T.border}`,
                color:      T.sky,
              }}
            >
              {i + 1}
            </div>

            {/* Route */}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium" style={{ color: T.navy }}>
                {r.from}
                <span style={{ color: T.faint, margin: "0 5px", fontWeight: 400 }}>→</span>
                {r.to}
              </div>
              {/* Demand bar */}
              <div
                className="h-[3px] rounded-full mt-1.5 overflow-hidden"
                style={{ background: "rgba(15,23,42,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${T.sky}, ${T.purple})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.count / 234) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Time */}
            <div
              className="text-[10.5px] px-2 py-0.5 rounded-md flex-shrink-0"
              style={{
                background: "rgba(15,23,42,0.04)",
                color:      T.muted,
                border:     "1px solid rgba(15,23,42,0.07)",
              }}
            >
              ⏱ {r.time}
            </div>

            {/* Count + trend */}
            <div className="text-right flex-shrink-0 w-14">
              <div className="text-[12px] font-semibold" style={{ color: T.navy }}>
                {r.count}
              </div>
              <div
                className="text-[10px] font-medium"
                style={{ color: r.up ? T.green : T.red }}
              >
                {r.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUILDING UTILIZATION — executive cards
═══════════════════════════════════════════════════════════ */

interface Building {
  name:    string;
  icon:    string;
  pct:     number;
  status:  "high" | "moderate" | "low";
  detail:  string;
  spark:   number[];
  color:   string;
}

const BUILDINGS: Building[] = [
  { name: "Central Library", icon: "📚", pct: 88, status: "high",     detail: "352 / 400 seats", spark: [40,55,70,82,88,92,85,88], color: T.sky    },
  { name: "Admin Block",     icon: "🏢", pct: 34, status: "low",      detail: "Light traffic",    spark: [50,42,38,35,30,32,36,34], color: T.gold   },
  { name: "Hostel Block A",  icon: "🏠", pct: 71, status: "moderate", detail: "Evening activity", spark: [20,30,45,55,60,68,72,71], color: T.purple },
  { name: "Auditorium",      icon: "🎭", pct: 95, status: "high",     detail: "Event in session", spark: [10,15,20,80,95,95,92,95], color: "#ef4444" },
  { name: "CSE Labs",        icon: "💻", pct: 62, status: "moderate", detail: "Lab sessions",     spark: [30,55,70,65,60,62,58,62], color: T.green  },
];

const STATUS_META = {
  high:     { label: "High",     bg: "rgba(239,68,68,0.08)",   color: "#ef4444", border: "rgba(239,68,68,0.18)"   },
  moderate: { label: "Moderate", bg: "rgba(245,158,11,0.08)",  color: T.gold,    border: "rgba(245,158,11,0.18)"  },
  low:      { label: "Low",      bg: "rgba(16,185,129,0.08)",  color: T.green,   border: "rgba(16,185,129,0.18)"  },
};

export function BuildingUtilization() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {BUILDINGS.map((b, i) => {
        const st = STATUS_META[b.status];
        return (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div
              className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
              style={{
                background:  "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                border:      `1px solid ${b.color}18`,
                boxShadow:   "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}33)` }} />

              {/* Icon + status */}
              <div className="flex items-center justify-between">
                <span className="text-xl">{b.icon}</span>
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                >
                  {st.label}
                </span>
              </div>

              {/* Name */}
              <div>
                <div className="text-[12px] font-semibold" style={{ color: T.navy }}>{b.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{b.detail}</div>
              </div>

              {/* Circular-ish utilization */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth="4" />
                    <motion.circle
                      cx="20" cy="20" r="15"
                      fill="none"
                      stroke={b.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 15}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - b.pct / 100) }}
                      transition={{ duration: 1.1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                    />
                    <text x="20" y="24" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.navy}>
                      {b.pct}%
                    </text>
                  </svg>
                </div>
                <MiniSparkline vals={b.spark} color={b.color} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION INTELLIGENCE — metrics panel
═══════════════════════════════════════════════════════════ */

const NAV_METRICS = [
  { label: "Most Requested Route",  value: "Main Gate → Block A", sub: "234 requests today",    icon: "🛣️",  color: T.sky    },
  { label: "Busiest Building",      value: "Central Library",      sub: "88% occupancy right now", icon: "🏆",  color: T.gold   },
  { label: "Avg Travel Time",       value: "6.4 min",              sub: "Down 12% this week",    icon: "⏱️",  color: T.purple },
  { label: "Route Success Rate",    value: "98.7%",                sub: "All paths navigable",   icon: "✅",  color: T.green  },
  { label: "Route Demand Index",    value: "High",                 sub: "Peak semester period",  icon: "📈",  color: "#ef4444" },
  { label: "Avg Session Duration",  value: "9.2 min",              sub: "Including exploration", icon: "🗺️",  color: T.sky    },
];

export function NavigationIntelligence() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background:  "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        border:      `1px solid ${T.borderSoft}`,
        boxShadow:   "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Navigation Intelligence</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>Route patterns and campus pathfinding insights</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {NAV_METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-xl p-4"
            style={{
              background: `${m.color}07`,
              border:     `1px solid ${m.color}18`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{m.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: T.muted }}>
                {m.label}
              </span>
            </div>
            <div className="text-[15px] font-bold leading-tight" style={{ color: T.navy }}>{m.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: m.color }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREDICTIVE INSIGHTS — AI panel
═══════════════════════════════════════════════════════════ */

interface Insight {
  type:    "demand" | "crowd" | "underuse" | "event";
  message: string;
  detail:  string;
  time:    string;
  urgent:  boolean;
}

const INSIGHTS: Insight[] = [
  { type: "demand",  message: "Library demand rising",          detail: "Expected 95%+ occupancy by 2 PM based on course schedule",          time: "Next 2h",   urgent: true  },
  { type: "event",   message: "Event traffic surge predicted",  detail: "Seminar Hall C — 200+ attendees expected tomorrow at 10 AM",        time: "Tomorrow",  urgent: true  },
  { type: "crowd",   message: "Canteen crowding predicted",     detail: "Lunch rush will peak 12:30–1:15 PM. Consider staggered breaks.",    time: "Today noon", urgent: false },
  { type: "underuse",message: "Underutilized: Block D labs",    detail: "Only 22% utilization this week. Scheduling opportunity available.", time: "This week", urgent: false },
  { type: "demand",  message: "Sports complex uptick likely",   detail: "Weekend forecast clear — expect 40% more foot traffic Saturday.",    time: "Weekend",   urgent: false },
];

const INSIGHT_META = {
  demand:  { icon: "📈", color: T.sky,    bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.15)"  },
  crowd:   { icon: "👥", color: T.gold,   bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.15)"  },
  underuse:{ icon: "💤", color: T.purple, bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.15)"  },
  event:   { icon: "📣", color: "#ef4444",bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.15)"   },
};

export function PredictiveInsights() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background:  "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        border:      `1px solid ${T.borderSoft}`,
        boxShadow:   "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Predictive Insights</h3>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider"
              style={{
                background: "linear-gradient(90deg, rgba(14,165,233,0.12), rgba(139,92,246,0.1))",
                color:      T.sky,
                border:     `1px solid ${T.border}`,
              }}
            >
              AI POWERED
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
            Campus intelligence · pattern-based forecasting
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {INSIGHTS.map((ins, i) => {
          const meta = INSIGHT_META[ins.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold" style={{ color: T.navy }}>
                    {ins.message}
                  </span>
                  {ins.urgent && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: T.muted }}>{ins.detail}</p>
              </div>
              <span
                className="text-[9px] font-medium px-2 py-1 rounded-lg flex-shrink-0 whitespace-nowrap"
                style={{ background: "rgba(15,23,42,0.04)", color: T.faint, border: "1px solid rgba(15,23,42,0.07)" }}
              >
                {ins.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}