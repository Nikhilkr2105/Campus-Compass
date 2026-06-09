/**
 * useSpatialDepth — Phase 4
 *
 * Produces scroll-driven spatial depth values consumed by:
 *   - LandingPage (hero parallax, map wrapper)
 *   - ParallaxLayer (generic wrapper)
 *   - Card components (tilt system uses mouse, not this hook)
 *
 * Design constraints:
 *   - GPU-only transforms (translateY, rotateX, scale)
 *   - No layout-triggering properties
 *   - Spring config: stiffness 45, damping 22, mass 0.8 → "Rivian" weighted feel
 *   - Max rotateX = 1.2deg — cinematic not dramatic
 *   - All values are MotionValues for zero-cost subscriptions
 */

import {
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

// ─── Spring config ────────────────────────────────────────────────────────────
// Premium weighted feel — heavier than default, not bouncy
const SPRING_GENTLE  = { stiffness: 45, damping: 22, mass: 0.8 } as const;
const SPRING_MEDIUM  = { stiffness: 60, damping: 25, mass: 0.6 } as const;
const SPRING_SNAPPY  = { stiffness: 80, damping: 30, mass: 0.4 } as const;

// ─── Parallax speed multipliers ──────────────────────────────────────────────
// Lower = slower = further away.  These are fractions of raw scroll px.
const SPEED_BG  = 0.06;   // Sky / distant background
const SPEED_MID = 0.18;   // Content cards, section headers
const SPEED_FG  = 0.32;   // Near elements (map, hero text)

export interface SpatialDepthValues {
  // Raw parallax Y offsets (springed)
  bgY:  MotionValue<number>;   // background layer
  midY: MotionValue<number>;   // mid content
  fgY:  MotionValue<number>;   // foreground / close

  // Hero-specific (driven by hero scroll, not page scroll)
  heroContentY: MotionValue<number>;

  // Perspective hints (section-level, not per-element)
  // Used to set CSS perspective on section wrappers
  perspectiveDepth: number;   // px — static, section-dependent

  // Map wrapper tilt — static, enhances isometric look
  mapTilt: {
    rotateX: number;    // deg
    perspective: number; // px
    transformOrigin: string;
  };

  // Whether to use reduced motion (a11y)
  reducedMotion: boolean;
}

interface UseSpatialDepthParams {
  globalProgress: number;  // 0-1 from useScrollNarrative
  sectionIndex:   number;  // 0-7
  containerRef:   React.RefObject<HTMLElement>;
}

export function useSpatialDepth({
  globalProgress,
  sectionIndex,
  containerRef,
}: UseSpatialDepthParams): SpatialDepthValues {
  // Detect reduced motion preference
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // ── Page-level scroll ─────────────────────────────────────────────────────
  const { scrollY } = useScroll();

  // Raw parallax offsets from scroll position
  const rawBg  = useTransform(scrollY, (v) => -v * SPEED_BG);
  const rawMid = useTransform(scrollY, (v) => -v * SPEED_MID);
  const rawFg  = useTransform(scrollY, (v) => -v * SPEED_FG);

  // Hero content rises slightly faster than container (depth separation)
  const rawHeroContent = useTransform(scrollY, (v) => -v * 0.12);

  // Apply springs for weighted camera feel
  const bgY  = useSpring(reducedMotion ? 0 : rawBg,  SPRING_GENTLE);
  const midY = useSpring(reducedMotion ? 0 : rawMid, SPRING_MEDIUM);
  const fgY  = useSpring(reducedMotion ? 0 : rawFg,  SPRING_SNAPPY);
  const heroContentY = useSpring(
    reducedMotion ? 0 : rawHeroContent,
    SPRING_GENTLE
  );

  // ── Static spatial config ─────────────────────────────────────────────────
  // These are configuration values, not animated — rendered once via CSS.
  // perspectiveDepth changes per section for depth narrative:
  //   hero:     deep perspective (distant sky)
  //   content:  moderate (readable cards)
  //   ecosystem/admin: tighter (compact dashboard feel)
  const PERSPECTIVE_PER_SECTION = [
    1400, // 0 hero
    1200, // 1 story
    1000, // 2 stats
    1000, // 3 features
    900,  // 4 ecosystem
    900,  // 5 admin
    1100, // 6 architecture
    1300, // 7 cta
  ] as const;

  const perspectiveDepth =
    PERSPECTIVE_PER_SECTION[Math.min(sectionIndex, 7)] ?? 1200;

  // Map tilt: static 3D hint that enhances the existing isometric look.
  // NOT scroll-reactive — stable CSS transform.
  const mapTilt = reducedMotion
    ? { rotateX: 0, perspective: 0, transformOrigin: "center center" }
    : { rotateX: 3, perspective: 900, transformOrigin: "center bottom" };

  return {
    bgY,
    midY,
    fgY,
    heroContentY,
    perspectiveDepth,
    mapTilt,
    reducedMotion,
  };
}