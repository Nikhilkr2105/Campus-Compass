"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation, ArrowUpDown, X,
  ChevronLeft, ChevronRight, StopCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { SmartSearch } from "@/components/SmartSearch";
import { SEARCH_TERMS } from "@/data/buildings";
import { Building, NavigationRoute } from "@/types/navigation";
import { distToMinutes } from "@/lib/dijkstra";

interface RoutePanelProps {
  source:          string;
  destination:     string;
  route:           NavigationRoute | null;
  isNavigating:    boolean;
  currentStep:     number;
  onSourceChange:  (v: string) => void;
  onDestChange:    (v: string) => void;
  onFindRoute:     () => void;
  onSwap:          () => void;
  onStart:         () => void;
  onStop:          () => void;
  onNext:          () => void;
  onPrev:          () => void;
  onClear:         () => void;
}

export function RoutePanel({
  source, destination, route, isNavigating,
  currentStep, onSourceChange, onDestChange,
  onFindRoute, onSwap, onStart, onStop,
  onNext, onPrev, onClear,
}: RoutePanelProps) {
  return (
    <div className="flex flex-col gap-3">

      {/* ── Search inputs ── */}
      <GlassCard neon className="p-4">
        <div
          className="text-[10px] font-semibold tracking-[1.5px] mb-3.5"
          style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
        >
          ROUTE PLANNER
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Source */}
          <div>
            <div className="text-[10px] mb-1.5 px-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
              FROM
            </div>
            <SmartSearch
              value={source}
              onChange={onSourceChange}
              suggestions={SEARCH_TERMS}
              placeholder="Start point..."
            />
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSwap}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0,212,255,0.08)",
                border:     "1px solid rgba(0,212,255,0.2)",
                color:      "var(--cyan)",
                cursor:     "pointer",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <ArrowUpDown className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Destination */}
          <div>
            <div className="text-[10px] mb-1.5 px-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
              TO
            </div>
            <SmartSearch
              value={destination}
              onChange={onDestChange}
              suggestions={SEARCH_TERMS}
              placeholder="Destination..."
            />
          </div>

          <NeonButton
            color="cyan"
            size="sm"
            fullWidth
            icon={<Navigation className="w-3.5 h-3.5" />}
            onClick={onFindRoute}
            disabled={!source || !destination}
          >
            Find Route
          </NeonButton>
        </div>
      </GlassCard>

      {/* ── Quick destinations ── */}
      <GlassCard className="p-4">
        <div className="text-[10px] font-semibold tracking-[1.5px] mb-3" style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>
          QUICK NAVIGATE
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Library",       icon: "📚" },
            { name: "Canteen",       icon: "🍽️" },
            { name: "Medical Center",icon: "🏥" },
            { name: "Admin Block",   icon: "🏢" },
            { name: "Sports Complex",icon: "⚽" },
            { name: "Seminar Hall",  icon: "🎓" },
          ].map((q) => (
            <motion.button
              key={q.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDestChange(q.name)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-left transition-colors"
              style={{
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.07)",
                color:      "var(--text-2)",
                fontFamily: "var(--font-body)",
                cursor:     "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background   = "rgba(0,212,255,0.07)";
                e.currentTarget.style.borderColor  = "rgba(0,212,255,0.25)";
                e.currentTarget.style.color        = "var(--text-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background   = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor  = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color        = "var(--text-2)";
              }}
            >
              <span>{q.icon}</span>
              <span className="truncate">{q.name}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* ── Route result ── */}
      <AnimatePresence>
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <GlassCard neon className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}>
                  ROUTE FOUND
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)" }}
                  >
                    <span className="w-[4px] h-[4px] rounded-full inline-block animate-glow" style={{ background: "var(--green)" }} />
                    ~{distToMinutes(route.totalDistance)} min
                  </span>
                  <button
                    onClick={onClear}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col mb-3.5">
                {route.buildings.map((b, i) => {
                  const isActive  = isNavigating && i === currentStep;
                  const isPast    = isNavigating && i < currentStep;
                  const isStart   = i === 0;
                  const isEnd     = i === route.buildings.length - 1;

                  return (
                    <div key={b.id} className="flex items-start gap-2.5">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                          style={{
                            background: isActive
                              ? "rgba(0,212,255,0.25)"
                              : isPast
                              ? "rgba(16,185,129,0.15)"
                              : isStart
                              ? "rgba(0,212,255,0.12)"
                              : isEnd
                              ? "rgba(139,92,246,0.12)"
                              : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${
                              isActive ? "var(--cyan)"
                              : isPast  ? "var(--green)"
                              : isStart ? "rgba(0,212,255,0.5)"
                              : isEnd   ? "rgba(139,92,246,0.5)"
                              : "rgba(255,255,255,0.12)"
                            }`,
                            boxShadow: isActive ? "0 0 10px rgba(0,212,255,0.4)" : "none",
                            color: isActive
                              ? "var(--cyan)"
                              : isPast
                              ? "var(--green)"
                              : "var(--text-3)",
                          }}
                        >
                          {isPast ? "✓" : i + 1}
                        </div>
                        {i < route.buildings.length - 1 && (
                          <div
                            className="w-px transition-all duration-500"
                            style={{
                              height: 20,
                              background: isPast
                                ? "rgba(16,185,129,0.4)"
                                : "rgba(255,255,255,0.08)",
                              marginTop: 2,
                              marginBottom: 2,
                            }}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-0.5 pb-1 min-w-0">
                        <div
                          className="text-[12px] truncate transition-all duration-200"
                          style={{
                            fontWeight: isActive ? 600 : 400,
                            color:      isActive ? "var(--text-1)" : isPast ? "var(--text-3)" : "var(--text-2)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {b.name}
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px]"
                            style={{ color: "var(--cyan)", fontFamily: "var(--font-body)" }}
                          >
                            You are here
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              {!isNavigating ? (
                <NeonButton color="cyan" size="sm" fullWidth icon={<Navigation className="w-3.5 h-3.5" />} onClick={onStart}>
                  Start Navigation
                </NeonButton>
              ) : (
                <div className="flex gap-2">
                  <NeonButton color="purple" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />} onClick={onPrev}>
                    Prev
                  </NeonButton>
                  <NeonButton color="cyan" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />} iconPosition="right" onClick={onNext}>
                    Next
                  </NeonButton>
                  <NeonButton color="red" size="sm" icon={<StopCircle className="w-3.5 h-3.5" />} onClick={onStop} />
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}