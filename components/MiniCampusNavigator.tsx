"use client";

/**
 * MiniCampusNavigator — Phase 3
 *
 * Sticky desktop-only (hidden on mobile) campus overview.
 * Shows building layout at 1/4 scale with active buildings highlighted.
 * Does NOT compete with the main map — sits below ScrollIndicator.
 *
 * Design decisions:
 *   - 160px wide, proportional height
 *   - Fixed right edge, below scroll dots
 *   - Ultra-minimal: only building rects + route hint
 *   - Animated highlight on active buildings
 *   - Narrative label shows current section context
 *   - Appears after hero (opacity 0 while sectionIndex === 0)
 */

import { motion } from "framer-motion";
import type { MapNarrativeState } from "@/hooks/useMapNarrative";

// Scale factor: original viewBox 700×390 → display ~160×89
const SCALE = 160 / 700;
const H = Math.round(390 * SCALE); // ≈ 89

// Exact building data mirrored from TopologyMapReactive (positions only)
const MINI_BUILDINGS = [
  { id: "A", x: 80,  y: 210, w: 95,  h: 62, label: "Main" },
  { id: "B", x: 222, y: 132, w: 82,  h: 72, label: "Sci"  },
  { id: "C", x: 344, y: 196, w: 72,  h: 58, label: "Lib"  },
  { id: "D", x: 462, y: 124, w: 88,  h: 68, label: "Adm"  },
  { id: "E", x: 562, y: 234, w: 76,  h: 52, label: "Hos"  },
  { id: "F", x: 198, y: 284, w: 68,  h: 50, label: "Med"  },
  { id: "G", x: 402, y: 296, w: 92,  h: 46, label: "Spt"  },
] as const;

// Route path for mini scale
const MINI_ROUTE = "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158";

// Layer to accent color
const LAYER_COLOR: Record<string, string> = {
  navigation:  "#3882f6",
  exploration: "#0d9e6e",
  intelligence:"#6b4fcf",
  connected:   "#3882f6",
  analytics:   "#c9922a",
};

const EASE = [0.16, 1, 0.3, 1] as const;

interface MiniCampusNavigatorProps {
  mapState: MapNarrativeState;
  sectionIndex: number;
}

export function MiniCampusNavigator({ mapState, sectionIndex }: MiniCampusNavigatorProps) {
  const { activeBuildingIds, layer, narrativeLabel, narrativeDesc } = mapState;
  const accentColor = LAYER_COLOR[layer] ?? "#3882f6";

  // Hidden in hero (0), visible from section 1 onward
  const isVisible = sectionIndex >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed hidden md:block pointer-events-none z-40"
      style={{ right: 24, top: "50%", transform: "translateY(-50%)" }}
    >
      <div
        style={{
          width: 160,
          borderRadius: 14,
          background: "rgba(10,18,35,0.88)",
          border: `1px solid ${accentColor}28`,
          backdropFilter: "blur(16px)",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(56,130,246,0.06)`,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "8px 10px 6px",
          borderBottom: `1px solid ${accentColor}18`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <motion.div
            animate={{ background: accentColor }}
            transition={{ duration: 0.5 }}
            style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div
              key={narrativeLabel}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {narrativeLabel}
            </motion.div>
            <div style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-body)",
              marginTop: 2,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {narrativeDesc}
            </div>
          </div>
        </div>

        {/* Mini SVG map */}
        <div style={{ padding: "8px 8px 6px" }}>
          <svg
            viewBox="0 0 700 390"
            style={{ width: "100%", display: "block" }}
          >
            {/* Ground */}
            <rect width="700" height="390" fill="rgba(22,42,78,0.3)"/>
            <ellipse cx="350" cy="390" rx="300" ry="55" fill="rgba(13,80,40,0.12)"/>

            {/* Path spine hint */}
            <path
              d="M 40 360 Q 350 300 660 360"
              fill="none"
              stroke="rgba(56,130,246,0.08)"
              strokeWidth="22"
              strokeLinecap="round"
            />

            {/* Active route — mini version */}
            <motion.path
              d={mapState.activeRoutePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 5"
              animate={{ strokeDashoffset: [0, -26] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              opacity={0.7}
            />

            {/* Buildings */}
            {MINI_BUILDINGS.map((b, i) => {
              const isActive = activeBuildingIds.includes(b.id);
              return (
                <motion.g key={b.id}>
                  {/* Glow for active */}
                  {isActive && (
                    <motion.rect
                      x={b.x - 2} y={b.y - 2}
                      width={b.w + 4} height={b.h + 4} rx={4}
                      fill="transparent"
                      stroke={accentColor}
                      strokeWidth={1.5}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                    />
                  )}

                  {/* Building rect */}
                  <motion.rect
                    x={b.x} y={b.y}
                    width={b.w} height={b.h} rx={4}
                    animate={{
                      fill: isActive
                        ? `${accentColor}33`
                        : "rgba(22,42,78,0.7)",
                      stroke: isActive
                        ? `${accentColor}70`
                        : "rgba(56,130,246,0.18)",
                    }}
                    transition={{ duration: 0.6, ease: EASE }}
                    strokeWidth={1}
                  />

                  {/* Building ID — tiny */}
                  <text
                    x={b.x + b.w / 2}
                    y={b.y + b.h / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "#6ea8ff" : "rgba(100,130,170,0.5)"}
                    fontSize={10}
                    fontWeight="700"
                    fontFamily="var(--font-sans)"
                  >
                    {b.id}
                  </text>
                </motion.g>
              );
            })}

            {/* Start node */}
            <circle cx={60} cy={241} r={6}
              fill="rgba(13,158,110,0.2)"
              stroke="#0d9e6e"
              strokeWidth={1.5}
            />
            <circle cx={60} cy={241} r={2.5} fill="#0d9e6e"/>

            {/* End node */}
            <motion.circle
              cx={506} cy={158} r={6}
              animate={{ fill: `${mapState.highlightNodeColor}22`, stroke: mapState.highlightNodeColor }}
              transition={{ duration: 0.5 }}
              strokeWidth={1.5}
            />
            <motion.circle
              cx={506} cy={158} r={2.5}
              animate={{ fill: mapState.highlightNodeColor }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>

        {/* Active buildings count */}
        <div style={{
          padding: "4px 10px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 3 }}>
            {MINI_BUILDINGS.map(b => (
              <motion.div
                key={b.id}
                animate={{
                  background: activeBuildingIds.includes(b.id)
                    ? accentColor
                    : "rgba(56,130,246,0.15)",
                }}
                transition={{ duration: 0.4 }}
                style={{ width: 14, height: 4, borderRadius: 2 }}
              />
            ))}
          </div>
          <span style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-sans)",
          }}>
            {activeBuildingIds.length}/7
          </span>
        </div>
      </div>
    </motion.div>
  );
}