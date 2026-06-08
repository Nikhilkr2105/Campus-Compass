/**
 * useMapNarrative — Phase 3
 *
 * Pure state machine: sectionIndex → map configuration.
 * No SVG logic, no rendering. Only data.
 *
 * Consumed by:
 *   TopologyMapReactive  (enhanced map in hero)
 *   MiniCampusNavigator  (sticky desktop overview)
 */

import { useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MapLayer =
  | "navigation"   // hero / cta: primary route highlighted
  | "exploration"  // story: full campus, medical/accessibility visible
  | "intelligence" // stats / features: all nodes, AI overlays
  | "connected"    // ecosystem / architecture: web of connections
  | "analytics";   // admin: heatmap tones, all buildings lit

export interface RouteMetadata {
  pathIndex: number;       // index into PATHS array
  distance: string;        // "120m"
  time: string;            // "2 min"
  accessible: boolean;
  midX: number;            // SVG coord for overlay badge
  midY: number;
}

export interface MapNarrativeState {
  activeBuildingIds: string[];   // e.g. ["A","B","D"]
  pulsingBuildingIds: string[];  // subset that gets pulse animation
  layer: MapLayer;
  layerOpacities: {
    base: number;          // always 1
    routeNetwork: number;  // 0-1
    accessibility: number; // 0-1
    intelligence: number;  // 0-1
    heatmap: number;       // 0-1
  };
  routeMetadata: RouteMetadata[];
  narrativeLabel: string;   // shown in mini-navigator
  narrativeDesc: string;    // subtitle
  showAllPaths: boolean;    // whether non-active paths render
  activeRoutePath: string;  // SVG path d override for animated route
  highlightNodeColor: string; // color for destination node
}

// ─── Per-section map configurations ───────────────────────────────────────────

/**
 * Building IDs:
 *   A = Main Block   B = Science   C = Library
 *   D = Admin        E = Hostel    F = Medical   G = Sports
 *
 * Route metadata midpoints computed from actual SVG path coordinates:
 *   path 0: M127,241 → M222,168  → mid ≈ (175, 204)
 *   path 1: M304,168 → M344,225  → mid ≈ (324, 196)
 *   path 2: M416,225 → M462,158  → mid ≈ (439, 191)
 *   path 3: M550,158 → M562,257  → mid ≈ (556, 207)
 *   path 4: M127,241 → M198,309  → mid ≈ (162, 275)
 *   path 5: M266,309 → M344,225  → mid ≈ (305, 267)
 *   path 6: M416,225 → M402,319  → mid ≈ (409, 272)
 */

const SECTION_MAP_STATES: MapNarrativeState[] = [
  // ── 0: HERO — Main navigation route ──────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "D"],
    pulsingBuildingIds: ["A", "D"],
    layer: "navigation",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0, intelligence: 0, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
    ],
    narrativeLabel: "Main Route",
    narrativeDesc: "Entry → Admin",
    showAllPaths: false,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#d94040",
  },

  // ── 1: STORY — Campus exploration ────────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "F"],
    pulsingBuildingIds: ["F"],
    layer: "exploration",
    layerOpacities: { base: 1, routeNetwork: 0.85, accessibility: 0.9, intelligence: 0, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 4, distance: "70m",  time: "1 min", accessible: true,  midX: 162, midY: 267 },
      { pathIndex: 5, distance: "90m",  time: "1 min", accessible: false, midX: 305, midY: 259 },
    ],
    narrativeLabel: "Campus Life",
    narrativeDesc: "Explore all zones",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 198 309 L 266 309 L 344 225 L 304 168 L 222 168",
    highlightNodeColor: "#0d9e6e",
  },

  // ── 2: STATS — System intelligence view ──────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    pulsingBuildingIds: ["A", "B", "C", "D"],
    layer: "intelligence",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0.5, intelligence: 1, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 1, distance: "80m",  time: "1 min", accessible: true,  midX: 324, midY: 188 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
      { pathIndex: 3, distance: "60m",  time: "1 min", accessible: false, midX: 556, midY: 199 },
    ],
    narrativeLabel: "Intelligence",
    narrativeDesc: "All 22 buildings",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#6b4fcf",
  },

  // ── 3: FEATURES — Full intelligence ──────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    pulsingBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    layer: "intelligence",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0.8, intelligence: 1, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 1, distance: "80m",  time: "1 min", accessible: true,  midX: 324, midY: 188 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
      { pathIndex: 4, distance: "70m",  time: "1 min", accessible: true,  midX: 162, midY: 267 },
      { pathIndex: 5, distance: "90m",  time: "1 min", accessible: false, midX: 305, midY: 259 },
      { pathIndex: 6, distance: "55m",  time: "1 min", accessible: true,  midX: 409, midY: 264 },
    ],
    narrativeLabel: "AI Routing",
    narrativeDesc: "9 capabilities",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#6b4fcf",
  },

  // ── 4: ECOSYSTEM — Connected campus ──────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    pulsingBuildingIds: ["A", "D", "F"],
    layer: "connected",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0.4, intelligence: 0.7, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
      { pathIndex: 6, distance: "55m",  time: "1 min", accessible: true,  midX: 409, midY: 264 },
    ],
    narrativeLabel: "Ecosystem",
    narrativeDesc: "Unified platform",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#3882f6",
  },

  // ── 5: ADMIN — Analytics heatmap ─────────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    pulsingBuildingIds: ["A", "B", "E"],
    layer: "analytics",
    layerOpacities: { base: 1, routeNetwork: 0.6, accessibility: 0.2, intelligence: 0.5, heatmap: 1 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 1, distance: "80m",  time: "1 min", accessible: true,  midX: 324, midY: 188 },
      { pathIndex: 3, distance: "60m",  time: "1 min", accessible: false, midX: 556, midY: 199 },
    ],
    narrativeLabel: "Admin View",
    narrativeDesc: "2,418 active now",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#c9922a",
  },

  // ── 6: ARCHITECTURE — Full connected ─────────────────────────────────────
  {
    activeBuildingIds: ["A", "B", "C", "D", "E", "F", "G"],
    pulsingBuildingIds: [],
    layer: "connected",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0.6, intelligence: 0.8, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 1, distance: "80m",  time: "1 min", accessible: true,  midX: 324, midY: 188 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
      { pathIndex: 4, distance: "70m",  time: "1 min", accessible: true,  midX: 162, midY: 267 },
      { pathIndex: 5, distance: "90m",  time: "1 min", accessible: false, midX: 305, midY: 259 },
      { pathIndex: 6, distance: "55m",  time: "1 min", accessible: true,  midX: 409, midY: 264 },
    ],
    narrativeLabel: "Architecture",
    narrativeDesc: "8 modules connected",
    showAllPaths: true,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#3882f6",
  },

  // ── 7: CTA — Back to navigation ──────────────────────────────────────────
  {
    activeBuildingIds: ["A", "D"],
    pulsingBuildingIds: ["A", "D"],
    layer: "navigation",
    layerOpacities: { base: 1, routeNetwork: 1, accessibility: 0, intelligence: 0, heatmap: 0 },
    routeMetadata: [
      { pathIndex: 0, distance: "120m", time: "2 min", accessible: true,  midX: 175, midY: 196 },
      { pathIndex: 2, distance: "95m",  time: "1 min", accessible: true,  midX: 439, midY: 183 },
    ],
    narrativeLabel: "Ready",
    narrativeDesc: "Start navigating",
    showAllPaths: false,
    activeRoutePath: "M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158",
    highlightNodeColor: "#0d9e6e",
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseMapNarrativeParams {
  sectionIndex: number;
  sectionProgress: number; // 0-1 within current section
}

export function useMapNarrative({
  sectionIndex,
  sectionProgress,
}: UseMapNarrativeParams): MapNarrativeState {
  return useMemo(() => {
    const clamped = Math.max(0, Math.min(SECTION_MAP_STATES.length - 1, sectionIndex));
    const current = SECTION_MAP_STATES[clamped];
    const next = SECTION_MAP_STATES[Math.min(clamped + 1, SECTION_MAP_STATES.length - 1)];

    // Crossfade opacity layers smoothly in last 30% of each section
    const blend = sectionProgress > 0.7
      ? (sectionProgress - 0.7) / 0.3
      : 0;

    if (blend === 0 || current === next) return current;

    // Interpolate layer opacities for cinematic crossfade
    const lerp = (a: number, b: number) => a + (b - a) * blend;
    return {
      ...current,
      layerOpacities: {
        base: 1,
        routeNetwork:  lerp(current.layerOpacities.routeNetwork,  next.layerOpacities.routeNetwork),
        accessibility: lerp(current.layerOpacities.accessibility, next.layerOpacities.accessibility),
        intelligence:  lerp(current.layerOpacities.intelligence,  next.layerOpacities.intelligence),
        heatmap:       lerp(current.layerOpacities.heatmap,       next.layerOpacities.heatmap),
      },
      // Building activation blends at same threshold
      activeBuildingIds: blend > 0.5 ? next.activeBuildingIds : current.activeBuildingIds,
      pulsingBuildingIds: blend > 0.5 ? next.pulsingBuildingIds : current.pulsingBuildingIds,
    };
  }, [sectionIndex, sectionProgress]);
}

// Named export for section definitions (used by MiniCampusNavigator)
export { SECTION_MAP_STATES };