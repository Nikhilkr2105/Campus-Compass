"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Campus route nodes - SVG compass/network metaphor
const ROUTE_NODES = [
  { cx: 50, cy: 50, r: 3.5, delay: 0.2 },
  { cx: 150, cy: 80, r: 2.5, delay: 0.4 },
  { cx: 260, cy: 45, r: 3, delay: 0.6 },
  { cx: 200, cy: 140, r: 2, delay: 0.8 },
  { cx: 80, cy: 160, r: 2.5, delay: 1.0 },
  { cx: 310, cy: 160, r: 3, delay: 1.2 },
  { cx: 170, cy: 210, r: 2, delay: 1.4 },
];

const ROUTE_PATHS = [
  { d: "M50,50 L150,80", delay: 0.5 },
  { d: "M150,80 L260,45", delay: 0.7 },
  { d: "M150,80 L200,140", delay: 0.9 },
  { d: "M50,50 L80,160", delay: 1.1 },
  { d: "M200,140 L310,160", delay: 1.3 },
  { d: "M80,160 L170,210", delay: 1.5 },
  { d: "M200,140 L170,210", delay: 1.7 },
];

const INIT_STEPS = [
  "Mapping campus topology",
  "Connecting service nodes",
  "Calibrating navigation layers",
  "Activating campus intelligence",
];

function RouteNetwork() {
  return (
    <svg
      viewBox="0 0 360 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Grid blueprint lines — very faint */}
      {[0, 60, 120, 180, 240].map((y) => (
        <motion.line
          key={`h-${y}`}
          x1="0" y1={y} x2="360" y2={y}
          stroke="rgba(14,165,233,0.06)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 1.2 }}
        />
      ))}
      {[0, 90, 180, 270, 360].map((x) => (
        <motion.line
          key={`v-${x}`}
          x1={x} y1="0" x2={x} y2="260"
          stroke="rgba(14,165,233,0.06)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 1.2 }}
        />
      ))}

      {/* Route paths */}
      {ROUTE_PATHS.map((path, i) => (
        <motion.path
          key={i}
          d={path.d}
          stroke="url(#routeGrad)"
          strokeWidth="1.5"
          strokeDasharray="200"
          strokeDashoffset="200"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ delay: path.delay, duration: 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Route nodes */}
      {ROUTE_NODES.map((node, i) => (
        <g key={i}>
          {/* Outer ring */}
          <motion.circle
            cx={node.cx} cy={node.cy} r={node.r + 4}
            fill="none"
            stroke="rgba(14,165,233,0.15)"
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: node.delay + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
          />
          {/* Core dot */}
          <motion.circle
            cx={node.cx} cy={node.cy} r={node.r}
            fill="url(#nodeFill)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: node.delay, duration: 0.35, type: "spring", stiffness: 260 }}
            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
          />
        </g>
      ))}

      {/* Central campus marker — compass style */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.5, type: "spring", stiffness: 180 }}
        style={{ transformOrigin: "170px 210px" }}
      >
        <circle cx="170" cy="210" r="10" fill="rgba(251,191,36,0.12)" />
        <circle cx="170" cy="210" r="6" fill="rgba(251,191,36,0.25)" />
        <circle cx="170" cy="210" r="3" fill="rgb(251,191,36)" />
        {/* Compass tick marks */}
        {[0, 90, 180, 270].map((angle) => (
          <motion.line
            key={angle}
            x1={170 + Math.cos((angle * Math.PI) / 180) * 12}
            y1={210 + Math.sin((angle * Math.PI) / 180) * 12}
            x2={170 + Math.cos((angle * Math.PI) / 180) * 16}
            y2={210 + Math.sin((angle * Math.PI) / 180) * 16}
            stroke="rgba(251,191,36,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 + angle / 1000, duration: 0.3 }}
          />
        ))}
      </motion.g>

      <defs>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.4)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0.4)" />
        </linearGradient>
        <radialGradient id="nodeFill" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgb(125,211,252)" />
          <stop offset="100%" stopColor="rgb(14,165,233)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-48 h-px bg-sky-100/60 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, rgb(56,189,248), rgb(251,191,36))",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function Loading() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalSteps = INIT_STEPS.length;
    const stepDuration = 700;

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });
      setProgress((prev) => {
        const next = prev + 100 / totalSteps;
        return Math.min(next, 100);
      });
    }, stepDuration);

    // Seed initial progress
    setProgress(100 / totalSteps);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(224,242,254,0.9) 0%, rgba(241,245,249,0.95) 45%, rgba(248,250,252,1) 100%)",
      }}
    >
      {/* Atmospheric depth layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 200deg at 70% 20%, rgba(251,191,36,0.04) 0deg, transparent 60deg, rgba(56,189,248,0.06) 120deg, transparent 180deg)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Soft top light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(186,230,253,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Main glass card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center gap-8 px-10 py-10 rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow:
            "0 8px 40px rgba(14,165,233,0.06), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
          width: "min(420px, 92vw)",
        }}
      >
        {/* Campus icon — stylised building + location pin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative flex items-center justify-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(224,242,254,0.9) 0%, rgba(186,230,253,0.7) 100%)",
              border: "1px solid rgba(125,211,252,0.35)",
              boxShadow: "0 4px 16px rgba(14,165,233,0.12)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Building silhouette */}
              <rect x="6" y="12" width="16" height="12" rx="1.5" fill="rgba(14,165,233,0.18)" />
              <rect x="9" y="8" width="10" height="8" rx="1" fill="rgba(14,165,233,0.28)" />
              <rect x="12" y="5" width="4" height="5" rx="1" fill="rgba(14,165,233,0.45)" />
              {/* Windows */}
              <rect x="9" y="14" width="3" height="3" rx="0.5" fill="rgba(251,191,36,0.7)" />
              <rect x="16" y="14" width="3" height="3" rx="0.5" fill="rgba(251,191,36,0.7)" />
              <rect x="12.5" y="14" width="3" height="3" rx="0.5" fill="rgba(56,189,248,0.5)" />
              {/* Base line */}
              <line x1="4" y1="24" x2="24" y2="24" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              {/* Location dot */}
              <circle cx="22" cy="7" r="3" fill="rgba(251,191,36,0.9)" />
              <circle cx="22" cy="7" r="1.5" fill="white" />
            </svg>
          </div>
          {/* Gold accent glow */}
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              background: "rgb(251,191,36)",
              boxShadow: "0 0 8px rgba(251,191,36,0.5)",
            }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          className="flex flex-col items-center gap-1 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1
            className="text-2xl tracking-tight text-slate-800"
            style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            Entering Campus Ecosystem
          </h1>
          <p
            className="text-sm text-slate-400"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
          >
            Intelligent Navigation Platform
          </p>
        </motion.div>

        {/* Route network SVG */}
        <motion.div
          className="w-full"
          style={{ height: 140 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <RouteNetwork />
        </motion.div>

        {/* Step indicator */}
        <div className="flex flex-col items-center gap-3 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              className="text-xs text-sky-500/70 tracking-widest uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, letterSpacing: "0.12em" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {INIT_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>

          <ProgressBar progress={progress} />
        </div>
      </motion.div>

      {/* Floating ambient particles */}
      {[
        { x: "15%", y: "25%", size: 4, color: "rgba(56,189,248,0.25)", delay: 0.8 },
        { x: "82%", y: "18%", size: 3, color: "rgba(251,191,36,0.3)", delay: 1.2 },
        { x: "10%", y: "72%", size: 3, color: "rgba(14,165,233,0.2)", delay: 1.6 },
        { x: "88%", y: "68%", size: 5, color: "rgba(251,191,36,0.2)", delay: 0.5 },
        { x: "50%", y: "88%", size: 3, color: "rgba(56,189,248,0.15)", delay: 1.0 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.6, 1],
            scale: [0, 1, 0.8, 1],
            y: [0, -8, 0, -4, 0],
          }}
          transition={{
            delay: p.delay,
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Bottom wordmark */}
      <motion.p
        className="absolute bottom-8 text-xs text-slate-300"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.08em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        CAMPUS NAVIGATOR
      </motion.p>
    </div>
  );
}