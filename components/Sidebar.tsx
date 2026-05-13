"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Layers } from "lucide-react";
import { RoutePanel } from "@/components/RoutePanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { Building, NavigationRoute } from "@/types/navigation";
import { BUILDINGS } from "@/data/buildings";

interface SidebarProps {
  source:          string;
  destination:     string;
  route:           NavigationRoute | null;
  isNavigating:    boolean;
  currentStep:     number;
  selectedBuilding:Building | null;
  onSourceChange:  (v: string) => void;
  onDestChange:    (v: string) => void;
  onFindRoute:     () => void;
  onSwap:          () => void;
  onStart:         () => void;
  onStop:          () => void;
  onNext:          () => void;
  onPrev:          () => void;
  onClear:         () => void;
  onCloseBuilding: () => void;
  onNavigateTo:    (name: string) => void;
}

export function Sidebar({
  source, destination, route, isNavigating, currentStep,
  selectedBuilding, onSourceChange, onDestChange,
  onFindRoute, onSwap, onStart, onStop, onNext, onPrev, onClear,
  onCloseBuilding, onNavigateTo,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{ width: 320, flexShrink: 0 }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <Layers className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
          </div>
          <span
            className="text-[13px] font-semibold gradient-text-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Campus Navigator
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">

        {/* Route planner */}
        <RoutePanel
          source={source}
          destination={destination}
          route={route}
          isNavigating={isNavigating}
          currentStep={currentStep}
          onSourceChange={onSourceChange}
          onDestChange={onDestChange}
          onFindRoute={onFindRoute}
          onSwap={onSwap}
          onStart={onStart}
          onStop={onStop}
          onNext={onNext}
          onPrev={onPrev}
          onClear={onClear}
        />

        {/* Building details panel */}
        <AnimatePresence>
          {selectedBuilding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0, y: 6     }}
              transition={{ duration: 0.25 }}
            >
              <GlassCard className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-[10px] font-semibold tracking-[1.5px]"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>
                    BUILDING INFO
                  </div>
                  <button
                    onClick={onCloseBuilding}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Identity */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `${selectedBuilding.color}15`,
                      border:     `1px solid ${selectedBuilding.color}30`,
                    }}
                  >
                    {selectedBuilding.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {selectedBuilding.name}
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5"
                      style={{
                        background: `${selectedBuilding.color}15`,
                        border:     `1px solid ${selectedBuilding.color}30`,
                        color:       selectedBuilding.color,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {selectedBuilding.type}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12px] leading-relaxed mb-3"
                  style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
                  {selectedBuilding.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Floors", value: selectedBuilding.floors },
                    { label: "Type",   value: selectedBuilding.type   },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg p-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="text-[9px] mb-1" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                        {s.label.toUpperCase()}
                      </div>
                      <div className="text-[12px] font-semibold capitalize">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Facilities */}
                <div className="mb-3.5">
                  <div className="text-[9px] mb-2" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    FACILITIES
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuilding.facilities.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-1 rounded-md"
                        style={{
                          background: `${selectedBuilding.color}12`,
                          border:     `1px solid ${selectedBuilding.color}28`,
                          color:       selectedBuilding.color,
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Navigate CTA */}
                <button
                  onClick={() => onNavigateTo(selectedBuilding.name)}
                  className="w-full py-2 rounded-xl text-[12px] font-medium transition-all duration-200"
                  style={{
                    background: "rgba(0,212,255,0.08)",
                    border:     "1px solid rgba(0,212,255,0.25)",
                    color:      "var(--cyan)",
                    cursor:     "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background  = "rgba(0,212,255,0.15)";
                    e.currentTarget.style.boxShadow   = "0 0 16px rgba(0,212,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background  = "rgba(0,212,255,0.08)";
                    e.currentTarget.style.boxShadow   = "none";
                  }}
                >
                  Navigate Here →
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}