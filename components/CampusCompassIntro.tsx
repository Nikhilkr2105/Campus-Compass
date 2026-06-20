"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CampusCompassIntroProps {
  /** Called once the intro has fully finished (including its fade-out). */
  onComplete: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface ParticleProfile {
  radius: number;
  isGold: boolean;
}

interface ColorBuckets {
  blue: number[];
  gold: number[];
}

interface MorphBuckets {
  steady: ColorBuckets;
  spawn: ColorBuckets;
  dying: ColorBuckets;
}

// Single source of truth for the timeline: 0->1.7s CAMPUS, 1.7->3.4s
// COMPASS, 3.4->4.4s BY NIKHIL, 4.4->5.0s dissolve. Sums to exactly 5000ms.
const SEG_FORM_MS = 1700;
const SEG_MORPH1_MS = 1700;
const SEG_MORPH2_MS = 1000;
const SEG_DISSOLVE_MS = 600;
const TOTAL_PARTICLE_MS = SEG_FORM_MS + SEG_MORPH1_MS + SEG_MORPH2_MS + SEG_DISSOLVE_MS; // 5000
// The container's own fade-out happens AFTER the 5s particle sequence - a
// separate, short polish step, not part of the 5s particle budget.
const EXIT_FADE_MS = 350;

const WORDS = ["CAMPUS", "COMPASS", "BY NIKHIL"] as const;

// System font stack only. Canvas text-sampling needs the font already
// loaded before the letters are turned into pixels - a system font is
// guaranteed available with zero load delay, so the very first sampled
// frame can never accidentally sample a fallback font.
const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const BLUE_RGB = "120, 168, 255"; // intelligent blue
const GOLD_RGB = "212, 178, 110"; // subtle premium gold accent
const GOLD_RATIO = 0.06; // a sprinkle of accent particles, never the majority
const GOLD_ALPHA_MULT = 0.85; // gold stays a touch dimmer than blue - accent, not competing focal point

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shrinks the font until `text` fits within `maxWidth`; leaves ctx.font set to the result. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize = 26
): number {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `700 ${size}px ${FONT_STACK}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

/**
 * Renders `text` to an offscreen mask canvas, then samples its visible
 * (non-transparent) pixels into particle target points - the literal
 * "particles form the text" mechanism from the original technique. The
 * sampling stride self-tightens if a word is too sparse to read (e.g. a
 * long phrase forced small on a narrow viewport), and the result is capped
 * for performance. Particle count is NOT fixed ahead of time - it falls
 * out of how much ink each word actually has, which is what keeps short
 * and long words equally legible instead of spreading the same fixed
 * budget thin over a big shape.
 */
function sampleTextPoints(
  text: string,
  maskWidth: number,
  maskHeight: number,
  minPoints: number,
  maxPoints: number
): Point[] {
  const canvas = document.createElement("canvas");
  canvas.width = maskWidth;
  canvas.height = maskHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.clearRect(0, 0, maskWidth, maskHeight);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = fitFontSize(ctx, text, maskWidth * 0.92, maskHeight * 0.68);
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`;

  // Progressive enhancement only - silently ignored on browsers without
  // support. Letters are still perfectly legible without it.
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${fontSize * 0.02}px`;
  } catch {
    /* unsupported - fine, normal spacing still reads clearly */
  }

  ctx.fillText(text, maskWidth / 2, maskHeight / 2);

  const { data } = ctx.getImageData(0, 0, maskWidth, maskHeight);

  const sampleAtStride = (stride: number): Point[] => {
    const pts: Point[] = [];
    for (let y = 0; y < maskHeight; y += stride) {
      for (let x = 0; x < maskWidth; x += stride) {
        if (data[(y * maskWidth + x) * 4 + 3] > 128) pts.push({ x, y });
      }
    }
    return pts;
  };

  let stride = maskWidth < 500 ? 4 : 3;
  let candidates = sampleAtStride(stride);
  while (candidates.length < minPoints && stride > 1) {
    stride -= 1;
    candidates = sampleAtStride(stride);
  }

  if (candidates.length === 0) return [];

  shuffle(candidates);
  if (candidates.length > maxPoints) candidates = candidates.slice(0, maxPoints);
  return candidates;
}

function generateScatter(width: number, height: number, count: number): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(width, height) * (0.55 + Math.random() * 0.55);
    return { x: centerX + Math.cos(angle) * distance, y: centerY + Math.sin(angle) * distance };
  });
}

function buildProfiles(count: number): ParticleProfile[] {
  return Array.from({ length: count }, () => ({
    radius: 1.3 + Math.random() * 0.7,
    isGold: Math.random() < GOLD_RATIO,
  }));
}

function bucketByColor(indices: number[], profiles: ParticleProfile[]): ColorBuckets {
  const blue: number[] = [];
  const gold: number[] = [];
  for (const i of indices) (profiles[i].isGold ? gold : blue).push(i);
  return { blue, gold };
}

/** Every particle slot a word actually uses (indices [0, count)). Mirrors the original's "every sampled pixel becomes a particle". */
function buildWordBuckets(count: number, profiles: ParticleProfile[]): ColorBuckets {
  const indices = Array.from({ length: count }, (_, i) => i);
  return bucketByColor(indices, profiles);
}

/**
 * Splits the index range into three groups for a transition between two
 * words - this IS the "reuse particle instances between words" mechanic
 * from the original, just expressed as precomputed buckets instead of a
 * mutated array, so timing stays exact:
 * - steady: needed by both words -> just retargets and keeps full opacity
 * - spawn: not needed by the "from" word, needed by the "to" word -> flies
 *   in from the scatter field and fades in (mirrors creating a new particle)
 * - dying: needed by the "from" word, not needed by the "to" word -> flies
 *   out to the scatter field and fades out (mirrors particle.kill())
 */
function buildMorphBuckets(countFrom: number, countTo: number, profiles: ParticleProfile[]): MorphBuckets {
  const steady: number[] = [];
  const spawn: number[] = [];
  const dying: number[] = [];
  const max = Math.max(countFrom, countTo);
  for (let i = 0; i < max; i++) {
    const inFrom = i < countFrom;
    const inTo = i < countTo;
    if (inFrom && inTo) steady.push(i);
    else if (!inFrom && inTo) spawn.push(i);
    else if (inFrom && !inTo) dying.push(i);
  }
  return {
    steady: bucketByColor(steady, profiles),
    spawn: bucketByColor(spawn, profiles),
    dying: bucketByColor(dying, profiles),
  };
}

interface DeviceTier {
  minPoints: number;
  maxPoints: number;
}

function getDeviceTier(width: number): DeviceTier {
  if (width < 640) return { minPoints: 90, maxPoints: 650 };
  if (width < 1024) return { minPoints: 110, maxPoints: 950 };
  return { minPoints: 140, maxPoints: 1500 };
}

function reducedMotionAlpha(elapsed: number): number {
  const FADE = 250;
  if (elapsed < FADE) return elapsed / FADE;
  if (elapsed > TOTAL_PARTICLE_MS - FADE) return Math.max(0, (TOTAL_PARTICLE_MS - elapsed) / FADE);
  return 1;
}

function reducedMotionWordIndex(elapsed: number): number {
  if (elapsed < SEG_FORM_MS) return 0;
  if (elapsed < SEG_FORM_MS + SEG_MORPH1_MS) return 1;
  return 2;
}

export default function CampusCompassIntro({ onComplete }: CampusCompassIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exiting, setExiting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleComplete = useCallback(() => onComplete(), [onComplete]);

  // Drives the exit fade + unmount, independent of the canvas/rAF loop so
  // it fires reliably even if a frame or two gets dropped.
  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), TOTAL_PARTICLE_MS);
    const completeTimer = setTimeout(handleComplete, TOTAL_PARTICLE_MS + EXIT_FADE_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [handleComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let wordPoints: Point[][] = [[], [], []];
    let counts: number[] = [0, 0, 0];
    let scatterStart: Point[] = [];
    let scatterEnd: Point[] = [];
    let profiles: ParticleProfile[] = [];
    let wordBuckets: ColorBuckets[] = [
      { blue: [], gold: [] },
      { blue: [], gold: [] },
      { blue: [], gold: [] },
    ];
    let morphBuckets: [MorphBuckets, MorphBuckets] = [
      { steady: { blue: [], gold: [] }, spawn: { blue: [], gold: [] }, dying: { blue: [], gold: [] } },
      { steady: { blue: [], gold: [] }, spawn: { blue: [], gold: [] }, dying: { blue: [], gold: [] } },
    ];

    const buildScene = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const tier = getDeviceTier(width);

      // Capped regardless of monitor size, so an ultra-wide desktop never
      // blows up the one-off pixel-sampling cost. Text stays centered.
      const maskWidth = Math.min(width * 0.82, 880);
      const maskHeight = Math.min(height * 0.32, 260);
      const offsetX = (width - maskWidth) / 2;
      const offsetY = height / 2 - maskHeight / 2;

      wordPoints = WORDS.map((word) =>
        sampleTextPoints(word, maskWidth, maskHeight, tier.minPoints, tier.maxPoints).map((p) => ({
          x: p.x + offsetX,
          y: p.y + offsetY,
        }))
      );
      counts = wordPoints.map((pts) => pts.length);
      const poolSize = Math.max(...counts, 1);

      scatterStart = generateScatter(width, height, poolSize);
      scatterEnd = generateScatter(width, height, poolSize);
      profiles = buildProfiles(poolSize);

      wordBuckets = counts.map((c) => buildWordBuckets(c, profiles));
      morphBuckets = [
        buildMorphBuckets(counts[0], counts[1], profiles),
        buildMorphBuckets(counts[1], counts[2], profiles),
      ];
    };

    buildScene();

    // If the viewport resizes mid-intro, particles re-target to the new
    // layout instantly. A brief jump is an acceptable trade-off for a
    // sequence this short staying responsive at every size.
    const resizeObserver = new ResizeObserver(buildScene);
    resizeObserver.observe(container);

    const fillGroup = (indices: number[], colorRGB: string, alpha: number, positionFn: (i: number) => Point) => {
      if (indices.length === 0 || alpha <= 0.003) return;
      ctx.fillStyle = `rgba(${colorRGB}, ${alpha})`;
      ctx.beginPath();
      for (const i of indices) {
        const p = positionFn(i);
        const r = profiles[i].radius;
        ctx.moveTo(p.x + r, p.y);
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const renderWordSnapshot = (buckets: ColorBuckets, points: Point[], alpha: number) => {
      const pos = (i: number) => points[i];
      fillGroup(buckets.blue, BLUE_RGB, alpha, pos);
      fillGroup(buckets.gold, GOLD_RGB, alpha * GOLD_ALPHA_MULT, pos);
    };

    const renderMorph = (buckets: MorphBuckets, fromPts: Point[], toPts: Point[], t: number) => {
      const steadyPos = (i: number) => lerpPoint(fromPts[i], toPts[i], t);
      fillGroup(buckets.steady.blue, BLUE_RGB, 1, steadyPos);
      fillGroup(buckets.steady.gold, GOLD_RGB, GOLD_ALPHA_MULT, steadyPos);

      const spawnPos = (i: number) => lerpPoint(scatterStart[i], toPts[i], t);
      fillGroup(buckets.spawn.blue, BLUE_RGB, t, spawnPos);
      fillGroup(buckets.spawn.gold, GOLD_RGB, t * GOLD_ALPHA_MULT, spawnPos);

      const dyingPos = (i: number) => lerpPoint(fromPts[i], scatterEnd[i], t);
      fillGroup(buckets.dying.blue, BLUE_RGB, 1 - t, dyingPos);
      fillGroup(buckets.dying.gold, GOLD_RGB, (1 - t) * GOLD_ALPHA_MULT, dyingPos);
    };

    let rafId: number;
    let startTime: number | null = null;

    const render = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;

      ctx.clearRect(0, 0, width, height);

      if (prefersReducedMotion) {
        const w = reducedMotionWordIndex(elapsed);
        renderWordSnapshot(wordBuckets[w], wordPoints[w], reducedMotionAlpha(elapsed));
      } else if (elapsed < SEG_FORM_MS) {
        const t = easeOutCubic(elapsed / SEG_FORM_MS);
        const pos = (i: number) => lerpPoint(scatterStart[i], wordPoints[0][i], t);
        fillGroup(wordBuckets[0].blue, BLUE_RGB, t, pos);
        fillGroup(wordBuckets[0].gold, GOLD_RGB, t * GOLD_ALPHA_MULT, pos);
      } else if (elapsed < SEG_FORM_MS + SEG_MORPH1_MS) {
        const t = easeInOutCubic((elapsed - SEG_FORM_MS) / SEG_MORPH1_MS);
        renderMorph(morphBuckets[0], wordPoints[0], wordPoints[1], t);
      } else if (elapsed < SEG_FORM_MS + SEG_MORPH1_MS + SEG_MORPH2_MS) {
        const t = easeInOutCubic((elapsed - SEG_FORM_MS - SEG_MORPH1_MS) / SEG_MORPH2_MS);
        renderMorph(morphBuckets[1], wordPoints[1], wordPoints[2], t);
      } else {
        const t = easeInCubic(
          Math.min((elapsed - SEG_FORM_MS - SEG_MORPH1_MS - SEG_MORPH2_MS) / SEG_DISSOLVE_MS, 1)
        );
        const pos = (i: number) => lerpPoint(wordPoints[2][i], scatterEnd[i], t);
        fillGroup(wordBuckets[2].blue, BLUE_RGB, 1 - t, pos);
        fillGroup(wordBuckets[2].gold, GOLD_RGB, (1 - t) * GOLD_ALPHA_MULT, pos);
      }

      if (elapsed < TOTAL_PARTICLE_MS) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#070B14]"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: EXIT_FADE_MS / 1000, ease: "easeInOut" }}
      aria-hidden="true"
    >
      {/* Deep navy base with a faint blue glow - present from frame one, so there's never a blank frame while the canvas spins up. This is ambient backdrop lighting, not a substitute for the particle-formed words. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(91,142,247,0.10), transparent 70%), #070B14",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Canvas has no semantic text, so announce the brand to screen readers without showing anything visually extra. This is the ONLY text node in this component. */}
      <span className="sr-only">Campus Compass — by Nikhil</span>
    </motion.div>
  );
}