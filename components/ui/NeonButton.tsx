"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Color   = "cyan" | "purple" | "green" | "red" | "amber";
type Size    = "sm" | "md" | "lg";
type Variant = "solid" | "ghost";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?:        Color;
  size?:         Size;
  variant?:      Variant;
  fullWidth?:    boolean;
  icon?:         React.ReactNode;
  iconPosition?: "left" | "right";
}

const COLORS: Record<Color, { bg: string; border: string; text: string; glow: string }> = {
  cyan:   { bg: "rgba(0,212,255,0.10)",   border: "rgba(0,212,255,0.40)",   text: "#00d4ff", glow: "0 0 24px rgba(0,212,255,0.35)"   },
  purple: { bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.40)",  text: "#8b5cf6", glow: "0 0 24px rgba(139,92,246,0.35)"  },
  green:  { bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.40)",  text: "#10b981", glow: "0 0 24px rgba(16,185,129,0.35)"  },
  red:    { bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.40)",   text: "#ef4444", glow: "0 0 24px rgba(239,68,68,0.35)"   },
  amber:  { bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.40)",  text: "#f59e0b", glow: "0 0 24px rgba(245,158,11,0.35)"  },
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

export function NeonButton({
  color        = "cyan",
  size         = "md",
  variant      = "solid",
  fullWidth    = false,
  icon,
  iconPosition = "left",
  className,
  children,
  ...props
}: NeonButtonProps) {
  const c = COLORS[color];

  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: c.glow }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium",
        "transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        "cursor-pointer select-none",
        SIZES[size],
        fullWidth && "w-full"
      )}
      style={{
        background: variant === "ghost" ? "transparent" : c.bg,
        border:     `1px solid ${c.border}`,
        color:      c.text,
        fontFamily: "var(--font-body)",
      }}
      {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
    >
      {icon && iconPosition === "left"  && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
    </motion.button>
  );
}