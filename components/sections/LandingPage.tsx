"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Navigation, Map, ArrowRight, ChevronDown, Zap, Brain, Mic, Accessibility, AlertTriangle, MapPin } from "lucide-react";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { useRef, useState, useEffect } from "react";

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fadeUp = (delay = 0, distance = 32) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] as any },
});

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
};

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const STATS = [
  { value: "22+",    label: "Buildings Mapped",  color: "#00d4ff",   glow: "rgba(0,212,255,0.35)"    },
  { value: "2,400+", label: "Students Using",     color: "#a78bfa",   glow: "rgba(167,139,250,0.35)"  },
  { value: "99.2%",  label: "Nav Accuracy",       color: "#34d399",   glow: "rgba(52,211,153,0.35)"   },
  { value: "340+",   label: "Active Routes",      color: "#fbbf24",   glow: "rgba(251,191,36,0.35)"   },
];

const FEATURES = [
  {
    icon: MapPin,
    iconEmoji: "🗺️",
    title: "Indoor Navigation",
    desc: "Floor-by-floor routing with animated path rendering across all campus buildings.",
    accent: "#00d4ff",
    accentBg: "rgba(0,212,255,0.07)",
    accentBorder: "rgba(0,212,255,0.18)",
  },
  {
    icon: Brain,
    iconEmoji: "🧠",
    title: "AI Route Detection",
    desc: "Dijkstra algorithm finds the optimal path instantly, adapting to live conditions.",
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.07)",
    accentBorder: "rgba(167,139,250,0.18)",
  },
  {
    icon: Zap,
    iconEmoji: "⚡",
    title: "Real-Time Guidance",
    desc: "Step-by-step directions with live ETA tracking and dynamic rerouting.",
    accent: "#fbbf24",
    accentBg: "rgba(251,191,36,0.07)",
    accentBorder: "rgba(251,191,36,0.18)",
  },
  {
    icon: AlertTriangle,
    iconEmoji: "🚨",
    title: "Emergency Mode",
    desc: "One-tap SOS with instant medical center routing and emergency alerts.",
    accent: "#f87171",
    accentBg: "rgba(248,113,113,0.07)",
    accentBorder: "rgba(248,113,113,0.18)",
  },
  {
    icon: Mic,
    iconEmoji: "🎙️",
    title: "Voice Assistant",
    desc: "Natural language campus navigation via AI — just speak your destination.",
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.07)",
    accentBorder: "rgba(52,211,153,0.18)",
  },
  {
    icon: Accessibility,
    iconEmoji: "♿",
    title: "Accessibility Mode",
    desc: "Wheelchair-friendly routes prioritising ramps, lifts, and level surfaces.",
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.07)",
    accentBorder: "rgba(96,165,250,0.18)",
  },
];

/* ─────────────────────────────────────────
   AMBIENT ORB COMPONENT
───────────────────────────────────────── */
function AmbientOrb({
  size, top, left, right, bottom, color, delay = 0, duration = 8,
}: {
  size: number; top?: string; left?: string; right?: string; bottom?: string;
  color: string; delay?: number; duration?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        width: size, height: size,
        top, left, right, bottom,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: "none",
        filter: "blur(1px)",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   GRID LINE OVERLAY
───────────────────────────────────────── */
function GridOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 80%)",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ s, i }: { s: typeof STATS[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      key={s.label}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.03 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        style={{
          padding: "28px 20px",
          textAlign: "center",
          borderRadius: 20,
          position: "relative",
          overflow: "hidden",
          background: hovered
            ? `linear-gradient(135deg, ${s.color}12, rgba(255,255,255,0.03))`
            : "linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
          border: `1px solid ${hovered ? s.color + "45" : s.color + "25"}`,
          backdropFilter: "blur(24px)",
          boxShadow: hovered
            ? `0 0 40px ${s.glow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 0 30px ${s.color}08`
            : `0 0 20px ${s.color}10, inset 0 0 20px ${s.color}04`,
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 70, height: 70,
          background: `radial-gradient(circle at top right, ${s.color}30 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: 50, height: 50,
          background: `radial-gradient(circle at bottom left, ${s.color}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: "clamp(32px, 4.5vw, 46px)",
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: 8,
          color: s.color,
          fontFamily: "var(--font-display)",
          textShadow: hovered ? `0 0 28px ${s.glow}` : `0 0 16px ${s.color}50`,
          transition: "text-shadow 0.3s ease",
          letterSpacing: "-1px",
        }}>
          {s.value}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(240,244,255,0.5)",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}>
          {s.label}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────── */
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = f.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -7, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ height: "100%" }}
    >
      <div style={{
        padding: "28px 26px",
        height: "100%",
        borderRadius: 22,
        position: "relative",
        overflow: "hidden",
        background: hovered
          ? `linear-gradient(145deg, ${f.accentBg}, rgba(255,255,255,0.02))`
          : "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        border: `1px solid ${hovered ? f.accentBorder : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(28px)",
        boxShadow: hovered
          ? `0 0 36px ${f.accent}18, 0 12px 40px rgba(0,0,0,0.45), inset 0 0 24px ${f.accent}06`
          : "0 2px 20px rgba(0,0,0,0.3)",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {/* scan line on hover */}
        <motion.div
          animate={{ top: hovered ? ["0%", "100%", "0%"] : "0%" }}
          transition={{ duration: 2, repeat: hovered ? Infinity : 0, ease: "linear" }}
          style={{
            position: "absolute",
            left: 0, right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${f.accent}40, transparent)`,
            pointerEvents: "none",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* top-right glow */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 100, height: 100,
          background: `radial-gradient(circle at top right, ${f.accent}18 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
          opacity: hovered ? 1 : 0.4,
        }} />

        {/* icon */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${f.accent}18, ${f.accent}06)`,
          border: `1px solid ${f.accentBorder}`,
          boxShadow: hovered ? `0 0 20px ${f.accent}30` : `0 0 10px ${f.accent}15`,
          marginBottom: 20,
          transition: "all 0.3s ease",
          flexShrink: 0,
        }}>
          <IconComp size={20} style={{ color: f.accent }} strokeWidth={1.5} />
        </div>

        <div style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 10,
          fontFamily: "var(--font-display)",
          color: "var(--text-1)",
          letterSpacing: "-0.2px",
        }}>
          {f.title}
        </div>

        <p style={{
          fontSize: 13,
          lineHeight: 1.75,
          color: "rgba(240,244,255,0.48)",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          flex: 1,
        }}>
          {f.desc}
        </p>

        {/* bottom accent line */}
        <div style={{
          marginTop: 20,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${f.accent}60, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────── */
function SectionLabel({ children, color = "var(--cyan)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 16px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "2.5px",
      textTransform: "uppercase" as const,
      background: `${color}0f`,
      border: `1px solid ${color}30`,
      color,
      fontFamily: "var(--font-display)",
      marginBottom: 20,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAP PREVIEW MOCKUP
───────────────────────────────────────── */
function MapPreviewMockup() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 560,
      margin: "0 auto",
      borderRadius: 24,
      overflow: "hidden",
      border: "1px solid rgba(0,212,255,0.2)",
      background: "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(139,92,246,0.03))",
      backdropFilter: "blur(20px)",
      boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 0 120px rgba(139,92,246,0.06), 0 24px 80px rgba(0,0,0,0.5)",
      aspectRatio: "16/9",
    }}>
      {/* grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* building blocks */}
      {[
        { x: "8%",  y: "12%", w: 90,  h: 55,  color: "rgba(0,212,255,0.15)",  border: "rgba(0,212,255,0.4)"  },
        { x: "22%", y: "40%", w: 110, h: 65,  color: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.4)" },
        { x: "42%", y: "18%", w: 75,  h: 80,  color: "rgba(0,212,255,0.1)",   border: "rgba(0,212,255,0.35)" },
        { x: "58%", y: "45%", w: 95,  h: 50,  color: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.35)" },
        { x: "70%", y: "15%", w: 70,  h: 60,  color: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)"  },
        { x: "15%", y: "68%", w: 80,  h: 45,  color: "rgba(0,212,255,0.08)",  border: "rgba(0,212,255,0.25)" },
        { x: "50%", y: "70%", w: 100, h: 40,  color: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
      ].map((b, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: "absolute",
            left: b.x, top: b.y,
            width: b.w, height: b.h,
            background: b.color,
            border: `1px solid ${b.border}`,
            borderRadius: 4,
          }}
        />
      ))}

      {/* animated route path */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 560 315">
        <motion.path
          d="M 80 280 L 80 200 L 180 200 L 180 140 L 300 140 L 300 200 L 420 200 L 420 130"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
        />
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* start dot */}
        <motion.circle
          cx="80" cy="280"
          r="6"
          fill="#34d399"
          animate={{ r: [5, 8, 5], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* end dot */}
        <motion.circle
          cx="420" cy="130"
          r="6"
          fill="#f87171"
          animate={{ r: [5, 8, 5], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
        />
      </svg>

      {/* HUD overlay top */}
      <div style={{
        position: "absolute", top: 12, left: 12,
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(0,212,255,0.25)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
        <span style={{ fontSize: 10, color: "#00d4ff", fontFamily: "var(--font-display)", letterSpacing: "1px", fontWeight: 600 }}>LIVE ROUTE ACTIVE</span>
      </div>

      {/* HUD overlay bottom right */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        padding: "8px 14px",
        borderRadius: 8,
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(167,139,250,0.25)",
        backdropFilter: "blur(12px)",
        textAlign: "right",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#a78bfa", fontFamily: "var(--font-display)", lineHeight: 1 }}>3 min</div>
        <div style={{ fontSize: 9, color: "rgba(240,244,255,0.4)", fontFamily: "var(--font-body)", marginTop: 2, letterSpacing: "0.5px" }}>ETA · 340m</div>
      </div>

      {/* scan line sweep */}
      <motion.div
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        style={{
          position: "absolute", left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY    = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const springY  = useSpring(heroY, { stiffness: 60, damping: 20 });

  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg-1)" }}
    >
      <ParticleBackground />
      <GridOverlay />

      {/* ── layered radial mesh ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,212,255,0.065) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 85% 75%, rgba(139,92,246,0.07) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,212,255,0.018) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)" }} />
      </div>

      <div className="relative z-10" style={{ paddingTop: "95px" }}>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section
          id="hero"
          ref={heroRef}
          className="flex flex-col items-center text-center px-6 pt-24 pb-32 relative"
          style={{ minHeight: "92vh", justifyContent: "center" }}
        >
          {/* ambient orbs */}
          <AmbientOrb size={640} top="-5%"  left="-12%"  color="rgba(0,212,255,0.07)"   delay={0} duration={9} />
          <AmbientOrb size={520} top="18%"  right="-8%"  color="rgba(139,92,246,0.08)"  delay={2} duration={11} />
          <AmbientOrb size={340} bottom="5%" left="35%"  color="rgba(0,212,255,0.04)"   delay={4} duration={7} />

          <motion.div style={{ y: springY, opacity: heroOpacity }} className="flex flex-col items-center">
            {/* badge */}
            <motion.div {...fadeUp(0.1)}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(139,92,246,0.07))",
                border: "1px solid rgba(0,212,255,0.3)",
                color: "var(--cyan)",
                fontFamily: "var(--font-display)",
                boxShadow: "0 0 40px rgba(0,212,255,0.1), inset 0 0 24px rgba(0,212,255,0.05)",
                backdropFilter: "blur(16px)",
                marginBottom: 36,
              }}>
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 10px var(--cyan)", display: "inline-block" }}
                />
                Nikhil-Powered Campus Navigation
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 10px #a78bfa", display: "inline-block" }}
                />
              </div>
            </motion.div>

            {/* headline */}
            <motion.h1
              style={{
                fontSize: "clamp(46px, 8.5vw, 96px)",
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: "-3px",
                fontFamily: "var(--font-display)",
                maxWidth: 960,
                marginBottom: 0,
              }}
              {...fadeUp(0.18)}
            >
              <span style={{
                background: "linear-gradient(135deg, #ffffff 0%, rgba(220,230,255,0.88) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Navigate Your
              </span>
              <br />
              <span style={{
                background: "linear-gradient(135deg, #ffffff 0%, rgba(220,230,255,0.88) 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Campus{" "}
              </span>
              <motion.span
                animate={{ filter: ["drop-shadow(0 0 20px rgba(0,212,255,0.5))", "drop-shadow(0 0 45px rgba(0,212,255,0.9))", "drop-shadow(0 0 20px rgba(0,212,255,0.5))"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(90deg, #00d4ff 0%, #818cf8 45%, #a78bfa 75%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Intelligently
              </motion.span>
            </motion.h1>

            {/* subtext */}
            <motion.p
              style={{
                fontSize: "clamp(15px, 2vw, 19px)",
                color: "rgba(240,244,255,0.58)",
                maxWidth: 480,
                lineHeight: 1.85,
                marginTop: 28,
                marginBottom: 56,
                fontFamily: "var(--font-body)",
                fontWeight: 300,
              }}
              {...fadeUp(0.3)}
            >
              Smart indoor + outdoor navigation for{" "}
              <strong style={{ color: "rgba(240,244,255,0.92)", fontWeight: 600 }}>RIMT University</strong>
              {" "}— powered by Nikhil, built for students.
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex gap-4 flex-wrap justify-center" {...fadeUp(0.4)}>
              <Link href="/navigator">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 32px",
                    borderRadius: 18,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "linear-gradient(135deg, rgba(0,212,255,0.22), rgba(0,212,255,0.08))",
                    border: "1px solid rgba(0,212,255,0.5)",
                    color: "#00d4ff",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 0 30px rgba(0,212,255,0.22), inset 0 0 20px rgba(0,212,255,0.06)",
                    backdropFilter: "blur(16px)",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    letterSpacing: "0.2px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onHoverStart={(e: any) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.boxShadow = "0 0 50px rgba(0,212,255,0.45), inset 0 0 30px rgba(0,212,255,0.1)";
                    }
                  }}
                  onHoverEnd={(e: any) => {
                    if (e.currentTarget) {
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(0,212,255,0.22), inset 0 0 20px rgba(0,212,255,0.06)";
                    }
                  }}
                >
                  <Navigation size={16} strokeWidth={2} />
                  Start Navigation
                  <ArrowRight size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToFeatures}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 32px",
                  borderRadius: 18,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(139,92,246,0.04))",
                  border: "1px solid rgba(167,139,250,0.3)",
                  color: "#a78bfa",
                  fontFamily: "var(--font-body)",
                  backdropFilter: "blur(16px)",
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                  letterSpacing: "0.2px",
                }}
              >
                <Map size={16} strokeWidth={2} />
                Explore Features
              </motion.div>
            </motion.div>

            {/* map preview */}
            <motion.div
              style={{ width: "100%", maxWidth: 600, marginTop: 72 }}
              initial={{ opacity: 0, y: 48, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <MapPreviewMockup />
            </motion.div>

            {/* scroll cue */}
            <motion.button
              className="flex flex-col items-center gap-2 mt-16 cursor-pointer"
              style={{ color: "rgba(0,212,255,0.4)", background: "none", border: "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={scrollToFeatures}
            >
              <span style={{ fontSize: 9, letterSpacing: "4px", fontFamily: "var(--font-display)", color: "rgba(0,212,255,0.4)" }}>SCROLL</span>
              <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.55), transparent)" }} />
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <ChevronDown size={16} style={{ color: "rgba(0,212,255,0.5)" }} />
              </motion.div>
            </motion.button>
          </motion.div>
        </section>

        {/* ══════════════════════════════
            STATS
        ══════════════════════════════ */}
        <section id="stats" style={{ padding: "0 24px 96px", maxWidth: 1080, margin: "0 auto" }}>
          {/* section divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.2), transparent)" }} />
            <span style={{ fontSize: 9, letterSpacing: "3px", color: "rgba(0,212,255,0.35)", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>Platform Stats</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.2), transparent)" }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => <StatCard key={s.label} s={s} i={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════
            FEATURES
        ══════════════════════════════ */}
        <section id="features" ref={featuresRef} style={{ padding: "0 24px 96px", maxWidth: 1080, margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: 56 }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel color="var(--purple)">Core Capabilities</SectionLabel>

            <h2 style={{
              fontSize: "clamp(30px, 5vw, 52px)",
              fontWeight: 900,
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #fff 20%, rgba(0,212,255,0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 14,
              letterSpacing: "-1px",
            }}>
              Everything You Need
            </h2>
            <p style={{
              color: "rgba(240,244,255,0.45)",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              maxWidth: 360,
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
              Advanced algorithms meet beautiful design — built for every student
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </section>

        {/* ══════════════════════════════
            CTA BANNER
        ══════════════════════════════ */}
        <section id="cta" style={{ padding: "0 24px 96px" }}>
          <motion.div
            style={{ maxWidth: 760, margin: "0 auto" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              padding: "64px 48px",
              textAlign: "center",
              borderRadius: 28,
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(0,212,255,0.07), rgba(139,92,246,0.05), rgba(255,255,255,0.02))",
              border: "1px solid rgba(0,212,255,0.22)",
              backdropFilter: "blur(28px)",
              boxShadow: "0 0 80px rgba(0,212,255,0.08), 0 0 140px rgba(139,92,246,0.05), inset 0 0 50px rgba(0,212,255,0.03), 0 24px 64px rgba(0,0,0,0.4)",
            }}>
              {/* bg blobs */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: "-40%", left: "-15%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }}
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                style={{ position: "absolute", bottom: "-40%", right: "-15%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }}
              />

              {/* scan line */}
              <motion.div
                animate={{ top: ["-3%", "105%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)", pointerEvents: "none" }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <SectionLabel color="var(--cyan)">Get Started</SectionLabel>

                <h2 style={{
                  fontSize: "clamp(28px, 4.5vw, 46px)",
                  fontWeight: 900,
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #fff 15%, #00d4ff 55%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 16,
                  letterSpacing: "-1px",
                }}>
                  Ready to Navigate?
                </h2>
                <p style={{
                  fontSize: 16,
                  color: "rgba(240,244,255,0.5)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  lineHeight: 1.75,
                  marginBottom: 44,
                  maxWidth: 380,
                  margin: "0 auto 44px",
                }}>
                  Join 2,400+ RIMT students already navigating smarter with AI
                </p>
                <Link href="/navigator">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "16px 40px",
                      borderRadius: 18,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.1))",
                      border: "1px solid rgba(0,212,255,0.55)",
                      color: "#00d4ff",
                      fontFamily: "var(--font-body)",
                      boxShadow: "0 0 30px rgba(0,212,255,0.22), inset 0 0 24px rgba(0,212,255,0.07)",
                      backdropFilter: "blur(12px)",
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      letterSpacing: "0.3px",
                    }}
                  >
                    <Navigation size={17} strokeWidth={2} />
                    Open Navigator
                    <ArrowRight size={15} strokeWidth={2} />
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════
            FOOTER
        ══════════════════════════════ */}
        <footer style={{
          padding: "36px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(to top, rgba(0,212,255,0.025), transparent)",
        }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div>
              <div style={{
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 5,
                fontFamily: "var(--font-display)",
                background: "linear-gradient(90deg, #fff, #00d4ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.2px",
              }}>
                RIMT Smart Campus Navigator
              </div>
              <div style={{
                fontSize: 11,
                color: "rgba(240,244,255,0.28)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.3px",
              }}>
                Built with ❤️ · Presented by Nikhil
              </div>
            </div>

            <div style={{ display: "flex", gap: 28 }}>
              {["Privacy", "Terms", "Support"].map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 13,
                    cursor: "pointer",
                    color: "rgba(240,244,255,0.35)",
                    fontFamily: "var(--font-body)",
                    transition: "color 0.2s ease",
                    letterSpacing: "0.2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.35)")}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}