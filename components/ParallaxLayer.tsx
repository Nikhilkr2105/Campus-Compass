"use client";

/**
 * ParallaxLayer — Phase 4
 *
 * Generic wrapper that applies scroll-driven parallax to children.
 * Three speed tiers: "bg" | "mid" | "fg"
 *
 * Usage:
 *   <ParallaxLayer depth="mid" y={spatialDepth.midY}>
 *     <SomeContent />
 *   </ParallaxLayer>
 *
 * Design rules:
 *   - Only CSS transform (translateY) — GPU composited, no layout
 *   - transform-style: preserve-3d propagated to children
 *   - will-change: transform applied only when animating
 *   - Skipped entirely when reducedMotion = true (passes through children)
 */

import { motion, type MotionValue } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface ParallaxLayerProps {
  children:     ReactNode;
  y:            MotionValue<number>;
  depth?:       "bg" | "mid" | "fg";       // visual hint for z-index grouping
  perspective?: number;                      // CSS perspective in px (optional)
  style?:       CSSProperties;
  className?:   string;
  reducedMotion?: boolean;
}

// Z-index bands per depth tier — keeps layers visually ordered
const Z_INDEX: Record<string, number> = {
  bg:  0,
  mid: 1,
  fg:  2,
};

export function ParallaxLayer({
  children,
  y,
  depth = "mid",
  perspective,
  style,
  className,
  reducedMotion = false,
}: ParallaxLayerProps) {
  // When reduced motion is requested, render children transparently
  if (reducedMotion) {
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      style={{
        y,
        position: "relative",
        zIndex: Z_INDEX[depth] ?? 1,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...(perspective ? { perspective: `${perspective}px` } : {}),
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SectionDepthWrapper
 *
 * Wraps a section container with CSS perspective.
 * Provides the containing block for child 3D transforms.
 * Static — not animated. Only sets CSS, no motion values.
 *
 * Usage:
 *   <SectionDepthWrapper perspective={spatialDepth.perspectiveDepth}>
 *     <section id="story">...</section>
 *   </SectionDepthWrapper>
 */
interface SectionDepthWrapperProps {
  children:    ReactNode;
  perspective: number;
  style?:      CSSProperties;
  className?:  string;
}

export function SectionDepthWrapper({
  children,
  perspective,
  style,
  className,
}: SectionDepthWrapperProps) {
  return (
    <div
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 40%",
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}