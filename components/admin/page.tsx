"use client";

import { useState, useEffect, useRef } from "react";
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
  Thermometer, Wind, Signal,
} from "lucide-react";

// ── Live Clock ────────────────────────────────────────
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
        fontFamily: "var(--font-display)",
        fontSize: 22,
        fontWeight: 800,
        color: "var(--cyan)",
        letterSpacing: 2,
        textShadow: "0 0 20px rgba(0,212,255,0.6)",
        lineHeight: 1,
      }}>
        {time}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)", letterSpacing: 1.5 }}>
        {date}
      </div>
    </div>
  );
}

// ── Ambient pulse dot ────────────────────────────────
function PulseDot({ color = "var(--green)", size = 6 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: color, opacity: 0.4,
        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
      }} />
      <span style={{
        position: "relative", borderRadius: "50%",
        width: size, height: size,
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }} />
      <style>{`@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}`}</style>
    </span>
  );
}

// ── Sparkline (CSS bar chart) ─────────────────────────
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
            width: 3,
            height: `${(v / max) * 100}%`,
            borderRadius: 2,
            background: color,
            opacity: 0.4 + (v / max) * 0.6,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

// ── Campus load ring ──────────────────────────────────
function LoadRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={58} height={58} viewBox="0 0 58 58">
        <circle cx={29} cy={29} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
        <motion.circle
          cx={29} cy={29} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 29 29)"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x={29} y={33} textAnchor="middle"
          fill={color} fontSize={11} fontWeight={700} fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: 1, fontFamily: "var(--font-body)" }}>
        {label}
      </span>
    </div>
  );
}

// ── Heatmap row ───────────────────────────────────────
function HeatRow({ label, values }: { label: string; values: number[] }) {
  const colors = ["rgba(0,212,255,0.08)", "rgba(0,212,255,0.2)", "rgba(0,212,255,0.4)", "rgba(0,212,255,0.65)", "rgba(0,212,255,0.9)"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-body)", width: 60, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            style={{
              flex: 1, height: 16, borderRadius: 3,
              background: colors[Math.floor(v * 4)],
              border: v > 0.7 ? "1px solid rgba(0,212,255,0.4)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Overview panel ────────────────────────────────────
function Overview() {
  const sparkData = {
    buildings: [22, 31, 28, 40, 35, 42, 38, 45, 41, 47],
    rooms:     [55, 60, 58, 63, 61, 67, 65, 70, 68, 72],
    routes:    [28, 32, 29, 35, 31, 38, 34, 36, 33, 37],
    users:     [280, 310, 295, 330, 315, 342, 328, 355, 340, 358],
  };

  const kpis = [
    {
      label: "Buildings", value: BUILDINGS.length, icon: Building2,
      color: "var(--cyan)", delta: "+2 this month",
      trend: "up", spark: sparkData.buildings,
    },
    {
      label: "Total Rooms", value: 67, icon: DoorOpen,
      color: "var(--purple)", delta: "+4 added",
      trend: "up", spark: sparkData.rooms,
    },
    {
      label: "Active Routes", value: 32, icon: Route,
      color: "var(--green)", delta: "−3 offline",
      trend: "down", spark: sparkData.routes,
    },
    {
      label: "Daily Users", value: 342, icon: Users,
      color: "var(--amber)", delta: "+18 vs avg",
      trend: "up", spark: sparkData.users,
    },
  ];

  const status = [
    { label: "Navigation Engine", state: "Operational", color: "var(--green)",  icon: Check          },
    { label: "AI Assistant",      state: "Active",      color: "var(--green)",  icon: Cpu            },
    { label: "Indoor Routing",    state: "Active",      color: "var(--green)",  icon: Route          },
    { label: "Emergency System",  state: "Armed",       color: "var(--amber)",  icon: ShieldCheck    },
    { label: "Analytics Engine",  state: "Running",     color: "var(--cyan)",   icon: Activity       },
    { label: "Map Data Sync",     state: "Up to Date",  color: "var(--green)",  icon: TrendingUp     },
  ];

  const recent = [
    { user: "Arjun Sharma",  action: "Navigated Gate → Block A", time: "2m ago",  dept: "CSE",   intensity: 0.9 },
    { user: "Priya Singh",   action: "Searched: Medical Room",   time: "5m ago",  dept: "ECE",   intensity: 0.5 },
    { user: "Rohit Kumar",   action: "Route: Hostel → Canteen",  time: "9m ago",  dept: "Mech",  intensity: 0.7 },
    { user: "Anjali Verma",  action: "Floor Nav: Block A F1→F3", time: "12m ago", dept: "IT",    intensity: 0.4 },
    { user: "Deepak Nair",   action: "Emergency SOS triggered",  time: "18m ago", dept: "Civil", intensity: 1.0 },
  ];

  const heatmap = [
    { label: "Block A",  values: [0.2, 0.5, 0.9, 1.0, 0.7, 0.4, 0.8, 0.6, 0.3, 0.2, 0.5, 0.9] },
    { label: "Block B",  values: [0.1, 0.3, 0.6, 0.8, 0.5, 0.3, 0.6, 0.4, 0.2, 0.1, 0.3, 0.7] },
    { label: "Canteen",  values: [0.0, 0.1, 0.3, 0.9, 1.0, 0.4, 0.2, 0.9, 0.8, 0.3, 0.1, 0.0] },
    { label: "Library",  values: [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.8, 0.6, 0.7, 0.5, 0.4, 0.3] },
    { label: "Hostel",   values: [0.8, 0.9, 0.4, 0.2, 0.1, 0.3, 0.5, 0.3, 0.5, 0.8, 0.9, 1.0] },
  ];

  const sysLoad = [
    { pct: 68, color: "var(--cyan)",   label: "CPU" },
    { pct: 42, color: "var(--purple)", label: "MEM" },
    { pct: 87, color: "var(--green)",  label: "NET" },
    { pct: 31, color: "var(--amber)",  label: "DISK" },
  ];

  const hours = ["6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p"];

  return (
    <div className="flex flex-col gap-5">

      {/* Header bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "14px 18px",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(0,212,255,0.12)",
        borderRadius: 12,
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* scan line */}
        <motion.div
          animate={{ x: ["−100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
          style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 80,
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.06), transparent)",
            pointerEvents: "none",
          }}
        />
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800,
            background: "linear-gradient(135deg, #00d4ff, #7b61ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: 0.5,
          }}>
            RIMT Smart Campus
          </div>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)",
            letterSpacing: 2, marginTop: 2, display: "flex", alignItems: "center", gap: 6,
          }}>
            <PulseDot color="var(--green)" size={5} />
            ADMIN CONTROL CENTER · ALL SYSTEMS NOMINAL
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* live widgets */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { icon: Wifi,   val: "98%",  label: "UPTIME", color: "var(--green)"  },
              { icon: Signal, val: "142",  label: "ONLINE",  color: "var(--cyan)"  },
              { icon: Eye,    val: "23",   label: "ACTIVE",  color: "var(--purple)"},
            ].map((w) => (
              <div key={w.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "6px 10px", borderRadius: 8,
                background: `${w.color}0d`,
                border: `1px solid ${w.color}20`,
                minWidth: 52,
              }}>
                <w.icon style={{ width: 12, height: 12, color: w.color, marginBottom: 2 }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: w.color, lineHeight: 1 }}>
                  {w.val}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 8, color: "var(--text-3)", letterSpacing: 1.2, marginTop: 1 }}>
                  {w.label}
                </span>
              </div>
            ))}
          </div>
          <LiveClock />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          >
            <GlassCard neon className="p-4" style={{
              position: "relative", overflow: "hidden",
              borderColor: `${k.color}22`,
            } as React.CSSProperties}>
              {/* ambient glow bg */}
              <div style={{
                position: "absolute", top: -20, right: -20, width: 80, height: 80,
                borderRadius: "50%", background: `${k.color}0d`,
                pointerEvents: "none",
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${k.color}15`,
                  border: `1px solid ${k.color}30`,
                }}>
                  <k.icon style={{ width: 15, height: 15, color: k.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {k.trend === "up"
                    ? <ArrowUpRight style={{ width: 12, height: 12, color: "var(--green)" }} />
                    : <ArrowDownRight style={{ width: 12, height: 12, color: "var(--amber)" }} />
                  }
                  <span style={{ fontSize: 9, color: k.trend === "up" ? "var(--green)" : "var(--amber)", fontFamily: "var(--font-body)" }}>
                    {k.delta}
                  </span>
                </div>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900,
                color: k.color, lineHeight: 1, marginBottom: 2,
                textShadow: `0 0 24px ${k.color}60`,
              }}>
                {k.value}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)", marginBottom: 8 }}>
                {k.label}
              </div>
              <MiniSparkline data={k.spark} color={k.color} />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* System load rings */}
      <GlassCard neon className="p-5" style={{ borderColor: "rgba(0,212,255,0.1)" } as React.CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--cyan)" }}>
            INFRASTRUCTURE LOAD
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)" }}>
            <Radio style={{ width: 10, height: 10, color: "var(--green)" }} />
            LIVE
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {sysLoad.map((s) => <LoadRing key={s.label} {...s} />)}
        </div>
      </GlassCard>

      {/* Status + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* System status */}
        <GlassCard neon className="p-5">
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, color: "var(--cyan)", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            SYSTEM STATUS
            <span style={{
              fontFamily: "var(--font-body)", fontSize: 9, padding: "2px 8px",
              borderRadius: 20, background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)", color: "var(--cyan)",
            }}>
              6/6 ONLINE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {status.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < status.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${s.color}0f`,
                    border: `1px solid ${s.color}20`,
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
                    padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    background: `${s.color}10`,
                    border: `1px solid ${s.color}25`,
                    color: s.color,
                  }}>
                    {s.state}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Activity feed */}
        <GlassCard neon className="p-5">
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, color: "var(--cyan)", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            LIVE ACTIVITY FEED
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <PulseDot color="var(--green)" size={5} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--green)", letterSpacing: 1 }}>
                STREAMING
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recent.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                  borderBottom: i < recent.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  position: "relative",
                }}
              >
                {/* intensity bar */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 2, borderRadius: 2,
                  background: r.intensity > 0.85
                    ? "var(--red)"
                    : r.intensity > 0.6
                    ? "var(--amber)"
                    : "var(--green)",
                  opacity: r.intensity,
                  boxShadow: `0 0 6px ${r.intensity > 0.85 ? "var(--red)" : r.intensity > 0.6 ? "var(--amber)" : "var(--green)"}`,
                }} />
                <div style={{ paddingLeft: 10, display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.18)",
                    color: "var(--cyan)",
                  }}>
                    {r.user[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>
                      {r.user}
                      <span style={{
                        fontSize: 9, padding: "1px 6px", borderRadius: 20,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--text-3)",
                      }}>
                        {r.dept}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>
                      {r.action}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-3)", flexShrink: 0 }}>
                  {r.time}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Crowd Heatmap */}
      <GlassCard neon className="p-5" style={{ borderColor: "rgba(0,212,255,0.1)" } as React.CSSProperties}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
          letterSpacing: 2, color: "var(--cyan)", marginBottom: 4,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          CROWD DENSITY HEATMAP
          <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--text-3)" }}>
            TODAY · HOURLY
          </span>
        </div>
        {/* hour labels */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingLeft: 66 }}>
          {hours.map((h) => (
            <span key={h} style={{ flex: 1, fontSize: 8, color: "var(--text-3)", fontFamily: "var(--font-body)", textAlign: "center" }}>
              {h}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {heatmap.map((row) => <HeatRow key={row.label} {...row} />)}
        </div>
        {/* legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Low</span>
          {["rgba(0,212,255,0.1)","rgba(0,212,255,0.25)","rgba(0,212,255,0.45)","rgba(0,212,255,0.65)","rgba(0,212,255,0.9)"].map((c, i) => (
            <div key={i} style={{ width: 16, height: 8, borderRadius: 2, background: c }} />
          ))}
          <span style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-body)" }}>High</span>
        </div>
      </GlassCard>

    </div>
  );
}

// ── Route Manager ─────────────────────────────────────
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
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
            color: "var(--amber)", fontFamily: "var(--font-body)",
          }}>
            In Progress
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────
function Settings() {
  const [toggles, setToggles] = useState({
    ai: true, emergency: true, analytics: true, offline: false, voice: true, darkMode: true,
  });
  const toggle = (k: keyof typeof toggles) => setToggles((p) => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "ai",        label: "AI Assistant",       desc: "Enable Claude AI chatbot",          icon: Cpu       },
    { key: "emergency", label: "Emergency Alerts",    desc: "Real-time SOS notifications",       icon: Zap       },
    { key: "analytics", label: "Analytics Tracking",  desc: "Collect navigation usage data",     icon: Activity  },
    { key: "offline",   label: "Offline Mode",        desc: "Cache map data for offline use",    icon: Wifi      },
    { key: "voice",     label: "Voice Navigation",    desc: "Enable voice command navigation",   icon: Radio     },
    { key: "darkMode",  label: "Dark Theme",          desc: "Futuristic dark neon interface",    icon: Eye       },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] font-bold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
        Settings
      </h2>
      <GlassCard neon className="p-5">
        <div className="text-[11px] font-semibold tracking-[1.5px] mb-4" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
          SYSTEM CONFIGURATION
        </div>
        <div className="flex flex-col gap-0">
          {items.map((item, i) => {
            const on = toggles[item.key];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: on ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${on ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.3s ease",
                  }}>
                    <item.icon style={{ width: 14, height: 14, color: on ? "var(--cyan)" : "var(--text-3)" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium" style={{ fontFamily: "var(--font-body)" }}>{item.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>{item.desc}</div>
                  </div>
                </div>
                <motion.button
                  onClick={() => toggle(item.key)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                    background: on ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${on ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                    cursor: "pointer",
                    boxShadow: on ? "0 0 12px rgba(0,212,255,0.2)" : "none",
                    transition: "all 0.25s ease",
                    position: "relative",
                  }}
                >
                  <motion.div
                    animate={{ x: on ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                      position: "absolute", top: 2, width: 18, height: 18,
                      borderRadius: "50%",
                      background: on ? "var(--cyan)" : "rgba(255,255,255,0.3)",
                      boxShadow: on ? "0 0 8px var(--cyan)" : "none",
                    }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────
function Analytics() {
  const metrics = [
    { label: "Navigation Events", value: "2,847", trend: "+12%", up: true,  spark: [180,210,195,230,215,247,232,255,240,258] },
    { label: "Avg Route Time",    value: "4.2m",  trend: "−8%",  up: false, spark: [5.1,4.9,4.8,4.6,4.5,4.3,4.4,4.2,4.3,4.2] },
    { label: "AI Usage",          value: "1,243", trend: "+25%", up: true,  spark: [820,900,870,980,940,1050,1020,1150,1120,1243] },
    { label: "User Retention",    value: "87%",   trend: "+5%",  up: true,  spark: [79,80,81,82,83,84,84,85,86,87] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] font-bold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
        Analytics Dashboard
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard neon className="p-4" style={{ position: "relative", overflow: "hidden" } as React.CSSProperties}>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-body)", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan)", fontFamily: "var(--font-display)", lineHeight: 1 }}>{m.value}</div>
              <div style={{
                fontSize: 10, color: m.up ? "var(--green)" : "var(--amber)",
                fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 3, marginTop: 4, marginBottom: 8,
              }}>
                {m.up ? <ArrowUpRight style={{ width: 10, height: 10 }} /> : <ArrowDownRight style={{ width: 10, height: 10 }} />}
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

// ── Emergency ─────────────────────────────────────────
function EmergencyAdmin() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] font-bold" style={{ color: "var(--red)", fontFamily: "var(--font-display)" }}>
        Emergency Management
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Active SOS Alerts",  value: "0", color: "var(--green)", icon: ShieldCheck   },
          { label: "Emergency Exits",    value: "6", color: "var(--amber)", icon: AlertTriangle },
          { label: "Medical Incidents",  value: "0", color: "var(--green)", icon: Check         },
          { label: "Security Incidents", value: "1", color: "var(--amber)", icon: AlertTriangle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
            <GlassCard neon className="p-5" style={{ borderColor: `${s.color}33` } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${s.color}15`, border: `1px solid ${s.color}30`,
                }}>
                  <s.icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 28, fontWeight: 900, color: s.color,
                    fontFamily: "var(--font-display)", lineHeight: 1,
                    textShadow: `0 0 20px ${s.color}60`,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────
const PANEL_MAP: Record<AdminTab, React.ReactNode> = {
  overview:  <Overview />,
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
    <div
      className="flex bg-grid"
      style={{ height: "100vh",
paddingTop: 95, background: "var(--bg-1)", overflow: "hidden" }}
    >
      <AdminSidebar active={tab} onChange={setTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {PANEL_MAP[tab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}