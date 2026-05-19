"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { BuildingForm } from "@/components/admin/BuildingForm";
import { RoomForm } from "@/components/admin/RoomForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { BUILDINGS } from "@/data/buildings";
import {
  Building2, DoorOpen, Route,
  Users, TrendingUp, ShieldCheck,
  Check, AlertTriangle, Activity,
  Cpu, Wifi, Zap, Eye, Radio,
  ArrowUpRight, ArrowDownRight, Radar,
  Thermometer, Wind, Signal, Lock,
  MapPin, Clock, Database, Server,
  Bell, Navigation, CheckCircle2,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   TIME-AWARE CAMPUS PHASE
══════════════════════════════════════════════════════════ */

type CampusPhase = {
  label:     string;
  short:     string;
  loadPct:   number;
  color:     string;
  userScale: number; // multiplier for user-count metrics
};

function getCampusPhase(): CampusPhase {
  const h = new Date().getHours();
  if (h >= 6  && h < 9)  return { label: "Morning Commute",   short: "MORNING",   loadPct: 42, color: "#60b4ff", userScale: 0.45 };
  if (h >= 9  && h < 12) return { label: "Peak Morning",      short: "PEAK AM",   loadPct: 87, color: "#f97316", userScale: 0.90 };
  if (h >= 12 && h < 14) return { label: "Lunch Rush",        short: "LUNCH",     loadPct: 94, color: "#ef4444", userScale: 1.00 };
  if (h >= 14 && h < 17) return { label: "Afternoon Session", short: "AFTERNOON", loadPct: 78, color: "#00d4ff", userScale: 0.82 };
  if (h >= 17 && h < 20) return { label: "Evening Wind-down", short: "EVENING",   loadPct: 45, color: "#8b5cf6", userScale: 0.48 };
  if (h >= 20 && h < 23) return { label: "Quiet Hours",       short: "QUIET",     loadPct: 18, color: "#94a3b8", userScale: 0.18 };
  return                         { label: "Night Mode",        short: "NIGHT",     loadPct:  6, color: "#475569", userScale: 0.06 };
}

// 24h activity profile — mirrors analytics page
const HOURLY_ACTIVITY = [
   4,  3,  2,  2,  3,  8,
  22, 38, 55, 82, 91, 88,
  96, 94, 85, 82, 79, 65,
  48, 35, 24, 16,  9,  5,
];

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
      <div style={{
        fontFamily:  "var(--font-display)",
        fontSize:    22,
        fontWeight:  800,
        color:       "var(--cyan)",
        letterSpacing: 2,
        textShadow:  "0 0 20px rgba(0,212,255,0.5)",
        lineHeight:  1,
      }}>
        {time}
      </div>
      <div style={{
        fontFamily:    "var(--font-body)",
        fontSize:      10,
        color:         "var(--text-3)",
        letterSpacing: 1.5,
        marginTop:     2,
      }}>
        {date}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PULSE DOT
══════════════════════════════════════════════════════════ */

function PulseDot({ color = "var(--green)", size = 6 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <motion.span
        style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <span style={{
        position:     "relative",
        borderRadius: "50%",
        width:         size,
        height:        size,
        background:    color,
        boxShadow:    `0 0 7px ${color}`,
        display:      "block",
      }} />
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   MINI SPARKLINE
══════════════════════════════════════════════════════════ */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}
          style={{
            width:           3,
            height:          `${(v / max) * 100}%`,
            borderRadius:    2,
            background:      color,
            opacity:         0.35 + (v / max) * 0.65,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOAD RING — with live drift
══════════════════════════════════════════════════════════ */

function LoadRing({
  basePct,
  color,
  label,
  phase,
}: {
  basePct: number;
  color:   string;
  label:   string;
  phase:   CampusPhase;
}) {
  // Scale base by campus load, add small drift
  const scaled = Math.round(basePct * (0.5 + (phase.loadPct / 100) * 0.5));
  const [pct, setPct] = useState(scaled);

  useEffect(() => {
    const id = setInterval(() => {
      setPct(Math.max(5, Math.min(99, scaled + Math.round((Math.random() - 0.48) * 5))));
    }, 3200);
    return () => clearInterval(id);
  }, [scaled]);

  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  const dotColor = pct > 80 ? "#ef4444" : pct > 60 ? "#f97316" : color;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={58} height={58} viewBox="0 0 58 58">
        <circle cx={29} cy={29} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}
        />
        <motion.circle
          cx={29} cy={29} r={r}
          fill="none" stroke={dotColor} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          transform="rotate(-90 29 29)"
          style={{ filter: `drop-shadow(0 0 4px ${dotColor}88)` }}
        />
        <text x={29} y={33} textAnchor="middle"
          fill={dotColor} fontSize={11} fontWeight={700} fontFamily="monospace"
        >
          {pct}%
        </text>
      </svg>
      <span style={{
        fontSize:      9,
        color:         "var(--text-3)",
        letterSpacing: 1,
        fontFamily:    "var(--font-body)",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HEATMAP ROW — current hour highlighted
══════════════════════════════════════════════════════════ */

function HeatRow({ label, values, currentHour }: { label: string; values: number[]; currentHour: number }) {
  const colors = [
    "rgba(0,212,255,0.07)",
    "rgba(0,212,255,0.18)",
    "rgba(0,212,255,0.38)",
    "rgba(0,212,255,0.62)",
    "rgba(0,212,255,0.88)",
  ];

  // Map 24h → 12 display slots (every 2 hours from 6am)
  const displayHour = currentHour - 6; // offset for 6am start

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        fontSize:   10,
        color:      "var(--text-3)",
        fontFamily: "var(--font-body)",
        width:       60,
        flexShrink:  0,
      }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {values.map((v, i) => {
          const isCurrent = i === displayHour;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              title={`${6 + i}:00`}
              style={{
                flex:         1,
                height:       isCurrent ? 20 : 16,
                borderRadius: 3,
                background:   isCurrent
                  ? `rgba(0,212,255,${0.4 + v * 0.6})`
                  : colors[Math.min(4, Math.floor(v * 4))],
                border:       isCurrent
                  ? "1px solid rgba(0,212,255,0.65)"
                  : v > 0.7
                  ? "1px solid rgba(0,212,255,0.3)"
                  : "none",
                boxShadow:    isCurrent ? "0 0 8px rgba(0,212,255,0.4)" : "none",
                transition:   "height 0.3s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LIVE ACTIVITY FEED — streams new events
══════════════════════════════════════════════════════════ */

type ActivityEvent = {
  id:        string;
  user:      string;
  dept:      string;
  action:    string;
  ts:        number;   // Date.now()
  intensity: number;
  type:      "nav" | "search" | "sos" | "floor" | "system";
};

const ACTIVITY_POOL: Omit<ActivityEvent, "id" | "ts">[] = [
  { user: "Arjun Sharma",  dept: "CSE",   action: "Navigated: Main Gate → Block A", intensity: 0.75, type: "nav"    },
  { user: "Priya Singh",   dept: "ECE",   action: "Searched: Medical Room",          intensity: 0.45, type: "search" },
  { user: "Rohit Kumar",   dept: "Mech",  action: "Route: Hostel → Cafeteria",       intensity: 0.60, type: "nav"    },
  { user: "Anjali Verma",  dept: "IT",    action: "Floor Nav: Block A F1 → F3",      intensity: 0.40, type: "floor"  },
  { user: "Deepak Nair",   dept: "Civil", action: "Emergency SOS triggered",         intensity: 1.00, type: "sos"    },
  { user: "Sneha Gupta",   dept: "MBA",   action: "Route: Library → Admin Block",    intensity: 0.50, type: "nav"    },
  { user: "Vikram Reddy",  dept: "CSE",   action: "Searched: CSE Lab 3",             intensity: 0.35, type: "search" },
  { user: "Megha Iyer",    dept: "ECE",   action: "Navigated: Hostel B → Gate",      intensity: 0.65, type: "nav"    },
  { user: "Arun Pillai",   dept: "Mech",  action: "Floor Map: Workshop F2",          intensity: 0.42, type: "floor"  },
  { user: "Kavya Menon",   dept: "IT",    action: "Route recalculated — congestion", intensity: 0.80, type: "system" },
  { user: "Rahul Tiwari",  dept: "MBA",   action: "Navigated: Canteen → Block C",    intensity: 0.55, type: "nav"    },
  { user: "Divya Nair",    dept: "CSE",   action: "Searched: Washroom Block B",      intensity: 0.28, type: "search" },
];

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10)  return "just now";
  if (s < 60)  return `${s}s ago`;
  if (s < 120) return "1m ago";
  return `${Math.floor(s / 60)}m ago`;
}

const TYPE_COLOR: Record<ActivityEvent["type"], string> = {
  nav:    "var(--cyan)",
  search: "var(--purple)",
  sos:    "var(--red)",
  floor:  "var(--green)",
  system: "var(--amber)",
};

function LiveActivityFeed({ phase }: { phase: CampusPhase }) {
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    ACTIVITY_POOL.slice(0, 5).map((e, i) => ({
      ...e,
      id: `init-${i}`,
      ts: Date.now() - (i + 1) * 65_000,
    }))
  );
  const [tick, setTick] = useState(0);

  // Stream new events — speed proportional to campus load
  useEffect(() => {
    const interval = Math.round(5000 - (phase.loadPct / 100) * 3000); // 2000–5000ms
    const id = setInterval(() => {
      const template = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)];
      const event: ActivityEvent = {
        ...template,
        id: `live-${Date.now()}-${Math.random()}`,
        ts: Date.now(),
      };
      setEvents((prev) => [event, ...prev].slice(0, 8));
    }, interval);
    return () => clearInterval(id);
  }, [phase.loadPct]);

  // Tick for relative-time refresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AnimatePresence initial={false}>
        {events.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1,  y: 0,   height: "auto" }}
            exit={{    opacity: 0,           height: 0       }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:         10,
              padding:    "9px 0",
              borderBottom: i < events.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              position:   "relative",
              overflow:   "hidden",
            }}
          >
            {/* Left intensity bar */}
            <div style={{
              position:     "absolute",
              left:          0,
              top:           0,
              bottom:        0,
              width:         2,
              borderRadius:  2,
              background:   TYPE_COLOR[r.type],
              opacity:       r.intensity,
              boxShadow:    `0 0 6px ${TYPE_COLOR[r.type]}`,
            }} />

            <div style={{ paddingLeft: 10, display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              {/* Avatar */}
              <div style={{
                width:          28,
                height:         28,
                borderRadius:   "50%",
                flexShrink:      0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:        11,
                fontWeight:      700,
                fontFamily:     "var(--font-display)",
                background:     `${TYPE_COLOR[r.type]}12`,
                border:         `1px solid ${TYPE_COLOR[r.type]}28`,
                color:           TYPE_COLOR[r.type],
              }}>
                {r.user[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily:  "var(--font-body)",
                  fontSize:    12,
                  fontWeight:  500,
                  display:    "flex",
                  gap:          6,
                  alignItems: "center",
                }}>
                  <span style={{ color: "var(--text-1)" }}>{r.user}</span>
                  <span style={{
                    fontSize:   9,
                    padding:   "1px 6px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.05)",
                    border:     "1px solid rgba(255,255,255,0.08)",
                    color:      "var(--text-3)",
                  }}>
                    {r.dept}
                  </span>
                  {r.type === "sos" && (
                    <span style={{
                      fontSize:   9,
                      padding:   "1px 6px",
                      borderRadius: 20,
                      background: "rgba(239,68,68,0.12)",
                      border:     "1px solid rgba(239,68,68,0.3)",
                      color:      "var(--red)",
                      fontWeight: 700,
                      animation:  "admin-blink 1s ease-in-out infinite",
                    }}>
                      SOS
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   10,
                  color:      "var(--text-3)",
                  marginTop:   1,
                  overflow:   "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {r.action}
                </div>
              </div>
            </div>

            {/* Time */}
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize:    9,
              color:      "var(--text-3)",
              flexShrink:  0,
              minWidth:   40,
              textAlign:  "right",
            }}>
              {relativeTime(r.ts)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   OVERVIEW
══════════════════════════════════════════════════════════ */

function Overview() {
  const phase       = useMemo(() => getCampusPhase(), []);
  const currentHour = new Date().getHours();

  // KPI values scale with campus phase
  const dailyUsers  = Math.round(342 * phase.userScale);
  const activeNodes = Math.round(142 * (0.4 + (phase.loadPct / 100) * 0.6));

  const [liveUsers,  setLiveUsers]  = useState(dailyUsers);
  const [liveNodes,  setLiveNodes]  = useState(activeNodes);
  const [sessionCt,  setSessionCt]  = useState(Math.round(847 * phase.userScale));

  // Believable drift
  useEffect(() => {
    const id = setInterval(() => {
      setLiveUsers((v)  => Math.max(1,  v + Math.round((Math.random() - 0.47) * 4)));
      setLiveNodes((v)  => Math.max(10, v + Math.round((Math.random() - 0.48) * 2)));
      setSessionCt((v)  => Math.max(1,  v + Math.round((Math.random() - 0.46) * 6)));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const sparkData = {
    buildings: [22, 31, 28, 40, 35, 42, 38, 45, 41, 47],
    rooms:     [55, 60, 58, 63, 61, 67, 65, 70, 68, 72],
    routes:    [28, 32, 29, 35, 31, 38, 34, 36, 33, 37],
    users:     [180, 210, 195, 230, 215, 247, 232, 255, 240, liveUsers],
  };

  const kpis = [
    {
      label: "Buildings",   value: BUILDINGS.length, icon: Building2,
      color: "var(--cyan)",   delta: "+2 this month", trend: "up",  spark: sparkData.buildings,
    },
    {
      label: "Total Rooms", value: 67,               icon: DoorOpen,
      color: "var(--purple)", delta: "+4 added",      trend: "up",  spark: sparkData.rooms,
    },
    {
      label: "Active Routes",value: 32,              icon: Route,
      color: "var(--green)",  delta: "−3 offline",   trend: "down", spark: sparkData.routes,
    },
    {
      label: "Active Users", value: liveUsers,        icon: Users,
      color: "var(--amber)",  delta: `${phase.short}`, trend: "up", spark: sparkData.users,
    },
  ];

  const status = [
    { label: "Navigation Engine", state: "Operational", color: "var(--green)",  icon: Check       },
    { label: "AI Assistant",      state: "Active",       color: "var(--green)",  icon: Cpu         },
    { label: "Indoor Routing",    state: "Active",       color: "var(--green)",  icon: Route       },
    { label: "Emergency System",  state: "Armed",        color: "var(--amber)",  icon: ShieldCheck },
    { label: "Analytics Engine",  state: "Running",      color: "var(--cyan)",   icon: Activity    },
    { label: "Map Data Sync",     state: "Up to Date",   color: "var(--green)",  icon: TrendingUp  },
  ];

  const heatmap = [
    { label: "Block A",  values: [0.2, 0.5, 0.9, 1.0, 0.7, 0.4, 0.8, 0.6, 0.3, 0.2, 0.5, 0.9] },
    { label: "Block B",  values: [0.1, 0.3, 0.6, 0.8, 0.5, 0.3, 0.6, 0.4, 0.2, 0.1, 0.3, 0.7] },
    { label: "Canteen",  values: [0.0, 0.1, 0.3, 0.9, 1.0, 0.4, 0.2, 0.9, 0.8, 0.3, 0.1, 0.0] },
    { label: "Library",  values: [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.8, 0.6, 0.7, 0.5, 0.4, 0.3] },
    { label: "Hostel",   values: [0.8, 0.9, 0.4, 0.2, 0.1, 0.3, 0.5, 0.3, 0.5, 0.8, 0.9, 1.0] },
  ];

  const sysLoad = [
    { basePct: 68, color: "var(--cyan)",   label: "CPU"  },
    { basePct: 42, color: "var(--purple)", label: "MEM"  },
    { basePct: 87, color: "var(--green)",  label: "NET"  },
    { basePct: 31, color: "var(--amber)",  label: "DISK" },
  ];

  const hours = ["6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p"];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header bar ── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
        padding:        "14px 18px",
        background:     "rgba(0,0,0,0.3)",
        border:         "1px solid rgba(0,212,255,0.12)",
        borderRadius:   12,
        backdropFilter: "blur(12px)",
        position:       "relative",
        overflow:       "hidden",
      }}>
        {/* Scan shimmer */}
        <motion.div
          animate={{ x: ["-100%", "250%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
          style={{
            position:   "absolute",
            top:         0,
            left:        0,
            bottom:      0,
            width:       80,
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.055), transparent)",
            pointerEvents: "none",
          }}
        />

        <div>
          <div style={{
            fontFamily:           "var(--font-display)",
            fontSize:              18,
            fontWeight:            800,
            background:           "linear-gradient(135deg, #00d4ff, #7b61ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            letterSpacing:         0.5,
          }}>
            RIMT Smart Campus
          </div>
          <div style={{
            fontFamily:  "var(--font-body)",
            fontSize:    10,
            color:       "var(--text-3)",
            letterSpacing: 2,
            marginTop:   3,
            display:     "flex",
            alignItems:  "center",
            gap:          6,
          }}>
            <PulseDot color="var(--green)" size={5} />
            ADMIN CONTROL CENTER ·
            <span style={{ color: phase.color, fontWeight: 600 }}>{phase.label.toUpperCase()}</span>
            · {phase.loadPct}% LOAD
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Live widgets */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: Wifi,       val: "98.7%",           label: "UPTIME",  color: "var(--green)"  },
              { icon: Signal,     val: String(liveNodes),  label: "NODES",   color: "var(--cyan)"   },
              { icon: Users,      val: String(liveUsers),  label: "ONLINE",  color: "var(--purple)" },
              { icon: Database,   val: String(sessionCt),  label: "SESSION", color: "var(--amber)"  },
            ].map((w) => (
              <motion.div
                key={w.label}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  padding:        "6px 10px",
                  borderRadius:   8,
                  background:    `${w.color}0d`,
                  border:        `1px solid ${w.color}20`,
                  minWidth:       52,
                }}
              >
                <w.icon style={{ width: 11, height: 11, color: w.color, marginBottom: 2 }} />
                <motion.span
                  key={w.val}
                  initial={{ opacity: 0.5, y: -3 }}
                  animate={{ opacity: 1,   y: 0   }}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize:   12,
                    fontWeight: 700,
                    color:       w.color,
                    lineHeight:  1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {w.val}
                </motion.span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 8, color: "var(--text-3)", letterSpacing: 1.2, marginTop: 1 }}>
                  {w.label}
                </span>
              </motion.div>
            ))}
          </div>

          <LiveClock />
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1,  y: 0,  scale: 1    }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          >
            <GlassCard neon className="p-4" style={{
              position:    "relative",
              overflow:    "hidden",
              borderColor: `${k.color}22`,
            } as React.CSSProperties}>
              {/* Ambient glow */}
              <div style={{
                position:     "absolute",
                top:          -20,
                right:        -20,
                width:         80,
                height:        80,
                borderRadius: "50%",
                background:  `${k.color}0c`,
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  width:           32,
                  height:          32,
                  borderRadius:     8,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  background:    `${k.color}15`,
                  border:        `1px solid ${k.color}30`,
                }}>
                  <k.icon style={{ width: 15, height: 15, color: k.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {k.trend === "up"
                    ? <ArrowUpRight   style={{ width: 11, height: 11, color: "var(--green)" }} />
                    : <ArrowDownRight style={{ width: 11, height: 11, color: "var(--amber)" }} />
                  }
                  <span style={{
                    fontSize:   9,
                    color:      k.trend === "up" ? "var(--green)" : "var(--amber)",
                    fontFamily: "var(--font-body)",
                  }}>
                    {k.delta}
                  </span>
                </div>
              </div>

              <motion.div
                key={k.value}
                initial={{ opacity: 0.6, y: -4 }}
                animate={{ opacity: 1,   y: 0   }}
                style={{
                  fontFamily:  "var(--font-display)",
                  fontSize:    30,
                  fontWeight:  900,
                  color:        k.color,
                  lineHeight:   1,
                  marginBottom: 2,
                  textShadow: `0 0 24px ${k.color}55`,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k.value}
              </motion.div>

              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)", marginBottom: 8 }}>
                {k.label}
              </div>
              <MiniSparkline data={k.spark} color={k.color} />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Infrastructure load ── */}
      <GlassCard neon className="p-5" style={{ borderColor: "rgba(0,212,255,0.1)" } as React.CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{
            fontFamily:    "var(--font-display)",
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: 2,
            color:         "var(--cyan)",
          }}>
            INFRASTRUCTURE LOAD
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize:   9,
              padding:   "2px 8px",
              borderRadius: 20,
              background:  `${phase.color}12`,
              border:      `1px solid ${phase.color}28`,
              color:        phase.color,
              fontFamily:  "var(--font-display)",
              letterSpacing: 1,
            }}>
              {phase.short} · {phase.loadPct}% CAMPUS
            </span>
            <Radio style={{ width: 10, height: 10, color: "var(--green)" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)" }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {sysLoad.map((s) => (
            <LoadRing key={s.label} {...s} phase={phase} />
          ))}
        </div>
      </GlassCard>

      {/* ── Status + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* System status */}
        <GlassCard neon className="p-5">
          <div style={{
            fontFamily:    "var(--font-display)",
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: 2,
            color:         "var(--cyan)",
            marginBottom:  16,
            display:       "flex",
            justifyContent: "space-between",
            alignItems:    "center",
          }}>
            SYSTEM STATUS
            <span style={{
              fontFamily:    "var(--font-body)",
              fontSize:       9,
              padding:       "2px 8px",
              borderRadius:   20,
              background:    "rgba(34,197,94,0.08)",
              border:        "1px solid rgba(34,197,94,0.22)",
              color:         "var(--green)",
            }}>
              6 / 6 ONLINE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {status.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  padding:        "10px 0",
                  borderBottom:   i < status.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width:          28,
                    height:         28,
                    borderRadius:   7,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    background:    `${s.color}0f`,
                    border:        `1px solid ${s.color}20`,
                  }}>
                    <s.icon style={{ width: 13, height: 13, color: s.color }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-1)" }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <PulseDot color={s.color} size={5} />
                  <span style={{
                    padding:      "2px 10px",
                    borderRadius:  20,
                    fontSize:      10,
                    fontWeight:    600,
                    fontFamily:   "var(--font-body)",
                    background:  `${s.color}10`,
                    border:      `1px solid ${s.color}25`,
                    color:        s.color,
                  }}>
                    {s.state}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Live activity feed */}
        <GlassCard neon className="p-5">
          <div style={{
            fontFamily:    "var(--font-display)",
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: 2,
            color:         "var(--cyan)",
            marginBottom:  16,
            display:       "flex",
            justifyContent: "space-between",
            alignItems:    "center",
          }}>
            LIVE ACTIVITY FEED
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <PulseDot color="var(--green)" size={5} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--green)", letterSpacing: 1 }}>
                STREAMING
              </span>
            </div>
          </div>
          <LiveActivityFeed phase={phase} />
        </GlassCard>
      </div>

      {/* ── Crowd heatmap ── */}
      <GlassCard neon className="p-5" style={{ borderColor: "rgba(0,212,255,0.1)" } as React.CSSProperties}>
        <div style={{
          fontFamily:    "var(--font-display)",
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: 2,
          color:         "var(--cyan)",
          marginBottom:   4,
          display:       "flex",
          justifyContent: "space-between",
          alignItems:    "center",
        }}>
          CROWD DENSITY HEATMAP
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize:   9,
              padding:   "2px 8px",
              borderRadius: 20,
              background: `${phase.color}10`,
              border:     `1px solid ${phase.color}25`,
              color:       phase.color,
              fontFamily: "var(--font-display)",
            }}>
              NOW: {currentHour}:00
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-3)" }}>
              TODAY · HOURLY
            </span>
          </div>
        </div>

        {/* Hour labels */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingLeft: 66 }}>
          {hours.map((h, i) => {
            const isCurrent = (6 + i) === currentHour;
            return (
              <span key={h} style={{
                flex:       1,
                fontSize:   8,
                color:      isCurrent ? "var(--cyan)" : "var(--text-3)",
                fontFamily: "var(--font-body)",
                textAlign:  "center",
                fontWeight: isCurrent ? 700 : 400,
              }}>
                {h}
              </span>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {heatmap.map((row) => (
            <HeatRow key={row.label} {...row} currentHour={currentHour} />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Low</span>
          {["rgba(0,212,255,0.08)","rgba(0,212,255,0.22)","rgba(0,212,255,0.42)","rgba(0,212,255,0.65)","rgba(0,212,255,0.9)"].map((c, i) => (
            <div key={i} style={{ width: 16, height: 8, borderRadius: 2, background: c }} />
          ))}
          <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-body)" }}>High</span>
          <span style={{ fontSize: 9, color: "var(--cyan)", fontFamily: "var(--font-body)", marginLeft: 8 }}>
            ▌ = current hour
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROUTE MANAGER
══════════════════════════════════════════════════════════ */

function RouteManager() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] font-bold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
        Route Management
      </h2>
      <GlassCard neon className="p-5">
        <div className="flex items-center justify-center py-12 flex-col gap-3">
          <Route className="w-10 h-10" style={{ color: "var(--text-3)" }} />
          <div className="text-[13px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
            Route editor coming in next release
          </div>
          <span className="px-3 py-1 rounded-full text-[10px]" style={{
            background: "rgba(245,158,11,0.1)",
            border:     "1px solid rgba(245,158,11,0.2)",
            color:      "var(--amber)",
            fontFamily: "var(--font-body)",
          }}>
            In Progress
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS — with save feedback
══════════════════════════════════════════════════════════ */

function Settings() {
  const [toggles, setToggles] = useState({
    ai: true, emergency: true, analytics: true, offline: false, voice: true, darkMode: true,
  });
  const [saved, setSaved] = useState<string | null>(null);

  const toggle = useCallback((k: keyof typeof toggles) => {
    setToggles((p) => ({ ...p, [k]: !p[k] }));
    setSaved(k);
    setTimeout(() => setSaved(null), 1800);
  }, []);

  const items = [
    { key: "ai",        label: "AI Assistant",      desc: "Enable Claude AI chatbot",         icon: Cpu       },
    { key: "emergency", label: "Emergency Alerts",   desc: "Real-time SOS notifications",      icon: Zap       },
    { key: "analytics", label: "Analytics Tracking", desc: "Collect navigation usage data",    icon: Activity  },
    { key: "offline",   label: "Offline Mode",       desc: "Cache map data for offline use",   icon: Wifi      },
    { key: "voice",     label: "Voice Navigation",   desc: "Enable voice command navigation",  icon: Radio     },
    { key: "darkMode",  label: "Dark Theme",         desc: "Futuristic dark neon interface",   icon: Eye       },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] font-bold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
        Settings
      </h2>
      <GlassCard neon className="p-5">
        <div style={{
          fontFamily:    "var(--font-display)",
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: "1.5px",
          color:         "var(--cyan)",
          marginBottom:  16,
          display:       "flex",
          alignItems:    "center",
          justifyContent: "space-between",
        }}>
          SYSTEM CONFIGURATION
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: 8 }}
                animate={{ opacity: 1, scale: 1,    x: 0 }}
                exit={{    opacity: 0, scale: 0.85         }}
                transition={{ duration: 0.2 }}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:          4,
                  fontSize:     9,
                  padding:     "3px 10px",
                  borderRadius: 20,
                  background:  "rgba(34,197,94,0.1)",
                  border:      "1px solid rgba(34,197,94,0.25)",
                  color:       "var(--green)",
                  fontFamily:  "var(--font-body)",
                }}
              >
                <CheckCircle2 style={{ width: 10, height: 10 }} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-0">
          {items.map((item, i) => {
            const on = toggles[item.key];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  padding:        "14px 0",
                  borderBottom:   i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width:          32,
                    height:         32,
                    borderRadius:   8,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    background:     on ? "rgba(0,212,255,0.1)"  : "rgba(255,255,255,0.04)",
                    border:         `1px solid ${on ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.08)"}`,
                    transition:     "all 0.3s ease",
                  }}>
                    <item.icon style={{ width: 14, height: 14, color: on ? "var(--cyan)" : "var(--text-3)" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium" style={{ fontFamily: "var(--font-body)", color: on ? "var(--text-1)" : "var(--text-2)", transition: "color 0.2s" }}>
                      {item.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {saved === item.key && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{    opacity: 0 }}
                      style={{ fontSize: 9, color: "var(--green)", fontFamily: "var(--font-body)" }}
                    >
                      {on ? "enabled" : "disabled"}
                    </motion.span>
                  )}
                  <motion.button
                    onClick={() => toggle(item.key)}
                    style={{
                      width:        44,
                      height:       24,
                      borderRadius: 12,
                      flexShrink:   0,
                      background:   on ? "rgba(0,212,255,0.22)" : "rgba(255,255,255,0.06)",
                      border:      `1px solid ${on ? "rgba(0,212,255,0.45)" : "rgba(255,255,255,0.1)"}`,
                      cursor:      "pointer",
                      boxShadow:    on ? "0 0 10px rgba(0,212,255,0.2)" : "none",
                      transition:  "all 0.25s ease",
                      position:    "relative",
                    }}
                  >
                    <motion.div
                      animate={{ x: on ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        position:     "absolute",
                        top:           2,
                        width:         18,
                        height:        18,
                        borderRadius: "50%",
                        background:    on ? "var(--cyan)" : "rgba(255,255,255,0.28)",
                        boxShadow:     on ? "0 0 8px var(--cyan)" : "none",
                      }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════════════════ */

function Analytics() {
  const phase = useMemo(() => getCampusPhase(), []);

  const metrics = [
    { label: "Navigation Events", value: Math.round(2847 * phase.userScale), trend: "+12%", up: true,  spark: [180,210,195,230,215,247,232,255,240,258] },
    { label: "Avg Route Time",    value: "4.2m",                             trend: "−8%",  up: false, spark: [5.1,4.9,4.8,4.6,4.5,4.3,4.4,4.2,4.3,4.2] },
    { label: "AI Interactions",   value: Math.round(1243 * phase.userScale), trend: "+25%", up: true,  spark: [820,900,870,980,940,1050,1020,1150,1120,1243] },
    { label: "User Retention",    value: "87%",                              trend: "+5%",  up: true,  spark: [79,80,81,82,83,84,84,85,86,87] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="text-[20px] font-bold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
          Analytics Dashboard
        </h2>
        <span style={{
          fontSize:   10,
          padding:   "3px 10px",
          borderRadius: 20,
          background:  `${phase.color}12`,
          border:      `1px solid ${phase.color}28`,
          color:        phase.color,
          fontFamily:  "var(--font-display)",
          letterSpacing: 1,
        }}>
          {phase.short} · {phase.loadPct}% LOAD
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: i * 0.07 }}
          >
            <GlassCard neon className="p-4" style={{ position: "relative", overflow: "hidden" } as React.CSSProperties}>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-body)", marginBottom: 6 }}>
                {m.label}
              </div>
              <div style={{
                fontSize:   24,
                fontWeight: 800,
                color:      "var(--cyan)",
                fontFamily: "var(--font-display)",
                lineHeight:  1,
                fontVariantNumeric: "tabular-nums",
              }}>
                {typeof m.value === "number" ? m.value.toLocaleString() : m.value}
              </div>
              <div style={{
                fontSize:   10,
                color:      m.up ? "var(--green)" : "var(--amber)",
                fontFamily: "var(--font-body)",
                display:    "flex",
                alignItems: "center",
                gap:         3,
                marginTop:   4,
                marginBottom: 8,
              }}>
                {m.up
                  ? <ArrowUpRight   style={{ width: 10, height: 10 }} />
                  : <ArrowDownRight style={{ width: 10, height: 10 }} />
                }
                {m.trend} vs last week
              </div>
              <MiniSparkline data={m.spark} color="var(--cyan)" />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EMERGENCY
══════════════════════════════════════════════════════════ */

function EmergencyAdmin() {
  const [lastChecked] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 7);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const stats = [
    { label: "Active SOS Alerts",  value: "0", color: "var(--green)", icon: ShieldCheck,   zone: "All Clear"        },
    { label: "Emergency Exits",    value: "6", color: "var(--amber)", icon: AlertTriangle, zone: "All Accessible"   },
    { label: "Medical Incidents",  value: "0", color: "var(--green)", icon: Check,         zone: "No Reports"       },
    { label: "Security Incidents", value: "1", color: "var(--amber)", icon: AlertTriangle, zone: "East Wing · Noted" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="text-[20px] font-bold" style={{ color: "var(--red)", fontFamily: "var(--font-display)" }}>
          Emergency Management
        </h2>
        <div style={{
          display:     "flex",
          alignItems:  "center",
          gap:          5,
          fontSize:     9,
          padding:     "3px 10px",
          borderRadius: 20,
          background:  "rgba(34,197,94,0.08)",
          border:      "1px solid rgba(34,197,94,0.2)",
          color:       "var(--green)",
          fontFamily:  "var(--font-body)",
        }}>
          <PulseDot color="var(--green)" size={5} />
          Last checked {lastChecked}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1    }}
            transition={{ delay: i * 0.07 }}
          >
            <GlassCard neon className="p-5" style={{ borderColor: `${s.color}28` } as React.CSSProperties}>
              <div className="flex items-start gap-3">
                <div style={{
                  width:          40,
                  height:         40,
                  borderRadius:   10,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  background:    `${s.color}15`,
                  border:        `1px solid ${s.color}30`,
                  flexShrink:     0,
                }}>
                  <s.icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{
                    fontSize:   28,
                    fontWeight: 900,
                    color:       s.color,
                    fontFamily: "var(--font-display)",
                    lineHeight:  1,
                    textShadow: `0 0 20px ${s.color}55`,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-body)", marginTop: 2 }}>
                    {s.label}
                  </div>
                  {/* Zone detail — NEW */}
                  <div style={{
                    fontSize:   9,
                    color:       s.color,
                    fontFamily: "var(--font-body)",
                    marginTop:   5,
                    opacity:     0.75,
                    display:    "flex",
                    alignItems: "center",
                    gap:         4,
                  }}>
                    <MapPin style={{ width: 8, height: 8 }} />
                    {s.zone}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* All-clear notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <GlassCard neon className="p-4" style={{ borderColor: "rgba(34,197,94,0.2)" } as React.CSSProperties}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 style={{ width: 20, height: 20, color: "var(--green)", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
                Campus Status: Secure
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>
                All emergency systems armed · Security patrol active · 6 emergency exits accessible
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   KEYFRAMES
══════════════════════════════════════════════════════════ */

const ADMIN_KEYFRAMES = `
@keyframes admin-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.4; }
}
`;

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */

const PANEL_MAP: Record<AdminTab, React.ReactNode> = {
  overview:  null, // rendered inline to receive phase
  buildings: <BuildingForm />,
  rooms:     <RoomForm />,
  routes:    <RouteManager />,
  analytics: <Analytics />,
  emergency: <EmergencyAdmin />,
  settings:  <Settings />,
};

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");

  return (
    <>
      <style suppressHydrationWarning>{ADMIN_KEYFRAMES}</style>

      <div
        className="flex bg-grid"
        style={{ height: "100vh", paddingTop: 95, background: "var(--bg-1)", overflow: "hidden" }}
      >
        <AdminSidebar active={tab} onChange={setTab} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[960px] mx-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10  }}
                animate={{ opacity: 1, y: 0   }}
                exit={{    opacity: 0, y: -6   }}
                transition={{ duration: 0.22   }}
              >
                {tab === "overview" ? <Overview /> : PANEL_MAP[tab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}