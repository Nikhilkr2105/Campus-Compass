import { useEffect, useMemo } from "react";
import { useMotionTemplate, useTransform, MotionValue } from "framer-motion";

// Atmospheric state for each section (0-7)
const ATMOSPHERIC_STATES = [
  {
    // 0: HERO (0.0-0.12) - Deep sunrise
    id: "hero",
    sunriseIntensity: 0.85,
    colorTemp: 3200, // Warm amber (sunrise)
    ambientBrightness: 0.5,
    vignetteStrength: 0.55,
    cloudDriftSpeed: 1.0,
    particleIntensity: 0.8,
    gradientStart: "#0d1a2e",
    gradientEnd: "#e8f4fd",
    accentGlow: "rgba(230,170,60,0.32)",
    skyMood: "dawn",
  },
  {
    // 1: STORY (0.12-0.28) - Golden hour
    id: "story",
    sunriseIntensity: 0.65,
    colorTemp: 4500, // Warm-neutral
    ambientBrightness: 0.65,
    vignetteStrength: 0.45,
    cloudDriftSpeed: 0.8,
    particleIntensity: 0.6,
    gradientStart: "#1a3560",
    gradientEnd: "#c4dff5",
    accentGlow: "rgba(201,146,42,0.28)",
    skyMood: "morning",
  },
  {
    // 2: STATS (0.28-0.48) - Clear daylight
    id: "stats",
    sunriseIntensity: 0.3,
    colorTemp: 6500, // Neutral daylight
    ambientBrightness: 0.85,
    vignetteStrength: 0.25,
    cloudDriftSpeed: 0.6,
    particleIntensity: 0.35,
    gradientStart: "#2b6cb8",
    gradientEnd: "#7ab4e8",
    accentGlow: "rgba(122,180,232,0.15)",
    skyMood: "midday",
  },
  {
    // 3: FEATURES (0.48-0.62) - Bright daylight
    id: "features",
    sunriseIntensity: 0.2,
    colorTemp: 6500, // Neutral daylight
    ambientBrightness: 0.9,
    vignetteStrength: 0.2,
    cloudDriftSpeed: 0.5,
    particleIntensity: 0.25,
    gradientStart: "#4a90d9",
    gradientEnd: "#7ab4e8",
    accentGlow: "rgba(122,180,232,0.08)",
    skyMood: "bright",
  },
  {
    // 4: ECOSYSTEM (0.62-0.72) - Evening transition
    id: "ecosystem",
    sunriseIntensity: 0.45,
    colorTemp: 4500, // Warm-neutral
    ambientBrightness: 0.7,
    vignetteStrength: 0.35,
    cloudDriftSpeed: 0.7,
    particleIntensity: 0.55,
    gradientStart: "#1a3560",
    gradientEnd: "#c4dff5",
    accentGlow: "rgba(201,146,42,0.22)",
    skyMood: "afternoon",
  },
  {
    // 5: ADMIN (0.72-0.82) - Golden dusk
    id: "admin",
    sunriseIntensity: 0.75,
    colorTemp: 3800, // Warm amber
    ambientBrightness: 0.65,
    vignetteStrength: 0.45,
    cloudDriftSpeed: 0.8,
    particleIntensity: 0.7,
    gradientStart: "#0f2040",
    gradientEnd: "#c4dff5",
    accentGlow: "rgba(230,170,60,0.28)",
    skyMood: "dusk",
  },
  {
    // 6: ARCHITECTURE (0.82-0.91) - Deep evening
    id: "architecture",
    sunriseIntensity: 0.55,
    colorTemp: 3500, // Warm sunset
    ambientBrightness: 0.55,
    vignetteStrength: 0.50,
    cloudDriftSpeed: 0.9,
    particleIntensity: 0.65,
    gradientStart: "#0c1829",
    gradientEnd: "#8fa4c4",
    accentGlow: "rgba(200,120,40,0.25)",
    skyMood: "evening",
  },
  {
    // 7: CTA (0.91-1.0) - Night with glow
    id: "cta",
    sunriseIntensity: 0.4,
    colorTemp: 3200, // Deep warm
    ambientBrightness: 0.5,
    vignetteStrength: 0.55,
    cloudDriftSpeed: 1.0,
    particleIntensity: 0.75,
    gradientStart: "#0a0f1e",
    gradientEnd: "#7ab4e8",
    accentGlow: "rgba(230,170,60,0.3)",
    skyMood: "night",
  },
] as const;

interface AtmosphericState {
  sunriseIntensity: MotionValue<number>;
  colorTemp: MotionValue<number>;
  ambientBrightness: MotionValue<number>;
  vignetteStrength: MotionValue<number>;
  cloudDriftSpeed: MotionValue<number>;
  particleIntensity: MotionValue<number>;
  accentGlowIntensity: MotionValue<number>;
  skyMood: MotionValue<string>;
}

interface UseAtmosphericEvolutionParams {
  globalProgress: number; // 0-1 from useScrollNarrative
  sectionIndex: number;
  isScrolling: boolean;
}

/**
 * Interpolate between two atmospheric states
 * Used for smooth transitions between sections
 */
function interpolateAtmosphere(
  currentProgress: number, // 0-1 within current section
  currentStateIdx: number,
  nextStateIdx: number
): {
  sunriseIntensity: number;
  colorTemp: number;
  ambientBrightness: number;
  vignetteStrength: number;
  cloudDriftSpeed: number;
  particleIntensity: number;
  accentGlowIntensity: number;
  skyMood: string;
} {
  const current = ATMOSPHERIC_STATES[currentStateIdx];
  const next = ATMOSPHERIC_STATES[Math.min(nextStateIdx, ATMOSPHERIC_STATES.length - 1)];

  // Easing for smooth transitions
  const eased = Math.sin(currentProgress * Math.PI / 2); // Ease-in-out

  return {
    sunriseIntensity: current.sunriseIntensity + (next.sunriseIntensity - current.sunriseIntensity) * eased,
    colorTemp: current.colorTemp + (next.colorTemp - current.colorTemp) * eased,
    ambientBrightness: current.ambientBrightness + (next.ambientBrightness - current.ambientBrightness) * eased,
    vignetteStrength: current.vignetteStrength + (next.vignetteStrength - current.vignetteStrength) * eased,
    cloudDriftSpeed: current.cloudDriftSpeed + (next.cloudDriftSpeed - current.cloudDriftSpeed) * eased,
    particleIntensity: current.particleIntensity + (next.particleIntensity - current.particleIntensity) * eased,
    accentGlowIntensity: current.sunriseIntensity * (0.5 + eased * 0.5), // Accent follows sunrise
    skyMood: current.skyMood, // Mood changes at section boundaries
  };
}

/**
 * Convert color temperature (Kelvin) to RGB shift values
 * Lower K = more red/yellow (warm)
 * Higher K = more blue (cool)
 */
function colorTempToShift(tempK: number): { r: number; g: number; b: number } {
  // Normalize: 3000K = -1 (warm), 6500K = 0 (neutral), 10000K = 1 (cool)
  const normalized = (tempK - 6500) / 3500;

  if (normalized < 0) {
    // Warm: increase red, keep green stable, decrease blue
    return {
      r: 1 + Math.abs(normalized) * 0.3, // +30% red
      g: 1,
      b: Math.max(0.4, 1 + normalized * 0.6), // -60% blue
    };
  } else {
    // Cool: decrease red, decrease green slightly, increase blue
    return {
      r: Math.max(0.7, 1 - normalized * 0.3), // -30% red
      g: Math.max(0.85, 1 - normalized * 0.15), // -15% green
      b: 1 + normalized * 0.4, // +40% blue
    };
  }
}

export function useAtmosphericEvolution({
  globalProgress,
  sectionIndex,
  isScrolling,
}: UseAtmosphericEvolutionParams) {
  // Get atmospheric state interpolation
  const atmosphereValues = useMemo(() => {
    const nextSectionIdx = Math.min(sectionIndex + 1, ATMOSPHERIC_STATES.length - 1);
    
    // Calculate progress within current section (0-1)
    const currentThreshold = sectionIndex / ATMOSPHERIC_STATES.length;
    const nextThreshold = (sectionIndex + 1) / ATMOSPHERIC_STATES.length;
    const sectionProgress = (globalProgress - currentThreshold) / (nextThreshold - currentThreshold);
    const clampedProgress = Math.max(0, Math.min(1, sectionProgress));

    return interpolateAtmosphere(clampedProgress, sectionIndex, nextSectionIdx);
  }, [globalProgress, sectionIndex]);

  // Color temperature to CSS filter shift
  const colorShift = colorTempToShift(atmosphereValues.colorTemp);

  // Sunrise glow intensity (affects bottom gradient brightness)
  const sunriseGlow = atmosphereValues.sunriseIntensity;

  // Vignette opacity (darker at edges)
  const vignetteOpacity = atmosphereValues.vignetteStrength;

  // Cloud animation speed multiplier
  const cloudSpeed = atmosphereValues.cloudDriftSpeed;

  // Particle intensity (float amount)
  const particleOpacity = atmosphereValues.particleIntensity;

  // Brightness overall (affects hero background luminosity)
  const brightness = atmosphereValues.ambientBrightness;

  // Accent glow (sunrise orange glow at bottom)
  const accentGlowOpacity = atmosphereValues.accentGlowIntensity;

  return {
    // For SkyHero component
    skyHero: {
      brightness, // 0-1: affects overall hero brightness
      sunriseGlowOpacity: sunriseGlow, // 0-1: affects bottom orange glow
      vignetteOpacity, // 0-1: affects dark edges
      accentGlowOpacity, // 0-1: affects colored glow at bottom
      cloudDriftSpeed: cloudSpeed, // 0.5-1.0: animation speed multiplier
      particleOpacity, // 0-1: affects floating particle visibility
      colorTempShift: colorShift, // { r, g, b }: color filter values
      skyMood: atmosphereValues.skyMood, // String identifier for mood
    },
    // For other atmospheric effects
    vignette: {
      topStrength: vignetteOpacity * 0.7, // Top vignette (subtle)
      bottomStrength: vignetteOpacity * 0.9, // Bottom vignette (stronger)
    },
    // For potential future section backgrounds
    sectionMood: {
      temperature: atmosphereValues.colorTemp,
      brightness: atmosphereValues.ambientBrightness,
      mood: atmosphereValues.skyMood,
    },
    // Raw values for advanced customization
    raw: atmosphereValues,
  };
}

// Export section definitions for reference
export const SECTIONS_ATMOSPHERIC = ATMOSPHERIC_STATES;
export type AtmosphericMood = typeof ATMOSPHERIC_STATES[number]["skyMood"];