"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navigation, Map, ArrowRight, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const STATS = [
  { value: "22+",    label: "Buildings Mapped",  color: "var(--cyan)"   },
  { value: "2,400+", label: "Students Using",     color: "var(--purple)" },
  { value: "99.2%",  label: "Nav Accuracy",       color: "var(--green)"  },
  { value: "340+",   label: "Active Routes",       color: "var(--amber)"  },
];

const FEATURES = [
  { icon: "🗺️",  title: "Indoor Navigation",   desc: "Floor-by-floor routing with animated path rendering." },
  { icon: "🧠",  title: "AI Route Detection",  desc: "Dijkstra algorithm finds the optimal path instantly."  },
  { icon: "⚡",  title: "Real-Time Guidance",  desc: "Step-by-step directions with live ETA tracking."       },
  { icon: "🚨",  title: "Emergency Mode",      desc: "One-tap SOS with instant medical center routing."      },
  { icon: "🎙️", title: "Voice Assistant",      desc: "Natural language campus navigation via AI."            },
  { icon: "♿",  title: "Accessibility Mode",  desc: "Wheelchair-friendly routes via ramps and lifts."       },
];

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--bg-1)" }}>
      <ParticleBackground />

      <div className="relative z-10" style={{ paddingTop: "95px" }}>

        {/* ── HERO ── */}
        <section id="hero" className="flex flex-col items-center text-center px-6 pt-16 pb-20 relative">
          <div
            className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none animate-float"
            style={{ background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-[25%] right-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none animate-float"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", animationDelay: "2.5s" }}
          />

          <motion.div {...fadeUp(0.1)}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest mb-8"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "var(--cyan)", fontFamily: "var(--font-display)" }}
            >
              <span className="w-[5px] h-[5px] rounded-full animate-glow inline-block" style={{ background: "var(--cyan)" }} />
              AI-POWERED CAMPUS NAVIGATION
            </span>
          </motion.div>

          <motion.h1
            className="gradient-text mb-6"
            style={{ fontSize: "clamp(42px,7.5vw,86px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-2px", fontFamily: "var(--font-display)", maxWidth: 860 }}
            {...fadeUp(0.2)}
          >
            Navigate Your Campus{" "}
            <span style={{ background: "linear-gradient(90deg, #00d4ff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Intelligently
            </span>
          </motion.h1>

          <motion.p
            style={{ fontSize: "clamp(15px,2vw,18px)", color: "var(--text-2)", maxWidth: 480, lineHeight: 1.75, marginBottom: 48, fontFamily: "var(--font-body)" }}
            {...fadeUp(0.3)}
          >
            Smart indoor + outdoor navigation for{" "}
            <strong style={{ color: "var(--text-1)" }}>RIMT University</strong> — powered by AI, built for students.
          </motion.p>

          <motion.div className="flex gap-4 flex-wrap justify-center" {...fadeUp(0.4)}>
            <Link href="/navigator">
              <NeonButton color="cyan" size="lg" icon={<Navigation className="w-4 h-4" />}>
                Start Navigation
              </NeonButton>
            </Link>
            <NeonButton
              color="purple"
              size="lg"
              icon={<Map className="w-4 h-4" />}
              variant="ghost"
              onClick={scrollToFeatures}
            >
              Explore Features
            </NeonButton>
          </motion.div>

          <motion.button
            className="flex flex-col items-center gap-2 mt-16 cursor-pointer animate-float"
            style={{ color: "var(--text-3)", background: "none", border: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={scrollToFeatures}
          >
            <span className="text-[10px] tracking-[3px]" style={{ fontFamily: "var(--font-display)" }}>SCROLL</span>
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, var(--cyan))" }} />
            <ChevronDown className="w-4 h-4" style={{ color: "var(--cyan)" }} />
          </motion.button>
        </section>

        {/* ── STATS ── */}
        <section id="stats" className="px-6 pb-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard neon hoverable className="p-6 text-center">
                  <div className="text-[clamp(28px,4vw,38px)] font-black mb-1" style={{ color: s.color, fontFamily: "var(--font-display)" }}>
                    {s.value}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--text-2)" }}>{s.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" ref={featuresRef} className="px-6 pb-16 max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="gradient-text-cyan text-[clamp(26px,4vw,42px)] font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Everything You Need
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 15, fontFamily: "var(--font-body)" }}>
              Advanced algorithms meet beautiful design
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <GlassCard hoverable className="p-6 h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.16)" }}>
                    {f.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="px-6 pb-16">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard neon className="p-10 text-center">
              <h2 className="gradient-text text-[clamp(24px,4vw,36px)] font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Navigate?
              </h2>
              <p className="mb-8 text-[15px]" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>
                Join 2,400+ RIMT students already using the system
              </p>
              <Link href="/navigator">
                <NeonButton color="cyan" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Open Navigator
                </NeonButton>
              </Link>
            </GlassCard>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-6 py-8" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
            <div>
              <div className="font-bold gradient-text-cyan text-sm" style={{ fontFamily: "var(--font-display)" }}>
                RIMT Smart Campus Navigator
              </div>
              <div className="text-[14px] mt-2 font-semibold" style={{ color: "rgba(240,244,255,0.82)", fontFamily: "var(--font-body)" }}>
                Built with ❤️ · Presented by Nikhil
              </div>
            </div>
            <div className="flex gap-5">
              {["Privacy", "Terms", "Support"].map((l) => (
                <span key={l} className="text-[13px] cursor-pointer" style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}>{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
