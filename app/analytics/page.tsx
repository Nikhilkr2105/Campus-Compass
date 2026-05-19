"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  KPICards,
  TopLocations,
  PopularRoutes,
} from "@/components/navigation/AnalyticsCards";
import {
  TrafficChart,
  BuildingSparklines,
} from "@/components/navigation/TrafficChart";

/* ════════════════════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════════════════════ */

function useClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

function useMouseParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 25 });
  const springY = useSpring(y, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * 24);
      y.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return { x: springX, y: springY };
}

function useLiveCounter(base: number, variance = 3, interval = 4000) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(base + Math.floor((Math.random() - 0.5) * variance * 2));
    }, interval);
    return () => clearInterval(id);
  }, [base, variance, interval]);
  return value;
}

/* ════════════════════════════════════════════════════════════════
   AMBIENT BACKGROUND — single purposeful gradient, not orb spam
════════════════════════════════════════════════════════════════ */

function AmbientBackground({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const bgX = useTransform(mouseX, (v) => `${50 + v * 0.3}%`);
  const bgY = useTransform(mouseY, (v) => `${30 + v * 0.2}%`);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0" style={{ background: "#080c14" }} />

      {/* Primary depth gradient — reacts to mouse */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${bgX} ${bgY}, rgba(14,165,233,0.055) 0%, transparent 65%)`,
        }}
      />

      {/* Secondary accent — upper right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 85% 5%, rgba(139,92,246,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Floor glow — bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 30% at 50% 100%, rgba(14,165,233,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Subtle dot grid — crisp, not blurred */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Horizontal light streak — top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.15) 30%, rgba(139,92,246,0.12) 70%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(4,6,10,0.7) 100%)",
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SURFACE SYSTEM — 3 distinct levels, not uniform glass
════════════════════════════════════════════════════════════════ */

// Level 1: Primary content surface
function Surface({
  children,
  className = "",
  delay = 0,
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  accent?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.06)"}`,
        transition: "border-color 0.4s ease",
      }}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edge accent line */}
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(14,165,233,0.5), rgba(139,92,246,0.3), transparent)",
          }}
        />
      )}
      {/* Hover ambient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 70%)",
        }}
      />
      {children}
    </motion.div>
  );
}

// Level 2: Inset panel (inside a Surface)
function InsetPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

// Level 3: Floating command element (header bar)
function CommandSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LIVE INDICATOR
════════════════════════════════════════════════════════════════ */

function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-[7px] w-[7px]">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{ background: "#22c55e" }}
          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <span
          className="relative inline-flex rounded-full h-[7px] w-[7px]"
          style={{ background: "#22c55e" }}
        />
      </span>
      <span
        className="text-[10px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "#22c55e", fontFamily: "var(--font-display)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMMAND HEADER
════════════════════════════════════════════════════════════════ */

function CommandHeader({ time, date }: { time: string; date: string }) {
  const activeNodes = useLiveCounter(24, 2, 5000);
  const sessions = useLiveCounter(847, 15, 3500);

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <CommandSurface>
        <div className="px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            {/* Left: identity */}
            <div className="flex items-center gap-5">
              {/* Icon mark */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(14,165,233,0.9)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(14,165,233,0.15), transparent 70%)",
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>

              {/* Title block */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1
                    className="text-[22px] font-bold tracking-tight leading-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "rgba(255,255,255,0.95)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Analytics
                  </h1>
                  <span
                    className="text-[22px] font-light leading-none"
                    style={{
                      color: "rgba(255,255,255,0.15)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    /
                  </span>
                  <span
                    className="text-[22px] font-bold tracking-tight leading-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      background:
                        "linear-gradient(90deg, rgba(14,165,233,0.9), rgba(139,92,246,0.8))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Intelligence Center
                  </span>
                </div>
                <p
                  className="text-[12px] leading-none"
                  style={{
                    color: "rgba(148,163,184,0.7)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.01em",
                  }}
                >
                  RIMT University · Campus Navigation System
                </p>
              </div>
            </div>

            {/* Right: live metrics + clock */}
            <div className="flex items-center gap-4">
              {/* Live counters */}
              <div className="hidden lg:flex items-center gap-3">
                <AnimatedStatPill
                  label="Active Nodes"
                  value={activeNodes}
                  color="rgba(14,165,233,0.9)"
                />
                <div
                  className="w-px h-8"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <AnimatedStatPill
                  label="Sessions Today"
                  value={sessions}
                  color="rgba(139,92,246,0.9)"
                />
                <div
                  className="w-px h-8"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>

              {/* Live badge */}
              <LiveBadge label="Live Feed" />

              {/* Divider */}
              <div
                className="hidden sm:block w-px h-8"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />

              {/* Clock */}
              <div className="hidden sm:block text-right">
                <motion.div
                  className="text-[20px] font-bold tabular-nums leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.04em",
                  }}
                  key={time}
                >
                  {time || "──:──:──"}
                </motion.div>
                <div
                  className="text-[10px] mt-1 leading-none"
                  style={{
                    color: "rgba(148,163,184,0.5)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {date.split(",")[0]?.toUpperCase() || ""}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div
            className="mt-5 pt-4 flex flex-wrap items-center gap-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            {[
              {
                icon: (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                label: "Updated",
                value: "Every 30 seconds",
              },
              {
                icon: (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                label: "Period",
                value: "Last 7 days",
              },
              {
                icon: (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                label: "Coverage",
                value: "Full campus",
              },
              {
                icon: (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                label: "System",
                value: "Nominal",
                highlight: true,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  style={{
                    color: item.highlight
                      ? "rgba(34,197,94,0.7)"
                      : "rgba(100,116,139,0.7)",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[11px]"
                  style={{
                    color: "rgba(100,116,139,0.8)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: item.highlight
                      ? "rgba(34,197,94,0.9)"
                      : "rgba(203,213,225,0.7)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CommandSurface>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ANIMATED STAT PILL
════════════════════════════════════════════════════════════════ */

function AnimatedStatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(0);

  useEffect(() => {
    setDir(value > prev ? 1 : value < prev ? -1 : 0);
    setPrev(value);
  }, [value]);

  return (
    <div className="text-center">
      <div className="flex items-center gap-1.5 justify-center">
        <motion.span
          key={value}
          className="text-[17px] font-bold tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            color,
          }}
          initial={{ y: dir * -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {value.toLocaleString()}
        </motion.span>
        {dir !== 0 && (
          <motion.span
            className="text-[10px]"
            style={{ color: dir > 0 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {dir > 0 ? "↑" : "↓"}
          </motion.span>
        )}
      </div>
      <div
        className="text-[9px] tracking-wider uppercase mt-0.5"
        style={{
          color: "rgba(100,116,139,0.7)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECTION HEADER — clean, minimal, purposeful
════════════════════════════════════════════════════════════════ */

function SectionHeader({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-[3px] h-4 rounded-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,165,233,0.9), rgba(139,92,246,0.6))",
            }}
          />
          <h2
            className="text-[13px] font-semibold tracking-wide"
            style={{
              color: "rgba(203,213,225,0.9)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </h2>
        </div>
        {description && (
          <p
            className="text-[11px] ml-[19px]"
            style={{
              color: "rgba(100,116,139,0.8)",
              fontFamily: "var(--font-body)",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            color: "rgba(14,165,233,0.8)",
            background: "rgba(14,165,233,0.07)",
            border: "1px solid rgba(14,165,233,0.12)",
            fontFamily: "var(--font-body)",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPERATIONAL RIBBON — bottom system status
════════════════════════════════════════════════════════════════ */

function OperationalRibbon() {
  const uptime = useLiveCounter(9998, 1, 8000);

  const systems = [
    { name: "Navigation Engine", status: "operational", latency: "12ms" },
    { name: "Sensor Grid", status: "operational", latency: "8ms" },
    { name: "Data Pipeline", status: "operational", latency: "34ms" },
    { name: "Analytics API", status: "operational", latency: "21ms" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <Surface accent className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* System health list */}
            <div className="flex flex-wrap items-center gap-5">
              {systems.map((sys, i) => (
                <motion.div
                  key={sys.name}
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + i * 0.06 }}
                >
                  <span className="relative flex h-[6px] w-[6px]">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full"
                      style={{ background: "#22c55e" }}
                      animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-[6px] w-[6px]"
                      style={{ background: "#22c55e" }}
                    />
                  </span>
                  <span
                    className="text-[11px]"
                    style={{
                      color: "rgba(148,163,184,0.7)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {sys.name}
                  </span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      color: "rgba(100,116,139,0.8)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {sys.latency}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Right: uptime */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div
                  className="text-[10px] uppercase tracking-widest mb-0.5"
                  style={{
                    color: "rgba(100,116,139,0.6)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Uptime
                </div>
                <div
                  className="text-[13px] font-bold tabular-nums"
                  style={{
                    color: "rgba(34,197,94,0.9)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {(uptime / 100).toFixed(2)}%
                </div>
              </div>

              <div
                className="w-px h-8"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />

              <LiveBadge label="All Systems Nominal" />
            </div>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE SKELETON LOADER
════════════════════════════════════════════════════════════════ */

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.04)" }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   STAGGER WRAPPER
════════════════════════════════════════════════════════════════ */

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  const { time, date } = useClock();
  const { x: mouseX, y: mouseY } = useMouseParallax();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#080c14", paddingTop: "95px" }}
    >
      {/* Ambient background reacts to cursor */}
      <AmbientBackground mouseX={mouseX} mouseY={mouseY} />

      {/* Page content */}
      <motion.div
        className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-7 py-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── COMMAND HEADER ─────────────────────────────── */}
        <CommandHeader time={time} date={date} />

        {/* ── CONTENT SECTIONS ──────────────────────────── */}
        <motion.div
          className="space-y-7"
          variants={staggerContainer}
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
        >
          {/* KPI ROW */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Key Performance Indicators"
              description="Live campus navigation metrics"
              action="Export"
            />
            <KPICards />
          </motion.section>

          {/* TRAFFIC CHART + SPARKLINES */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Traffic & Activity Streams"
              description="Hourly movement patterns across campus zones"
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Main chart — primary surface */}
              <div className="lg:col-span-2">
                <Surface accent delay={0.2} className="h-full">
                  <div className="p-1">
                    <TrafficChart />
                  </div>
                </Surface>
              </div>

              {/* Sparklines — secondary */}
              <div>
                <Surface delay={0.28} className="h-full">
                  <div className="p-1">
                    <BuildingSparklines />
                  </div>
                </Surface>
              </div>
            </div>
          </motion.section>

          {/* LOCATIONS + ROUTES */}
          <motion.section variants={staggerItem}>
            <SectionHeader
              label="Campus Intelligence"
              description="Top destinations and navigation route patterns"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Surface delay={0.3}>
                <TopLocations />
              </Surface>
              <Surface delay={0.36}>
                <PopularRoutes />
              </Surface>
            </div>
          </motion.section>

          {/* OPERATIONAL RIBBON */}
          <motion.section variants={staggerItem}>
            <OperationalRibbon />
          </motion.section>
        </motion.div>

        {/* Bottom clearance */}
        <div className="h-12" />
      </motion.div>
    </div>
  );
}