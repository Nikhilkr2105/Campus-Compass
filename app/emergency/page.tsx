"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Cross,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Zap,
  Activity,
  Eye,
  Navigation,
  Siren,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BUILDINGS } from "@/data/buildings";

const emergencyBuildings = BUILDINGS.filter((b) => b.type === "emergency");

const contacts = [
  { label: "Campus Security", value: "+91 98765 43210", tone: "var(--red)" },
  { label: "Medical Helpdesk", value: "+91 98765 43211", tone: "var(--green)" },
  { label: "Main Reception", value: "+91 98765 43212", tone: "var(--cyan)" },
];

const responseSteps = [
  "Move to a visible, safe area if possible.",
  "Call campus security or medical help immediately.",
  "Share your nearest building, floor, and room number.",
  "Stay on the line until help reaches you.",
];

const liveStatuses = [
  { label: "Medical Center", value: "Available", color: "var(--green)", dot: true },
  { label: "Security Patrol", value: "Active", color: "var(--cyan)", dot: true },
  { label: "SOS Alerts", value: "0 Open", color: "var(--green)", dot: false },
  { label: "Ambulance Bay", value: "Ready", color: "var(--amber)", dot: true },
];

const activityFeed = [
  { time: "2m ago", msg: "Security patrol completed — Block C", color: "var(--cyan)", icon: "shield" },
  { time: "8m ago", msg: "Medical center shift change — all posts covered", color: "var(--green)", icon: "cross" },
  { time: "14m ago", msg: "Fire alarm test — Admin Block (scheduled)", color: "var(--amber)", icon: "alert" },
  { time: "31m ago", msg: "Ambulance bay vehicle check — cleared", color: "var(--green)", icon: "activity" },
];

const quickActions = [
  { label: "Trigger SOS", icon: Siren, color: "var(--red)", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  { label: "Alert Security", icon: ShieldAlert, color: "var(--amber)", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  { label: "Navigate to Med", icon: Navigation, color: "var(--cyan)", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.3)" },
  { label: "Live Monitor", icon: Eye, color: "var(--green)", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
];

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: color }}
      />
    </span>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "w-3 h-3";
  if (type === "shield") return <ShieldCheck className={cls} />;
  if (type === "cross") return <Cross className={cls} />;
  if (type === "alert") return <AlertTriangle className={cls} />;
  return <Activity className={cls} />;
}

export default function EmergencyPage() {
  const [tick, setTick] = useState(0);
  const [sosActive, setSosActive] = useState(false);

  // Heartbeat tick for live feel
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "var(--bg-1)", paddingTop: 95 }}
    >
      {/* ── Ambient red/orange glow backdrop ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 15% 10%, rgba(239,68,68,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 35% at 85% 80%, rgba(245,158,11,0.05) 0%, transparent 55%)",
        }}
      />

      {/* ── Scan-line texture overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-[1200px] mx-auto px-5 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ══ TOP STRIP: system label + live clock ══ */}
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <PulseDot color="var(--red)" />
            <span
              className="text-[10px] font-bold tracking-[2.5px] uppercase"
              style={{ color: "var(--red)", fontFamily: "var(--font-display)" }}
            >
              Emergency Operations Center
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: "var(--cyan)" }} />
            <span
              className="text-[10px] tracking-widest"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
            >
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </motion.div>

        {/* ══ HERO SECTION ══ */}
        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 mb-5"
        >
          {/* SOS / Hero card */}
          <div
            className="relative rounded-2xl p-7 lg:p-9 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(15,15,20,0.6) 60%)",
              border: "1px solid rgba(239,68,68,0.25)",
              boxShadow: "0 0 40px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Corner accent */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, var(--red), transparent 70%)",
              }}
            />

            <div className="flex items-center gap-2 mb-5">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[2px]"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "var(--red)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--red)" }}
                />
                LIVE · EMERGENCY MODE
              </motion.span>
            </div>

            <h1
              className="text-[clamp(32px,5vw,58px)] font-black leading-[1.05] mb-3 tracking-tight"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}
            >
              Get Help
              <span style={{ color: "var(--red)" }}> Fast.</span>
            </h1>
            <p
              className="text-[14px] leading-relaxed max-w-lg mb-7"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              Urgent campus support, medical assistance, and instant routing to
              emergency facilities — all in one control center.
            </p>

            {/* Quick-action row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl px-3 py-3 flex flex-col items-center gap-2 cursor-pointer transition-shadow"
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    color: action.color,
                    boxShadow:
                      i === 0 && sosActive
                        ? `0 0 20px ${action.color}40`
                        : "none",
                  }}
                  onClick={() => i === 0 && setSosActive((v) => !v)}
                >
                  <action.icon className="w-5 h-5" />
                  <span
                    className="text-[10px] font-bold tracking-wide text-center leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Contact buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {contacts.map((contact) => (
                <motion.a
                  key={contact.label}
                  href={`tel:${contact.value.replace(/\s/g, "")}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: `${contact.tone}10`,
                    border: `1px solid ${contact.tone}30`,
                    color: contact.tone,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold tracking-wide">
                      {contact.label}
                    </span>
                  </div>
                  <div className="text-[13px] font-bold">{contact.value}</div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* What To Do + Live Status stacked */}
          <div className="flex flex-col gap-5">
            {/* Response steps */}
            <div
              className="rounded-2xl p-5 flex-1"
              style={{
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.18)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 0 30px rgba(245,158,11,0.04)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[2px] mb-4 flex items-center gap-2"
                style={{ color: "var(--amber)", fontFamily: "var(--font-display)" }}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                WHAT TO DO NOW
              </div>
              <div className="flex flex-col gap-3">
                {responseSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex gap-3 items-start"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{
                        background: "rgba(245,158,11,0.14)",
                        border: "1px solid rgba(245,158,11,0.32)",
                        color: "var(--amber)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p
                      className="text-[12px] leading-relaxed pt-0.5"
                      style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                    >
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live Status */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(34,197,94,0.03)",
                border: "1px solid rgba(34,197,94,0.14)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[2px] mb-3.5 flex items-center gap-2"
                style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}
              >
                <Clock className="w-3.5 h-3.5" />
                UNIT STATUS
              </div>
              <div className="flex flex-col gap-2">
                {liveStatuses.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
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
                        style={{ color: item.color, fontFamily: "var(--font-display)" }}
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

        {/* ══ BOTTOM SECTION ══ */}
        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5"
        >
          {/* Emergency Locations */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(34,211,238,0.03)",
              border: "1px solid rgba(34,211,238,0.12)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 40px rgba(34,211,238,0.03)",
            }}
          >
            <div
              className="text-[10px] font-bold tracking-[2px] mb-4 flex items-center gap-2"
              style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
            >
              <MapPin className="w-3.5 h-3.5" />
              EMERGENCY LOCATIONS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {emergencyBuildings.map((building, i) => (
                <motion.div
                  key={building.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl p-4"
                  style={{
                    background: `${building.color}08`,
                    border: `1px solid ${building.color}28`,
                    boxShadow: `0 0 20px ${building.color}05`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${building.color}16`,
                        border: `1px solid ${building.color}32`,
                        color: building.color,
                      }}
                    >
                      {building.id === "medical" ? (
                        <Cross className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2
                        className="text-[14px] font-bold mb-1"
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

                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {building.facilities.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="text-[9px] px-2 py-0.5 rounded-md font-semibold tracking-wide"
                        style={{
                          background: `${building.color}10`,
                          border: `1px solid ${building.color}22`,
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
                    Open in navigator
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div
            className="rounded-2xl p-5 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="text-[10px] font-bold tracking-[2px] mb-4 flex items-center justify-between"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <div className="flex items-center gap-2" style={{ color: "var(--text-2)" }}>
                <Activity className="w-3.5 h-3.5" />
                INCIDENT FEED
              </div>
              <div className="flex items-center gap-1.5">
                <PulseDot color="var(--green)" />
                <span
                  className="text-[9px] tracking-widest"
                  style={{ color: "var(--green)" }}
                >
                  LIVE
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 flex-1">
              <AnimatePresence>
                {activityFeed.map((item, i) => (
                  <motion.div
                    key={item.msg}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.09 }}
                    className="rounded-xl px-3.5 py-3 flex items-start gap-3"
                    style={{
                      background: `${item.color}08`,
                      border: `1px solid ${item.color}18`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}30`,
                        color: item.color,
                      }}
                    >
                      <ActivityIcon type={item.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
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
                ))}
              </AnimatePresence>
            </div>

            {/* Footer stat strip */}
            <div
              className="mt-4 grid grid-cols-3 gap-2 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[
                { label: "Active Alerts", val: "0", color: "var(--green)" },
                { label: "On Patrol", val: "4", color: "var(--cyan)" },
                { label: "Response ETA", val: "<3m", color: "var(--amber)" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-[18px] font-black leading-tight"
                    style={{ color: stat.color, fontFamily: "var(--font-display)" }}
                  >
                    {stat.val}
                  </div>
                  <div
                    className="text-[9px] tracking-wide mt-0.5"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ══ BOTTOM GUTTER ══ */}
        <motion.div
          variants={fadeUp}
          className="mt-5 flex items-center justify-center gap-2 py-4"
        >
          <Zap className="w-3 h-3" style={{ color: "var(--text-3)" }} />
          <span
            className="text-[9px] tracking-[2px] uppercase"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
          >
            Smart Campus Emergency Control System · All data live
          </span>
          <Zap className="w-3 h-3" style={{ color: "var(--text-3)" }} />
        </motion.div>
      </motion.div>
    </main>
  );
}