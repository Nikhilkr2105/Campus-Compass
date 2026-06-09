"use client";

/**
 * useTilt — Phase 4
 *
 * Mouse-position-aware tilt for card components.
 * Returns onMouseMove / onMouseLeave handlers + rotateX/rotateY MotionValues.
 *
 * Constraints:
 *   - Max ±3deg rotateX, ±4deg rotateY (premium subtle, not toy-like)
 *   - Spring config: stiffness 150, damping 20 → fast response, light bounce
 *   - Reset to 0,0 on mouse leave with gentle ease-out
 *   - Disabled when reducedMotion = true
 *   - No layout effect — transform-only
 *
 * Usage:
 *   const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();
 *   <motion.div
 *     ref={ref}
 *     style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
 *     onMouseMove={onMouseMove}
 *     onMouseLeave={onMouseLeave}
 *   />
 */

import {
  useRef,
  useCallback,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useSpring, useMotionValue, type MotionValue } from "framer-motion";

const SPRING_TILT = { stiffness: 150, damping: 20, mass: 0.4 } as const;

const MAX_ROTATE_X = 3;   // deg
const MAX_ROTATE_Y = 4;   // deg

interface UseTiltReturn {
  ref:          RefObject<HTMLDivElement>;
  rotateX:      MotionValue<number>;
  rotateY:      MotionValue<number>;
  onMouseMove:  (e: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

export function useTilt(reducedMotion = false): UseTiltReturn {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(rawX, SPRING_TILT);
  const rotateY = useSpring(rawY, SPRING_TILT);

  const onMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      // Normalized -1 → +1 within the card bounds
      const nx = (e.clientX - rect.left) / rect.width  - 0.5;   // left→right
      const ny = (e.clientY - rect.top)  / rect.height - 0.5;   // top→bottom

      // rotateY: move right → tilt right (positive Y rotation)
      // rotateX: move down  → tilt forward (negative X rotation — top comes toward viewer)
      rawY.set(nx * MAX_ROTATE_Y * 2);
      rawX.set(-ny * MAX_ROTATE_X * 2);
    },
    [reducedMotion, rawX, rawY]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}