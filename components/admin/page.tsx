"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { BuildingForm } from "@/components/admin/BuildingForm";
import { RoomForm } from "@/components/admin/RoomForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { BUILDINGS } from "@/data/buildings";
import {
  Building2, DoorOpen, Route,
  Users, TrendingUp, ShieldCheck,
  Check, AlertTriangle, Activity,
} from "lucide-react";

// ── Overview panel ────────────────────────────────────
function Overview() {
  const kpis = [
    { label: "Buildings",    value: BUILDINGS.length,  icon: Building2,   color: "var(--cyan)"   },
    { label: "Total Rooms",  value: 67,                icon: DoorOpen,    color: "var(--purple)" },
    { label: "Active Routes",value: 32,                icon: Route,       color: "var(--green)"  },
    { label: "Daily Users",  value: 342,               icon: Users,       color: "var(--amber)"  },
  ];

  const status = [
    { label: "Navigation Engine",  state: "Operational",   color: "var(--green)", icon: Check           },
    { label: "AI Assistant",       state: "Active",        color: "var(--green)", icon: Check           },
    { label: "Indoor Routing",     state: "Active",        color: "var(--green)", icon: Check           },
    { label: "Emergency System",   state: "Armed",         color: "var(--amber)", icon: ShieldCheck     },
    { label: "Analytics Engine",   state: "Running",       color: "var(--cyan)",  icon: Activity        },
    { label: "Map Data Sync",      state: "Up to Date",    color: "var(--green)", icon: TrendingUp      },
  ];

  const recent = [
    { user: "Arjun Sharma",   action: "Navigated Gate → Block A",  time: "2 min ago",  dept: "CSE"   },
    { user: "Priya Singh",    action: "Searched: Medical Room",     time: "5 min ago",  dept: "ECE"   },
    { user: "Rohit Kumar",    action: "Route: Hostel → Canteen",    time: "9 min ago",  dept: "Mech"  },
    { user: "Anjali Verma",   action: "Floor Nav: Block A F1→F3",   time: "12 min ago", dept: "IT"    },
    { user: "Deepak Nair",    action: "Emergency SOS triggered",    time: "18 min ago", dept: "Civil" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          className="text-[20px] font-bold gradient-text-cyan"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard Overview
        </h2>
        <p
          className="text-[12px] mt-0.5"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
        >
          RIMT Smart Campus Navigator — Admin Console
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * 0.07 }}
          >
            <GlassCard neon className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${k.color}15`, border: `1px solid ${k.color}30` }}
                >
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
              </div>
              <div
                className="text-[28px] font-black leading-none mb-1"
                style={{ color: k.color, fontFamily: "var(--font-display)" }}
              >
                {k.value}
              </div>
              <div
                className="text-[11px]"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
              >
                {k.label}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System status */}
        <GlassCard neon className="p-5">
          <div
            className="text-[11px] font-semibold tracking-[1.5px] mb-4"
            style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
          >
            SYSTEM STATUS
          </div>
          <div className="flex flex-col gap-0">
            {status.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < status.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div className="flex items-center gap-2.5">
                  <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                  >
                    {s.label}
                  </span>
                </div>
                <span
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: `${s.color}12`,
                    border:     `1px solid ${s.color}30`,
                    color:       s.color,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span
                    className="w-[4px] h-[4px] rounded-full inline-block animate-glow"
                    style={{ background: s.color }}
                  />
                  {s.state}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent activity */}
        <GlassCard neon className="p-5">
          <div
            className="text-[11px] font-semibold tracking-[1.5px] mb-4"
            style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
          >
            RECENT ACTIVITY
          </div>
          <div className="flex flex-col gap-0">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: i < recent.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: "rgba(0,212,255,0.1)",
                    border:     "1px solid rgba(0,212,255,0.2)",
                    color:      "var(--cyan)",
                  }}
                >
                  {r.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[12px] font-medium truncate"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {r.user}
                    <span
                      className="ml-1.5 text-[10px] font-normal"
                      style={{ color: "var(--text-3)" }}
                    >
                      {r.dept}
                    </span>
                  </div>
                  <div
                    className="text-[11px] truncate"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    {r.action}
                  </div>
                </div>
                <div
                  className="text-[10px] flex-shrink-0"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  {r.time}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Routes manager ────────────────────────────────────
function RouteManager() {
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-[20px] font-bold gradient-text-cyan"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Route Management
      </h2>
      <GlassCard neon className="p-5">
        <div className="flex items-center justify-center py-12 flex-col gap-3">
          <Route className="w-10 h-10" style={{ color: "var(--text-3)" }} />
          <div
            className="text-[13px]"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            Route editor coming in next release
          </div>
          <span
            className="px-3 py-1 rounded-full text-[10px]"
            style={{
              background: "rgba(245,158,11,0.1)",
              border:     "1px solid rgba(245,158,11,0.2)",
              color:      "var(--amber)",
              fontFamily: "var(--font-body)",
            }}
          >
            In Progress
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Settings panel ────────────────────────────────────
function Settings() {
  const [toggles, setToggles] = useState({
    ai:        true,
    emergency: true,
    analytics: true,
    offline:   false,
    voice:     true,
    darkMode:  true,
  });

  const toggle = (k: keyof typeof toggles) =>
    setToggles((p) => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "ai",        label: "AI Assistant",       desc: "Enable Claude AI chatbot"          },
    { key: "emergency", label: "Emergency Alerts",    desc: "Real-time SOS notifications"       },
    { key: "analytics", label: "Analytics Tracking",  desc: "Collect navigation usage data"     },
    { key: "offline",   label: "Offline Mode",        desc: "Cache map data for offline use"    },
    { key: "voice",     label: "Voice Navigation",    desc: "Enable voice command navigation"   },
    { key: "darkMode",  label: "Dark Theme",          desc: "Futuristic dark neon interface"    },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-[20px] font-bold gradient-text-cyan"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Settings
      </h2>
      <GlassCard neon className="p-5">
        <div
          className="text-[11px] font-semibold tracking-[1.5px] mb-4"
          style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
        >
          SYSTEM CONFIGURATION
        </div>
        <div className="flex flex-col gap-0">
          {items.map((item, i) => {
            const on = toggles[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div>
                  <div
                    className="text-[13px] font-medium"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    {item.desc}
                  </div>
                </div>
                {/* Toggle */}
                <motion.button
                  onClick={() => toggle(item.key)}
                  className="relative flex-shrink-0"
                  style={{
                    width:     44,
                    height:    24,
                    borderRadius: 12,
                    background: on ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.06)",
                    border:    `1px solid ${on ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                    cursor:    "pointer",
                    boxShadow: on ? "0 0 12px rgba(0,212,255,0.2)" : "none",
                    transition:"all 0.25s ease",
                  }}
                >
                  <motion.div
                    animate={{ x: on ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                      position:  "absolute",
                      top:       2,
                      width:     18,
                      height:    18,
                      borderRadius: "50%",
                      background: on ? "var(--cyan)" : "rgba(255,255,255,0.3)",
                      boxShadow: on ? "0 0 8px var(--cyan)" : "none",
                    }}
                  />
                </motion.button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Analytics panel ──────────────────────────────────
function Analytics() {
  const metrics = [
    { label: "Navigation Events",    value: "2,847",   trend: "+12%"  },
    { label: "Avg Route Time",       value: "4.2m",    trend: "-8%"   },
    { label: "AI Assistant Usage",   value: "1,243",   trend: "+25%"  },
    { label: "User Retention",       value: "87%",     trend: "+5%"   },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-[20px] font-bold gradient-text-cyan"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Analytics Dashboard
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlassCard neon className="p-4">
              <div className="text-[12px] mb-2" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                {m.label}
              </div>
              <div className="text-[24px] font-bold mb-1" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
                {m.value}
              </div>
              <div className="text-[11px]" style={{ color: "var(--green)", fontFamily: "var(--font-body)" }}>
                {m.trend}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Emergency admin ───────────────────────────────────
function EmergencyAdmin() {
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-[20px] font-bold"
        style={{ color: "var(--red)", fontFamily: "var(--font-display)" }}
      >
        Emergency Management
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Active SOS Alerts",   value: "0",   color: "var(--green)", icon: ShieldCheck  },
          { label: "Emergency Exits",     value: "6",   color: "var(--amber)", icon: AlertTriangle},
          { label: "Medical Incidents",   value: "0",   color: "var(--green)", icon: Check        },
          { label: "Security Incidents",  value: "1",   color: "var(--amber)", icon: AlertTriangle},
        ].map((s) => (
          <GlassCard
            key={s.label}
            neon
            className="p-5"
            style={{ borderColor: `${s.color}33` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div
                  className="text-[24px] font-black leading-none"
                  style={{ color: s.color, fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          </GlassCard>
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
      style={{
        height:     "calc(100vh - 95px)",
        background: "var(--bg-1)",
        overflow:   "hidden",
      }}
    >
      <AdminSidebar active={tab} onChange={setTab} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0, y: -6    }}
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