/**
 * useScrollNarrative Hook
 * 
 * Provides global scroll context for the landing page narrative.
 * Tracks:
 * - Current section (0=hero, 1=story, 2=stats, 3=features, 4=ecosystem, 5=admin, 6=architecture, 7=cta)
 * - Progress within current section (0–1)
 * - Global page progress (0–1)
 * - Scroll direction (up/down)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll } from "framer-motion";

// Section definitions with IDs and thresholds
const SECTIONS = [
  { id: "hero", label: "Hero", color: "var(--sky)", threshold: 0.0 },
  { id: "story", label: "The Story", color: "var(--gold)", threshold: 0.12 },
  { id: "stats", label: "Platform at a Glance", color: "var(--sky)", threshold: 0.28 },
  { id: "features", label: "Core Capabilities", color: "var(--sky)", threshold: 0.48 },
  { id: "ecosystem", label: "AI Ecosystem", color: "#6ea8ff", threshold: 0.62 },
  { id: "admin", label: "Admin Intelligence", color: "var(--gold)", threshold: 0.72 },
  { id: "architecture", label: "Architecture", color: "var(--sky)", threshold: 0.82 },
  { id: "cta", label: "Get Started", color: "var(--sky)", threshold: 0.91 },
] as const;

export type SectionId = typeof SECTIONS[number]["id"];

interface ScrollNarrativeState {
  currentSection: SectionId;
  sectionIndex: number;
  sectionProgress: number; // 0–1 within current section
  globalProgress: number; // 0–1 across entire page
  scrollDirection: "up" | "down" | "idle";
  isScrolling: boolean;
}

interface UseScrollNarrativeReturn extends ScrollNarrativeState {
  sections: typeof SECTIONS;
}

export function useScrollNarrative(): UseScrollNarrativeReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [state, setState] = useState<ScrollNarrativeState>({
    currentSection: "hero",
    sectionIndex: 0,
    sectionProgress: 0,
    globalProgress: 0,
    scrollDirection: "idle",
    isScrolling: false,
  });

  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to scrollYProgress changes
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      const globalProgress = latest;

      // Determine current section based on global progress
      let currentSectionIndex = 0;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        if (globalProgress >= SECTIONS[i].threshold) {
          currentSectionIndex = i;
          break;
        }
      }

      const currentSection = SECTIONS[currentSectionIndex].id;
      const nextThreshold =
        currentSectionIndex < SECTIONS.length - 1
          ? SECTIONS[currentSectionIndex + 1].threshold
          : 1;
      const currentThreshold = SECTIONS[currentSectionIndex].threshold;

      // Calculate progress within current section (0–1)
      const sectionProgress =
        (globalProgress - currentThreshold) / (nextThreshold - currentThreshold);

      // Determine scroll direction
      const currentScrollY = window.scrollY;
      const scrollDirection: "up" | "down" | "idle" =
        currentScrollY > lastScrollY.current
          ? "down"
          : currentScrollY < lastScrollY.current
            ? "up"
            : "idle";

      lastScrollY.current = currentScrollY;

      // Clear existing timeout and set isScrolling to true
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      setState({
        currentSection,
        sectionIndex: currentSectionIndex,
        sectionProgress: Math.max(0, Math.min(1, sectionProgress)),
        globalProgress,
        scrollDirection,
        isScrolling: true,
      });

      // Set idle after 1.5s of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isScrolling: false }));
      }, 1500);
    });

    return () => {
      unsubscribe();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollYProgress]);

  // Return container ref for LandingPage to attach to
  return {
    ...state,
    sections: SECTIONS,
  };
}

// Export helper to get section color dynamically
export function getSectionColor(sectionId: SectionId): string {
  const section = SECTIONS.find((s) => s.id === sectionId);
  return section?.color || "var(--sky)";
}

// Export container hook for ref
export function useScrollNarrativeContainer() {
  return useRef<HTMLDivElement>(null);
}