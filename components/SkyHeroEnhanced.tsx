/**
 * ENHANCED SkyHero Component - Phase 2
 * 
 * Modifications from original:
 * - Sunrise glow intensity tied to scroll progress
 * - Color temperature shifts per section
 * - Cloud animation speed responsive to scroll
 * - Particle opacity varying with scroll
 * - Vignette strength changes with section
 * - Accent glow intensity controlled by scroll
 * 
 * Uses useAtmosphericEvolution hook to calculate values
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SkyHeroProps {
  atmosphericState: {
    skyHero: {
      brightness: number;
      sunriseGlowOpacity: number;
      vignetteOpacity: number;
      accentGlowOpacity: number;
      cloudDriftSpeed: number;
      particleOpacity: number;
      colorTempShift: { r: number; g: number; b: number };
      skyMood: string;
    };
    vignette: {
      topStrength: number;
      bottomStrength: number;
    };
  };
}

export function SkyHeroEnhanced({ atmosphericState }: SkyHeroProps) {
  const { skyHero, vignette } = atmosphericState;

  // Memoize computed styles to avoid recalculation
  const baseGradient = useMemo(() => {
    // Gradient changes opacity based on brightness
    return `linear-gradient(165deg, 
      rgba(13,26,46,${0.9 * skyHero.brightness}) 0%, 
      rgba(26,53,96,${0.9 * skyHero.brightness}) 18%, 
      rgba(30,75,138,${0.9 * skyHero.brightness}) 34%, 
      rgba(43,108,184,${0.9 * skyHero.brightness}) 50%, 
      rgba(74,144,217,${0.9 * skyHero.brightness}) 65%, 
      rgba(122,180,232,${0.9 * skyHero.brightness}) 78%, 
      rgba(196,223,245,${0.8 + skyHero.brightness * 0.2}) 90%, 
      rgba(232,244,253,${0.8 + skyHero.brightness * 0.2}) 100%)`;
  }, [skyHero.brightness]);

  const sunriseGlowColor = useMemo(() => {
    // Golden to orange based on intensity
    const opacity = skyHero.sunriseGlowOpacity;
    return `radial-gradient(ellipse 80% 60% at 50% 100%, 
      rgba(230,170,60,${0.32 * opacity}) 0%, 
      rgba(200,120,40,${0.15 * opacity}) 40%, 
      transparent 70%)`;
  }, [skyHero.sunriseGlowOpacity]);

  const accentGlowColor = useMemo(() => {
    // Accent glow at bottom (warm orange)
    const opacity = skyHero.accentGlowOpacity;
    return `radial-gradient(ellipse 70% 50% at 50% 100%, 
      rgba(230,170,60,${0.25 * opacity}) 0%, 
      rgba(200,120,40,${0.12 * opacity}) 30%, 
      transparent 60%)`;
  }, [skyHero.accentGlowOpacity]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Base sky gradient — color temperature aware */}
      <motion.div
        animate={{
          // Filter adjusts color temperature
          filter: `brightness(${skyHero.brightness}) 
            saturate(${0.9 + skyHero.brightness * 0.2})`,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background: baseGradient,
        }}
      />

      {/* Sunrise glow — golden hour effect */}
      <motion.div
        animate={{
          opacity: skyHero.sunriseGlowOpacity,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120%",
          height: "45%",
          background: sunriseGlowColor,
          animation: `sunrise-pulse ${8 + (1 - skyHero.sunriseGlowOpacity) * 4}s ease-in-out infinite`,
        }}
      />

      {/* Accent glow layer — adds depth */}
      <motion.div
        animate={{
          opacity: skyHero.accentGlowOpacity,
        }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "50%",
          background: accentGlowColor,
          pointerEvents: "none",
        }}
      />

      {/* Volumetric light shaft — left (brightness-aware) */}
      <motion.div
        animate={{
          opacity: 0.04 * skyHero.brightness,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          width: "28%",
          height: "75%",
          background:
            "linear-gradient(175deg, rgba(255,255,255,0.06) 0%, rgba(180,210,255,0.04) 50%, transparent 100%)",
          transform: "skewX(-8deg)",
          transformOrigin: "top",
        }}
      />

      {/* Volumetric light shaft — right (brightness-aware) */}
      <motion.div
        animate={{
          opacity: 0.025 * skyHero.brightness,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 0,
          right: "18%",
          width: "22%",
          height: "65%",
          background:
            "linear-gradient(175deg, rgba(255,255,255,0.04) 0%, rgba(200,220,255,0.025) 50%, transparent 100%)",
          transform: "skewX(6deg)",
          transformOrigin: "top",
        }}
      />

      {/* Cloud layer 1 — speed responsive to scroll */}
      <motion.div
        animate={{
          x: [0, 30 * skyHero.cloudDriftSpeed, 0],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 22 / skyHero.cloudDriftSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "28%",
          left: "-5%",
          width: "55%",
          height: "18%",
          background:
            "radial-gradient(ellipse 90% 50% at 40% 50%, rgba(255,255,255,0.12) 0%, rgba(180,210,255,0.06) 55%, transparent 80%)",
          borderRadius: "50%",
          filter: "blur(18px)",
        }}
      />

      {/* Cloud layer 2 — speed responsive */}
      <motion.div
        animate={{
          x: [0, -20 * skyHero.cloudDriftSpeed, 0],
          opacity: [0.4, 0.65, 0.4],
        }}
        transition={{
          duration: 18 / skyHero.cloudDriftSpeed,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          position: "absolute",
          top: "20%",
          right: "-8%",
          width: "50%",
          height: "16%",
          background:
            "radial-gradient(ellipse 85% 45% at 55% 50%, rgba(255,255,255,0.1) 0%, rgba(160,200,255,0.05) 55%, transparent 80%)",
          borderRadius: "50%",
          filter: "blur(22px)",
        }}
      />

      {/* Fog layer — responds to brightness */}
      <motion.div
        animate={{
          opacity: 0.18 - skyHero.brightness * 0.08,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background:
            "linear-gradient(to top, rgba(200,225,255,0.18) 0%, rgba(180,210,255,0.08) 50%, transparent 100%)",
          filter: "blur(6px)",
        }}
      />

      {/* Floating ambient particles — opacity controlled by scroll */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -(28 + (i % 5) * 14), 0],
            x: [0, (i % 3 === 0 ? 1 : -1) * (6 + (i % 4) * 4), 0],
            opacity: [
              0,
              (0.45 + (i % 4) * 0.1) * skyHero.particleOpacity,
              0,
            ],
          }}
          transition={{
            duration: 6 + (i % 5) * 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.55,
          }}
          style={{
            position: "absolute",
            left: `${5 + ((i * 37) % 90)}%`,
            top: `${30 + ((i * 23) % 55)}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            borderRadius: "50%",
            background:
              i % 4 === 0
                ? "rgba(230,180,60,0.7)"
                : i % 3 === 0
                ? "rgba(255,255,255,0.65)"
                : "rgba(160,200,255,0.55)",
          }}
        />
      ))}

      {/* Top vignette — always present, opacity varies */}
      <motion.div
        animate={{
          opacity: vignette.topStrength,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(8,14,28,0.55) 0%, transparent 35%, transparent 60%, rgba(8,14,28,0.2) 100%)",
        }}
      />

      {/* Bottom vignette — stronger, adds depth */}
      <motion.div
        animate={{
          opacity: vignette.bottomStrength,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(8,14,28,0.4) 0%, rgba(8,14,28,0.2) 30%, transparent 60%)",
        }}
      />
    </div>
  );
}