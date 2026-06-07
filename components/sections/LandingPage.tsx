"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navigation,
  Map,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Zap,
  Brain,
  Mic,
  Accessibility,
  AlertTriangle,
  MapPin,
  Bell,
  CreditCard,
  Calendar,
  BarChart3,
  Briefcase,
  Sparkles,
  Shield,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

// ========== NEW IMPORTS FOR PHASE 1 ==========
import { useScrollNarrative, type SectionId } from "@/hooks/useScrollNarrative";
import { ScrollIndicator } from "@/components/ScrollIndicator";
// ================================================

/* ─────────────────────────────────────────
   EASING
───────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────── */
function useCountUp(target: number, duration = 2, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const isDecimal = target % 1 !== 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(
        isDecimal
          ? parseFloat((eased * target).toFixed(1))
          : Math.floor(eased * target)
      );
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return count;
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const STATS = [
  {
    value: 22,
    suffix: "+",
    label: "Buildings Mapped",
    color: "#3882f6",
    bg: "rgba(56,130,246,0.08)",
    border: "rgba(56,130,246,0.18)",
  },
  {
    value: 2400,
    suffix: "+",
    label: "Students Using",
    color: "#c9922a",
    bg: "rgba(201,146,42,0.08)",
    border: "rgba(201,146,42,0.18)",
  },
  {
    value: 99.2,
    suffix: "%",
    label: "Nav Accuracy",
    color: "#0d9e6e",
    bg: "rgba(13,158,110,0.08)",
    border: "rgba(13,158,110,0.18)",
  },
  {
    value: 340,
    suffix: "+",
    label: "Active Routes",
    color: "#6b4fcf",
    bg: "rgba(107,79,207,0.08)",
    border: "rgba(107,79,207,0.18)",
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Indoor Navigation",
    desc: "Floor-by-floor routing with animated path rendering across all campus buildings.",
    color: "#3882f6",
    bg: "rgba(56,130,246,0.06)",
    border: "rgba(56,130,246,0.14)",
  },
  {
    icon: Brain,
    title: "AI Route Detection",
    desc: "Dijkstra algorithm finds the optimal path instantly, adapting to live conditions.",
    color: "#6b4fcf",
    bg: "rgba(107,79,207,0.06)",
    border: "rgba(107,79,207,0.14)",
  },
  {
    icon: Zap,
    title: "Real-Time Guidance",
    desc: "Step-by-step directions with live ETA tracking and dynamic rerouting.",
    color: "#c9922a",
    bg: "rgba(201,146,42,0.06)",
    border: "rgba(201,146,42,0.14)",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Alerts",
    desc: "One-tap SOS with instant medical center routing and campus-wide emergency alerts.",
    color: "#d94040",
    bg: "rgba(217,64,64,0.06)",
    border: "rgba(217,64,64,0.14)",
  },
  {
    icon: Bell,
    title: "Notices & Reminders",
    desc: "Fee reminders, academic notices, and smart push alerts delivered intelligently.",
    color: "#0d9e6e",
    bg: "rgba(13,158,110,0.06)",
    border: "rgba(13,158,110,0.14)",
  },
  {
    icon: Calendar,
    title: "Events",
    desc: "Campus events calendar with location-aware directions to every venue.",
    color: "#3882f6",
    bg: "rgba(56,130,246,0.06)",
    border: "rgba(56,130,246,0.14)",
  },
  {
    icon: BarChart3,
    title: "Campus Analytics",
    desc: "Usage insights, footfall heatmaps, and admin dashboards for smarter decisions.",
    color: "#c9922a",
    bg: "rgba(201,146,42,0.06)",
    border: "rgba(201,146,42,0.14)",
  },
  {
    icon: Mic,
    title: "Voice Assistant",
    desc: "Natural language campus navigation via AI — just speak your destination.",
    color: "#6b4fcf",
    bg: "rgba(107,79,207,0.06)",
    border: "rgba(107,79,207,0.14)",
  },
  {
    icon: Accessibility,
    title: "Accessibility Mode",
    desc: "Wheelchair-friendly routes prioritising ramps, lifts, and level surfaces.",
    color: "#0d9e6e",
    bg: "rgba(13,158,110,0.06)",
    border: "rgba(13,158,110,0.14)",
  },
];

const ECOSYSTEM = [
  { icon: Sparkles, label: "AI Ecosystem", desc: "Nikhil-powered intelligence" },
  { icon: Shield,   label: "Admin System", desc: "Full control dashboard" },
  { icon: Briefcase,label: "Opportunities", desc: "Jobs, internships & more" },
  { icon: CreditCard, label: "Fee Reminders", desc: "Smart payment alerts" },
];

/* ─────────────────────────────────────────
   SKY HERO BACKGROUND (PRESERVED)
───────────────────────────────────────── */
function SkyHero() {
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
      {/* Base sky gradient — sunrise atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(165deg, #0d1a2e 0%, #1a3560 18%, #1e4b8a 34%, #2b6cb8 50%, #4a90d9 65%, #7ab4e8 78%, #c4dff5 90%, #e8f4fd 100%)",
        }}
      />

      {/* Sunrise glow — gold warmth at horizon */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120%",
          height: "45%",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(230,170,60,0.32) 0%, rgba(200,120,40,0.15) 40%, transparent 70%)",
          animation: "sunrise-pulse 8s ease-in-out infinite",
        }}
      />

      {/* Volumetric light shaft — left */}
      <div
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

      {/* Volumetric light shaft — right */}
      <div
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

      {/* Cloud layer 1 — slow drift */}
      <motion.div
        animate={{ x: [0, 30, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
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

      {/* Cloud layer 2 */}
      <motion.div
        animate={{ x: [0, -20, 0], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
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

      {/* Fog layer — lower atmosphere */}
      <div
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

      {/* Floating ambient particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -(28 + (i % 5) * 14), 0],
            x: [0, (i % 3 === 0 ? 1 : -1) * (6 + (i % 4) * 4), 0],
            opacity: [0, 0.45 + (i % 4) * 0.1, 0],
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

      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(8,14,28,0.55) 0%, transparent 35%, transparent 60%, rgba(8,14,28,0.2) 100%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   TOPOLOGY MAP (PRESERVED)
───────────────────────────────────────── */
function TopologyMap() {
  const buildings = [
    { id: "A", x: 80,  y: 210, label: "Main Block",  floors: 4, w: 95,  h: 62, active: true  },
    { id: "B", x: 222, y: 132, label: "Science",     floors: 3, w: 82,  h: 72, active: false },
    { id: "C", x: 344, y: 196, label: "Library",     floors: 2, w: 72,  h: 58, active: false },
    { id: "D", x: 462, y: 124, label: "Admin",       floors: 3, w: 88,  h: 68, active: false },
    { id: "E", x: 562, y: 234, label: "Hostel",      floors: 5, w: 76,  h: 52, active: false },
    { id: "F", x: 198, y: 284, label: "Medical",     floors: 2, w: 68,  h: 50, active: false },
    { id: "G", x: 402, y: 296, label: "Sports",      floors: 1, w: 92,  h: 46, active: false },
  ];

  const paths = [
    { d: "M 127 241 L 222 168", active: true,  label: "120m" },
    { d: "M 304 168 L 344 225", active: false, label: "80m"  },
    { d: "M 416 225 L 462 158", active: true,  label: "95m"  },
    { d: "M 550 158 L 562 257", active: false, label: "60m"  },
    { d: "M 127 241 L 198 309", active: false, label: "70m"  },
    { d: "M 266 309 L 344 225", active: false, label: "90m"  },
    { d: "M 416 225 L 402 319", active: true,  label: "55m"  },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(150deg, #0c1829 0%, #0f2040 40%, #132850 100%)",
        border: "1px solid rgba(56,130,246,0.2)",
        boxShadow:
          "0 40px 100px rgba(13,26,46,0.45), 0 8px 32px rgba(56,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(56,130,246,0.08)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(56,130,246,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(56,130,246,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#0d9e6e",
              boxShadow: "0 0 10px rgba(13,158,110,0.7)",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)", letterSpacing: "0.8px" }}>
            CAMPUS COMPASS · LIVE TOPOLOGY
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Floor selector pill */}
          <div style={{ display: "flex", gap: 4 }}>
            {["B1","G","F1","F2"].map((f, i) => (
              <div key={f} style={{
                padding: "2px 7px", borderRadius: 6, fontSize: 9, fontWeight: 600,
                fontFamily: "var(--font-sans)",
                background: i === 1 ? "rgba(56,130,246,0.3)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${i === 1 ? "rgba(56,130,246,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: i === 1 ? "#6ea8ff" : "rgba(255,255,255,0.38)",
              }}>{f}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {["#d94040","#c9922a","#0d9e6e"].map((c,i) => (
              <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:c, opacity:0.7 }} />
            ))}
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <svg viewBox="0 0 700 390" style={{ width: "100%", display: "block" }}>
        <defs>
          <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,130,246,0.06)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="campusDotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.6" fill="rgba(56,130,246,0.12)"/>
          </pattern>
          <linearGradient id="routeMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3882f6" stopOpacity="1"/>
            <stop offset="100%" stopColor="#6ea8ff" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="routeAlt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9922a" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#e8b84b" stopOpacity="0.5"/>
          </linearGradient>
          <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(13,80,40,0.18)"/>
            <stop offset="100%" stopColor="rgba(13,80,40,0.04)"/>
          </linearGradient>
          <filter id="buildingGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="activeGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Base layers */}
        <rect width="700" height="390" fill="url(#campusDotGrid)"/>
        <rect width="700" height="390" fill="url(#campusGrid)"/>

        {/* Campus ground plane — perspective illusion */}
        <ellipse cx="350" cy="390" rx="300" ry="55" fill="url(#groundGrad)"/>
        {/* Central pathway spine */}
        <path d="M 40 360 Q 350 300 660 360" fill="none" stroke="rgba(56,130,246,0.08)" strokeWidth="18" strokeLinecap="round"/>
        <path d="M 40 360 Q 350 300 660 360" fill="none" stroke="rgba(56,130,246,0.06)" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 6"/>

        {/* Green zones */}
        <ellipse cx="340" cy="365" rx="140" ry="22" fill="rgba(13,120,60,0.1)"/>
        <ellipse cx="340" cy="365" rx="100" ry="14" fill="rgba(13,120,60,0.08)"/>

        {/* Path connections with distance labels */}
        {paths.map((p, i) => (
          <motion.g key={i}>
            <motion.path
              d={p.d}
              fill="none"
              stroke={p.active ? "url(#routeMain)" : "url(#routeAlt)"}
              strokeWidth={p.active ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeDasharray={p.active ? "none" : "5 4"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}
            />
          </motion.g>
        ))}

        {/* Active route animated pulse */}
        <motion.path
          d="M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158"
          fill="none"
          stroke="rgba(56,130,246,0.4)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d="M 60 241 L 127 241 L 222 168 L 304 168 L 344 225 L 416 225 L 462 158"
          fill="none"
          stroke="#3882f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="10 6"
          animate={{ strokeDashoffset: [0, -32] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          opacity={0.9}
        />

        {/* Buildings with isometric depth hint */}
        {buildings.map((b, i) => (
          <motion.g
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.55, ease: EASE }}
          >
            {/* Shadow */}
            <rect x={b.x+4} y={b.y+4} width={b.w} height={b.h} rx="5"
              fill="rgba(0,0,0,0.3)" filter="url(#buildingGlow)"/>
            {/* Floor depth bars — isometric feel */}
            {Array.from({ length: Math.min(b.floors, 4) }).map((_, fi) => (
              <rect
                key={fi}
                x={b.x} y={b.y - fi * 5}
                width={b.w} height={b.h}
                rx="5"
                fill={b.active
                  ? `rgba(56,130,246,${0.08 + fi * 0.04})`
                  : `rgba(22,42,78,${0.6 + fi * 0.08})`}
                stroke={b.active
                  ? `rgba(56,130,246,${0.3 + fi * 0.1})`
                  : `rgba(56,130,246,${0.1 + fi * 0.04})`}
                strokeWidth={b.active ? 1.5 : 0.75}
              />
            ))}
            {/* Top face */}
            <rect
              x={b.x} y={b.y - (Math.min(b.floors,4)-1)*5}
              width={b.w} height={b.h} rx="5"
              fill={b.active ? "rgba(56,130,246,0.28)" : "rgba(30,52,88,0.85)"}
              stroke={b.active ? "rgba(110,168,255,0.7)" : "rgba(56,130,246,0.22)"}
              strokeWidth={b.active ? 1.5 : 1}
            />
            {/* Window dots — occupied feel */}
            {!b.active && Array.from({ length: 3 }).map((_, wi) =>
              Array.from({ length: 2 }).map((_, hi) => (
                <rect
                  key={`${wi}-${hi}`}
                  x={b.x + 10 + wi * ((b.w-20)/3)}
                  y={b.y - (Math.min(b.floors,4)-1)*5 + 10 + hi * ((b.h-20)/2.5)}
                  width={6} height={5} rx="1"
                  fill={Math.random() > 0.4 ? "rgba(200,220,255,0.18)" : "rgba(200,220,255,0.05)"}
                />
              ))
            )}
            {/* Building ID */}
            <text
              x={b.x + b.w/2}
              y={b.y - (Math.min(b.floors,4)-1)*5 + b.h/2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fill={b.active ? "#6ea8ff" : "rgba(160,190,230,0.75)"}
              fontSize="11" fontWeight="700" fontFamily="var(--font-sans)"
            >{b.id}</text>
            {/* Floor count badge */}
            <rect
              x={b.x + b.w - 18}
              y={b.y - (Math.min(b.floors,4)-1)*5 - 14}
              width={16} height={12} rx="3"
              fill="rgba(56,130,246,0.2)"
              stroke="rgba(56,130,246,0.35)"
              strokeWidth="0.8"
            />
            <text
              x={b.x + b.w - 10}
              y={b.y - (Math.min(b.floors,4)-1)*5 - 8}
              textAnchor="middle" dominantBaseline="middle"
              fill="#6ea8ff" fontSize="7" fontFamily="var(--font-sans)" fontWeight="700"
            >F{b.floors}</text>
            {/* Label */}
            <text
              x={b.x + b.w/2}
              y={b.y + b.h + 14}
              textAnchor="middle"
              fill="rgba(140,170,210,0.6)"
              fontSize="9" fontFamily="var(--font-body)" letterSpacing="0.3"
            >{b.label}</text>
          </motion.g>
        ))}

        {/* Start / End nodes */}
        {[
          { cx: 60, cy: 241, color: "#0d9e6e", label: "You", sub: "Main Entry" },
          { cx: 506, cy: 158, color: "#d94040", label: "Dest", sub: "Admin Block" },
        ].map((n, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + i*0.2, duration: 0.4, ease: EASE }}
          >
            <motion.circle cx={n.cx} cy={n.cy} r="14"
              fill="transparent"
              stroke={n.color}
              strokeWidth="1"
              animate={{ r: [12, 20, 12], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.8 }}
            />
            <circle cx={n.cx} cy={n.cy} r="7"
              fill={`${n.color}22`} stroke={n.color} strokeWidth="1.5"/>
            <circle cx={n.cx} cy={n.cy} r="3" fill={n.color}/>
            <text x={n.cx} y={n.cy - 20} textAnchor="middle"
              fill={n.color} fontSize="9" fontWeight="700" fontFamily="var(--font-sans)" letterSpacing="0.5">
              {n.label}
            </text>
            <text x={n.cx} y={n.cy - 10} textAnchor="middle"
              fill={`${n.color}88`} fontSize="7.5" fontFamily="var(--font-body)">
              {n.sub}
            </text>
          </motion.g>
        ))}

        {/* Compass rose */}
        <g transform="translate(648, 348)">
          <circle cx="0" cy="0" r="16" fill="rgba(13,26,46,0.7)" stroke="rgba(56,130,246,0.2)" strokeWidth="1"/>
          <text x="0" y="-7" textAnchor="middle" fill="rgba(110,168,255,0.8)" fontSize="7" fontWeight="700" fontFamily="var(--font-sans)">N</text>
          <path d="M 0 -4 L 2 2 L 0 0 L -2 2 Z" fill="#3882f6" opacity="0.9"/>
          <path d="M 0 4 L 2 -1 L 0 0 L -2 -1 Z" fill="rgba(255,255,255,0.3)"/>
        </g>
      </svg>

      {/* Legend + Status bar */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid rgba(56,130,246,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.25)",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { color: "#3882f6", label: "Active route" },
            { color: "#c9922a", label: "Alternate" },
            { color: "#0d9e6e", label: "Origin" },
            { color: "#d94040", label: "Destination" },
          ].map((l) => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:18, height:2, borderRadius:2, background:l.color, opacity:0.85 }}/>
              <span style={{ fontSize:9, color:"rgba(160,190,230,0.55)", fontFamily:"var(--font-body)" }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Navigation size={11} style={{ color: "#3882f6" }}/>
            <span style={{ fontSize:11, color:"rgba(160,190,230,0.7)", fontFamily:"var(--font-body)" }}>340m · Optimal</span>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"#6ea8ff", fontFamily:"var(--font-sans)" }}>
            3 min ETA
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT CARD (PRESERVED)
───────────────────────────────────────── */
function StatCard({ s, i }: { s: (typeof STATS)[0]; i: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(s.value, 2, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.7, ease: EASE }}
      whileHover={{ y: -4 }}
      style={{ height: "100%" }}
    >
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          borderRadius: 20,
          background: s.bg,
          border: `1px solid ${s.border}`,
          backdropFilter: "blur(20px)",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.3s ease",
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize: "clamp(36px, 4.5vw, 52px)",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 8,
            color: s.color,
            fontFamily: "var(--font-display)",
            letterSpacing: "-1.5px",
          }}
        >
          {count.toLocaleString()}
          {s.suffix}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-2)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.6px",
            textTransform: "uppercase",
          }}
        >
          {s.label}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FEATURE CARD (PRESERVED)
───────────────────────────────────────── */
function FeatureCard({ f, i }: { f: (typeof FEATURES)[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = f.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06, duration: 0.65, ease: EASE }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ height: "100%" }}
    >
      <div
        style={{
          padding: "28px 26px",
          height: "100%",
          borderRadius: 20,
          background: hovered
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,255,255,0.72)",
          border: `1px solid ${hovered ? f.border : "rgba(13,26,46,0.07)"}`,
          boxShadow: hovered
            ? `var(--shadow-lg), 0 0 0 1px ${f.border}`
            : "var(--shadow-sm)",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: f.bg,
            border: `1px solid ${f.border}`,
            marginBottom: 18,
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <IconComp size={18} style={{ color: f.color }} strokeWidth={1.75} />
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 10,
            fontFamily: "var(--font-sans)",
            color: "var(--text-1)",
            letterSpacing: "-0.1px",
          }}
        >
          {f.title}
        </div>

        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "var(--text-2)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            flex: 1,
          }}
        >
          {f.desc}
        </p>

        <motion.div
          animate={{ width: hovered ? "100%" : "0%" }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            marginTop: 20,
            height: 2,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${f.color}, transparent)`,
            opacity: 0.6,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SECTION LABEL (PRESERVED)
───────────────────────────────────────── */
function SectionLabel({
  children,
  color = "var(--sky)",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "2px",
        textTransform: "uppercase" as const,
        background: `${color}12`,
        border: `1px solid ${color}28`,
        color,
        fontFamily: "var(--font-sans)",
        marginBottom: 20,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          opacity: 0.85,
        }}
      />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE (MODIFIED FOR PHASE 1)
───────────────────────────────────────── */
export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // ========== PHASE 1: USE SCROLL NARRATIVE HOOK ==========
  const scrollState = useScrollNarrative();
  // ========================================================

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const springY = useSpring(heroY, { stiffness: 55, damping: 22 });

  const scrollToFeatures = () =>
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  // ========== PHASE 1: SECTION-TRIGGERED ANIMATIONS ==========
  // These will trigger animations when entering specific sections
  const isStoryVisible = scrollState.sectionIndex >= 1;
  const isStatsVisible = scrollState.sectionIndex >= 2;
  const isFeaturesVisible = scrollState.sectionIndex >= 3;
  // ========================================================

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg-1)" }}
    >
      {/* ========== PHASE 1: SCROLL INDICATOR ==========*/}
      <ScrollIndicator
        currentSection={scrollState.currentSection}
        sectionIndex={scrollState.sectionIndex}
        globalProgress={scrollState.globalProgress}
        sections={scrollState.sections}
      />
      {/* ================================================ */}

      {/* ── HERO ── */}
      <section
        id="hero"
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <SkyHero />

        <motion.div
          style={{
            y: springY,
            opacity: heroOpacity,
            position: "relative",
            zIndex: 2,
            paddingTop: 90,
          }}
          className="flex flex-col items-center text-center px-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.28)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "var(--font-sans)",
                backdropFilter: "blur(16px)",
                marginBottom: 36,
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#0d9e6e",
                  boxShadow: "0 0 8px rgba(13,158,110,0.8)",
                  display: "inline-block",
                }}
              />
              COLLEGE COMPASS · Intelligent Campus Ecosystem
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            style={{
              fontSize: "clamp(44px, 8vw, 96px)",
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-2.5px",
              fontFamily: "var(--font-display)",
              maxWidth: 900,
              marginBottom: 0,
              color: "#fff",
            }}
          >
            <span style={{ display: "block", color: "rgba(255,255,255,0.96)" }}>
              One Campus.
            </span>
            <span style={{ display: "block", color: "rgba(255,255,255,0.96)" }}>
              Every System.{" "}
              <motion.span
                style={{
                  background:
                    "linear-gradient(90deg, #e8c96a 0%, #f0d98a 40%, #e8c96a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                One Platform.
              </motion.span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: 520,
              lineHeight: 1.8,
              marginTop: 28,
              marginBottom: 52,
              fontFamily: "var(--font-body)",
              fontWeight: 300,
            }}
          >
            Navigation, safety, alerts, analytics, events, and AI — unified into a
            living intelligent ecosystem for{" "}
            <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
              COLLEGE STUDENTS
            </strong>
            . Powered by Nikhil💗.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link href="/navigator">
              <motion.div
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "15px 34px",
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow:
                    "0 8px 28px rgba(56,130,246,0.45), 0 2px 8px rgba(0,0,0,0.2)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.1px",
                }}
              >
                <Navigation size={16} strokeWidth={2} />
                Start Navigation
                <ArrowRight size={14} strokeWidth={2} />
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToFeatures}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "15px 34px",
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(16px)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.1px",
              }}
            >
              <Map size={16} strokeWidth={2} />
              Explore Features
            </motion.div>
          </motion.div>

          {/* Map preview */}
          <motion.div
            style={{ width: "100%", maxWidth: 680, marginTop: 72 }}
            initial={{ opacity: 0, y: 56, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.85, ease: EASE }}
          >
            <TopologyMap />
          </motion.div>

          {/* Scroll hint */}
          <motion.button
            className="flex flex-col items-center gap-2 mt-14 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            onClick={scrollToFeatures}
          >
            <span
              style={{
                fontSize: 9,
                letterSpacing: "4px",
                fontFamily: "var(--font-sans)",
                color: "rgba(255,255,255,0.38)",
                textTransform: "uppercase",
              }}
            >
              Explore
            </span>
            <div
              style={{
                width: 1,
                height: 40,
                background:
                  "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={15} style={{ color: "rgba(255,255,255,0.45)" }} />
            </motion.div>
          </motion.button>
        </motion.div>
      </section>

      {/* ── TRANSITION: hero → light ── */}
      <div
        aria-hidden
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, rgba(13,26,46,0.15), var(--bg-1))",
          marginTop: -2,
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* ── PROBLEM → SOLUTION ── */}
      <section
        id="story"
        style={{ padding: "80px 24px 100px", maxWidth: 1080, margin: "0 auto", position: "relative" }}
      >
        {/* Section header */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 72 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <SectionLabel color="var(--gold)">The Story</SectionLabel>
          <h2 style={{
            fontSize: "clamp(30px, 4.5vw, 52px)",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--navy)",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            maxWidth: 600,
            margin: "0 auto",
          }}>
            Campus life is complex.<br/>
            <span style={{
              background: "linear-gradient(135deg, #3882f6, #c9922a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              We made it simple.
            </span>
          </h2>
        </motion.div>

        {/* Problem → Solution two-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ alignItems: "stretch" }}>

          {/* PROBLEM column */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              padding: "40px 36px",
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(217,64,64,0.04), rgba(217,64,64,0.02))",
              border: "1px solid rgba(217,64,64,0.1)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", borderRadius: 999, marginBottom: 28,
              background: "rgba(217,64,64,0.08)", border: "1px solid rgba(217,64,64,0.18)",
            }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#d94040", display:"inline-block" }}/>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:"2px", color:"#d94040", fontFamily:"var(--font-sans)", textTransform:"uppercase" }}>Before</span>
            </div>
            <h3 style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight:700, fontFamily:"var(--font-display)", color:"var(--navy)", marginBottom:24, letterSpacing:"-0.8px", lineHeight:1.2 }}>
              Lost on a sprawling campus
            </h3>
            {[
              "Students wander for 15+ minutes finding a classroom or office",
              "No single place to see fees, notices, and events together",
              "Emergency situations with no fast way to reach help",
              "Admin teams have zero visibility into campus movement patterns",
              "Accessibility routes are guesswork — no ramp or lift guidance",
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EASE }}
                style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}
              >
                <div style={{
                  width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                  background:"rgba(217,64,64,0.1)", border:"1px solid rgba(217,64,64,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ fontSize:10, color:"#d94040", fontWeight:700 }}>✕</span>
                </div>
                <p style={{ fontSize:14, color:"var(--text-2)", fontFamily:"var(--font-body)", lineHeight:1.65, margin:0 }}>{p}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* SOLUTION column */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              padding: "40px 36px",
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(56,130,246,0.06), rgba(13,158,110,0.03))",
              border: "1px solid rgba(56,130,246,0.12)",
              boxShadow: "var(--shadow-md)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Sunrise accent */}
            <div aria-hidden style={{
              position:"absolute", bottom:"-20%", right:"-10%",
              width:"50%", height:"50%",
              background:"radial-gradient(ellipse, rgba(201,146,42,0.08) 0%, transparent 70%)",
              pointerEvents:"none",
            }}/>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", borderRadius: 999, marginBottom: 28,
              background: "rgba(13,158,110,0.08)", border: "1px solid rgba(13,158,110,0.2)",
            }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#0d9e6e", display:"inline-block" }}/>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:"2px", color:"#0d9e6e", fontFamily:"var(--font-sans)", textTransform:"uppercase" }}>After Nikhil</span>
            </div>
            <h3 style={{ fontSize:"clamp(20px,2.5vw,28px)", fontWeight:700, fontFamily:"var(--font-display)", color:"var(--navy)", marginBottom:24, letterSpacing:"-0.8px", lineHeight:1.2 }}>
              One intelligent campus platform
            </h3>
            {[
              "AI-powered routing guides you floor-by-floor in under 30 seconds",
              "Unified dashboard: navigation, fees, notices, events — all in one",
              "One-tap SOS routes you to the medical centre instantly",
              "Admin analytics surface footfall heatmaps and usage patterns",
              "Dedicated accessibility mode with ramp and lift-aware routing",
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }}
                style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}
              >
                <div style={{
                  width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                  background:"rgba(13,158,110,0.12)", border:"1px solid rgba(13,158,110,0.25)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ fontSize:10, color:"#0d9e6e", fontWeight:700 }}>✓</span>
                </div>
                <p style={{ fontSize:14, color:"var(--text-2)", fontFamily:"var(--font-body)", lineHeight:1.65, margin:0 }}>{s}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        id="stats"
        style={{
          padding: "0 24px 100px",
          maxWidth: 1080,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 52,
          }}
        >
          <div className="divider" style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              color: "var(--text-3)",
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
            }}
          >
            Platform at a Glance
          </span>
          <div className="divider" style={{ flex: 1 }} />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} s={s} i={i} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        ref={featuresRef}
        style={{
          padding: "0 24px 120px",
          maxWidth: 1080,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Subtle background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "60%",
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(56,130,246,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          style={{ textAlign: "center", marginBottom: 64, position: "relative" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <SectionLabel color="var(--sky)">Core Capabilities</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--navy)",
              marginBottom: 16,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
            }}
          >
            Everything Your Campus Needs
          </h2>
          <p
            style={{
              color: "var(--text-2)",
              fontSize: 16,
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Advanced AI meets elegant design — built for every student from any COLLEGE
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </section>

      {/* ── ECOSYSTEM STRIP ── */}
      <section
        id="ecosystem"
        style={{
          padding: "80px 24px",
          background: "var(--navy)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(56,130,246,0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(201,146,42,0.07) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: 56 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <SectionLabel color="#6ea8ff">AI Ecosystem</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(28px, 4.5vw, 48px)",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: "#fff",
                marginBottom: 12,
                letterSpacing: "-1.2px",
              }}
            >
              A Living Campus Universe
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 15,
                fontFamily: "var(--font-body)",
                maxWidth: 380,
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Nikhil-powered intelligence woven through every layer of campus life
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ECOSYSTEM.map((e, i) => {
              const IconComp = e.icon;
              return (
                <motion.div
                  key={e.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: "28px 24px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(12px)",
                    textAlign: "center",
                    cursor: "default",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(56,130,246,0.15)",
                      border: "1px solid rgba(56,130,246,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <IconComp size={18} color="#6ea8ff" strokeWidth={1.75} />
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: "var(--font-sans)",
                      marginBottom: 6,
                    }}
                  >
                    {e.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.38)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {e.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ADMIN INTELLIGENCE ── */}
      <section
        id="admin"
        style={{ padding: "100px 24px", background: "var(--bg-2)", position: "relative", overflow: "hidden" }}
      >
        <div aria-hidden style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 60% 50% at 80% 50%, rgba(201,146,42,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 10% 50%, rgba(56,130,246,0.05) 0%, transparent 65%)",
          pointerEvents:"none",
        }}/>
        <div style={{ maxWidth:1080, margin:"0 auto", position:"relative" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16" style={{ alignItems:"center" }}>

            {/* Left: copy */}
            <motion.div
              initial={{ opacity:0, x:-32 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.75, ease:EASE }}
            >
              <SectionLabel color="var(--gold)">Admin Intelligence</SectionLabel>
              <h2 style={{
                fontSize:"clamp(28px,4vw,48px)", fontWeight:700,
                fontFamily:"var(--font-display)", color:"var(--navy)",
                letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:20,
              }}>
                Complete campus visibility.<br/>
                <span style={{ background:"linear-gradient(135deg,#c9922a,#3882f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  From one dashboard.
                </span>
              </h2>
              <p style={{ fontSize:16, color:"var(--text-2)", fontFamily:"var(--font-body)", lineHeight:1.8, marginBottom:36, maxWidth:420 }}>
                The admin system gives faculty and management a live window into every layer of campus activity — movement, alerts, fees, and analytics in real time.
              </p>
              {[
                { label:"Footfall Heatmaps", desc:"See where students move in real time across buildings and floors" },
                { label:"Alert Broadcast",  desc:"Push emergency or notice alerts to all students in seconds"     },
                { label:"Fee & Notice Control", desc:"Manage reminders, deadlines, and announcements from one panel" },
                { label:"Route Analytics", desc:"Understand which routes are used most — optimise campus flow"   },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity:0, y:12 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }}
                  transition={{ delay: i*0.1, duration:0.5, ease:EASE }}
                  style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:20 }}
                >
                  <div style={{
                    width:8, height:8, borderRadius:"50%", flexShrink:0, marginTop:7,
                    background:"var(--gold)", boxShadow:"0 0 10px rgba(201,146,42,0.4)",
                  }}/>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--navy)", fontFamily:"var(--font-sans)", marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:"var(--text-2)", fontFamily:"var(--font-body)", lineHeight:1.65 }}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: mock admin panel */}
            <motion.div
              initial={{ opacity:0, x:32 }}
              whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.75, delay:0.15, ease:EASE }}
            >
              <div style={{
                borderRadius:24, overflow:"hidden",
                background:"var(--navy)",
                border:"1px solid rgba(56,130,246,0.15)",
                boxShadow:"var(--shadow-xl)",
              }}>
                {/* Panel titlebar */}
                <div style={{
                  padding:"14px 20px", borderBottom:"1px solid rgba(56,130,246,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"rgba(56,130,246,0.06)",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Shield size={13} color="#c9922a"/>
                    <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-sans)", letterSpacing:"0.8px" }}>ADMIN DASHBOARD · LIVE</span>
                  </div>
                  <motion.div
                    animate={{ opacity:[1,0.3,1] }}
                    transition={{ duration:2, repeat:Infinity }}
                    style={{ width:6, height:6, borderRadius:"50%", background:"#0d9e6e", boxShadow:"0 0 8px rgba(13,158,110,0.7)" }}
                  />
                </div>

                {/* Metric row */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(56,130,246,0.06)" }}>
                  {[
                    { val:"2,418", label:"Online Now",    color:"#3882f6" },
                    { val:"7",     label:"Active Alerts", color:"#d94040" },
                    { val:"99.2%", label:"Uptime",        color:"#0d9e6e" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      padding:"18px 16px", textAlign:"center",
                      background:"rgba(13,26,46,0.8)",
                      borderRight: i < 2 ? "1px solid rgba(56,130,246,0.08)" : "none",
                    }}>
                      <div style={{ fontSize:"clamp(18px,2.5vw,24px)", fontWeight:700, color:m.color, fontFamily:"var(--font-display)", letterSpacing:"-0.5px" }}>{m.val}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontFamily:"var(--font-body)", marginTop:3, letterSpacing:"0.4px" }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Activity feed */}
                <div style={{ padding:"16px 20px" }}>
                  <div style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-sans)", letterSpacing:"2px", marginBottom:12, textTransform:"uppercase" }}>
                    Live Activity
                  </div>
                  {[
                    { time:"2s ago",  event:"Fee reminder sent · 3rd year batch",    dot:"#c9922a", type:"notice"    },
                    { time:"14s ago", event:"Emergency cleared · Medical centre",     dot:"#0d9e6e", type:"alert"     },
                    { time:"1m ago",  event:"New route optimised · Library → Admin",  dot:"#3882f6", type:"route"     },
                    { time:"3m ago",  event:"Event posted · Annual Tech Fest 2025",   dot:"#6b4fcf", type:"event"     },
                    { time:"5m ago",  event:"Peak footfall detected · Main Block F2", dot:"#c9922a", type:"analytics" },
                  ].map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity:0, x:10 }}
                      whileInView={{ opacity:1, x:0 }}
                      viewport={{ once:true }}
                      transition={{ delay: 0.4 + i*0.08, duration:0.4, ease:EASE }}
                      style={{
                        display:"flex", alignItems:"center", gap:12,
                        padding:"10px 0",
                        borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}
                    >
                      <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background:a.dot, boxShadow:`0 0 6px ${a.dot}80` }}/>
                      <div style={{ flex:1, fontSize:12, color:"rgba(255,255,255,0.65)", fontFamily:"var(--font-body)", lineHeight:1.4 }}>{a.event}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)", flexShrink:0 }}>{a.time}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ARCHITECTURE ── */}
      <section
        id="architecture"
        style={{ padding:"100px 24px", maxWidth:1080, margin:"0 auto", position:"relative" }}
      >
        <div aria-hidden style={{
          position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)",
          width:"70%", height:"60%",
          background:"radial-gradient(ellipse 70% 50% at 50% 50%, rgba(56,130,246,0.05) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>

        <motion.div
          style={{ textAlign:"center", marginBottom:64, position:"relative" }}
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.65, ease:EASE }}
        >
          <SectionLabel color="var(--sky)">Architecture</SectionLabel>
          <h2 style={{
            fontSize:"clamp(28px,4vw,50px)", fontWeight:700,
            fontFamily:"var(--font-display)", color:"var(--navy)",
            letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:14,
          }}>
            How the ecosystem connects
          </h2>
          <p style={{ fontSize:15, color:"var(--text-2)", fontFamily:"var(--font-body)", maxWidth:380, margin:"0 auto", lineHeight:1.75 }}>
            Every module talks to every other — unified under one AI layer
          </p>
        </motion.div>

        {/* Architecture SVG diagram */}
        <motion.div
          initial={{ opacity:0, y:32 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.85, ease:EASE }}
          style={{
            borderRadius:28, overflow:"hidden",
            background:"linear-gradient(135deg,rgba(255,255,255,0.88),rgba(240,246,255,0.82))",
            border:"1px solid rgba(56,130,246,0.1)",
            boxShadow:"var(--shadow-xl)",
            padding:"40px 24px",
          }}
        >
          <svg viewBox="0 0 900 440" style={{ width:"100%", display:"block" }}>
            <defs>
              <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(56,130,246,0.5)"/>
              </marker>
              <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(201,146,42,0.5)"/>
              </marker>
              <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3882f6"/>
                <stop offset="100%" stopColor="#1a4fa8"/>
              </linearGradient>
            </defs>

            {/* Central AI core */}
            <motion.g
              initial={{ opacity:0, scale:0.7 }}
              animate={{ opacity:1, scale:1 }}
              transition={{ duration:0.6, ease:EASE }}
            >
              <circle cx="450" cy="220" r="62" fill="url(#coreGrad)" opacity="0.12"/>
              <circle cx="450" cy="220" r="50" fill="url(#coreGrad)" opacity="0.18"/>
              <circle cx="450" cy="220" r="38" fill="url(#coreGrad)" opacity="0.9"/>
              <motion.circle
                cx="450" cy="220" r="62"
                fill="none" stroke="rgba(56,130,246,0.3)" strokeWidth="1.5"
                strokeDasharray="8 6"
                animate={{ rotate:[0,360] }}
                transition={{ duration:18, repeat:Infinity, ease:"linear" }}
                style={{ transformOrigin:"450px 220px" }}
              />
              <text x="450" y="215" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" letterSpacing="1">NIKHIL</text>
              <text x="450" y="230" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="var(--font-body)">AI Core</text>
            </motion.g>

            {/* Satellite modules */}
            {[
              { x:120,  y:80,  label:"Navigation",   sub:"GPS + Indoor",     color:"#3882f6", angle: -140 },
              { x:280,  y:50,  label:"Emergency",    sub:"SOS + Alerts",     color:"#d94040", angle: -110 },
              { x:580,  y:50,  label:"Analytics",    sub:"Heatmaps + Stats", color:"#c9922a", angle: -70  },
              { x:740,  y:80,  label:"Admin",        sub:"Control Panel",    color:"#6b4fcf", angle: -40  },
              { x:740,  y:360, label:"Events",       sub:"Calendar + Maps",  color:"#3882f6", angle:  40  },
              { x:580,  y:390, label:"Fees",         sub:"Reminders + Pay",  color:"#c9922a", angle:  70  },
              { x:280,  y:390, label:"Notices",      sub:"Push + In-app",    color:"#0d9e6e", angle:  110 },
              { x:120,  y:360, label:"Accessibility",sub:"Ramps + Lifts",    color:"#6b4fcf", angle:  140 },
            ].map((node, i) => {
              // connection line endpoint on core circle edge
              const dx = node.x + 60 - 450;
              const dy = node.y + 26 - 220;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const nx = dx/dist; const ny = dy/dist;
              const x2 = 450 + nx*40; const y2 = 220 + ny*40;
              const x1 = node.x + 60 - nx*8; const y1 = node.y + 26 - ny*8;
              return (
                <motion.g
                  key={node.label}
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  transition={{ delay: 0.3 + i*0.1, duration:0.5 }}
                >
                  {/* Connector */}
                  <motion.line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={`${node.color}40`}
                    strokeWidth="1.5"
                    strokeDasharray="6 5"
                    initial={{ pathLength:0 }}
                    animate={{ pathLength:1 }}
                    transition={{ delay: 0.4 + i*0.1, duration:0.8, ease:EASE }}
                  />
                  {/* Animated pulse dot along connector */}
                  <motion.circle
                    r="3"
                    fill={node.color}
                    opacity="0.8"
                    animate={{
                      cx: [x1, x2, x1],
                      cy: [y1, y2, y1],
                      opacity:[0.8, 0.2, 0.8],
                    }}
                    transition={{ duration: 2.5 + i*0.3, repeat:Infinity, ease:"easeInOut", delay: i*0.35 }}
                  />
                  {/* Node box */}
                  <rect
                    x={node.x} y={node.y} width={118} height={50} rx="12"
                    fill="rgba(255,255,255,0.88)"
                    stroke={`${node.color}28`}
                    strokeWidth="1"
                    style={{ filter:"drop-shadow(0 4px 12px rgba(13,26,46,0.08))" }}
                  />
                  <rect x={node.x+10} y={node.y+14} width={6} height={22} rx="3" fill={node.color} opacity="0.8"/>
                  <text x={node.x+24} y={node.y+23} fill="var(--navy)" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">{node.label}</text>
                  <text x={node.x+24} y={node.y+36} fill="var(--text-3)" fontSize="9.5" fontFamily="var(--font-body)">{node.sub}</text>
                </motion.g>
              );
            })}
          </svg>

          {/* Caption */}
          <p style={{ textAlign:"center", fontSize:13, color:"var(--text-3)", fontFamily:"var(--font-body)", marginTop:12 }}>
            All 8 modules communicate bidirectionally through the Nikhil AI Core
          </p>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section
        id="cta"
        style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}
      >
        {/* Atmospheric sky glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(56,130,246,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div
            style={{
              padding: "72px 56px",
              textAlign: "center",
              borderRadius: 32,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,246,255,0.85))",
              border: "1px solid rgba(56,130,246,0.12)",
              boxShadow:
                "var(--shadow-xl), 0 0 0 1px rgba(56,130,246,0.06)",
              backdropFilter: "blur(24px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gold sunrise accent */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: "-30%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%",
                height: "60%",
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201,146,42,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <SectionLabel color="var(--sky)">Get Started</SectionLabel>
              <h2
                style={{
                  fontSize: "clamp(30px, 4.5vw, 50px)",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--navy)",
                  marginBottom: 16,
                  letterSpacing: "-1.5px",
                  lineHeight: 1.1,
                }}
              >
                Ready to Navigate?
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-2)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  lineHeight: 1.8,
                  marginBottom: 48,
                  maxWidth: 360,
                  margin: "0 auto 48px",
                }}
              >
                Join 2,400+ College students already navigating smarter with AI
              </p>

              <div
                className="flex gap-4 flex-wrap justify-center"
              >
                <Link href="/navigator">
                  <motion.div
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "16px 40px",
                      borderRadius: 16,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                      color: "#fff",
                      border: "none",
                      boxShadow:
                        "0 8px 28px rgba(56,130,246,0.35), 0 2px 8px rgba(56,130,246,0.2)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.2px",
                    }}
                  >
                    <Navigation size={17} strokeWidth={2} />
                    Open Navigator
                    <ArrowRight size={15} strokeWidth={2} />
                  </motion.div>
                </Link>

                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={scrollToFeatures}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "16px 40px",
                    borderRadius: 16,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "rgba(56,130,246,0.07)",
                    color: "var(--sky-deep)",
                    border: "1px solid rgba(56,130,246,0.18)",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.2px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Map size={17} strokeWidth={2} />
                  Explore Features
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "40px 24px",
          borderTop: "1px solid rgba(13,26,46,0.07)",
          background: "rgba(255,255,255,0.5)",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Navigation size={13} color="white" strokeWidth={2} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--navy)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.2px",
                }}
              >
                 Smart Campus Navigator
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.2px",
                }}
              >
                Built with ❤️ · Presented by Nikhil
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Support"].map((l) => (
              <span
                key={l}
                style={{
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontFamily: "var(--font-body)",
                  transition: "color 0.2s ease",
                  letterSpacing: "0.2px",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--sky)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--text-3)")
                }
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}