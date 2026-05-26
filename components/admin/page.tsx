"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { BuildingForm } from "@/components/admin/BuildingForm";
import { RoomForm } from "@/components/admin/RoomForm";
import { BUILDINGS } from "@/data/buildings";
import {
  Building2, DoorOpen, Route,
  Users, TrendingUp, ShieldCheck,
  Check, AlertTriangle, Activity,
  Cpu, Wifi, Zap, Eye, Radio,
  ArrowUpRight, ArrowDownRight,
  Signal, Database,
  MapPin, CheckCircle2,
  Plus, Bell, FileText, Navigation,
  RefreshCw, Settings2,
} from "lucide-react";
import { AdminCard, StatusBadge } from "@/components/admin/ui/FormField";

/* ══════════════════════════════════════════════════════════
   TIME-AWARE CAMPUS PHASE (unchanged logic)
══════════════════════════════════════════════════════════ */

type CampusPhase = {
  label:     string;
  short:     string;
  loadPct:   number;
  variant:   "info" | "warning" | "success" | "critical" | "neutral";
  userScale: number;
};

function getCampusPhase(): CampusPhase {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return { label: "Morning Commute",   short: "Morning",   loadPct: 42, variant: "info",     userScale: 0.45 };
  if (h >= 9  && h < 12) return { label: "Peak Morning",      short: "Peak AM",   loadPct: 87, variant: "warning",  userScale: 0.90 };
  if (h >= 12 && h < 14) return { label: "Lunch Rush",        short: "Lunch",     loadPct: 94, variant: "critical", userScale: 1.00 };
  if (h >= 14 && h < 17) return { label: "Afternoon",         short: "Afternoon", loadPct: 78, variant: "info",     userScale: 0.82 };
  if (h >= 17 && h < 20) return { label: "Evening Wind-down", short: "Evening",   loadPct: 45, variant: "neutral",  userScale: 0.48 };
  if (h >= 20 && h < 23) return { label: "Quiet Hours",       short: "Quiet",     loadPct: 18, variant: "neutral",  userScale: 0.18 };
  return                         { label: "Night Mode",        short: "Night",     loadPct:  6, variant: "neutral",  userScale: 0.06 };
}

/* ══════════════════════════════════════════════════════════
   LIVE CLOCK
══════════════════════════════════════════════════════════ */

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div
        className="text-[20px] font-bold tabular-nums leading-none"
        style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)", letterSpacing: 1 }}
      >
        {time}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
        {date}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MINI SPARKLINE
══════════════════════════════════════════════════════════ */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 24 }}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.03, duration: 0.35, ease: "easeOut" }}
          style={{
            width:           4,
            height:          `${(v / max) * 100}%`,
            borderRadius:    2,
            background:      color,
            opacity:         0.3 + (v / max) * 0.7,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════ */

function KpiCard({
  label, value, icon: Icon, color, accentBg,
  delta, trend, spark, subtitle,
}: {
  label:    string;
  value:    string | number;
  icon:     React.ElementType;
  color:    string;
  accentBg: string;
  delta:    string;
  trend:    "up" | "down" | "neutral";
  spark:    number[];
  subtitle?: string;
}) {
  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#f59e0b" : "#94a3b8";
  const TrendIcon  = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <AdminCard className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentBg, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${trendColor}10`, color: trendColor }}
        >
          <TrendIcon className="w-3 h-3" />
          {delta}
        </div>
      </div>

      <div>
        <motion.div
          key={String(value)}
          initial={{ opacity: 0.6, y: -3 }}
          animate={{ opacity: 1,   y: 0  }}
          className="text-[28px] font-bold tabular-nums leading-none"
          style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </motion.div>
        <div className="text-[12px] mt-1" style={{ color: "#64748b" }}>
          {label}
        </div>
        {subtitle && (
          <div className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{subtitle}</div>
        )}
      </div>

      <MiniSparkline data={spark} color={color} />
    </AdminCard>
  );
}

/* ══════════════════════════════════════════════════════════
   LOAD METRIC — clean ring
══════════════════════════════════════════════════════════ */

function LoadMetric({
  basePct, color, label, phase,
}: {
  basePct: number;
  color:   string;
  label:   string;
  phase:   CampusPhase;
}) {
  const scaled = Math.round(basePct * (0.5 + (phase.loadPct / 100) * 0.5));
  const [pct, setPct] = useState(scaled);

  useEffect(() => {
    const id = setInterval(() => {
      setPct(Math.max(5, Math.min(99, scaled + Math.round((Math.random() - 0.48) * 5))));
    }, 3200);
    return () => clearInterval(id);
  }, [scaled]);

  const r    = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const dotColor = pct > 80 ? "#ef4444" : pct > 60 ? "#f59e0b" : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={52} height={52} viewBox="0 0 52 52">
        <circle cx={26} cy={26} r={r} fill="none" stroke="#f1f5f9" strokeWidth={4} />
        <motion.circle
          cx={26} cy={26} r={r}
          fill="none" stroke={dotColor} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          transform="rotate(-90 26 26)"
        />
        <text x={26} y={30} textAnchor="middle" fill={dotColor} fontSize={10} fontWeight={700} fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <span className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════════════════════════ */

type ActivityEvent = {
  id:        string;
  user:      string;
  dept:      string;
  action:    string;
  ts:        number;
  type:      "nav" | "search" | "sos" | "floor" | "system";
};

const ACTIVITY_POOL: Omit<ActivityEvent, "id" | "ts">[] = [
  { user: "Arjun Sharma",  dept: "CSE",   action: "Navigated: Main Gate → Block A",  type: "nav"    },
  { user: "Priya Singh",   dept: "ECE",   action: "Searched: Medical Room",           type: "search" },
  { user: "Rohit Kumar",   dept: "Mech",  action: "Route: Hostel → Cafeteria",        type: "nav"    },
  { user: "Anjali Verma",  dept: "IT",    action: "Floor Nav: Block A F1 → F3",       type: "floor"  },
  { user: "Deepak Nair",   dept: "Civil", action: "Emergency SOS triggered",          type: "sos"    },
  { user: "Sneha Gupta",   dept: "MBA",   action: "Route: Library → Admin Block",     type: "nav"    },
  { user: "Vikram Reddy",  dept: "CSE",   action: "Searched: CSE Lab 3",              type: "search" },
  { user: "Megha Iyer",    dept: "ECE",   action: "Navigated: Hostel B → Gate",       type: "nav"    },
  { user: "Arun Pillai",   dept: "Mech",  action: "Floor Map: Workshop F2",           type: "floor"  },
  { user: "Kavya Menon",   dept: "IT",    action: "Route recalculated — congestion",  type: "system" },
];

const TYPE_META_ACTIVITY: Record<ActivityEvent["type"], { color: string; label: string; badge?: string }> = {
  nav:    { color: "#0ea5e9", label: "Navigation"            },
  search: { color: "#8b5cf6", label: "Search"                },
  sos:    { color: "#ef4444", label: "Emergency", badge: "SOS" },
  floor:  { color: "#10b981", label: "Floor Nav"             },
  system: { color: "#f59e0b", label: "System"                },
};

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10)  return "just now";
  if (s < 60)  return `${s}s ago`;
  if (s < 120) return "1m ago";
  return `${Math.floor(s / 60)}m ago`;
}

function LiveActivityFeed({ phase }: { phase: CampusPhase }) {
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    ACTIVITY_POOL.slice(0, 6).map((e, i) => ({
      ...e, id: `init-${i}`, ts: Date.now() - (i + 1) * 65_000,
    }))
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = Math.round(5000 - (phase.loadPct / 100) * 3000);
    const id = setInterval(() => {
      const template = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)];
      setEvents((prev) => [
        { ...template, id: `live-${Date.now()}`, ts: Date.now() },
        ...prev,
      ].slice(0, 8));
    }, interval);
    return () => clearInterval(id);
  }, [phase.loadPct]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: "#f8fafc" }}>
      <AnimatePresence initial={false}>
        {events.map((r) => {
          const meta = TYPE_META_ACTIVITY[r.type];
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-3 py-3 px-4"
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                style={{
                  background: `${meta.color}12`,
                  border:     `1px solid ${meta.color}25`,
                  color:       meta.color,
                }}
              >
                {r.user[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-medium" style={{ color: "#0f172a" }}>{r.user}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{ background: "#f8fafc", color: "#94a3b8", border: "1px solid #f1f5f9" }}
                  >
                    {r.dept}
                  </span>
                  {r.type === "sos" && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                    >
                      SOS
                    </span>
                  )}
                </div>
                <div className="text-[11px] mt-0.5 truncate" style={{ color: "#94a3b8" }}>
                  {r.action}
                </div>
              </div>

              {/* Time */}
              <div className="text-[10px] flex-shrink-0" style={{ color: "#cbd5e1" }}>
                {relativeTime(r.ts)}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HEATMAP
══════════════════════════════════════════════════════════ */

function HeatRow({ label, values, currentHour }: { label: string; values: number[]; currentHour: number }) {
  const displayHour = currentHour - 6;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] w-14 flex-shrink-0 text-right" style={{ color: "#94a3b8" }}>
        {label}
      </span>
      <div className="flex gap-1 flex-1">
        {values.map((v, i) => {
          const isCurrent = i === displayHour;
          const opacity   = 0.08 + v * 0.82;
          return (
            <div
              key={i}
              title={`${6 + i}:00`}
              className="flex-1 rounded transition-all duration-300"
              style={{
                height:     isCurrent ? 20 : 16,
                background: `rgba(14,165,233,${opacity})`,
                border:     isCurrent ? "1.5px solid #0ea5e9" : "none",
                outline:    isCurrent ? "2px solid rgba(14,165,233,0.15)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTION CENTER
══════════════════════════════════════════════════════════ */

function ActionCenter({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const actions: {
    label:   string;
    desc:    string;
    icon:    React.ElementType;
    color:   string;
    bg:      string;
    tab?:    AdminTab;
  }[] = [
    { label: "Add Building",   desc: "Register campus building", icon: Building2,  color: "#0ea5e9", bg: "#f0f9ff", tab: "buildings" },
    { label: "Add Room",       desc: "Register room or lab",     icon: DoorOpen,   color: "#8b5cf6", bg: "#faf5ff", tab: "rooms"     },
    { label: "Update Routes",  desc: "Manage navigation paths",  icon: Navigation, color: "#10b981", bg: "#f0fdf4", tab: "routes"    },
    { label: "Publish Notice", desc: "Campus-wide alert",        icon: Bell,       color: "#f59e0b", bg: "#fffbeb"                  },
    { label: "Generate Report",desc: "Export operations data",   icon: FileText,   color: "#64748b", bg: "#f8fafc"                  },
    { label: "System Settings",desc: "Configure platform",       icon: Settings2,  color: "#6366f1", bg: "#f0f0ff", tab: "settings" },
  ];

  return (
    <AdminCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[14px] font-semibold" style={{ color: "#0f172a" }}>Quick Actions</div>
          <div className="text-[12px]" style={{ color: "#94a3b8" }}>Common administrative tasks</div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {actions.map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => a.tab && onNavigate(a.tab)}
            className="flex flex-col gap-2 p-3 rounded-xl text-left transition-colors duration-150"
            style={{
              background: a.bg,
              border:     `1px solid ${a.color}20`,
              cursor:     "pointer",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#ffffff", border: `1px solid ${a.color}25` }}
            >
              <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
            </div>
            <div>
              <div className="text-[12px] font-semibold" style={{ color: "#0f172a" }}>{a.label}</div>
              <div className="text-[10px]" style={{ color: "#94a3b8" }}>{a.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </AdminCard>
  );
}

/* ══════════════════════════════════════════════════════════
   OVERVIEW
══════════════════════════════════════════════════════════ */

function Overview({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const phase       = useMemo(() => getCampusPhase(), []);
  const currentHour = new Date().getHours();

  const dailyUsers  = Math.round(342 * phase.userScale);
  const activeNodes = Math.round(142 * (0.4 + (phase.loadPct / 100) * 0.6));

  const [liveUsers,  setLiveUsers]  = useState(dailyUsers);
  const [liveNodes,  setLiveNodes]  = useState(activeNodes);
  const [sessionCt,  setSessionCt]  = useState(Math.round(847 * phase.userScale));

  useEffect(() => {
    const id = setInterval(() => {
      setLiveUsers((v)  => Math.max(1,  v + Math.round((Math.random() - 0.47) * 4)));
      setLiveNodes((v)  => Math.max(10, v + Math.round((Math.random() - 0.48) * 2)));
      setSessionCt((v)  => Math.max(1,  v + Math.round((Math.random() - 0.46) * 6)));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const kpis = [
    {
      label:    "Buildings",
      value:    BUILDINGS.length,
      icon:     Building2,
      color:    "#0ea5e9",
      accentBg: "#f0f9ff",
      delta:    "+2 this month",
      trend:    "up" as const,
      spark:    [22, 31, 28, 40, 35, 42, 38, 45, 41, BUILDINGS.length],
      subtitle: "Registered on campus",
    },
    {
      label:    "Total Rooms",
      value:    67,
      icon:     DoorOpen,
      color:    "#8b5cf6",
      accentBg: "#faf5ff",
      delta:    "+4 added",
      trend:    "up" as const,
      spark:    [55, 60, 58, 63, 61, 67, 65, 70, 68, 72],
      subtitle: "Labs, halls & offices",
    },
    {
      label:    "Active Routes",
      value:    32,
      icon:     Route,
      color:    "#10b981",
      accentBg: "#f0fdf4",
      delta:    "3 offline",
      trend:    "down" as const,
      spark:    [28, 32, 29, 35, 31, 38, 34, 36, 33, 37],
      subtitle: "Navigation paths live",
    },
    {
      label:    "Active Users",
      value:    liveUsers,
      icon:     Users,
      color:    "#f59e0b",
      accentBg: "#fffbeb",
      delta:    phase.short,
      trend:    "neutral" as const,
      spark:    [180, 210, 195, 230, 215, 247, 232, 255, 240, liveUsers],
      subtitle: "Online right now",
    },
  ];

  const systemStatus = [
    { label: "Navigation Engine", state: "Operational", variant: "success" as const, icon: Check       },
    { label: "AI Assistant",      state: "Active",       variant: "success" as const, icon: Cpu         },
    { label: "Indoor Routing",    state: "Active",       variant: "success" as const, icon: Route       },
    { label: "Emergency System",  state: "Armed",        variant: "warning" as const, icon: ShieldCheck },
    { label: "Analytics Engine",  state: "Running",      variant: "info"    as const, icon: Activity    },
    { label: "Map Data Sync",     state: "Up to Date",   variant: "success" as const, icon: TrendingUp  },
  ];

  const sysLoad = [
    { basePct: 68, color: "#0ea5e9", label: "CPU"  },
    { basePct: 42, color: "#8b5cf6", label: "MEM"  },
    { basePct: 87, color: "#10b981", label: "NET"  },
    { basePct: 31, color: "#f59e0b", label: "DISK" },
  ];

  const heatmap = [
    { label: "Block A",  values: [0.2, 0.5, 0.9, 1.0, 0.7, 0.4, 0.8, 0.6, 0.3, 0.2, 0.5, 0.9] },
    { label: "Block B",  values: [0.1, 0.3, 0.6, 0.8, 0.5, 0.3, 0.6, 0.4, 0.2, 0.1, 0.3, 0.7] },
    { label: "Canteen",  values: [0.0, 0.1, 0.3, 0.9, 1.0, 0.4, 0.2, 0.9, 0.8, 0.3, 0.1, 0.0] },
    { label: "Library",  values: [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.8, 0.6, 0.7, 0.5, 0.4, 0.3] },
    { label: "Hostel",   values: [0.8, 0.9, 0.4, 0.2, 0.1, 0.3, 0.5, 0.3, 0.5, 0.8, 0.9, 1.0] },
  ];

  const hours = ["6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p"];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Executive header ── */}
      <AdminCard className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-[20px] font-bold"
                style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)" }}
              >
                Campus Operations
              </h1>
              <StatusBadge variant={phase.variant} pulse>
                {phase.label} · {phase.loadPct}% load
              </StatusBadge>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: "#64748b" }}>
               RIMT Smart Campus · Admin Control Center · Demo Data
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live widgets */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { icon: Wifi,     val: "98.7%",           label: "Uptime",   color: "#10b981" },
                { icon: Signal,   val: String(liveNodes),  label: "Nodes",    color: "#0ea5e9" },
                { icon: Users,    val: String(liveUsers),  label: "Online",   color: "#8b5cf6" },
                { icon: Database, val: String(sessionCt),  label: "Sessions", color: "#f59e0b" },
              ].map((w) => (
                <div
                  key={w.label}
                  className="flex flex-col items-center px-3 py-2 rounded-lg"
                  style={{
                    background: `${w.color}08`,
                    border:     `1px solid ${w.color}18`,
                    minWidth:   52,
                  }}
                >
                  <w.icon className="w-3 h-3 mb-0.5" style={{ color: w.color }} />
                  <motion.span
                    key={w.val}
                    initial={{ opacity: 0.6, y: -2 }}
                    animate={{ opacity: 1,   y: 0  }}
                    className="text-[12px] font-bold tabular-nums leading-none"
                    style={{ color: w.color }}
                  >
                    {w.val}
                  </motion.span>
                  <span className="text-[9px] mt-0.5" style={{ color: "#94a3b8" }}>{w.label}</span>
                </div>
              ))}
            </div>
            <LiveClock />
          </div>
        </div>
      </AdminCard>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* ── Action Center ── */}
      <ActionCenter onNavigate={onNavigate} />

      {/* ── System load + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Infrastructure load */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>
                Infrastructure Load
              </div>
               <div className="text-[11px]" style={{ color: "#94a3b8" }}>Simulated server metrics</div>
            </div>
            <StatusBadge variant={phase.variant}>
              {phase.short} · {phase.loadPct}%
            </StatusBadge>
          </div>
          <div className="flex justify-around">
            {sysLoad.map((s) => (
              <LoadMetric key={s.label} {...s} phase={phase} />
            ))}
          </div>
        </AdminCard>

        {/* System status */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>
                System Status
              </div>
              <div className="text-[11px]" style={{ color: "#94a3b8" }}>Platform health check</div>
            </div>
            <StatusBadge variant="success">6 / 6 Online</StatusBadge>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "#f8fafc" }}>
            {systemStatus.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: s.variant === "success" ? "#f0fdf4" : s.variant === "warning" ? "#fffbeb" : "#eff6ff",
                      border:     s.variant === "success" ? "1px solid #bbf7d0" : s.variant === "warning" ? "1px solid #fde68a" : "1px solid #bfdbfe",
                    }}
                  >
                    <s.icon
                      className="w-3.5 h-3.5"
                      style={{ color: s.variant === "success" ? "#22c55e" : s.variant === "warning" ? "#f59e0b" : "#3b82f6" }}
                    />
                  </div>
                  <span className="text-[12px]" style={{ color: "#374151" }}>{s.label}</span>
                </div>
                <StatusBadge variant={s.variant}>{s.state}</StatusBadge>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* ── Activity + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Live activity */}
        <AdminCard className="overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: "1px solid #f8fafc" }}
          >
            <div>
               <div className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>Simulated Activity</div>
               <div className="text-[11px]" style={{ color: "#94a3b8" }}>Generated campus events</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
               <span className="text-[11px] font-medium" style={{ color: "#22c55e" }}>Demo</span>
            </div>
          </div>
          <LiveActivityFeed phase={phase} />
        </AdminCard>

        {/* Crowd heatmap */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>Crowd Density</div>
              <div className="text-[11px]" style={{ color: "#94a3b8" }}>Today · Hourly view</div>
            </div>
            <StatusBadge variant="info">{currentHour}:00</StatusBadge>
          </div>

          {/* Hour labels */}
          <div className="flex items-center gap-1 mb-2 pl-[68px]">
            {hours.map((h, i) => (
              <span
                key={h}
                className="flex-1 text-[9px] text-center"
                style={{
                  color:      (6 + i) === currentHour ? "#0ea5e9" : "#cbd5e1",
                  fontWeight: (6 + i) === currentHour ? 700 : 400,
                }}
              >
                {h}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {heatmap.map((row) => (
              <HeatRow key={row.label} {...row} currentHour={currentHour} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>Low</span>
            {[0.08, 0.28, 0.48, 0.68, 0.90].map((o, i) => (
              <div
                key={i}
                className="w-4 h-2 rounded-sm"
                style={{ background: `rgba(14,165,233,${o})` }}
              />
            ))}
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>High</span>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUB-PANELS
══════════════════════════════════════════════════════════ */

function RouteManager() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: "#0f172a" }}>Routes</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "#64748b" }}>Manage campus navigation paths</p>
      </div>
      <AdminCard className="py-20 flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <Route className="w-6 h-6" style={{ color: "#10b981" }} />
        </div>
        <div className="text-center">
          <div className="text-[14px] font-semibold" style={{ color: "#0f172a" }}>Route editor coming soon</div>
          <div className="text-[12px] mt-1" style={{ color: "#94a3b8" }}>This feature is currently in development</div>
        </div>
        <StatusBadge variant="warning">In Progress</StatusBadge>
      </AdminCard>
    </div>
  );
}

function Settings() {
  const [toggles, setToggles] = useState({
    ai: true, emergency: true, analytics: true, offline: false, voice: true, darkMode: true,
  });
  const [saved, setSaved] = useState<string | null>(null);

  const toggle = useCallback((k: keyof typeof toggles) => {
    setToggles((p) => ({ ...p, [k]: !p[k] }));
    setSaved(k);
    setTimeout(() => setSaved(null), 2000);
  }, []);

  const items = [
    { key: "ai",        label: "AI Assistant",      desc: "Enable Claude AI chatbot for students",   icon: Cpu      },
    { key: "emergency", label: "Emergency Alerts",   desc: "Real-time SOS push notifications",        icon: Zap      },
    { key: "analytics", label: "Analytics Tracking", desc: "Collect and analyze navigation data",     icon: Activity },
    { key: "offline",   label: "Offline Mode",       desc: "Cache map data for offline use",          icon: Wifi     },
    { key: "voice",     label: "Voice Navigation",   desc: "Enable voice command interface",          icon: Radio    },
    { key: "darkMode",  label: "Dark Theme",         desc: "Use dark interface for kiosks",           icon: Eye      },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: "#0f172a" }}>Settings</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "#64748b" }}>System configuration and preferences</p>
      </div>

      <AdminCard className="overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #f8fafc" }}
        >
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>Platform Configuration</div>
            <div className="text-[11px]" style={{ color: "#94a3b8" }}>Toggle features on or off</div>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0             }}
              >
                <StatusBadge variant="success">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Saved
                </StatusBadge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="divide-y" style={{ borderColor: "#f8fafc" }}>
          {items.map((item, i) => {
            const on = toggles[item.key];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{
                      background: on ? "#f0f9ff" : "#f8fafc",
                      border:     `1px solid ${on ? "#bae6fd" : "#e2e8f0"}`,
                    }}
                  >
                    <item.icon
                      className="w-4 h-4 transition-colors duration-200"
                      style={{ color: on ? "#0ea5e9" : "#94a3b8" }}
                    />
                  </div>
                  <div>
                    <div
                      className="text-[13px] font-medium transition-colors duration-150"
                      style={{ color: on ? "#0f172a" : "#64748b" }}
                    >
                      {item.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <motion.button
                  onClick={() => toggle(item.key)}
                  className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                  style={{
                    width:      44,
                    height:     24,
                    background: on ? "#0ea5e9" : "#e2e8f0",
                    border:     "none",
                    cursor:     "pointer",
                  }}
                >
                  <motion.div
                    animate={{ x: on ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-[3px] rounded-full"
                    style={{
                      width:   18,
                      height:  18,
                      background: "#ffffff",
                      boxShadow:  "0 1px 3px rgba(0,0,0,0.15)",
                    }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </AdminCard>
    </div>
  );
}

function Analytics() {
  const phase = useMemo(() => getCampusPhase(), []);

  const metrics = [
    { label: "Navigation Events", value: Math.round(2847 * phase.userScale), delta: "+12%", up: true,  spark: [180,210,195,230,215,247,232,255,240,258], color: "#0ea5e9", bg: "#f0f9ff" },
    { label: "Avg Route Time",    value: "4.2m",                             delta: "−8%",  up: false, spark: [5.1,4.9,4.8,4.6,4.5,4.3,4.4,4.2,4.3,4.2], color: "#10b981", bg: "#f0fdf4" },
    { label: "AI Interactions",   value: Math.round(1243 * phase.userScale), delta: "+25%", up: true,  spark: [820,900,870,980,940,1050,1020,1150,1120,1243], color: "#8b5cf6", bg: "#faf5ff" },
    { label: "User Retention",    value: "87%",                              delta: "+5%",  up: true,  spark: [79,80,81,82,83,84,84,85,86,87], color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "#0f172a" }}>Analytics</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#64748b" }}>Platform usage and performance metrics</p>
        </div>
        <StatusBadge variant={phase.variant}>{phase.short} · {phase.loadPct}% load</StatusBadge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: i * 0.07 }}
          >
            <AdminCard className="p-4 flex flex-col gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: m.bg, border: `1px solid ${m.color}20` }}
              >
                {i === 0 && <Navigation className="w-4 h-4" style={{ color: m.color }} />}
                {i === 1 && <Route      className="w-4 h-4" style={{ color: m.color }} />}
                {i === 2 && <Cpu        className="w-4 h-4" style={{ color: m.color }} />}
                {i === 3 && <Users      className="w-4 h-4" style={{ color: m.color }} />}
              </div>
              <div>
                <div className="text-[11px]" style={{ color: "#94a3b8" }}>{m.label}</div>
                <div
                  className="text-[24px] font-bold tabular-nums leading-none mt-1"
                  style={{ color: "#0f172a" }}
                >
                  {typeof m.value === "number" ? m.value.toLocaleString() : m.value}
                </div>
                <div
                  className="flex items-center gap-1 text-[11px] mt-1"
                  style={{ color: m.up ? "#22c55e" : "#f59e0b" }}
                >
                  {m.up
                    ? <ArrowUpRight   className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />
                  }
                  {m.delta} vs last week
                </div>
              </div>
              <MiniSparkline data={m.spark} color={m.color} />
            </AdminCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EmergencyAdmin() {
  const [lastChecked] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 7);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const stats = [
    { label: "Active SOS Alerts",  value: "0", variant: "success" as const, icon: ShieldCheck,   detail: "All Clear"           },
    { label: "Emergency Exits",    value: "6", variant: "warning" as const, icon: AlertTriangle, detail: "All Accessible"      },
    { label: "Medical Incidents",  value: "0", variant: "success" as const, icon: Check,         detail: "No Reports Today"    },
    { label: "Security Incidents", value: "1", variant: "warning" as const, icon: AlertTriangle, detail: "East Wing · Logged"  },
  ];

  const statColors = { success: "#22c55e", warning: "#f59e0b", info: "#3b82f6", critical: "#ef4444", neutral: "#94a3b8" };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "#0f172a" }}>Emergency Management</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#64748b" }}>Campus safety and incident monitoring</p>
        </div>
        <StatusBadge variant="success" pulse>
          Last checked {lastChecked}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((s, i) => {
          const color = statColors[s.variant];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1    }}
              transition={{ delay: i * 0.07 }}
            >
              <AdminCard className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color}12`,
                      border:     `1px solid ${color}25`,
                    }}
                  >
                    <s.icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <div
                      className="text-[30px] font-bold tabular-nums leading-none"
                      style={{ color }}
                    >
                      {s.value}
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: "#374151" }}>{s.label}</div>
                    <div className="flex items-center gap-1 text-[11px] mt-1.5" style={{ color }}>
                      <MapPin className="w-3 h-3" />
                      {s.detail}
                    </div>
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          );
        })}
      </div>

      {/* All-clear notice */}
      <AdminCard className="px-5 py-4 flex items-center gap-3" style={{ border: "1px solid #bbf7d0", background: "#f0fdf4" }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#22c55e" }} />
        <div>
          <div className="text-[13px] font-semibold" style={{ color: "#166534" }}>Campus Status: Secure</div>
          <div className="text-[11px] mt-0.5" style={{ color: "#4ade80" }}>
            All emergency systems armed · Security patrol active · 6 emergency exits accessible
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");

  const PANEL_MAP: Partial<Record<AdminTab, React.ReactNode>> = {
    buildings: <BuildingForm />,
    rooms:     <RoomForm />,
    routes:    <RouteManager />,
    analytics: <Analytics />,
    emergency: <EmergencyAdmin />,
    settings:  <Settings />,
  };

  return (
    <div
      className="flex"
      style={{
        height:     "100vh",
        paddingTop: 95,
        background: "#f8fafc",
        overflow:   "hidden",
      }}
    >
      <AdminSidebar active={tab} onChange={setTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -4 }}
              transition={{ duration: 0.18  }}
            >
              {tab === "overview"
                ? <Overview onNavigate={setTab} />
                : PANEL_MAP[tab]
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
