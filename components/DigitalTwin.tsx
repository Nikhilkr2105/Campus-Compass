"use client";

/**
 * DigitalTwin — Phase 6
 *
 * Inserted between #admin and #architecture.
 * Self-contained: no props from LandingPage, no Phase 1-5 hook dependencies.
 *
 * Three tabbed views:
 *   "Live Campus"  — occupancy breathing, activity pulses per building
 *   "Event Mode"   — event at Sports block, demand spike, route redistribution
 *   "Emergency"    — SOS at Library, red overlay, safety routing to Medical
 *
 * Feedback loop diagram (below tabs):
 *   Campus Activity → AI Analysis → Route Optimization → Updated Navigation
 *
 * Performance: ~6 continuous Framer Motion animations (ripples + route pulse).
 * All others trigger once via useInView. No interval loops — CSS animation
 * handles the breathing effect; Framer Motion handles path draws and reveals.
 */

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Shared campus data (same coordinate space as TopologyMapReactive) ────────

const BUILDINGS = [
  { id: "A", x: 80,  y: 210, w: 95,  h: 62, label: "Main Block" },
  { id: "B", x: 222, y: 132, w: 82,  h: 72, label: "Science"    },
  { id: "C", x: 344, y: 196, w: 72,  h: 58, label: "Library"    },
  { id: "D", x: 462, y: 124, w: 88,  h: 68, label: "Admin"      },
  { id: "E", x: 562, y: 234, w: 76,  h: 52, label: "Hostel"     },
  { id: "F", x: 198, y: 284, w: 68,  h: 50, label: "Medical"    },
  { id: "G", x: 402, y: 296, w: 92,  h: 46, label: "Sports"     },
] as const;

const ALL_PATHS = [
  "M 127 241 L 222 168",
  "M 304 168 L 344 225",
  "M 416 225 L 462 158",
  "M 550 158 L 562 257",
  "M 127 241 L 198 309",
  "M 266 309 L 344 225",
  "M 416 225 L 402 319",
];

// ─── Mode-specific data ───────────────────────────────────────────────────────

// Occupancy levels for Live Campus mode
// 0 = idle, 0.35 = moderate, 0.75+ = busy
const LIVE_OCCUPANCY: Record<string, { level: number; label: string }> = {
  A: { level: 0.82, label: "Busy"     },
  B: { level: 0.55, label: "Active"   },
  C: { level: 0.30, label: "Moderate" },
  D: { level: 0.70, label: "Active"   },
  E: { level: 0.45, label: "Moderate" },
  F: { level: 0.18, label: "Quiet"    },
  G: { level: 0.25, label: "Quiet"    },
};

// Event Mode: Tech Fest at Sports (G) → demand surge
const EVENT_BUILDING = "G";
const EVENT_PATHS_ACTIVE   = [6, 5, 1, 2];  // routes toward G
const EVENT_PATHS_OVERFLOW = [0, 4];          // alternate relieved routes

// Emergency Mode: incident at Library (C) → evacuate via Medical (F)
const EMERGENCY_BUILDING = "C";
const SAFE_ROUTE   = "M 344 225 L 266 309 L 198 309 L 127 241"; // C→F→A
const BLOCKED_PATH = "M 304 168 L 344 225";                       // B→C blocked

type TabId = "live" | "event" | "emergency";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function occupancyColor(level: number): string {
  if (level >= 0.70) return "#d94040";
  if (level >= 0.45) return "#c9922a";
  return "#0d9e6e";
}

function occupancyFill(level: number): string {
  if (level >= 0.70) return `rgba(217,64,64,${0.12 + level * 0.1})`;
  if (level >= 0.45) return `rgba(201,146,42,${0.10 + level * 0.1})`;
  return `rgba(13,158,110,${0.08 + level * 0.08})`;
}

// ─── Tab Button ──────────────────────────────────────────────────────────────

function TabButton({
  id, label, active, onClick,
}: {
  id: TabId; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: "8px 18px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.2px",
        cursor: "pointer",
        border: "none",
        outline: "none",
        background: active ? "rgba(56,130,246,0.18)" : "rgba(255,255,255,0.05)",
        color: active ? "#6ea8ff" : "rgba(255,255,255,0.42)",
        borderBottom: active
          ? "1px solid rgba(56,130,246,0.5)"
          : "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── SVG base layer (shared across all tabs) ─────────────────────────────────

function CampusBase() {
  return (
    <>
      <defs>
        <pattern id="dtDotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.5" fill="rgba(56,130,246,0.1)" />
        </pattern>
        <filter id="dtGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="dtBlur8">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <rect width="700" height="390" fill="url(#dtDotGrid)" />
      <ellipse cx="350" cy="390" rx="300" ry="55" fill="rgba(13,80,40,0.08)" />
      {/* Dim path network */}
      {ALL_PATHS.map((d, i) => (
        <path
          key={i} d={d} fill="none"
          stroke="rgba(56,130,246,0.12)"
          strokeWidth={1.5} strokeLinecap="round"
          strokeDasharray="4 5"
        />
      ))}
    </>
  );
}

// ─── Live Campus Tab ──────────────────────────────────────────────────────────

function LiveCampusView({ visible }: { visible: boolean }) {
  // Buildings with breathing occupancy pulses
  const busyBuildings = (Object.entries(LIVE_OCCUPANCY) as [string, { level: number; label: string }][])
    .filter(([, v]) => v.level >= 0.45)
    .map(([id]) => id);

  return (
    <motion.g
      key="live"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {BUILDINGS.map((b, i) => {
        const occ = LIVE_OCCUPANCY[b.id];
        const color = occupancyColor(occ.level);
        const fill  = occupancyFill(occ.level);
        const isBusy = occ.level >= 0.45;

        return (
          <g key={b.id}>
            {/* Ripple for busy buildings */}
            {isBusy && (
              <motion.rect
                x={b.x - 4} y={b.y - 4}
                width={b.w + 8} height={b.h + 8} rx={8}
                fill="transparent"
                stroke={color}
                strokeWidth={1}
                animate={{
                  opacity: [0.6, 0, 0.6],
                  scale:   [1, 1.06, 1],
                }}
                transition={{
                  duration: 2.4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.45,
                }}
                style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px` }}
              />
            )}

            {/* Building fill — occupancy color */}
            <motion.rect
              x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
              animate={{ fill, stroke: color + "55" }}
              transition={{ duration: 0.6, ease: EASE }}
              strokeWidth={isBusy ? 1.5 : 0.75}
            />

            {/* Building ID */}
            <text
              x={b.x + b.w / 2} y={b.y + b.h / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize={11} fontWeight="700"
              fontFamily="var(--font-sans)"
            >{b.id}</text>

            {/* Occupancy badge */}
            <motion.g
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -4 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
            >
              <rect
                x={b.x + b.w / 2 - 20} y={b.y - 18}
                width={40} height={13} rx={4}
                fill="rgba(10,18,35,0.9)"
                stroke={color + "44"} strokeWidth={0.75}
              />
              <text
                x={b.x + b.w / 2} y={b.y - 11}
                textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize={7.5}
                fontFamily="var(--font-sans)" fontWeight="600"
              >
                {Math.round(occ.level * 100)}% · {occ.label}
              </text>
            </motion.g>
          </g>
        );
      })}

      {/* Activity pulse on main corridor (A-B path) */}
      <motion.circle
        r={4} fill="#3882f6" opacity={0.7}
        animate={{
          cx: [127, 175, 222],
          cy: [241, 200, 168],
          opacity: [0.8, 0.9, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      {/* Secondary pulse on A-F path */}
      <motion.circle
        r={3} fill="#c9922a" opacity={0.6}
        animate={{
          cx: [127, 162, 198],
          cy: [241, 275, 309],
          opacity: [0.7, 0.8, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      />
    </motion.g>
  );
}

// ─── Event Mode Tab ───────────────────────────────────────────────────────────

function EventModeView({ visible }: { visible: boolean }) {
  const eventB = BUILDINGS.find((b) => b.id === EVENT_BUILDING)!;

  return (
    <motion.g
      key="event"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {BUILDINGS.map((b) => {
        const isEvent = b.id === EVENT_BUILDING;
        const isOnRoute = ["A", "C", "G"].includes(b.id);

        return (
          <g key={b.id}>
            {/* Event building gold halo */}
            {isEvent && (
              <motion.rect
                x={b.x - 5} y={b.y - 5}
                width={b.w + 10} height={b.h + 10} rx={9}
                fill="rgba(201,146,42,0.18)"
                stroke="rgba(201,146,42,0.55)"
                strokeWidth={1.5}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            <rect
              x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
              fill={
                isEvent    ? "rgba(201,146,42,0.28)" :
                isOnRoute  ? "rgba(56,130,246,0.18)" :
                             "rgba(22,42,78,0.6)"
              }
              stroke={
                isEvent    ? "rgba(201,146,42,0.7)" :
                isOnRoute  ? "rgba(56,130,246,0.45)" :
                             "rgba(56,130,246,0.15)"
              }
              strokeWidth={isEvent ? 2 : 1}
            />
            <text
              x={b.x + b.w / 2} y={b.y + b.h / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={isEvent ? "#c9922a" : isOnRoute ? "#6ea8ff" : "rgba(160,190,230,0.4)"}
              fontSize={11} fontWeight="700" fontFamily="var(--font-sans)"
            >{b.id}</text>
          </g>
        );
      })}

      {/* Event label on Sports block */}
      <motion.g
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <rect
          x={eventB.x - 12} y={eventB.y - 26}
          width={eventB.w + 24} height={17} rx={5}
          fill="rgba(201,146,42,0.2)"
          stroke="rgba(201,146,42,0.5)" strokeWidth={0.75}
        />
        <text
          x={eventB.x + eventB.w / 2} y={eventB.y - 17}
          textAnchor="middle" dominantBaseline="middle"
          fill="#c9922a" fontSize={8.5}
          fontFamily="var(--font-sans)" fontWeight="700"
        >
          ★ Tech Fest · High demand
        </text>
      </motion.g>

      {/* Redistributed active routes toward event */}
      {EVENT_PATHS_ACTIVE.map((pi, i) => (
        <motion.path
          key={`active-${pi}`}
          d={ALL_PATHS[pi]}
          fill="none"
          stroke="#c9922a"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 0.8 : 0 }}
          transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: EASE }}
        />
      ))}

      {/* Overflow alternate routes */}
      {EVENT_PATHS_OVERFLOW.map((pi, i) => (
        <motion.path
          key={`overflow-${pi}`}
          d={ALL_PATHS[pi]}
          fill="none"
          stroke="#3882f6"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 0.5 : 0 }}
          transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: EASE }}
        />
      ))}

      {/* Moving pulse toward event */}
      <motion.circle
        r={4} fill="#c9922a" opacity={0.8}
        animate={{
          cx: [416, 409, 402],
          cy: [225, 272, 319],
          opacity: [0.8, 0.9, 0],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        r={3} fill="#c9922a" opacity={0.6}
        animate={{
          cx: [344, 380, 402],
          cy: [225, 265, 319],
          opacity: [0.6, 0.8, 0],
        }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
      />

      {/* Legend */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <rect x={12} y={12} width={160} height={42} rx={7}
          fill="rgba(10,18,35,0.88)" stroke="rgba(201,146,42,0.3)" strokeWidth={0.75} />
        <text x={22} y={28} fill="rgba(255,255,255,0.65)" fontSize={9}
          fontFamily="var(--font-sans)" fontWeight="600">Route redistribution active</text>
        <text x={22} y={42} fill="rgba(255,255,255,0.35)" fontSize={8}
          fontFamily="var(--font-body)">+340 students routed to Sports</text>
      </motion.g>
    </motion.g>
  );
}

// ─── Emergency Tab ────────────────────────────────────────────────────────────

function EmergencyView({ visible }: { visible: boolean }) {
  const emgB = BUILDINGS.find((b) => b.id === EMERGENCY_BUILDING)!;
  const safeB = BUILDINGS.find((b) => b.id === "F")!; // Medical

  return (
    <motion.g
      key="emergency"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Red zone overlay at incident building */}
      <motion.ellipse
        cx={emgB.x + emgB.w / 2}
        cy={emgB.y + emgB.h / 2}
        rx={70} ry={50}
        fill="rgba(217,64,64,0.12)"
        filter="url(#dtBlur8)"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {BUILDINGS.map((b) => {
        const isIncident  = b.id === EMERGENCY_BUILDING;
        const isSafe      = b.id === "F";
        const isEvacRoute = ["A", "F"].includes(b.id);

        return (
          <g key={b.id}>
            {/* SOS pulse */}
            {isIncident && (
              <motion.rect
                x={b.x - 6} y={b.y - 6}
                width={b.w + 12} height={b.h + 12} rx={9}
                fill="transparent"
                stroke="#d94040" strokeWidth={2}
                animate={{ opacity: [1, 0.1, 1], scale: [1, 1.08, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px` }}
              />
            )}

            <rect
              x={b.x} y={b.y} width={b.w} height={b.h} rx={5}
              fill={
                isIncident  ? "rgba(217,64,64,0.3)"  :
                isSafe      ? "rgba(13,158,110,0.22)" :
                isEvacRoute ? "rgba(56,130,246,0.14)" :
                              "rgba(22,42,78,0.5)"
              }
              stroke={
                isIncident  ? "#d94040"               :
                isSafe      ? "rgba(13,158,110,0.7)"  :
                isEvacRoute ? "rgba(56,130,246,0.4)"  :
                              "rgba(56,130,246,0.12)"
              }
              strokeWidth={isIncident ? 2 : isSafe ? 1.5 : 1}
            />
            <text
              x={b.x + b.w / 2} y={b.y + b.h / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={
                isIncident ? "#d94040" :
                isSafe     ? "#0d9e6e" :
                isEvacRoute ? "#6ea8ff" :
                              "rgba(160,190,230,0.35)"
              }
              fontSize={11} fontWeight="700" fontFamily="var(--font-sans)"
            >{b.id}</text>
          </g>
        );
      })}

      {/* Blocked path (B→C) */}
      <motion.path
        d={BLOCKED_PATH}
        fill="none" stroke="#d94040"
        strokeWidth={2.5} strokeLinecap="round"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 0.7 : 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Safe evacuation route C→F→A */}
      <motion.path
        d={SAFE_ROUTE}
        fill="none" stroke="rgba(13,158,110,0.4)"
        strokeWidth={8} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 1.0, delay: 0.4, ease: EASE }}
      />
      <motion.path
        d={SAFE_ROUTE}
        fill="none" stroke="#0d9e6e"
        strokeWidth={2.5} strokeLinecap="round"
        strokeDasharray="10 6"
        animate={visible ? { strokeDashoffset: [0, -32] } : {}}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        initial={{ opacity: 0 }}
      />
      <motion.path
        d={SAFE_ROUTE}
        fill="none" stroke="#0d9e6e"
        strokeWidth={2.5} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 0.9 : 0 }}
        transition={{ duration: 1.0, delay: 0.4, ease: EASE }}
      />

      {/* SOS label */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ transformOrigin: `${emgB.x + emgB.w / 2}px ${emgB.y - 20}px` }}
      >
        <rect
          x={emgB.x + emgB.w / 2 - 26} y={emgB.y - 30}
          width={52} height={15} rx={4}
          fill="rgba(217,64,64,0.25)"
          stroke="rgba(217,64,64,0.6)" strokeWidth={0.75}
        />
        <text
          x={emgB.x + emgB.w / 2} y={emgB.y - 22}
          textAnchor="middle" dominantBaseline="middle"
          fill="#d94040" fontSize={8.5}
          fontFamily="var(--font-sans)" fontWeight="700"
        >⚠ SOS Active</text>
      </motion.g>

      {/* Safe destination label */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <rect
          x={safeB.x - 6} y={safeB.y - 22}
          width={safeB.w + 12} height={15} rx={4}
          fill="rgba(13,158,110,0.2)"
          stroke="rgba(13,158,110,0.45)" strokeWidth={0.75}
        />
        <text
          x={safeB.x + safeB.w / 2} y={safeB.y - 14}
          textAnchor="middle" dominantBaseline="middle"
          fill="#0d9e6e" fontSize={8}
          fontFamily="var(--font-sans)" fontWeight="700"
        >✚ Medical Centre</text>
      </motion.g>

      {/* Emergency legend */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <rect x={12} y={12} width={178} height={52} rx={7}
          fill="rgba(10,18,35,0.9)" stroke="rgba(217,64,64,0.3)" strokeWidth={0.75} />
        <text x={22} y={28} fill="#d94040" fontSize={9}
          fontFamily="var(--font-sans)" fontWeight="700">Emergency Protocol Active</text>
        <text x={22} y={40} fill="rgba(255,255,255,0.45)" fontSize={8}
          fontFamily="var(--font-body)">Block C isolated · Safe route via F</text>
        <text x={22} y={52} fill="rgba(255,255,255,0.28)" fontSize={8}
          fontFamily="var(--font-body)">ETA to Medical: 1 min 40s</text>
      </motion.g>
    </motion.g>
  );
}

// ─── Feedback Loop Diagram ────────────────────────────────────────────────────

const LOOP_STEPS = [
  { label: "Campus Activity",    sub: "Occupancy sensors · footfall", color: "#3882f6" },
  { label: "AI Analysis",        sub: "Pattern recognition · scoring",  color: "#6b4fcf" },
  { label: "Route Optimization", sub: "Constraint solving · ranking",   color: "#c9922a" },
  { label: "Updated Navigation", sub: "Pushed to all devices",          color: "#0d9e6e" },
] as const;

function FeedbackLoop({ trigger }: { trigger: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {LOOP_STEPS.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: trigger ? 1 : 0, y: trigger ? 0 : 16 }}
          transition={{ duration: 0.55, delay: 0.1 + i * 0.14, ease: EASE }}
          style={{
            flex: 1,
            padding: "22px 18px",
            background: "rgba(255,255,255,0.025)",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            position: "relative",
            textAlign: "center",
          }}
        >
          {/* Step number */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: step.color + "20",
              border: `1px solid ${step.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "var(--font-sans)",
              color: step.color,
            }}
          >
            {i + 1}
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.82)",
              fontFamily: "var(--font-sans)",
              marginBottom: 5,
              lineHeight: 1.2,
            }}
          >
            {step.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.32)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.4,
            }}
          >
            {step.sub}
          </div>

          {/* Arrow between steps */}
          {i < 3 && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: trigger ? 1 : 0, x: trigger ? 0 : -4 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.14 }}
              style={{
                position: "absolute",
                right: -10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                color: `rgba(${
                  i === 0 ? "56,130,246" :
                  i === 1 ? "107,79,207" :
                            "201,146,42"
                },0.5)`,
                zIndex: 2,
                fontFamily: "var(--font-sans)",
              }}
            >
              →
            </motion.div>
          )}

          {/* Active pulse indicator */}
          <motion.div
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale:   [1, 1.15, 1],
            }}
            transition={{
              duration: 2 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: step.color,
              boxShadow: `0 0 8px ${step.color}80`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function DigitalTwin() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });
  const [activeTab, setActiveTab] = useState<TabId>("live");

  return (
    <section
      id="digital-twin"
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
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 45% at 20% 60%, rgba(56,130,246,0.07) 0%, transparent 55%), " +
            "radial-gradient(ellipse 55% 40% at 85% 30%, rgba(13,158,110,0.06) 0%, transparent 50%)",
        }}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>

        {/* ── Header ── */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 52 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 999,
              fontSize: 11, fontWeight: 600, letterSpacing: "2px",
              textTransform: "uppercase",
              background: "rgba(13,158,110,0.1)",
              border: "1px solid rgba(13,158,110,0.25)",
              color: "#0d9e6e",
              fontFamily: "var(--font-sans)",
              marginBottom: 20,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0d9e6e", opacity: 0.85 }} />
            Digital Twin
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 4.5vw, 46px)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "#fff",
              marginBottom: 12,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
            }}
          >
            The campus, live.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              maxWidth: 380,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            A synchronized model of the physical campus — updated continuously,
            used to make every route decision smarter.
          </p>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            padding: "6px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            width: "fit-content",
          }}
        >
          {(
            [
              { id: "live",      label: "Live Campus"  },
              { id: "event",     label: "Event Mode"   },
              { id: "emergency", label: "Emergency"    },
            ] as { id: TabId; label: string }[]
          ).map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </motion.div>

        {/* ── Campus SVG with animated tab layers ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(150deg, #0a1220 0%, #0d1e38 100%)",
            border: "1px solid rgba(56,130,246,0.15)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            marginBottom: 28,
          }}
        >
          {/* Map header */}
          <div
            style={{
              padding: "12px 18px",
              borderBottom: "1px solid rgba(56,130,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(56,130,246,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: activeTab === "emergency" ? "#d94040" : "#0d9e6e",
                  boxShadow: `0 0 8px ${activeTab === "emergency" ? "rgba(217,64,64,0.8)" : "rgba(13,158,110,0.7)"}`,
                  transition: "background 0.3s ease",
                }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeTab}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontSize: 10, fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.8px",
                  }}
                >
                  {activeTab === "live"      && "CAMPUS COMPASS · LIVE OCCUPANCY"}
                  {activeTab === "event"     && "CAMPUS COMPASS · EVENT MODE · TECH FEST"}
                  {activeTab === "emergency" && "CAMPUS COMPASS · EMERGENCY PROTOCOL"}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Live / Event / Emergency status chip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans)",
                  background:
                    activeTab === "emergency" ? "rgba(217,64,64,0.2)"  :
                    activeTab === "event"     ? "rgba(201,146,42,0.18)" :
                                               "rgba(13,158,110,0.15)",
                  border:
                    activeTab === "emergency" ? "1px solid rgba(217,64,64,0.4)"  :
                    activeTab === "event"     ? "1px solid rgba(201,146,42,0.35)" :
                                               "1px solid rgba(13,158,110,0.35)",
                  color:
                    activeTab === "emergency" ? "#d94040" :
                    activeTab === "event"     ? "#c9922a" :
                                               "#0d9e6e",
                }}
              >
                {activeTab === "live"      && "Live"}
                {activeTab === "event"     && "Event"}
                {activeTab === "emergency" && "Emergency"}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SVG campus */}
          <svg viewBox="0 0 700 390" style={{ width: "100%", display: "block" }}>
            <CampusBase />
            <AnimatePresence mode="wait">
              {activeTab === "live"      && <LiveCampusView      key="live"      visible={inView} />}
              {activeTab === "event"     && <EventModeView       key="event"     visible={inView} />}
              {activeTab === "emergency" && <EmergencyView       key="emergency" visible={inView} />}
            </AnimatePresence>
          </svg>

          {/* Status bar */}
          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(56,130,246,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.2)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              {(activeTab === "live"
                ? [
                    { dot: "#d94040", label: "Busy (>70%)" },
                    { dot: "#c9922a", label: "Active (45-70%)" },
                    { dot: "#0d9e6e", label: "Quiet (<45%)" },
                  ]
                : activeTab === "event"
                ? [
                    { dot: "#c9922a", label: "Event building" },
                    { dot: "#3882f6", label: "Redistributed routes" },
                  ]
                : [
                    { dot: "#d94040", label: "Incident zone" },
                    { dot: "#0d9e6e", label: "Safe route & Medical" },
                  ]
              ).map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: l.dot, opacity: 0.85 }} />
                  <span style={{ fontSize: 9, color: "rgba(160,190,230,0.5)", fontFamily: "var(--font-body)" }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
              7 buildings · {ALL_PATHS.length} paths · Synced
            </span>
          </div>
        </motion.div>

        {/* ── Feedback Loop ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{ marginBottom: 28 }}
        >
          <div
            style={{
              fontSize: 10, fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Digital Twin Feedback Loop
          </div>
          <FeedbackLoop trigger={inView} />
        </motion.div>

      </div>
    </section>
  );
}