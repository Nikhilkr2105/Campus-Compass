"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation, Map, ArrowRight, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { useRef } from "react";

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

export function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--bg-1)" }}>
      <ParticleBackground />

      {/* ── layered radial mesh background ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0,212,255,0.055) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 80% 70%, rgba(139,92,246,0.06) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,212,255,0.02) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10" style={{ paddingTop: "95px" }}>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section id="hero" className="flex flex-col items-center text-center px-6 pt-20 pb-24 relative">

          {/* floating orbs */}
          <motion.div
            animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "8%", left: "-8%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)", pointerEvents: "none" }}
          />
          <motion.div
            animate={{ y: [0, 14, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ position: "absolute", top: "22%", right: "-6%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)", pointerEvents: "none" }}
          />

          {/* badge */}
          <motion.div {...fadeUp(0.1)}>
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-[11px] font-semibold tracking-[2px] mb-10"
              style={{
                background:  "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(139,92,246,0.06))",
                border:      "1px solid rgba(0,212,255,0.28)",
                color:       "var(--cyan)",
                fontFamily:  "var(--font-display)",
                boxShadow:   "0 0 30px rgba(0,212,255,0.08), inset 0 0 20px rgba(0,212,255,0.04)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="w-[6px] h-[6px] rounded-full animate-glow" style={{ background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />
              AI-POWERED CAMPUS NAVIGATION
              <span className="w-[6px] h-[6px] rounded-full animate-glow" style={{ background: "var(--purple)", boxShadow: "0 0 8px var(--purple)", animationDelay: "0.5s" }} />
            </div>
          </motion.div>

          {/* headline */}
          <motion.h1
            style={{
              fontSize:      "clamp(44px, 8vw, 92px)",
              fontWeight:    800,
              lineHeight:    1.04,
              letterSpacing: "-2.5px",
              fontFamily:    "var(--font-display)",
              maxWidth:      920,
              marginBottom:  28,
            }}
            {...fadeUp(0.2)}
          >
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, rgba(240,244,255,0.9) 40%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Navigate Your{" "}
            </span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, rgba(240,244,255,0.9) 30%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Campus{" "}
            </span>
            <span style={{
              background: "linear-gradient(90deg, #00d4ff 0%, #a78bfa 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(0,212,255,0.4))",
            }}>
              Intelligently
            </span>
          </motion.h1>

          {/* subtext */}
          <motion.p
            style={{
              fontSize:     "clamp(15px, 2vw, 19px)",
              color:        "rgba(240,244,255,0.62)",
              maxWidth:     500,
              lineHeight:   1.8,
              marginBottom: 52,
              fontFamily:   "var(--font-body)",
              fontWeight:   300,
            }}
            {...fadeUp(0.3)}
          >
            Smart indoor + outdoor navigation for{" "}
            <strong style={{ color: "var(--text-1)", fontWeight: 600 }}>RIMT University</strong>
            {" "}— powered by AI, built for students.
          </motion.p>

          {/* CTAs */}
          <motion.div className="flex gap-4 flex-wrap justify-center" {...fadeUp(0.4)}>
            <Link href="/navigator">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-semibold cursor-pointer"
                style={{
                  background:  "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.08))",
                  border:      "1px solid rgba(0,212,255,0.45)",
                  color:       "var(--cyan)",
                  fontFamily:  "var(--font-body)",
                  boxShadow:   "0 0 30px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05)",
                  backdropFilter: "blur(12px)",
                  transition:  "all 0.25s ease",
                }}
              >
                <Navigation className="w-4 h-4" />
                Start Navigation
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-semibold cursor-pointer"
              style={{
                background:  "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))",
                border:      "1px solid rgba(139,92,246,0.35)",
                color:       "var(--purple)",
                fontFamily:  "var(--font-body)",
                backdropFilter: "blur(12px)",
                transition:  "all 0.25s ease",
              }}
            >
              <Map className="w-4 h-4" />
              Explore Features
            </motion.div>
          </motion.div>

          {/* scroll cue */}
          <motion.button
            className="flex flex-col items-center gap-2 mt-20 cursor-pointer"
            style={{ color: "var(--text-3)", background: "none", border: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={scrollToFeatures}
          >
            <span className="text-[9px] tracking-[4px]" style={{ fontFamily: "var(--font-display)", color: "rgba(0,212,255,0.4)" }}>DISCOVER</span>
            <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.5), transparent)" }} />
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" style={{ color: "rgba(0,212,255,0.5)" }} />
            </motion.div>
          </motion.button>
        </section>

        {/* ══════════════════════════════
            STATS
        ══════════════════════════════ */}
        <section id="stats" className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div
                  className="p-6 text-center rounded-2xl relative overflow-hidden"
                  style={{
                    background:     "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border:         `1px solid ${s.color}33`,
                    backdropFilter: "blur(20px)",
                    boxShadow:      `0 0 30px ${s.color}12, inset 0 0 20px ${s.color}06`,
                    transition:     "all 0.3s ease",
                  }}
                >
                  {/* corner glow */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle, ${s.color}22 0%, transparent 70%)`, pointerEvents: "none" }} />

                  <div
                    className="text-[clamp(30px,4vw,42px)] font-black mb-1.5 leading-none"
                    style={{ color: s.color, fontFamily: "var(--font-display)", textShadow: `0 0 20px ${s.color}66` }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[12px] font-medium" style={{ color: "rgba(240,244,255,0.55)", fontFamily: "var(--font-body)", letterSpacing: "0.3px" }}>
                    {s.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            FEATURES
        ══════════════════════════════ */}
        <section id="features" ref={featuresRef} className="px-6 pb-20 max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-[2px] mb-5"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "var(--purple)", fontFamily: "var(--font-display)" }}
            >
              CORE CAPABILITIES
            </div>
            <h2
              style={{
                fontSize:   "clamp(28px,4.5vw,46px)",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #fff 30%, rgba(0,212,255,0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 12,
              }}
            >
              Everything You Need
            </h2>
            <p style={{ color: "rgba(240,244,255,0.5)", fontSize: 15, fontFamily: "var(--font-body)", fontWeight: 300 }}>
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
                whileHover={{ y: -5, scale: 1.01 }}
              >
                <div
                  className="p-6 h-full rounded-2xl relative overflow-hidden group"
                  style={{
                    background:     "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border:         "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    transition:     "all 0.3s ease",
                    cursor:         "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border      = "1px solid rgba(0,212,255,0.25)";
                    e.currentTarget.style.boxShadow   = "0 0 30px rgba(0,212,255,0.08), inset 0 0 20px rgba(0,212,255,0.03)";
                    e.currentTarget.style.background  = "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,255,255,0.02))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border      = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow   = "none";
                    e.currentTarget.style.background  = "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))";
                  }}
                >
                  {/* top-right glow */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))",
                      border:     "1px solid rgba(0,212,255,0.2)",
                      boxShadow:  "0 0 16px rgba(0,212,255,0.1)",
                    }}
                  >
                    {f.icon}
                  </div>

                  <h3 className="text-[14px] font-semibold mb-2.5" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                    {f.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(240,244,255,0.5)", fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            CTA
        ══════════════════════════════ */}
        <section id="cta" className="px-6 pb-20">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="p-12 text-center rounded-3xl relative overflow-hidden"
              style={{
                background:     "linear-gradient(135deg, rgba(0,212,255,0.07), rgba(139,92,246,0.05), rgba(255,255,255,0.02))",
                border:         "1px solid rgba(0,212,255,0.22)",
                backdropFilter: "blur(24px)",
                boxShadow:      "0 0 60px rgba(0,212,255,0.08), 0 0 120px rgba(139,92,246,0.05), inset 0 0 40px rgba(0,212,255,0.04)",
              }}
            >
              {/* bg glow blobs */}
              <div style={{ position: "absolute", top: "-30%", left: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "-30%", right: "-10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div className="relative z-10">
                <h2
                  style={{
                    fontSize:   "clamp(26px,4vw,40px)",
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #fff 20%, #00d4ff 60%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 16,
                  }}
                >
                  Ready to Navigate?
                </h2>
                <p
                  className="mb-10"
                  style={{ fontSize: 16, color: "rgba(240,244,255,0.55)", fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.7 }}
                >
                  Join 2,400+ RIMT students already using the system
                </p>
                <Link href="/navigator">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0 0 40px rgba(0,212,255,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-[15px] font-semibold cursor-pointer"
                    style={{
                      background:  "linear-gradient(135deg, rgba(0,212,255,0.22), rgba(0,212,255,0.1))",
                      border:      "1px solid rgba(0,212,255,0.5)",
                      color:       "var(--cyan)",
                      fontFamily:  "var(--font-body)",
                      boxShadow:   "0 0 24px rgba(0,212,255,0.18)",
                      transition:  "all 0.25s ease",
                    }}
                  >
                    Open Navigator
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════
            FOOTER
        ══════════════════════════════ */}
        <footer
          className="px-6 py-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(to top, rgba(0,212,255,0.02), transparent)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
            <div>
              <div
                className="font-bold text-sm mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(90deg, #fff, #00d4ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                RIMT Smart Campus Navigator
              </div>
              <div className="text-[11px]" style={{ color: "rgba(240,244,255,0.3)", fontFamily: "var(--font-body)" }}>
                Built with ❤️ · Presented by Nikhil
              </div>
            </div>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Support"].map((l) => (
                <span
                  key={l}
                  className="text-[13px] cursor-pointer transition-colors duration-200"
                  style={{ color: "rgba(240,244,255,0.4)", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cyan)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.4)")}
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