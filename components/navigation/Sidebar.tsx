"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, ChevronLeft, ChevronRight, Wifi } from "lucide-react";
import { RoutePanel } from "@/components/navigation/RoutePanel";
import { Building } from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";

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

      {/* ── Collapse toggle ── */}
      <motion.button
        onClick={() => setCollapsed((c) => !c)}
        whileHover={{ scale: 1.12, boxShadow: "0 0 20px rgba(0,212,255,0.35)" }}
        whileTap={{ scale: 0.93 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-30 flex items-center justify-center"
        style={{
          background:     "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.12))",
          border:         "1.5px solid rgba(0,212,255,0.4)",
          color:          "var(--cyan)",
          cursor:         "pointer",
          backdropFilter: "blur(16px)",
          boxShadow:      "0 0 16px rgba(0,212,255,0.2), 0 4px 16px rgba(0,0,0,0.4)",
          transition:     "all 0.25s ease",
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />
        }
      </motion.button>

      {/* ── Main panel ── */}
      <motion.aside
        animate={{ width: collapsed ? 0 : 320, opacity: collapsed ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col overflow-hidden h-full flex-shrink-0"
        style={{
          borderRight:    "1px solid rgba(0,212,255,0.12)",
          background:     "linear-gradient(180deg, rgba(6,13,24,0.95) 0%, rgba(2,4,8,0.98) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow:      "4px 0 24px rgba(0,0,0,0.4), inset -1px 0 0 rgba(0,212,255,0.08)",
        }}
      >
        {!collapsed && (
          <>
            {/* ── Header ── */}
            <div
              className="px-5 py-4 flex-shrink-0 flex items-center gap-3"
              style={{
                borderBottom:   "1px solid rgba(0,212,255,0.1)",
                background:     "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(139,92,246,0.03))",
                boxShadow:      "0 1px 0 rgba(0,212,255,0.08)",
              }}
            >
              {/* icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.12))",
                  border:     "1.5px solid rgba(0,212,255,0.35)",
                  boxShadow:  "0 0 14px rgba(0,212,255,0.2)",
                }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-bold leading-tight"
                  style={{
                    fontFamily:           "var(--font-display)",
                    background:           "linear-gradient(90deg, #fff, #00d4ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:  "transparent",
                  }}
                >
                  Campus Navigator
                </div>
                <div className="text-[9px] tracking-[1.5px] mt-0.5" style={{ color: "rgba(0,212,255,0.45)", fontFamily: "var(--font-display)" }}>
                  SMART ROUTING SYSTEM
                </div>
              </div>

              {/* live indicator */}
              <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span className="w-[5px] h-[5px] rounded-full inline-block animate-glow" style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
                <span className="text-[9px] font-semibold" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>LIVE</span>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">

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

              {/* ── Building detail panel ── */}
              <AnimatePresence>
                {selectedBuilding && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{ opacity: 0, y: 8, scale: 0.98     }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background:     `linear-gradient(135deg, ${selectedBuilding.color}0a, rgba(255,255,255,0.03))`,
                        border:         `1px solid ${selectedBuilding.color}33`,
                        backdropFilter: "blur(20px)",
                        boxShadow:      `0 0 24px ${selectedBuilding.color}12, inset 0 0 20px ${selectedBuilding.color}06`,
                      }}
                    >
                      {/* panel header */}
                      <div
                        className="px-4 pt-4 pb-3 flex items-start justify-between"
                        style={{ borderBottom: `1px solid ${selectedBuilding.color}20` }}
                      >
                        <div
                          className="text-[9px] font-semibold tracking-[2px]"
                          style={{ color: selectedBuilding.color, fontFamily: "var(--font-display)", opacity: 0.8 }}
                        >
                          SELECTED BUILDING
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={onCloseBuilding}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                          transition={{ duration: 0.15 }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                      {/* building identity */}
                      <div className="px-4 py-3.5">
                        <div className="flex items-center gap-3 mb-3.5">
                          <motion.div
                            animate={{ boxShadow: [`0 0 10px ${selectedBuilding.color}44`, `0 0 20px ${selectedBuilding.color}66`, `0 0 10px ${selectedBuilding.color}44`] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${selectedBuilding.color}22, ${selectedBuilding.color}0a)`,
                              border:     `1.5px solid ${selectedBuilding.color}44`,
                            }}
                          >
                            {selectedBuilding.icon}
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-[13px] font-semibold truncate mb-1"
                              style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                            >
                              {selectedBuilding.name}
                            </div>
                            <span
                              className="text-[10px] px-2.5 py-0.5 rounded-full inline-block"
                              style={{
                                background: `${selectedBuilding.color}18`,
                                border:     `1px solid ${selectedBuilding.color}35`,
                                color:       selectedBuilding.color,
                                fontFamily: "var(--font-body)",
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            >
                              {selectedBuilding.type}
                            </span>
                          </div>
                        </div>

                        {/* description */}
                        <p
                          className="text-[12px] leading-relaxed mb-3.5"
                          style={{ color: "rgba(240,244,255,0.52)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                        >
                          {selectedBuilding.description}
                        </p>

                        {/* stats chips */}
                        <div className="grid grid-cols-2 gap-2 mb-3.5">
                          {[
                            { label: "FLOORS", value: selectedBuilding.floors },
                            { label: "TYPE",   value: selectedBuilding.type   },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl px-3 py-2.5"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border:     "1px solid rgba(255,255,255,0.07)",
                              }}
                            >
                              <div
                                className="text-[8.5px] mb-1 tracking-[1px]"
                                style={{ color: "rgba(240,244,255,0.3)", fontFamily: "var(--font-display)" }}
                              >
                                {String(s.label)}
                              </div>
                              <div
                                className="text-[13px] font-semibold capitalize"
                                style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                              >
                                {s.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* facilities */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {selectedBuilding.facilities.slice(0, 4).map((f) => (
                            <span
                              key={f}
                              className="text-[10px] px-2.5 py-1 rounded-lg"
                              style={{
                                background: `${selectedBuilding.color}10`,
                                border:     `1px solid ${selectedBuilding.color}25`,
                                color:       selectedBuilding.color,
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {f}
                            </span>
                          ))}
                          {selectedBuilding.facilities.length > 4 && (
                            <span
                              className="text-[10px] px-2.5 py-1 rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border:     "1px solid rgba(255,255,255,0.08)",
                                color:      "var(--text-3)",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              +{selectedBuilding.facilities.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* navigate button */}
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,212,255,0.25)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onNavigateTo(selectedBuilding.name)}
                          className="w-full py-2.5 rounded-xl text-[12px] font-semibold"
                          style={{
                            background:  "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.07))",
                            border:      "1px solid rgba(0,212,255,0.35)",
                            color:       "var(--cyan)",
                            cursor:      "pointer",
                            fontFamily:  "var(--font-body)",
                            boxShadow:   "0 0 12px rgba(0,212,255,0.1)",
                            transition:  "all 0.25s ease",
                          }}
                        >
                          Navigate Here →
                        </motion.button>
                      </div>
                    </div>
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