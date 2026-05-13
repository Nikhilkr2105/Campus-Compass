"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, Building2, DoorOpen,
  Route, BarChart2, Settings, ShieldAlert,
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

const ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "overview",   label: "Overview",   icon: LayoutDashboard },
  { id: "buildings",  label: "Buildings",  icon: Building2       },
  { id: "rooms",      label: "Rooms",      icon: DoorOpen        },
  { id: "routes",     label: "Routes",     icon: Route           },
  { id: "analytics",  label: "Analytics",  icon: BarChart2       },
  { id: "emergency",  label: "Emergency",  icon: ShieldAlert     },
  { id: "settings",   label: "Settings",   icon: Settings        },
];

export function AdminSidebar({ active, onChange }: AdminSidebarProps) {
  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width:       220,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background:  "rgba(2,4,8,0.6)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="text-[10px] font-semibold tracking-[2px]"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
        >
          ADMIN PANEL
        </div>
        <div
          className="text-[13px] font-bold mt-0.5 gradient-text-cyan"
          style={{ fontFamily: "var(--font-display)" }}
        >
          RIMT Navigator
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileHover={{ x: isActive ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] relative"
              style={{
                background: isActive ? "rgba(0,212,255,0.09)" : "transparent",
                border:     `1px solid ${isActive ? "rgba(0,212,255,0.22)" : "transparent"}`,
                color:      isActive ? "var(--cyan)" : "var(--text-2)",
                cursor:     "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: isActive ? 600 : 400,
                transition: "background 0.2s, border-color 0.2s, color 0.2s",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? "var(--cyan)" : "var(--text-3)" }}
              />
              {label}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom user chip */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,rgba(0,212,255,0.18),rgba(139,92,246,0.18))",
              border:     "1.5px solid rgba(0,212,255,0.35)",
              color:      "var(--cyan)",
            }}
          >
            N
          </div>
          <div className="min-w-0">
            <div
              className="text-[12px] font-semibold truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nikhil
            </div>
            <div
              className="text-[10px]"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
            >
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}