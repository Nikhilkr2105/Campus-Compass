"use client";

/**
 * TopologyMapReactive — Phase 3
 *
 * Extends the original TopologyMap with:
 *   1. Scroll-driven building illumination (active/pulse/inactive)
 *   2. Route metadata overlays (distance · time · ♿)
 *   3. Layer opacity system (navigation / exploration / intelligence / connected / analytics)
 *   4. Heatmap tint overlay for admin section
 *
 * Preserves 100% of the original SVG architecture, defs, gradients, and animations.
 * All new elements are ADDITIVE — layered on top via SVG groups with controlled opacity.
 *
 * Props:
 *   mapState  — from useMapNarrative hook
 *   (No other props — same visual defaults as original TopologyMap)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "lucide-react";
import type { MapNarrativeState } from "@/hooks/useMapNarrative";

// ─── Exact data from original TopologyMap ────────────────────────────────────

const BUILDINGS = [
  { id: "A", x: 80,  y: 210, label: "Main Block", floors: 4, w: 95,  h: 62 },
  { id: "B", x: 222, y: 132, label: "Science",    floors: 3, w: 82,  h: 72 },
  { id: "C", x: 344, y: 196, label: "Library",    floors: 2, w: 72,  h: 58 },
  { id: "D", x: 462, y: 124, label: "Admin",      floors: 3, w: 88,  h: 68 },
  { id: "E", x: 562, y: 234, label: "Hostel",     floors: 5, w: 76,  h: 52 },
  { id: "F", x: 198, y: 284, label: "Medical",    floors: 2, w: 68,  h: 50 },
  { id: "G", x: 402, y: 296, label: "Sports",     floors: 1, w: 92,  h: 46 },
] as const;

const PATHS = [
  { d: "M 127 241 L 222 168", label: "120m" },
  { d: "M 304 168 L 344 225", label: "80m"  },
  { d: "M 416 225 L 462 158", label: "95m"  },
  { d: "M 550 158 L 562 257", label: "60m"  },
  { d: "M 127 241 L 198 309", label: "70m"  },
  { d: "M 266 309 L 344 225", label: "90m"  },
  { d: "M 416 225 L 402 319", label: "55m"  },
] as const;

// Heatmap intensities per building — used in analytics layer
const HEATMAP = {
  A: 0.55,  // Main Block — very busy
  B: 0.35,
  C: 0.20,
  D: 0.45,
  E: 0.40,
  F: 0.15,
  G: 0.10,
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Accessibility indicator ──────────────────────────────────────────────────

function A11yDot({ x, y, opacity }: { x: number; y: number; opacity: number }) {
  return (
    <motion.g animate={{ opacity }} transition={{ duration: 0.5 }}>
      <circle cx={x} cy={y} r={5} fill="rgba(13,158,110,0.15)" stroke="rgba(13,158,110,0.5)" strokeWidth={0.8} />
      {/* Wheelchair symbol simplified — just a colored dot with ♿ text */}
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
        fill="#0d9e6e" fontSize={5} fontFamily="var(--font-sans)">♿</text>
    </motion.g>
  );
}

// ─── Route metadata badge ─────────────────────────────────────────────────────

function MetadataBadge({
  x, y, distance, time, accessible, opacity,
}: {
  x: number; y: number;
  distance: string; time: string;
  accessible: boolean;
  opacity: number;
}) {
  const w = accessible ? 68 : 54;
  return (
    <motion.g
      animate={{ opacity }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Badge background */}
      <rect
        x={x - w / 2} y={y - 9}
        width={w} height={18} rx={5}
        fill="rgba(10,18,35,0.82)"
        stroke="rgba(56,130,246,0.28)"
        strokeWidth={0.75}
      />
      {/* Distance · time text */}
      <text
        x={accessible ? x - 4 : x}
        y={y + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill="rgba(160,200,255,0.88)"
        fontSize={7.5}
        fontFamily="var(--font-sans)"
        fontWeight="600"
        letterSpacing="0.3"
      >
        {distance} · {time}
      </text>
      {/* Accessibility dot — right edge */}
      {accessible && (
        <text
          x={x + w / 2 - 9} y={y + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill="#0d9e6e" fontSize={7}
          fontFamily="var(--font-sans)"
        >♿</text>
      )}
    </motion.g>
  );
}

// ─── Heatmap overlay per building ────────────────────────────────────────────

function BuildingHeatmap({
  b, intensity, opacity,
}: {
  b: (typeof BUILDINGS)[number];
  intensity: number;
  opacity: number;
}) {
  const floorOffset = (Math.min(b.floors, 4) - 1) * 5;
  return (
    <motion.rect
      x={b.x} y={b.y - floorOffset}
      width={b.w} height={b.h} rx={5}
      fill={`rgba(201,146,42,${intensity * 0.5})`}
      animate={{ opacity }}
      transition={{ duration: 0.8 }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TopologyMapReactiveProps {
  mapState: MapNarrativeState;
}

export function TopologyMapReactive({ mapState }: TopologyMapReactiveProps) {
  const {
    activeBuildingIds,
    pulsingBuildingIds,
    layerOpacities,
    routeMetadata,
    showAllPaths,
    activeRoutePath,
    highlightNodeColor,
    layer,
  } = mapState;

  return (
    <motion.div
      initial={{ opacity: 0.85, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(150deg, #0c1829 0%, #0f2040 40%, #132850 100%)",
        border: "1px solid rgba(56,130,246,0.2)",
        boxShadow:
          "0 40px 100px rgba(13,26,46,0.45), 0 8px 32px rgba(56,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(56,130,246,0.08)",
        // Phase 4: transformStyle needed for parent perspective to work
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* ── Header bar (original, preserved) ─────────────────────────────── */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(56,130,246,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(56,130,246,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#0d9e6e", boxShadow: "0 0 10px rgba(13,158,110,0.7)" }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)", letterSpacing: "0.8px" }}>
            CAMPUS COMPASS · LIVE TOPOLOGY
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Floor selector pill */}
          <div style={{ display: "flex", gap: 4 }}>
            {["B1", "G", "F1", "F2"].map((f, i) => (
              <div key={f} style={{
                padding: "2px 7px", borderRadius: 6, fontSize: 9, fontWeight: 600,
                fontFamily: "var(--font-sans)",
                background: i === 1 ? "rgba(56,130,246,0.3)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${i === 1 ? "rgba(56,130,246,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: i === 1 ? "#6ea8ff" : "rgba(255,255,255,0.38)",
              }}>{f}</div>
            ))}
          </div>
          {/* Layer indicator — NEW: shows current layer */}
          <motion.div
            key={layer}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: "2px 8px", borderRadius: 6, fontSize: 8, fontWeight: 700,
              fontFamily: "var(--font-sans)", letterSpacing: "0.8px", textTransform: "uppercase",
              background: "rgba(56,130,246,0.15)",
              border: "1px solid rgba(56,130,246,0.3)",
              color: "#6ea8ff",
            }}
          >
            {layer}
          </motion.div>
          <div style={{ display: "flex", gap: 5 }}>
            {["#d94040", "#c9922a", "#0d9e6e"].map((c, i) => (
              <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── SVG Map ───────────────────────────────────────────────────────── */}
      <svg viewBox="0 0 700 390" style={{ width: "100%", display: "block" }}>
        <defs>
          {/* Original defs — preserved exactly */}
          <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,130,246,0.06)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="campusDotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.6" fill="rgba(56,130,246,0.12)"/>
          </pattern>
          <linearGradient id="routeMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3882f6" stopOpacity="1"/>
            <stop offset="100%" stopColor="#6ea8ff" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="routeAlt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9922a" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#e8b84b" stopOpacity="0.5"/>
          </linearGradient>
          <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(13,80,40,0.18)"/>
            <stop offset="100%" stopColor="rgba(13,80,40,0.04)"/>
          </linearGradient>
          <filter id="buildingGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="activeGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          {/* NEW: Soft glow filter for pulsing buildings */}
          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          {/* NEW: Intelligence grid overlay */}
          <pattern id="intelligenceGrid" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="7.5" cy="7.5" r="0.4" fill="rgba(107,79,207,0.3)"/>
          </pattern>
        </defs>

        {/* ── BASE LAYER (always visible, original) ─────────────────────── */}
        <rect width="700" height="390" fill="url(#campusDotGrid)"/>
        <rect width="700" height="390" fill="url(#campusGrid)"/>
        <ellipse cx="350" cy="390" rx="300" ry="55" fill="url(#groundGrad)"/>
        <path d="M 40 360 Q 350 300 660 360" fill="none" stroke="rgba(56,130,246,0.08)" strokeWidth="18" strokeLinecap="round"/>
        <path d="M 40 360 Q 350 300 660 360" fill="none" stroke="rgba(56,130,246,0.06)" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 6"/>
        <ellipse cx="340" cy="365" rx="140" ry="22" fill="rgba(13,120,60,0.1)"/>
        <ellipse cx="340" cy="365" rx="100" ry="14" fill="rgba(13,120,60,0.08)"/>

        {/* ── INTELLIGENCE LAYER OVERLAY (new) ──────────────────────────── */}
        <motion.g animate={{ opacity: layerOpacities.intelligence * 0.15 }} transition={{ duration: 0.8 }}>
          <rect width="700" height="390" fill="url(#intelligenceGrid)"/>
        </motion.g>

        {/* ── ROUTE NETWORK LAYER ────────────────────────────────────────── */}
        <motion.g
          animate={{ opacity: layerOpacities.routeNetwork }}
          transition={{ duration: 0.7 }}
        >
          {PATHS.map((p, i) => {
            const isInMetadata = routeMetadata.some(m => m.pathIndex === i);
            const shouldShow = showAllPaths || isInMetadata;
            return shouldShow ? (
              <motion.path
                key={i}
                d={p.d}
                fill="none"
                stroke={isInMetadata ? "url(#routeMain)" : "url(#routeAlt)"}
                strokeWidth={isInMetadata ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeDasharray={isInMetadata ? "none" : "5 4"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}
              />
            ) : null;
          })}
        </motion.g>

        {/* ── ACTIVE ROUTE (scroll-reactive path) ────────────────────────── */}
        <motion.g animate={{ opacity: layerOpacities.routeNetwork }} transition={{ duration: 0.7 }}>
          {/* Glow halo */}
          <motion.path
            d={activeRoutePath}
            fill="none"
            stroke="rgba(56,130,246,0.35)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Animated marching ants */}
          <motion.path
            key={activeRoutePath} // remount when path changes → replays animation
            d={activeRoutePath}
            fill="none"
            stroke="#3882f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="10 6"
            animate={{ strokeDashoffset: [0, -32] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            opacity={0.9}
          />
        </motion.g>

        {/* ── ACCESSIBILITY LAYER (new) ──────────────────────────────────── */}
        <motion.g animate={{ opacity: layerOpacities.accessibility }} transition={{ duration: 0.7 }}>
          {/* Mark accessible path midpoints */}
          {routeMetadata
            .filter(m => m.accessible)
            .map((m, i) => (
              <A11yDot key={i} x={m.midX} y={m.midY + 16} opacity={1} />
            ))}
        </motion.g>

        {/* ── HEATMAP LAYER (admin section) ─────────────────────────────── */}
        <motion.g animate={{ opacity: layerOpacities.heatmap }} transition={{ duration: 0.8 }}>
          {BUILDINGS.map(b => (
            <BuildingHeatmap
              key={b.id}
              b={b}
              intensity={HEATMAP[b.id as keyof typeof HEATMAP]}
              opacity={1}
            />
          ))}
        </motion.g>

        {/* ── BUILDINGS (scroll-reactive illumination) ──────────────────── */}
        {BUILDINGS.map((b, i) => {
          const isActive = activeBuildingIds.includes(b.id);
          const isPulsing = pulsingBuildingIds.includes(b.id);
          const floorCount = Math.min(b.floors, 4);

          return (
            <motion.g
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.55, ease: EASE }}
            >
              {/* Shadow */}
              <rect x={b.x + 4} y={b.y + 4} width={b.w} height={b.h} rx="5"
                fill="rgba(0,0,0,0.3)" filter="url(#buildingGlow)"/>

              {/* NEW: Active building glow halo */}
              {isActive && (
                <motion.rect
                  x={b.x - 3} y={b.y - (floorCount - 1) * 5 - 3}
                  width={b.w + 6} height={b.h + 6} rx={7}
                  fill="transparent"
                  stroke="rgba(56,130,246,0.3)"
                  strokeWidth={1}
                  animate={isPulsing ? {
                    opacity: [0.4, 0.9, 0.4],
                    strokeWidth: [1, 2, 1],
                  } : { opacity: 0.3 }}
                  transition={isPulsing ? {
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  } : { duration: 0.5 }}
                />
              )}

              {/* Floor depth bars — animated fill on activation */}
              {Array.from({ length: floorCount }).map((_, fi) => (
                <motion.rect
                  key={fi}
                  x={b.x} y={b.y - fi * 5}
                  width={b.w} height={b.h} rx={5}
                  animate={{
                    fill: isActive
                      ? `rgba(56,130,246,${0.08 + fi * 0.04})`
                      : `rgba(22,42,78,${0.6 + fi * 0.08})`,
                    stroke: isActive
                      ? `rgba(56,130,246,${0.3 + fi * 0.1})`
                      : `rgba(56,130,246,${0.1 + fi * 0.04})`,
                    strokeWidth: isActive ? 1.5 : 0.75,
                  }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              ))}

              {/* Top face */}
              <motion.rect
                x={b.x} y={b.y - (floorCount - 1) * 5}
                width={b.w} height={b.h} rx={5}
                animate={{
                  fill: isActive ? "rgba(56,130,246,0.28)" : "rgba(30,52,88,0.85)",
                  stroke: isActive ? "rgba(110,168,255,0.7)" : "rgba(56,130,246,0.22)",
                  strokeWidth: isActive ? 1.5 : 1,
                }}
                transition={{ duration: 0.6, ease: EASE }}
              />

              {/* Window dots */}
              {!isActive && Array.from({ length: 3 }).map((_, wi) =>
                Array.from({ length: 2 }).map((_, hi) => (
                  <rect
                    key={`${wi}-${hi}`}
                    x={b.x + 10 + wi * ((b.w - 20) / 3)}
                    y={b.y - (floorCount - 1) * 5 + 10 + hi * ((b.h - 20) / 2.5)}
                    width={6} height={5} rx={1}
                    fill="rgba(200,220,255,0.08)"
                  />
                ))
              )}

              {/* Building ID label */}
              <motion.text
                x={b.x + b.w / 2}
                y={b.y - (floorCount - 1) * 5 + b.h / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                animate={{ fill: isActive ? "#6ea8ff" : "rgba(160,190,230,0.55)" }}
                transition={{ duration: 0.5 }}
                fontSize="11" fontWeight="700" fontFamily="var(--font-sans)"
              >{b.id}</motion.text>

              {/* Floor badge */}
              <rect
                x={b.x + b.w - 18} y={b.y - (floorCount - 1) * 5 - 14}
                width={16} height={12} rx={3}
                fill="rgba(56,130,246,0.2)" stroke="rgba(56,130,246,0.35)" strokeWidth="0.8"
              />
              <text
                x={b.x + b.w - 10} y={b.y - (floorCount - 1) * 5 - 8}
                textAnchor="middle" dominantBaseline="middle"
                fill="#6ea8ff" fontSize="7" fontFamily="var(--font-sans)" fontWeight="700"
              >F{b.floors}</text>

              {/* Building label below */}
              <motion.text
                x={b.x + b.w / 2} y={b.y + b.h + 14}
                textAnchor="middle"
                animate={{ fill: isActive ? "rgba(160,200,255,0.75)" : "rgba(140,170,210,0.4)" }}
                transition={{ duration: 0.5 }}
                fontSize="9" fontFamily="var(--font-body)" letterSpacing="0.3"
              >{b.label}</motion.text>
            </motion.g>
          );
        })}

        {/* ── ROUTE METADATA OVERLAYS (new, intelligence layer) ─────────── */}
        <motion.g
          animate={{ opacity: Math.max(layerOpacities.routeNetwork, layerOpacities.intelligence) * 0.9 }}
          transition={{ duration: 0.8 }}
        >
          {routeMetadata.map((m, i) => (
            <MetadataBadge
              key={`meta-${m.pathIndex}`}
              x={m.midX}
              y={m.midY}
              distance={m.distance}
              time={m.time}
              accessible={m.accessible}
              opacity={1}
            />
          ))}
        </motion.g>

        {/* ── START / END NODES (scroll-reactive colors) ────────────────── */}
        {[
          { cx: 60, cy: 241, color: "#0d9e6e", label: "You", sub: "Main Entry" },
          { cx: 506, cy: 158, color: highlightNodeColor, label: "Dest", sub: "Admin Block" },
        ].map((n, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + i * 0.2, duration: 0.4, ease: EASE }}
          >
            <motion.circle
              cx={n.cx} cy={n.cy} r="14"
              fill="transparent"
              animate={{ stroke: n.color }}
              strokeWidth="1"
              transition={{ duration: 0.5 }}
            />
            <motion.circle
              cx={n.cx} cy={n.cy} r="14"
              fill="transparent"
              stroke={n.color}
              strokeWidth="1"
              animate={{ r: [12, 20, 12], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.8 }}
            />
            <motion.circle
              cx={n.cx} cy={n.cy} r="7"
              animate={{ fill: `${n.color}22`, stroke: n.color }}
              transition={{ duration: 0.5 }}
              strokeWidth="1.5"
            />
            <circle cx={n.cx} cy={n.cy} r="3" fill={n.color}/>
            <text x={n.cx} y={n.cy - 20} textAnchor="middle"
              fill={n.color} fontSize="9" fontWeight="700" fontFamily="var(--font-sans)" letterSpacing="0.5">
              {n.label}
            </text>
            <text x={n.cx} y={n.cy - 10} textAnchor="middle"
              fill={`${n.color}88`} fontSize="7.5" fontFamily="var(--font-body)">
              {n.sub}
            </text>
          </motion.g>
        ))}

        {/* ── COMPASS ROSE (original, preserved) ────────────────────────── */}
        <g transform="translate(648, 348)">
          <circle cx="0" cy="0" r="16" fill="rgba(13,26,46,0.7)" stroke="rgba(56,130,246,0.2)" strokeWidth="1"/>
          <text x="0" y="-7" textAnchor="middle" fill="rgba(110,168,255,0.8)" fontSize="7" fontWeight="700" fontFamily="var(--font-sans)">N</text>
          <path d="M 0 -4 L 2 2 L 0 0 L -2 2 Z" fill="#3882f6" opacity="0.9"/>
          <path d="M 0 4 L 2 -1 L 0 0 L -2 -1 Z" fill="rgba(255,255,255,0.3)"/>
        </g>
      </svg>

      {/* ── Legend + Status bar (original + enhanced) ────────────────────── */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid rgba(56,130,246,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.25)",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { color: "#3882f6", label: "Active route" },
            { color: "#c9922a", label: "Alternate" },
            { color: "#0d9e6e", label: "Origin" },
            { color: highlightNodeColor, label: "Destination" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 18, height: 2, borderRadius: 2, background: l.color, opacity: 0.85 }}/>
              <span style={{ fontSize: 9, color: "rgba(160,190,230,0.55)", fontFamily: "var(--font-body)" }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Active buildings count — new */}
          <motion.div
            key={activeBuildingIds.length}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span style={{ fontSize: 9, color: "rgba(110,168,255,0.5)", fontFamily: "var(--font-sans)" }}>
              {activeBuildingIds.length}/{BUILDINGS.length} lit
            </span>
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Navigation size={11} style={{ color: "#3882f6" }}/>
            <span style={{ fontSize: 11, color: "rgba(160,190,230,0.7)", fontFamily: "var(--font-body)" }}>340m · Optimal</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#6ea8ff", fontFamily: "var(--font-sans)" }}>
            3 min ETA
          </div>
        </div>
      </div>
    </motion.div>
  );
}