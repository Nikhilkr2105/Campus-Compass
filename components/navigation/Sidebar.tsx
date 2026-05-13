"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { RoutePanel } from "@/components/navigation/RoutePanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { Building, NavigationRoute } from "@/types/navigation";

interface SidebarProps {
  selectedBuilding:  Building | null;
  route:             NavigationRoute | null;
  isNavigating:      boolean;
  currentStep:       number;
  onRouteFound:      (r: NavigationRoute) => void;
  onStart:           () => void;
  onStop:            () => void;
  onNext:            () => void;
  onPrev:            () => void;
  onClear:           () => void;
  onCloseBuilding:   () => void;
  onNavigateTo:      (name: string) => void;
}

export function Sidebar({
  selectedBuilding, route, isNavigating, currentStep,
  onRouteFound, onStart, onStop, onNext, onPrev, onClear,
  onCloseBuilding, onNavigateTo,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [destInput, setDestInput] = useState("");

  const handleDestChange = useCallback((name: string) => {
    setDestInput(name);
  }, []);

  return (
    <div className="relative flex h-full">
      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-30 flex items-center justify-center"
        style={{
          background:    "rgba(6,13,24,0.95)",
          border:        "1px solid rgba(0,212,255,0.25)",
          color:         "var(--cyan)",
          cursor:        "pointer",
          backdropFilter:"blur(12px)",
          boxShadow:     "0 0 12px rgba(0,0,0,0.4)",
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />
        }
      </motion.button>

      {/* Sidebar panel */}
      <motion.aside
        animate={{ width: collapsed ? 0 : 320, opacity: collapsed ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col overflow-hidden h-full flex-shrink-0"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {!collapsed && (
          <>
            {/* Header */}
            <div
              className="px-4 py-3.5 flex-shrink-0 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
              </div>
              <span className="text-[13px] font-semibold gradient-text-cyan" style={{ fontFamily: "var(--font-display)" }}>
                Campus Navigator
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full inline-block animate-glow" style={{ background: "var(--green)" }} />
                <span className="text-[10px]" style={{ color: "var(--green)", fontFamily: "var(--font-body)" }}>Live</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">

              {/* Route panel */}
              <RoutePanel
                route={route}
                isNavigating={isNavigating}
                currentStep={currentStep}
                onRouteFound={onRouteFound}
                onStart={onStart}
                onStop={onStop}
                onNext={onNext}
                onPrev={onPrev}
                onClear={onClear}
                onDestChange={handleDestChange}
              />

              {/* Building details */}
              <AnimatePresence>
                {selectedBuilding && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{ opacity: 0, y: 6     }}
                    transition={{ duration: 0.25 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="text-[10px] font-semibold tracking-[1.5px]"
                          style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
                        >
                          SELECTED BUILDING
                        </div>
                        <button
                          onClick={onCloseBuilding}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: `${selectedBuilding.color}15`, border: `1px solid ${selectedBuilding.color}30` }}
                        >
                          {selectedBuilding.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>
                            {selectedBuilding.name}
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5"
                            style={{ background: `${selectedBuilding.color}15`, border: `1px solid ${selectedBuilding.color}30`, color: selectedBuilding.color, fontFamily: "var(--font-body)" }}
                          >
                            {selectedBuilding.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
                        {selectedBuilding.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        {[
                          { label: "Floors", value: selectedBuilding.floors },
                          { label: "Type",   value: selectedBuilding.type   },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg px-3 py-2"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[9px] mb-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                              {String(s.label).toUpperCase()}
                            </div>
                            <div className="text-[12px] font-semibold capitalize">{s.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {selectedBuilding.facilities.slice(0, 4).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-2 py-1 rounded-md"
                            style={{ background: `${selectedBuilding.color}12`, border: `1px solid ${selectedBuilding.color}28`, color: selectedBuilding.color, fontFamily: "var(--font-body)" }}
                          >
                            {f}
                          </span>
                        ))}
                        {selectedBuilding.facilities.length > 4 && (
                          <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                            +{selectedBuilding.facilities.length - 4} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onNavigateTo(selectedBuilding.name)}
                        className="w-full py-2 rounded-xl text-[12px] font-medium transition-all duration-200"
                        style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-body)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.15)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(0,212,255,0.2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        Navigate Here →
                      </button>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}