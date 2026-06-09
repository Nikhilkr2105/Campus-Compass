"use client";

/**
 * AIDecisionEngine — Phase 5
 *
 * Self-contained section. Inserted in LandingPage between
 * #features and #ecosystem.
 *
 * Design: dark-navy base matching ecosystem strip.
 * Three panels in sequence:
 *   1. Route Candidates (A/B/C) with animated scoring
 *   2. Decision Flow (4-step waterfall)
 *   3. Mini topology with winning route overlaid
 *
 * All route data references real building IDs A/B/C/D/F/G
 * from TopologyMapReactive — same coordinate language.
 *
 * No chatbots. No brains. No buzzword animations.
 * Just a system doing its job, visibly.
 */

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteCandidate {
  id: "A" | "B" | "C";
  label: string;
  via: string;
  time: number;          // minutes
  distance: string;
  congestion: number;    // 0-1
  a11yScore: number;     // 0-1
  confidence: number;    // 0-1
  color: string;
  winner: boolean;
  path: string;          // SVG path d
  note: string;
}

// ─── Route data (grounded in real campus topology) ────────────────────────────

const ROUTES: RouteCandidate[] = [
  {
    id: "A",
    label: "Route A",
    via: "Main Block → Science → Admin",
    time: 3,
    distance: "340m",
    congestion: 0.28,
    a11yScore: 0.92,
    confidence: 0.94,
    color: "#3882f6",
    winner: true,
    path: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    note: "Lift B2 available · Low footfall · Ramp at block A",
  },
  {
    id: "B",
    label: "Route B",
    via: "Main Block → Medical → Library → Admin",
    time: 5,
    distance: "480m",
    congestion: 0.61,
    a11yScore: 0.75,
    confidence: 0.58,
    color: "#c9922a",
    winner: false,
    path: "M 60 241 L 127 241 L 198 309 L 266 309 L 344 225 L 416 225 L 462 158",
    note: "Staircase at block C · Lunch-hour footfall",
  },
  {
    id: "C",
    label: "Route C",
    via: "Main Block → Sports → Library → Admin",
    time: 7,
    distance: "610m",
    congestion: 0.14,
    a11yScore: 0.60,
    confidence: 0.31,
    color: "#6b4fcf",
    winner: false,
    path: "M 60 241 L 127 241 L 402 319 L 416 225 L 462 158",
    note: "No lift access · Longer distance",
  },
];

// ─── Decision flow steps ──────────────────────────────────────────────────────

const DECISION_STEPS = [
  {
    id: "destination",
    label: "Destination Parsed",
    detail: "Admin Block, Floor 2",
    icon: "◎",
    color: "#3882f6",
  },
  {
    id: "analysis",
    label: "Route Analysis",
    detail: "3 candidates · Dijkstra pass",
    icon: "⌥",
    color: "#6b4fcf",
  },
  {
    id: "constraints",
    label: "Constraint Evaluation",
    detail: "Lift access · Congestion · Distance",
    icon: "⊛",
    color: "#c9922a",
  },
  {
    id: "selected",
    label: "Optimal Route Selected",
    detail: "Route A · 94% confidence",
    icon: "✓",
    color: "#0d9e6e",
  },
];

// ─── Constraint chips ─────────────────────────────────────────────────────────

const CONSTRAINTS = [
  { label: "Lift access",         active: true,  color: "#0d9e6e" },
  { label: "Stair avoidance",     active: true,  color: "#0d9e6e" },
  { label: "Low congestion",      active: true,  color: "#3882f6" },
  { label: "Wheelchair route",    active: true,  color: "#0d9e6e" },
  { label: "Shortest distance",   active: false, color: "#c9922a" },
  { label: "Avoid block C steps", active: true,  color: "#0d9e6e" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBar({
  value,
  color,
  delay = 0,
  trigger,
}: {
  value: number;
  color: string;
  delay?: number;
  trigger: boolean;
}) {
  return (
    <div
      style={{
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: trigger ? `${value * 100}%` : "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        style={{ height: "100%", borderRadius: 2, background: color }}
      />
    </div>
  );
}

function CongestionDot({ level }: { level: number }) {
  const color =
    level < 0.35 ? "#0d9e6e" : level < 0.65 ? "#c9922a" : "#d94040";
  const label =
    level < 0.35 ? "Low" : level < 0.65 ? "Moderate" : "High";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontFamily: "var(--font-sans)",
        color,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

// ─── Route Candidate Card ────────────────────────────────────────────────────

function RouteCard({
  route,
  index,
  trigger,
  selected,
  onSelect,
}: {
  route: RouteCandidate;
  index: number;
  trigger: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: trigger ? 1 : 0, y: trigger ? 0 : 20 }}
      transition={{ duration: 0.65, delay: 0.15 + index * 0.18, ease: EASE }}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        cursor: "pointer",
        background: selected
          ? `rgba(${route.color === "#3882f6" ? "56,130,246" : route.color === "#c9922a" ? "201,146,42" : "107,79,207"},0.12)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${selected ? route.color + "55" : "rgba(255,255,255,0.08)"}`,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Winner badge */}
      {route.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: trigger ? 1 : 0, scale: trigger ? 1 : 0.8 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            background: "rgba(13,158,110,0.2)",
            border: "1px solid rgba(13,158,110,0.4)",
            color: "#0d9e6e",
          }}
        >
          Selected
        </motion.div>
      )}

      {/* Route ID + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: route.color + "22",
            border: `1px solid ${route.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            color: route.color,
            flexShrink: 0,
          }}
        >
          {route.id}
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1,
            }}
          >
            {route.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-body)",
              marginTop: 3,
            }}
          >
            {route.via}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Time", value: `${route.time} min` },
          { label: "Distance", value: route.distance },
          { label: "Congestion", value: <CongestionDot level={route.congestion} /> },
        ].map((m) => (
          <div key={m.label}>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { label: "Accessibility", value: route.a11yScore, color: "#0d9e6e" },
          { label: "Confidence", value: route.confidence, color: route.color },
        ].map((bar, bi) => (
          <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-sans)",
                width: 72,
                flexShrink: 0,
              }}
            >
              {bar.label}
            </span>
            <ScoreBar
              value={bar.value}
              color={bar.color}
              delay={0.4 + index * 0.18 + bi * 0.1}
              trigger={trigger}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: bar.color,
                fontFamily: "var(--font-sans)",
                width: 30,
                textAlign: "right",
              }}
            >
              {Math.round(bar.value * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: "rgba(255,255,255,0.28)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 10,
        }}
      >
        {route.note}
      </div>
    </motion.div>
  );
}

// ─── Decision Flow ────────────────────────────────────────────────────────────

function DecisionFlow({ trigger }: { trigger: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {DECISION_STEPS.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: trigger ? 1 : 0, x: trigger ? 0 : -16 }}
          transition={{ duration: 0.55, delay: 0.1 + i * 0.22, ease: EASE }}
          style={{ display: "flex", gap: 0, alignItems: "stretch" }}
        >
          {/* Spine */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 36,
              flexShrink: 0,
            }}
          >
            {/* Icon circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: trigger ? 1 : 0 }}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.22, ease: EASE }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: step.color + "18",
                border: `1px solid ${step.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: step.color,
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {step.icon}
            </motion.div>
            {/* Connector line */}
            {i < DECISION_STEPS.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: trigger ? 1 : 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + i * 0.22,
                  ease: "easeInOut",
                  transformOrigin: "top",
                }}
                style={{
                  width: 1,
                  flex: 1,
                  minHeight: 28,
                  background: `linear-gradient(to bottom, ${step.color}50, ${DECISION_STEPS[i + 1].color}30)`,
                  transformOrigin: "top",
                }}
              />
            )}
          </div>

          {/* Content */}
          <div style={{ paddingLeft: 14, paddingBottom: i < DECISION_STEPS.length - 1 ? 20 : 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1,
                paddingTop: 6,
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.38)",
                fontFamily: "var(--font-body)",
                marginTop: 4,
              }}
            >
              {step.detail}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Accessibility panel ──────────────────────────────────────────────────────

function AccessibilityPanel({ trigger }: { trigger: boolean }) {
  const items = [
    { label: "Lift B2 available",       color: "#0d9e6e", active: true  },
    { label: "Ramp at block A entry",   color: "#0d9e6e", active: true  },
    { label: "Staircase at block C",    color: "#d94040", active: false },
    { label: "Level corridor Main→Sci", color: "#0d9e6e", active: true  },
    { label: "No step at destination",  color: "#0d9e6e", active: true  },
    { label: "Narrow passage at E",     color: "#c9922a", active: false },
  ];

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(13,158,110,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-sans)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Accessibility Check
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: trigger ? 1 : 0, x: trigger ? 0 : 8 }}
            transition={{ duration: 0.45, delay: 0.05 + i * 0.09, ease: EASE }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: item.color + "20",
                border: `1px solid ${item.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 9, color: item.color, fontWeight: 700 }}>
                {item.active ? "✓" : "✕"}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: item.active
                  ? "rgba(255,255,255,0.65)"
                  : "rgba(255,255,255,0.28)",
                fontFamily: "var(--font-body)",
                textDecoration: item.active ? "none" : "line-through",
              }}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Congestion awareness mini-map ────────────────────────────────────────────
// Uses same SVG coordinate system as TopologyMapReactive (viewBox 0 0 700 390)

function CongestionMap({ trigger, activeRoute }: { trigger: boolean; activeRoute: RouteCandidate }) {
  // Congestion zones: ellipses over high-traffic path segments
  const zones = [
    { cx: 232, cy: 300, rx: 55, ry: 28, level: 0.61, label: "Medical corridor" },
    { cx: 390, cy: 290, rx: 60, ry: 24, level: 0.45, label: "Sports approach" },
    { cx: 263, cy: 165, rx: 50, ry: 22, level: 0.22, label: "Science wing" },
  ];

  const congestionColor = (level: number) =>
    level > 0.55 ? "#d94040" : level > 0.35 ? "#c9922a" : "#0d9e6e";

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(150deg, #0a1220 0%, #0d1e38 100%)",
        border: "1px solid rgba(56,130,246,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid rgba(56,130,246,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#0d9e6e",
            boxShadow: "0 0 8px rgba(13,158,110,0.7)",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.8px",
          }}
        >
          LIVE CONGESTION · ROUTE SELECTED
        </span>
      </div>

      {/* Mini campus SVG */}
      <svg viewBox="0 0 700 390" style={{ width: "100%", display: "block" }}>
        <defs>
          <pattern id="aiDotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(56,130,246,0.1)" />
          </pattern>
          <filter id="congestionBlur">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <rect width="700" height="390" fill="url(#aiDotGrid)" />
        <ellipse cx="350" cy="390" rx="300" ry="55" fill="rgba(13,80,40,0.1)" />

        {/* Congestion zone halos */}
        {zones.map((z, i) => (
          <motion.g key={i}>
            <motion.ellipse
              cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
              fill={congestionColor(z.level) + "22"}
              stroke={congestionColor(z.level) + "55"}
              strokeWidth={1}
              filter="url(#congestionBlur)"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: trigger ? 0.9 : 0, scale: trigger ? 1 : 0.5 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
              style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
            />
            <motion.ellipse
              cx={z.cx} cy={z.cy} rx={z.rx * 0.5} ry={z.ry * 0.5}
              fill={congestionColor(z.level) + "18"}
              initial={{ opacity: 0 }}
              animate={{ opacity: trigger ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
            />
          </motion.g>
        ))}

        {/* All paths (dim) */}
        {[
          "M 127 241 L 222 168",
          "M 304 168 L 344 225",
          "M 416 225 L 462 158",
          "M 550 158 L 562 257",
          "M 127 241 L 198 309",
          "M 266 309 L 344 225",
          "M 416 225 L 402 319",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(56,130,246,0.15)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        ))}

        {/* Rejected routes (crossed) */}
        {ROUTES.filter((r) => !r.winner).map((r) => (
          <motion.path
            key={r.id}
            d={r.path}
            fill="none"
            stroke={r.color + "30"}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="4 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: trigger ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        ))}

        {/* Winner route glow */}
        <motion.path
          d={activeRoute.path}
          fill="none"
          stroke="rgba(56,130,246,0.3)"
          strokeWidth={10}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: trigger ? 1 : 0, opacity: trigger ? 1 : 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: EASE }}
        />
        <motion.path
          d={activeRoute.path}
          fill="none"
          stroke="#3882f6"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="10 6"
          animate={trigger ? { strokeDashoffset: [0, -32] } : {}}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          initial={{ opacity: 0 }}
        />
        <motion.path
          d={activeRoute.path}
          fill="none"
          stroke="#3882f6"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: trigger ? 1 : 0, opacity: trigger ? 0.9 : 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: EASE }}
        />

        {/* Buildings (simplified rects) */}
        {[
          { id: "A", x: 80,  y: 210, w: 95,  h: 62, active: true  },
          { id: "B", x: 222, y: 132, w: 82,  h: 72, active: true  },
          { id: "C", x: 344, y: 196, w: 72,  h: 58, active: false },
          { id: "D", x: 462, y: 124, w: 88,  h: 68, active: true  },
          { id: "E", x: 562, y: 234, w: 76,  h: 52, active: false },
          { id: "F", x: 198, y: 284, w: 68,  h: 50, active: false },
          { id: "G", x: 402, y: 296, w: 92,  h: 46, active: false },
        ].map((b) => (
          <motion.rect
            key={b.id}
            x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
            animate={{
              fill: b.active ? "rgba(56,130,246,0.22)" : "rgba(22,42,78,0.7)",
              stroke: b.active ? "rgba(110,168,255,0.6)" : "rgba(56,130,246,0.15)",
            }}
            transition={{ duration: 0.6, delay: b.active ? 0.9 : 0 }}
            strokeWidth={b.active ? 1.5 : 0.75}
          />
        ))}

        {/* Origin / destination nodes */}
        <motion.circle
          cx={60} cy={241} r={8}
          fill="rgba(13,158,110,0.2)"
          stroke="#0d9e6e" strokeWidth={1.5}
          animate={{ opacity: trigger ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        />
        <motion.circle cx={60} cy={241} r={3} fill="#0d9e6e"
          animate={{ opacity: trigger ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.7 }} />

        <motion.circle
          cx={506} cy={158} r={8}
          fill="rgba(217,64,64,0.2)"
          stroke="#d94040" strokeWidth={1.5}
          animate={{ opacity: trigger ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        />
        <motion.circle cx={506} cy={158} r={3} fill="#d94040"
          animate={{ opacity: trigger ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.9 }} />

        {/* Congestion labels */}
        {zones.map((z, i) => (
          <motion.g
            key={`label-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: trigger ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.12 }}
          >
            <rect
              x={z.cx - 40} y={z.cy - 8}
              width={80} height={14} rx={4}
              fill="rgba(10,18,35,0.85)"
              stroke={congestionColor(z.level) + "44"}
              strokeWidth={0.75}
            />
            <text
              x={z.cx} y={z.cy + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={congestionColor(z.level)}
              fontSize={8} fontFamily="var(--font-sans)" fontWeight="600"
            >
              {Math.round(z.level * 100)}% congestion
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Legend */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid rgba(56,130,246,0.08)",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "#0d9e6e", label: "Low" },
          { color: "#c9922a", label: "Moderate" },
          { color: "#d94040", label: "High" },
        ].map((l) => (
          <div
            key={l.label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: l.color,
                opacity: 0.8,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-body)",
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "var(--font-body)",
            }}
          >
            Route A selected · 340m · 3 min
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function AIDecisionEngine() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [selectedRoute, setSelectedRoute] = useState<"A" | "B" | "C">("A");
  const activeRoute = ROUTES.find((r) => r.id === selectedRoute)!;

  return (
    <section
      id="ai-decision-engine"
      ref={sectionRef}
      style={{
        padding: "100px 24px",
        background: "var(--navy)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric depth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(56,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(107,79,207,0.06) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* ── Section header ── */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 64 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          {/* Label chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              background: "rgba(56,130,246,0.12)",
              border: "1px solid rgba(56,130,246,0.28)",
              color: "#6ea8ff",
              fontFamily: "var(--font-sans)",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#6ea8ff",
                opacity: 0.85,
              }}
            />
            AI Decision Engine
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4.5vw, 48px)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "#fff",
              marginBottom: 12,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
            }}
          >
            Reasoning, not guessing.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.42)",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Every route involves trade-offs. Campus Compass evaluates all of
            them — in milliseconds.
          </p>
        </motion.div>

        {/* ── TOP GRID: Candidates + Decision Flow ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          style={{ marginBottom: 32, alignItems: "start" }}
        >
          {/* Left: route candidates */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Route Candidates
            </motion.div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ROUTES.map((route, i) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  index={i}
                  trigger={inView}
                  selected={selectedRoute === route.id}
                  onSelect={() => setSelectedRoute(route.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: decision flow + accessibility */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Decision flow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Decision Flow
              </div>
              <div
                style={{
                  padding: "24px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(56,130,246,0.12)",
                }}
              >
                <DecisionFlow trigger={inView} />
              </div>
            </motion.div>

            {/* Constraint chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Constraints Applied
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CONSTRAINTS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{
                      opacity: inView ? 1 : 0,
                      scale: inView ? 1 : 0.85,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: 0.3 + i * 0.07,
                      ease: EASE,
                    }}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      background: c.active
                        ? c.color + "18"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${c.active ? c.color + "44" : "rgba(255,255,255,0.08)"}`,
                      color: c.active
                        ? c.color
                        : "rgba(255,255,255,0.25)",
                      textDecoration: c.active ? "none" : "line-through",
                    }}
                  >
                    {c.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Accessibility panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <AccessibilityPanel trigger={inView} />
            </motion.div>
          </div>
        </div>

        {/* ── BOTTOM: Congestion-aware campus map ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 24 }}
          transition={{ duration: 0.75, delay: 0.45, ease: EASE }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Campus Topology · Decision Output
          </div>
          <CongestionMap trigger={inView} activeRoute={activeRoute} />
        </motion.div>

        {/* ── Footer stat row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            marginTop: 28,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { value: "<50ms", label: "Decision latency",   color: "#3882f6" },
            { value: "3",     label: "Routes evaluated",   color: "#6b4fcf" },
            { value: "6",     label: "Constraints checked", color: "#c9922a" },
            { value: "94%",   label: "Confidence score",   color: "#0d9e6e" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: "1 1 120px",
                padding: "20px 22px",
                textAlign: "center",
                background: "rgba(255,255,255,0.025)",
                borderRight:
                  i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  marginBottom: 5,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.3px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}