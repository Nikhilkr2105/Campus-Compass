"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */

const T = {
  sky:    "#0ea5e9",
  gold:   "#f59e0b",
  navy:   "#0f172a",
  slate:  "#334155",
  muted:  "#64748b",
  faint:  "#94a3b8",
  green:  "#10b981",
  purple: "#8b5cf6",
  white:  "#ffffff",
  surface:    "rgba(255,255,255,0.82)",
  borderSoft: "rgba(15,23,42,0.07)",
};

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

const HOURLY = [
  { label: "6AM",  val: 12 }, { label: "7AM",  val: 38 },
  { label: "8AM",  val: 72 }, { label: "9AM",  val: 88 },
  { label: "10AM", val: 95 }, { label: "11AM", val: 82 },
  { label: "12PM", val: 76 }, { label: "1PM",  val: 91 },
  { label: "2PM",  val: 89 }, { label: "3PM",  val: 84 },
  { label: "4PM",  val: 78 }, { label: "5PM",  val: 60 },
  { label: "6PM",  val: 44 }, { label: "7PM",  val: 31 },
  { label: "8PM",  val: 20 },
];

const DAILY = [
  { label: "Mon", val: 78 }, { label: "Tue", val: 91 },
  { label: "Wed", val: 85 }, { label: "Thu", val: 88 },
  { label: "Fri", val: 94 }, { label: "Sat", val: 42 },
  { label: "Sun", val: 28 },
];

const BUILDING_TRAFFIC = [
  { name: "Library",  vals: [30, 55, 80, 90, 70, 40, 20], color: T.sky    },
  { name: "Canteen",  vals: [10, 40, 85, 95, 60, 35, 15], color: T.gold   },
  { name: "Block A",  vals: [20, 60, 90, 75, 88, 20, 10], color: T.purple },
];

/* ═══════════════════════════════════════════════════════════
   CAMPUS FLOW DATA
═══════════════════════════════════════════════════════════ */

const CAMPUS_FLOW = [
  {
    phase: "Morning",
    time:  "6 – 9 AM",
    icon:  "🌅",
    pct:   42,
    color: "#f59e0b",
    zones: [
      { name: "Main Gate",      load: 68 },
      { name: "Admin Block",    load: 45 },
      { name: "Cafeteria",      load: 30 },
      { name: "Library",        load: 28 },
    ],
    insight: "Inbound surge via Main Gate",
  },
  {
    phase: "Afternoon",
    time:  "12 – 3 PM",
    icon:  "☀️",
    pct:   94,
    color: "#ef4444",
    zones: [
      { name: "Cafeteria",      load: 98 },
      { name: "Library",        load: 88 },
      { name: "Block A — CSE",  load: 84 },
      { name: "Seminar Halls",  load: 76 },
    ],
    insight: "Peak occupancy · all zones active",
  },
  {
    phase: "Evening",
    time:  "5 – 8 PM",
    icon:  "🌆",
    pct:   45,
    color: "#8b5cf6",
    zones: [
      { name: "Library",        load: 70 },
      { name: "Sports Complex", load: 80 },
      { name: "Hostels",        load: 65 },
      { name: "Block B Labs",   load: 40 },
    ],
    insight: "Sports & library retain traffic",
  },
  {
    phase: "Night",
    time:  "9 PM – 12",
    icon:  "🌙",
    pct:   12,
    color: "#334155",
    zones: [
      { name: "Hostels",        load: 90 },
      { name: "Security Gate",  load: 15 },
      { name: "Night Library",  load: 22 },
      { name: "Others",         load: 5  },
    ],
    insight: "Campus secured · minimal traffic",
  },
];

/* ═══════════════════════════════════════════════════════════
   STUDENT ACTIVITY DATA
═══════════════════════════════════════════════════════════ */

const ACTIVITY_TRENDS = [
  { day: "Mon", academic: 82, social: 44, sports: 28 },
  { day: "Tue", academic: 91, social: 52, sports: 31 },
  { day: "Wed", academic: 85, social: 60, sports: 45 },
  { day: "Thu", academic: 88, social: 58, sports: 38 },
  { day: "Fri", academic: 72, social: 78, sports: 62 },
  { day: "Sat", academic: 35, social: 92, sports: 85 },
  { day: "Sun", academic: 22, social: 65, sports: 72 },
];

/* ═══════════════════════════════════════════════════════════
   RECENT TRENDS DATA
═══════════════════════════════════════════════════════════ */

const RECENT_TRENDS = [
  { label: "Library search requests",   change: "+34%", up: true,  detail: "Peak exam prep season" },
  { label: "Canteen route queries",     change: "+22%", up: true,  detail: "Lunch hour congestion" },
  { label: "Emergency exit searches",  change: "-8%",  up: false, detail: "Safety drills concluded" },
  { label: "Hostel → Academic blocks",  change: "+41%", up: true,  detail: "New semester schedule" },
  { label: "Off-campus navigation",     change: "+12%", up: true,  detail: "Weekend event planning" },
  { label: "Admin block requests",      change: "-15%", up: false, detail: "Online services adopted" },
];

/* ═══════════════════════════════════════════════════════════
   CARD WRAPPER
═══════════════════════════════════════════════════════════ */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background:     T.surface,
        backdropFilter: "blur(16px)",
        border:         `1px solid ${T.borderSoft}`,
        boxShadow:      "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BAR CHART — upgraded with gridlines + legend
═══════════════════════════════════════════════════════════ */

type Tab = "hourly" | "daily";

function BarChart({ data, maxVal }: { data: { label: string; val: number }[]; maxVal: number }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const H = 120;
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="relative" style={{ paddingLeft: 28 }}>
      {/* Y-axis gridlines */}
      <div className="absolute inset-0 pointer-events-none" style={{ paddingLeft: 28 }}>
        {gridLines.map((g) => (
          <div
            key={g}
            className="absolute left-0 right-0 flex items-center"
            style={{ bottom: `${(g / 100) * H}px` }}
          >
            <span
              className="absolute text-[8.5px] font-mono"
              style={{ color: T.faint, left: -26, width: 22, textAlign: "right" }}
            >
              {g}
            </span>
            <div className="w-full border-t" style={{ borderColor: g === 0 ? "rgba(15,23,42,0.12)" : "rgba(15,23,42,0.04)" }} />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5" style={{ height: H }}>
        {data.map((d, i) => {
          const barH = Math.round((d.val / maxVal) * (H - 8));
          const isH  = hovered === i;

          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isH && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-10 -top-9 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                    style={{
                      background: T.navy,
                      color:      "#fff",
                      border:     "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {d.val} navigations
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar */}
              <motion.div
                className="w-full rounded-t-md relative overflow-hidden"
                style={{ height: Math.max(barH, 3) }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "bottom", height: Math.max(barH, 3) }}
              >
                <div
                  className="absolute inset-0 rounded-t-md transition-all duration-200"
                  style={{
                    background: isH
                      ? `linear-gradient(to top, ${T.sky}, ${T.purple})`
                      : `linear-gradient(to top, ${T.sky}cc, ${T.sky}44)`,
                    boxShadow: isH ? `0 0 12px ${T.sky}44` : "none",
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex items-center gap-1.5 mt-2.5">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="flex-1 text-center text-[8.5px]"
            style={{ color: hovered === i ? T.navy : T.faint }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════════════════════ */

function Sparkline({ vals, color, W = 80, H = 28 }: { vals: number[]; color: string; W?: number; H?: number }) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - 4 - ((v - min) / range) * (H - 8);
    return [x, y] as [number, number];
  });
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
  const lastPt = pts[pts.length - 1];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`tc-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#tc-${color.slice(1)})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRAFFIC CHART — main export
═══════════════════════════════════════════════════════════ */

export function TrafficChart() {
  const [tab, setTab] = useState<Tab>("hourly");
  const data   = tab === "hourly" ? HOURLY : DAILY;
  const maxVal = 100;
  const peak   = data.reduce((a, b) => (b.val > a.val ? b : a));

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Navigation Traffic</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>Campus movement volume over time</p>
        </div>
        {/* Tab switcher */}
        <div
          className="flex rounded-lg overflow-hidden p-0.5 gap-0.5"
          style={{ background: "rgba(15,23,42,0.05)", border: "1px solid rgba(15,23,42,0.08)" }}
        >
          {(["hourly", "daily"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 text-[10px] font-medium capitalize rounded-md transition-all duration-200"
              style={{
                background: tab === t ? "#ffffff" : "transparent",
                color:      tab === t ? T.navy : T.muted,
                boxShadow:  tab === t ? "0 1px 3px rgba(15,23,42,0.1)" : "none",
                border:     "none",
                cursor:     "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${T.sky}, ${T.purple})` }} />
          <span className="text-[10px]" style={{ color: T.muted }}>Navigation volume</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px border-t-2 border-dashed" style={{ borderColor: T.gold }} />
          <span className="text-[10px]" style={{ color: T.muted }}>Campus avg</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Avg reference line */}
        <div
          className="absolute left-7 right-0 border-t border-dashed pointer-events-none"
          style={{
            borderColor: `${T.gold}55`,
            top: `${((1 - 72 / 100) * 120)}px`,
          }}
        />
        <BarChart data={data} maxVal={maxVal} />
      </div>

      {/* Insight footer */}
      <div
        className="mt-4 pt-4 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
          <span className="text-[11px]" style={{ color: T.muted }}>
            Peak:{" "}
            <span style={{ color: T.navy, fontWeight: 600 }}>{peak.label}</span>
            {" · "}
            <span style={{ color: T.sky, fontWeight: 600 }}>{peak.val} navigations</span>
          </span>
        </div>
        <span
          className="text-[10px] font-medium px-2 py-1 rounded-lg"
          style={{ background: "rgba(14,165,233,0.07)", color: T.sky, border: "1px solid rgba(14,165,233,0.12)" }}
        >
          +18% vs last period
        </span>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUILDING SPARKLINES — 7-day view
═══════════════════════════════════════════════════════════ */

export function BuildingSparklines() {
  return (
    <Card className="p-5 h-full">
      <div className="mb-5">
        <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Building Traffic</h3>
        <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>7-day activity by building</p>
      </div>

      <div className="flex flex-col gap-5">
        {BUILDING_TRAFFIC.map((b, i) => {
          const avg  = Math.round(b.vals.reduce((a, v) => a + v, 0) / b.vals.length);
          const last = b.vals[b.vals.length - 1];
          const prev = b.vals[b.vals.length - 2];
          const up   = last >= prev;

          return (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium" style={{ color: T.navy }}>{b.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: T.muted }}>avg {avg}/day</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: up ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                      color:      up ? T.green : "#ef4444",
                    }}
                  >
                    {up ? "↑" : "↓"} {last}
                  </span>
                </div>
              </div>

              {/* Sparkline full width */}
              <div className="relative">
                <Sparkline vals={b.vals} color={b.color} W={200} H={36} />
              </div>

              {/* Day labels */}
              <div className="flex justify-between mt-1">
                {["M","T","W","T","F","S","S"].map((d, j) => (
                  <span key={j} className="text-[8px]" style={{ color: T.faint }}>{d}</span>
                ))}
              </div>

              {/* Divider */}
              {i < BUILDING_TRAFFIC.length - 1 && (
                <div className="mt-4 border-t" style={{ borderColor: "rgba(15,23,42,0.06)" }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAMPUS FLOW ANALYSIS
═══════════════════════════════════════════════════════════ */

export function CampusFlowAnalysis() {
  const [active, setActive] = useState(1); // default: Afternoon (peak)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Campus Flow Analysis</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>Movement patterns across time-of-day phases</p>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CAMPUS_FLOW.map((f, i) => (
          <button
            key={f.phase}
            onClick={() => setActive(i)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all duration-200"
            style={{
              background: active === i ? `${f.color}12` : "rgba(15,23,42,0.04)",
              border:     `1px solid ${active === i ? `${f.color}30` : "rgba(15,23,42,0.08)"}`,
              color:      active === i ? f.color : T.muted,
              cursor:     "pointer",
            }}
          >
            <span>{f.icon}</span>
            <span>{f.phase}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: active === i ? `${f.color}20` : "rgba(15,23,42,0.06)",
                color:      active === i ? f.color : T.faint,
              }}
            >
              {f.pct}%
            </span>
          </button>
        ))}
      </div>

      {/* Active phase detail */}
      <AnimatePresence mode="wait">
        {(() => {
          const f = CAMPUS_FLOW[active];
          return (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Phase info */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                style={{ background: `${f.color}08`, border: `1px solid ${f.color}18` }}
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: T.navy }}>
                    {f.phase} · {f.time}
                  </div>
                  <div className="text-[11px]" style={{ color: T.muted }}>{f.insight}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[22px] font-bold leading-none" style={{ color: f.color }}>{f.pct}%</div>
                  <div className="text-[9px]" style={{ color: T.faint }}>campus load</div>
                </div>
              </div>

              {/* Zone bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {f.zones.map((z, j) => (
                  <motion.div
                    key={z.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-medium truncate" style={{ color: T.navy }}>{z.name}</span>
                        <span className="text-[11px] font-semibold ml-2" style={{ color: f.color }}>{z.load}%</span>
                      </div>
                      <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.06)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}66)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${z.load}%` }}
                          transition={{ duration: 0.7, delay: j * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   STUDENT ACTIVITY TRENDS — multi-series grouped bars
═══════════════════════════════════════════════════════════ */

const SERIES = [
  { key: "academic" as const, label: "Academic",  color: T.sky    },
  { key: "social"   as const, label: "Social",    color: T.gold   },
  { key: "sports"   as const, label: "Sports",    color: T.green  },
];

export function StudentActivityTrends() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Student Activity Trends</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>Academic · Social · Sports — weekly breakdown</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[10px]" style={{ color: T.muted }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grouped bars */}
      <div className="flex items-end gap-3" style={{ height: 110 }}>
        {ACTIVITY_TRENDS.map((d, i) => (
          <div
            key={d.day}
            className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {hovered === i && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 -top-2 text-[9px] font-medium px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                style={{ background: T.navy, color: "#fff" }}
              >
                Ac {d.academic} · So {d.social} · Sp {d.sports}
              </motion.div>
            )}

            {/* Bar group */}
            <div className="flex items-end gap-[2px] w-full" style={{ height: 96 }}>
              {SERIES.map((s) => {
                const val = d[s.key];
                const barH = Math.max((val / 100) * 90, 3);
                return (
                  <motion.div
                    key={s.key}
                    className="flex-1 rounded-t-sm"
                    style={{
                      background: `${s.color}${hovered === i ? "ff" : "bb"}`,
                      height: barH,
                      alignSelf: "flex-end",
                      transition: "background 0.2s",
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "bottom", height: barH, alignSelf: "flex-end" }}
                  />
                );
              })}
            </div>

            {/* Day label */}
            <span className="text-[9px] mt-1.5" style={{ color: hovered === i ? T.navy : T.faint }}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   RECENT TRENDS — change list
═══════════════════════════════════════════════════════════ */

export function RecentTrends() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Recent Trends</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>Week-over-week navigation pattern shifts</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(15,23,42,0.05)", color: T.muted, border: "1px solid rgba(15,23,42,0.08)" }}
        >
          Last 7 days
        </span>
      </div>

      <div className="flex flex-col divide-y" style={{ borderColor: "rgba(15,23,42,0.05)" }}>
        {RECENT_TRENDS.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
              style={{
                background: t.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color:      t.up ? T.green : "#ef4444",
                border:     `1px solid ${t.up ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              {t.up ? "↑" : "↓"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium" style={{ color: T.navy }}>{t.label}</div>
              <div className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>{t.detail}</div>
            </div>

            <span
              className="text-[12px] font-bold flex-shrink-0"
              style={{ color: t.up ? T.green : "#ef4444" }}
            >
              {t.change}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   OPERATIONAL METRICS
═══════════════════════════════════════════════════════════ */

const OPS_METRICS = [
  { label: "Sensor Uptime",         value: "99.98%",  color: T.green,  icon: "📡", sub: "28 of 28 nodes online"    },
  { label: "Data Latency",          value: "12ms",    color: T.sky,    icon: "⚡", sub: "Well within SLA target"   },
  { label: "Routes Computed Today", value: "1,204",   color: T.purple, icon: "🔄", sub: "~50/hr avg throughout day" },
  { label: "API Success Rate",      value: "100%",    color: T.green,  icon: "✅", sub: "Zero failed requests"      },
  { label: "Cache Hit Ratio",       value: "94.2%",   color: T.gold,   icon: "💾", sub: "Warm cache reducing load"  },
  { label: "Avg Compute Time",      value: "38ms",    color: T.sky,    icon: "⏱", sub: "Per route calculation"     },
];

export function OperationalMetrics() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: T.navy }}>Operational Metrics</h3>
          <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>System performance · infrastructure health</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: T.green }} />
          <span className="text-[11px] font-medium" style={{ color: T.green }}>All systems nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {OPS_METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-xl p-4"
            style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.07)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{m.icon}</span>
              <span className="text-[10px]" style={{ color: T.muted }}>{m.label}</span>
            </div>
            <div className="text-[17px] font-bold" style={{ color: T.navy }}>{m.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: m.color }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}