"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

// ── Data ─────────────────────────────────────────────
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
  { name: "Library",    vals: [30, 55, 80, 90, 70, 40, 20] },
  { name: "Canteen",    vals: [10, 40, 85, 95, 60, 35, 15] },
  { name: "Block A",    vals: [20, 60, 90, 75, 88, 20, 10] },
];

type Tab = "hourly" | "daily";

// ── Bar chart ─────────────────────────────────────────
function BarChart({ data, maxVal }: { data: { label: string; val: number }[]; maxVal: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: 130 }}>
      {data.map((d, i) => {
        const h   = Math.round((d.val / maxVal) * 110);
        const isH = hovered === i;

        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <div
              className="text-[9px] font-semibold transition-all duration-150 select-none"
              style={{
                color:   "var(--cyan)",
                opacity: isH ? 1 : 0,
                fontFamily: "var(--font-body)",
              }}
            >
              {d.val}
            </div>

            {/* Bar */}
            <div
              className="w-full rounded-t-sm relative overflow-hidden"
              style={{ height: h, minHeight: 3 }}
            >
              <motion.div
                className="absolute inset-0 rounded-t-sm"
                style={{
                  background: isH
                    ? "linear-gradient(to top, #00d4ff, #8b5cf6)"
                    : "linear-gradient(to top, rgba(0,212,255,0.65), rgba(0,212,255,0.2))",
                  border:     `1px solid ${isH ? "rgba(0,212,255,0.7)" : "rgba(0,212,255,0.2)"}`,
                  boxShadow:  isH ? "0 0 12px rgba(0,212,255,0.35)" : "none",
                  transition: "all 0.2s ease",
                  transformOrigin: "bottom",
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* X-axis label */}
            <span
              className="text-[8.5px] select-none"
              style={{ color: isH ? "var(--text-1)" : "var(--text-3)", fontFamily: "var(--font-body)" }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────
function Sparkline({ vals, color }: { vals: number[]; color: string }) {
  const max = Math.max(...vals);
  const W = 80, H = 28;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - (v / max) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      {/* Last point dot */}
      {(() => {
        const last = pts[pts.length - 1].split(",");
        return (
          <circle
            cx={last[0]} cy={last[1]} r="2.5"
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        );
      })()}
    </svg>
  );
}

// ── Main chart component ──────────────────────────────
export function TrafficChart() {
  const [tab, setTab] = useState<Tab>("hourly");
  const data   = tab === "hourly" ? HOURLY : DAILY;
  const maxVal = Math.max(...data.map((d) => d.val));

  return (
    <GlassCard neon className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div
          className="text-[11px] font-semibold tracking-[1.5px]"
          style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
        >
          NAVIGATION TRAFFIC
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["hourly", "daily"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 text-[10px] font-medium capitalize transition-all duration-200"
              style={{
                background: tab === t ? "rgba(0,212,255,0.12)" : "transparent",
                color:      tab === t ? "var(--cyan)" : "var(--text-3)",
                border:     "none",
                cursor:     "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <BarChart data={data} maxVal={maxVal} />

      {/* Peak annotation */}
      <div
        className="mt-3 pt-3 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full animate-glow"
          style={{ background: "var(--cyan)", flexShrink: 0 }}
        />
        <span className="text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
          Peak at{" "}
          <span style={{ color: "var(--text-2)" }}>
            {data.reduce((a, b) => (b.val > a.val ? b : a)).label}
          </span>{" "}
          with{" "}
          <span style={{ color: "var(--cyan)" }}>
            {Math.max(...data.map((d) => d.val))} navigations
          </span>
        </span>
      </div>
    </GlassCard>
  );
}

// ── Building traffic sparklines ───────────────────────
export function BuildingSparklines() {
  const COLORS = ["var(--cyan)", "var(--amber)", "var(--purple)"];

  return (
    <GlassCard neon className="p-5">
      <div
        className="text-[11px] font-semibold tracking-[1.5px] mb-5"
        style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
      >
        BUILDING TRAFFIC — 7 DAYS
      </div>

      <div className="flex flex-col gap-4">
        {BUILDING_TRAFFIC.map((b, i) => {
          const avg = Math.round(b.vals.reduce((a, v) => a + v, 0) / b.vals.length);
          return (
            <div key={b.name} className="flex items-center gap-4">
              {/* Name + avg */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] mb-0.5 truncate"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                >
                  {b.name}
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  avg {avg}/day
                </div>
              </div>

              {/* Sparkline */}
              <Sparkline vals={b.vals} color={COLORS[i]} />

              {/* Last value */}
              <div
                className="text-[13px] font-semibold w-7 text-right flex-shrink-0"
                style={{ color: COLORS[i], fontFamily: "var(--font-display)" }}
              >
                {b.vals[b.vals.length - 1]}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
