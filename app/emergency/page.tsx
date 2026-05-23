"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Navigation,
  Siren,
  Cross,
  CheckCircle2,
  Radio,
  ChevronRight,
  Building2,
  HeartPulse,
  Eye,
} from "lucide-react";
import { BUILDINGS } from "@/data/buildings";

const emergencyBuildings = BUILDINGS.filter((b) => b.type === "emergency");

// ─── Data ────────────────────────────────────────────────────────────────────

const contacts = [
  {
    label: "Campus Security",
    role: "24 / 7 Patrol & Response",
    value: "+91 98765 43210",
    accent: "#DC2626",        // red-600
    bg: "rgba(220,38,38,0.06)",
    border: "rgba(220,38,38,0.18)",
    icon: ShieldCheck,
  },
  {
    label: "Medical Helpdesk",
    role: "Ambulance & First Aid",
    value: "+91 98765 43211",
    accent: "#16A34A",        // green-600
    bg: "rgba(22,163,74,0.06)",
    border: "rgba(22,163,74,0.18)",
    icon: HeartPulse,
  },
  {
    label: "Main Reception",
    role: "Administration & Support",
    value: "+91 98765 43212",
    accent: "#0369A1",        // sky-700
    bg: "rgba(3,105,161,0.06)",
    border: "rgba(3,105,161,0.18)",
    icon: Building2,
  },
];

const responseSteps = [
  "Move to a visible, safe area if possible.",
  "Call campus security or medical help immediately.",
  "Share your nearest building, floor, and room number.",
  "Stay on the line until help reaches you.",
];

const liveStatuses = [
  { label: "Medical Center",   value: "Available", color: "#16A34A", dot: true  },
  { label: "Security Patrol",  value: "Active",    color: "#0369A1", dot: true  },
  { label: "Open SOS Alerts",  value: "0",         color: "#16A34A", dot: false },
  { label: "Ambulance Bay",    value: "Ready",     color: "#D97706", dot: true  },
];

const activityFeed = [
  { time: "2 min ago",  category: "Security",  severity: "info",    msg: "Security patrol completed — Block C",                    icon: "shield"   },
  { time: "8 min ago",  category: "Medical",   severity: "info",    msg: "Medical center shift change — all posts covered",        icon: "cross"    },
  { time: "14 min ago", category: "Facility",  severity: "warning", msg: "Fire alarm test completed — Admin Block (scheduled)",    icon: "alert"    },
  { time: "31 min ago", category: "Medical",   severity: "info",    msg: "Ambulance bay vehicle check cleared",                    icon: "activity" },
];

const quickActions = [
  { label: "Trigger SOS",      icon: Siren,      accent: "#DC2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.22)"  },
  { label: "Alert Security",   icon: ShieldAlert, accent: "#D97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.22)"  },
  { label: "Navigate to Med",  icon: Navigation,  accent: "#0369A1", bg: "rgba(3,105,161,0.08)",  border: "rgba(3,105,161,0.22)"  },
  { label: "Live Monitor",     icon: Eye,         accent: "#16A34A", bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.22)"  },
];

// severity → visual token
const severityConfig = {
  info:    { label: "Info",     dot: "#0369A1", text: "#0369A1", bg: "rgba(3,105,161,0.07)",   border: "rgba(3,105,161,0.16)"   },
  warning: { label: "Warning",  dot: "#D97706", text: "#D97706", bg: "rgba(217,119,6,0.07)",   border: "rgba(217,119,6,0.16)"   },
  critical:{ label: "Critical", dot: "#DC2626", text: "#DC2626", bg: "rgba(220,38,38,0.07)",   border: "rgba(220,38,38,0.16)"   },
  resolved:{ label: "Resolved", dot: "#16A34A", text: "#16A34A", bg: "rgba(22,163,74,0.07)",   border: "rgba(22,163,74,0.16)"   },
};

// ─── Sub-components (inline, not extracted — single-use) ──────────────────────

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: color }}
      />
    </span>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5";
  if (type === "shield")   return <ShieldCheck className={cls} />;
  if (type === "cross")    return <Cross className={cls} />;
  if (type === "alert")    return <AlertTriangle className={cls} />;
  return <Activity className={cls} />;
}

function SeverityBadge({ severity }: { severity: keyof typeof severityConfig }) {
  const cfg = severityConfig[severity];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false);
  const [sosConfirm, setSosConfirm] = useState(false);

  // two-step SOS: first click arms, second activates
  function handleSOS() {
    if (!sosConfirm) {
      setSosConfirm(true);
      setTimeout(() => setSosConfirm(false), 4000); // auto-cancel after 4s
    } else {
      setSosActive((v) => !v);
      setSosConfirm(false);
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "var(--bg-1)", paddingTop: 95 }}
    >
      {/* Subtle directional light — warm, not alarming */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,116,144,0.045) 0%, transparent 65%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-[1200px] mx-auto px-5 py-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ═══════════════════════════════════════════════════════════════════
            STATUS BAR — calm, trusted, informational
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between mb-6 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(22,163,74,0.06)",
            border: "1px solid rgba(22,163,74,0.16)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <PulseDot color="#16A34A" />
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              Campus Safety — All Systems Operational
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Radio className="w-3 h-3" style={{ color: "var(--text-3)" }} />
            <span
              className="text-[10px] tracking-wide"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
            >
              Last updated just now
            </span>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — HERO: title + quick actions + contacts
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 mb-5"
        >
          {/* Hero card */}
          <div
            className="rounded-2xl p-7 lg:p-8"
            style={{
              background: "var(--surface, rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {/* Page label */}
            <p
              className="text-[11px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
            >
              Campus Safety Center
            </p>

            <h1
              className="text-[clamp(28px,4.5vw,52px)] font-bold leading-[1.1] mb-3 tracking-tight"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}
            >
              Get Help{" "}
              <span style={{ color: "#DC2626" }}>Fast.</span>
            </h1>

            <p
              className="text-[14px] leading-relaxed max-w-md mb-7"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              Immediate access to campus security, medical assistance, and
              emergency routing — available 24 hours a day.
            </p>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {quickActions.map((action, i) => {
                const isSOS = i === 0;
                const isArmed = isSOS && sosConfirm;
                const isActive = isSOS && sosActive;

                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-xl px-3 py-3.5 flex flex-col items-center gap-2 cursor-pointer transition-all"
                    style={{
                      background: isArmed
                        ? "rgba(220,38,38,0.15)"
                        : action.bg,
                      border: `1px solid ${isArmed ? "rgba(220,38,38,0.45)" : action.border}`,
                      color: action.accent,
                      boxShadow: isActive ? `0 0 0 3px ${action.accent}30` : "none",
                    }}
                    onClick={() => isSOS ? handleSOS() : undefined}
                  >
                    <action.icon className="w-5 h-5" />
                    <span
                      className="text-[10px] font-semibold tracking-wide text-center leading-tight"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {isSOS && isArmed ? "Confirm SOS?" : action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Emergency contact cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {contacts.map((c) => (
                <motion.a
                  key={c.label}
                  href={`tel:${c.value.replace(/\s/g, "")}`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl p-3.5 flex flex-col gap-2 group"
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    textDecoration: "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${c.accent}14`,
                        border: `1px solid ${c.accent}28`,
                        color: c.accent,
                      }}
                    >
                      <c.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div
                        className="text-[11px] font-semibold leading-tight"
                        style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                      >
                        {c.label}
                      </div>
                      <div
                        className="text-[9px] leading-tight"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                      >
                        {c.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[13px] font-bold tracking-tight"
                      style={{ color: c.accent, fontFamily: "var(--font-display)" }}
                    >
                      {c.value}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `${c.accent}16`, color: c.accent }}
                    >
                      <Phone className="w-3 h-3" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right column: What To Do + Unit Status */}
          <div className="flex flex-col gap-5">

            {/* What To Do */}
            <div
              className="rounded-2xl p-5 flex-1"
              style={{
                background: "rgba(217,119,6,0.05)",
                border: "1px solid rgba(217,119,6,0.16)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4" style={{ color: "#D97706" }} />
                <span
                  className="text-[11px] font-semibold tracking-wide uppercase"
                  style={{ color: "#D97706", fontFamily: "var(--font-body)" }}
                >
                  What To Do Now
                </span>
              </div>
              <div className="flex flex-col gap-3.5">
                {responseSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.07 }}
                    className="flex gap-3 items-start"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(217,119,6,0.12)",
                        border: "1px solid rgba(217,119,6,0.28)",
                        color: "#D97706",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                    >
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Unit Status */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface, rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" style={{ color: "var(--text-3)" }} />
                <span
                  className="text-[11px] font-semibold tracking-wide uppercase"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  Unit Status
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {liveStatuses.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                    >
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.dot && <PulseDot color={item.color} />}
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: item.color, fontFamily: "var(--font-body)" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — EMERGENCY LOCATIONS + INCIDENT FEED
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 mb-5"
        >
          {/* Emergency Locations */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--surface, rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4" style={{ color: "var(--text-3)" }} />
              <span
                className="text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
              >
                Emergency Locations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emergencyBuildings.map((building, i) => (
                <motion.div
                  key={building.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  whileHover={{ y: -1 }}
                  className="rounded-xl p-4"
                  style={{
                    background: `${building.color}07`,
                    border: `1px solid ${building.color}22`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${building.color}14`,
                        border: `1px solid ${building.color}28`,
                        color: building.color,
                      }}
                    >
                      {building.id === "medical" ? (
                        <Cross className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2
                        className="text-[13px] font-semibold mb-0.5 leading-tight"
                        style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}
                      >
                        {building.name}
                      </h2>
                      <p
                        className="text-[11px] leading-relaxed"
                        style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                      >
                        {building.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {building.facilities.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="text-[9px] px-2 py-0.5 rounded-md font-medium"
                        style={{
                          background: `${building.color}0d`,
                          border: `1px solid ${building.color}1e`,
                          color: building.color,
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/navigator"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold group"
                    style={{ color: building.color, fontFamily: "var(--font-body)" }}
                  >
                    Open in Navigator
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Incident Feed */}
          <div
            className="rounded-2xl p-5 flex flex-col"
            style={{
              background: "var(--surface, rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: "var(--text-3)" }} />
                <span
                  className="text-[11px] font-semibold tracking-wide uppercase"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  Incident Feed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <PulseDot color="#16A34A" />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "#16A34A", fontFamily: "var(--font-body)" }}
                >
                  Live
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-1 flex-1 relative">
              {/* Vertical line */}
              <div
                className="absolute left-[19px] top-3 bottom-3 w-px"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />

              <AnimatePresence>
                {activityFeed.map((item, i) => {
                  const severity = item.severity as keyof typeof severityConfig;
                  const cfg = severityConfig[severity];
                  return (
                    <motion.div
                      key={item.msg}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-start gap-3 py-2.5 px-1"
                    >
                      {/* Icon node on timeline */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 z-10"
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.text,
                        }}
                      >
                        <ActivityIcon type={item.icon} />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <SeverityBadge severity={severity} />
                          <span
                            className="text-[9px] font-medium"
                            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p
                          className="text-[11px] leading-snug mb-1"
                          style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
                        >
                          {item.msg}
                        </p>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                        >
                          {item.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Stat strip */}
            <div
              className="mt-4 grid grid-cols-3 gap-2 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[
                { label: "Active Alerts", val: "0",   color: "#16A34A" },
                { label: "On Patrol",     val: "4",   color: "#0369A1" },
                { label: "Response ETA",  val: "<3m", color: "#D97706" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-[18px] font-bold leading-tight"
                    style={{ color: stat.color, fontFamily: "var(--font-display)" }}
                  >
                    {stat.val}
                  </div>
                  <div
                    className="text-[9px] mt-0.5"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER — minimal, reassuring
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          className="mt-2 flex items-center justify-center gap-2 py-5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
          <span
            className="text-[11px]"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            Campus Safety System · All data refreshed live
          </span>
        </motion.div>
      </motion.div>
    </main>
  );
}