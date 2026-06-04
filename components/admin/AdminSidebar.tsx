"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, Building2, DoorOpen,
  Route, BarChart2, Settings, ShieldAlert,
  ChevronRight,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "buildings"
  | "rooms"
  | "routes"
  | "analytics"
  | "emergency"
  | "settings";

interface AdminSidebarProps {
  active:   AdminTab;
  onChange: (t: AdminTab) => void;
}

/* ── Nav structure ───────────────────────────────────────── */
const GROUPS: {
  label:  string;
  items:  { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[];
}[] = [
  {
    label: "Overview",
    items: [
      { id: "overview",  label: "Dashboard",  icon: LayoutDashboard },
      { id: "analytics", label: "Analytics",  icon: BarChart2       },
    ],
  },
  {
    label: "Campus Data",
    items: [
      { id: "buildings", label: "Buildings",  icon: Building2 },
      { id: "rooms",     label: "Rooms",      icon: DoorOpen  },
      { id: "routes",    label: "Routes",     icon: Route     },
    ],
  },
  {
    label: "System",
    items: [
      { id: "emergency", label: "Emergency",  icon: ShieldAlert, badge: "1" },
      { id: "settings",  label: "Settings",   icon: Settings               },
    ],
  },
];

export function AdminSidebar({ active, onChange }: AdminSidebarProps) {
  return (
    <aside
      className="flex w-full flex-shrink-0 flex-col border-b lg:h-full lg:w-56 lg:border-b-0 lg:border-r"
      style={{
        background:  "#ffffff",
        borderColor: "#e2e8f0",
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-4 py-3 flex-shrink-0 lg:px-5 lg:py-5"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              boxShadow:  "0 2px 8px rgba(14,165,233,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div
              className="text-[13px] font-bold leading-tight"
              style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)" }}
            >
              Campus Compass
            </div>
            <div
              className="text-[10px]"
              style={{ color: "#94a3b8", letterSpacing: "0.5px" }}
            >
              Admin Console
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="no-scrollbar flex gap-3 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:gap-5 lg:overflow-x-hidden lg:overflow-y-auto lg:py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="flex-shrink-0 lg:flex-shrink">
            {/* Group label */}
            <div
              className="px-2 mb-1.5 text-[10px] font-semibold tracking-[1.2px] uppercase"
              style={{ color: "#cbd5e1" }}
            >
              {group.label}
            </div>

            {/* Items */}
            <div className="flex gap-1 lg:flex-col lg:gap-0.5">
              {group.items.map(({ id, label, icon: Icon, badge }) => {
                const isActive = active === id;
                return (
                  <motion.button
                    key={id}
                    onClick={() => onChange(id)}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex min-h-10 w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors duration-150"
                    style={{
                      background: isActive ? "#f0f9ff" : "transparent",
                      color:      isActive ? "#0284c7" : "#475569",
                      fontWeight: isActive ? 600 : 400,
                      cursor:     "pointer",
                      border:     "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="admin-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                        style={{
                          width:      3,
                          height:     20,
                          background: "#0ea5e9",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? "#0ea5e9" : "#94a3b8" }}
                    />

                    <span className="flex-1 min-w-0 truncate" style={{ fontFamily: "inherit" }}>
                      {label}
                    </span>

                    {/* Notification badge */}
                    {badge && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                        style={{
                          background: "#fef2f2",
                          color:      "#ef4444",
                          border:     "1px solid #fecaca",
                        }}
                      >
                        {badge}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "#0ea5e9", opacity: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Campus status pill ── */}
      <div
        className="mx-3 mb-3 hidden items-center gap-2 rounded-lg px-3 py-2.5 lg:flex"
        style={{
          background: "#f0fdf4",
          border:     "1px solid #bbf7d0",
        }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: "#22c55e",
            boxShadow:  "0 0 0 3px rgba(34,197,94,0.2)",
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold" style={{ color: "#15803d" }}>
            All systems operational
          </div>
          <div className="text-[10px]" style={{ color: "#86efac" }}>
            6 / 6 services online
          </div>
        </div>
      </div>

      {/* ── User chip ── */}
      <div
        className="hidden px-4 py-4 flex-shrink-0 lg:block"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
            style={{
              background: "#eff6ff",
              border:     "1.5px solid #bfdbfe",
              color:      "#2563eb",
            }}
          >
            N
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[12px] font-semibold truncate"
              style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)" }}
            >
              Nikhil
            </div>
            <div className="text-[10px]" style={{ color: "#94a3b8" }}>
              Super Admin
            </div>
          </div>
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#22c55e" }}
          />
        </div>
      </div>
    </aside>
  );
}
