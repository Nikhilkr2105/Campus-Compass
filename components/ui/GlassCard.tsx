"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  neon?:      boolean;
  hoverable?: boolean;
  children:   React.ReactNode;
  className?: string;
}

export function GlassCard({
  neon = false,
  hoverable = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hoverable
          ? {
              scale:       1.015,
              borderColor: "rgba(0,212,255,0.4)",
              boxShadow:   "0 0 30px rgba(0,212,255,0.1), inset 0 0 30px rgba(0,212,255,0.02)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "rounded-2xl transition-colors duration-300",
        neon ? "glass-neon" : "glass",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}