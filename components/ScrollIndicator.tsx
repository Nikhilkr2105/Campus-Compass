/**
 * ScrollIndicator Component
 * 
 * Persistent top-right indicator showing:
 * - Current section position (colored line)
 * - Section label
 * - Mini progress dots for all sections
 * 
 * Only visible on desktop (md+ breakpoint)
 */

import { motion } from "framer-motion";
import { type SectionId } from "@/hooks/useScrollNarrative";

interface ScrollIndicatorProps {
  currentSection: SectionId;
  sectionIndex: number;
  globalProgress: number;
  sections: readonly {
    id: SectionId;
    label: string;
    color: string;
    threshold: number;
  }[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function ScrollIndicator({
  currentSection,
  sectionIndex,
  globalProgress,
  sections,
}: ScrollIndicatorProps) {
  const currentSectionData = sections.find((s) => s.id === currentSection);
  const sectionColor = currentSectionData?.color || "var(--sky)";

  return (
    <>
      {/* Desktop-only indicator (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed top-0 right-0 md:flex hidden flex-col items-end gap-6 pointer-events-none z-40"
        style={{ padding: "24px" }}
      >
        {/* Section dots */}
        <motion.div
          className="flex flex-col gap-3"
          layout
        >
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              className="flex items-center gap-3 cursor-default"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + i * 0.08, duration: 0.5 }}
            >
              {/* Dot indicator */}
              <motion.div
                layout
                className="rounded-full transition-all"
                style={{
                  width: sectionIndex === i ? 10 : 6,
                  height: sectionIndex === i ? 10 : 6,
                  background:
                    sectionIndex === i
                      ? section.color
                      : "rgba(255,255,255,0.2)",
                  boxShadow:
                    sectionIndex === i
                      ? `0 0 12px ${section.color}60`
                      : "none",
                }}
              />

              {/* Section label (appears on hover) */}
              <motion.span
                className="text-xs font-semibold uppercase tracking-widest pointer-events-auto"
                style={{
                  color: section.color,
                  fontFamily: "var(--font-sans)",
                  opacity: sectionIndex === i ? 1 : 0,
                  pointerEvents: sectionIndex === i ? "auto" : "none",
                }}
                initial={{ opacity: 0, x: 8 }}
                animate={{
                  opacity: sectionIndex === i ? 1 : 0,
                  x: sectionIndex === i ? 0 : 8,
                }}
                transition={{ duration: 0.3 }}
              >
                {section.label}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress line */}
        <motion.div
          className="relative h-20 w-0.5 rounded-full"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)",
            overflow: "hidden",
          }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{
              height: `${Math.max(20, globalProgress * 100)}%`,
              background: `linear-gradient(to bottom, ${sectionColor}, ${sectionColor}80, transparent)`,
              boxShadow: `0 0 8px ${sectionColor}60`,
            }}
            layout
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>

      {/* Mobile-only minimal indicator (bottom right) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed bottom-6 right-6 md:hidden z-40 flex gap-1.5"
      >
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            className="h-1 rounded-full transition-all"
            style={{
              width: sectionIndex === i ? 20 : 6,
              background:
                globalProgress >= section.threshold
                  ? section.color
                  : "rgba(255,255,255,0.15)",
            }}
            layout
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.div>
    </>
  );
}