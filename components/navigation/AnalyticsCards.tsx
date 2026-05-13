"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

interface KPI {
  label: string;
  value: string;
  change: string;
  up: boolean;
  color: string;
}

interface TopLocation {
  name: string;
  count: number;
  pct: number;
  icon: string;
}

interface PopularRoute {
  from: string;
  to: string;
  count: number;
  trend: string;
  up: boolean;
}

const KPIS: KPI[] = [
  { label: "Total Navigations", value: "4,892", change: "+18%", up: true,  color: "var(--cyan)"   },
  { label: "Active Users",      value: "342",   change: "+5%",  up: true,  color: "var(--purple)" },
  { label: "Routes Created",    value: "1,204", change: "+31%", up: true,  color: "var(--green)"  },
  { label: "Avg Journey",       value: "6.4 min", change: "-12%", up: false, color: "var(--amber)" },
];

const TOP_LOCATIONS: TopLocation[] = [
  { name: "Central Library",   count: 892, pct: 92, icon: "📚" },
  { name: "Main Canteen",      count: 756, pct: 78, icon: "🍽️" },
  { name: "Block A — CSE",     count: 634, pct: 65, icon: "💻" },
  { name: "Admin Block",       count: 421, pct: 43, icon: "🏢" },
  { name: "Sports Complex",    count: 310, pct: 32, icon: "⚽" },
  { name: "Seminar Hall",      count: 287, pct: 29, icon: "🎓" },
];

const POPULAR_ROUTES: PopularRoute[] = [
  { from: "Main Gate",  to: "Block A",  count: 234, trend: "+12%", up: true  },
  { from: "Block A",    to: "Library",  count: 189, trend: "+8%",  up: true  },
  { from: "Hostel",     to: "Canteen",  count: 156, trend: "+23%", up: true  },
  { from: "Block B",    to: "Seminar",  count: 98,  trend: "-4%",  up: false },
  { from: "Library",    to: "Sports",   count: 74,  trend: "+6%",  up: true  },
];

// ── KPI row ──────────────────────────────────────────
export function KPICards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPIS.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: i * 0.07, duration: 0.45 }}
        >
          <GlassCard neon className="p-5">
            <div
              className="text-[10px] tracking-[1px] mb-3"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
            >
              {k.label.toUpperCase()}
            </div>
            <div
              className="text-[32px] font-black leading-none mb-2"
              style={{ color: k.color, fontFamily: "var(--font-display)" }}
            >
              {k.value}
            </div>
            <div
              className="text-[11px] font-medium"
              style={{
                color:      k.up ? "var(--green)" : "var(--red)",
                fontFamily: "var(--font-body)",
              }}
            >
              {k.change} this week
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

// ── Top locations ─────────────────────────────────────
export function TopLocations() {
  return (
    <GlassCard neon className="p-5 h-full">
      <div
        className="text-[11px] font-semibold tracking-[1.5px] mb-5"
        style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
      >
        MOST VISITED LOCATIONS
      </div>

      <div className="flex flex-col gap-4">
        {TOP_LOCATIONS.map((loc, i) => (
          <motion.div
            key={loc.name}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0   }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            {/* Rank */}
            <div
              className="w-5 text-[11px] text-right flex-shrink-0"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
            >
              {i + 1}
            </div>

            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border:     "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {loc.icon}
            </div>

            {/* Bar + label */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span
                  className="text-[12px] truncate"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                >
                  {loc.name}
                </span>
                <span
                  className="text-[11px] font-semibold ml-2 flex-shrink-0"
                  style={{ color: "var(--cyan)", fontFamily: "var(--font-body)" }}
                >
                  {loc.count}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-[3px] rounded-full overflow-hidden w-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: i === 0
                      ? "linear-gradient(90deg, var(--cyan), var(--purple))"
                      : "linear-gradient(90deg, rgba(0,212,255,0.7), rgba(139,92,246,0.7))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${loc.pct}%` }}
                  transition={{ duration: 0.9, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Popular routes ────────────────────────────────────
export function PopularRoutes() {
  return (
    <GlassCard neon className="p-5 h-full">
      <div
        className="text-[11px] font-semibold tracking-[1.5px] mb-5"
        style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
      >
        POPULAR ROUTES
      </div>

      <div className="flex flex-col gap-0">
        {POPULAR_ROUTES.map((r, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{
              borderBottom: i < POPULAR_ROUTES.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            {/* Index badge */}
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                background: "rgba(0,212,255,0.08)",
                border:     "1px solid rgba(0,212,255,0.18)",
                color:      "var(--cyan)",
              }}
            >
              {i + 1}
            </div>

            {/* Route label */}
            <div className="flex-1 min-w-0">
              <div
                className="text-[12px]"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
              >
                {r.from}
                <span style={{ color: "var(--text-3)", margin: "0 6px" }}>→</span>
                {r.to}
              </div>
              {/* Mini bar */}
              <div
                className="h-[2px] rounded-full mt-1.5 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", width: "100%" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--cyan), var(--purple))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.count / 234) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Count + trend */}
            <div className="text-right flex-shrink-0">
              <div
                className="text-[12px] font-semibold"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
              >
                {r.count}
              </div>
              <div
                className="text-[10px]"
                style={{ color: r.up ? "var(--green)" : "var(--red)" }}
              >
                {r.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}