"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navigation, Map, ArrowRight, ChevronDown, Sparkles, Compass } from "lucide-react";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { useRef } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const STATS = [
  { value: "22+", label: "Buildings Digitized" },
  { value: "2,400+", label: "Active Students" },
  { value: "99.2%", label: "Routing Precision" },
  { value: "340+", label: "Live Paths" },
];

const FEATURES = [
  { icon: "🗺️", title: "Indoor Navigation", desc: "Floor-aware route rendering with smooth transitions." },
  { icon: "🧠", title: "Smart Path Engine", desc: "Algorithmic wayfinding for accurate, low-latency routes." },
  { icon: "⚡", title: "Live Guidance", desc: "Step-by-step campus direction with instant recalculation." },
  { icon: "♿", title: "Accessible Routing", desc: "Barrier-conscious navigation for safer movement across campus." },
  { icon: "🎙️", title: "Voice Requests", desc: "Natural prompts for hands-free destination search and routing." },
  { icon: "🚨", title: "Emergency Assist", desc: "One-tap emergency route guidance to key safety locations." },
];

export function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#06090f" }}>
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 18% 15%, rgba(0,212,255,0.14), transparent 62%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(55% 50% at 84% 18%, rgba(140,110,255,0.16), transparent 64%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,11,18,0.2) 0%, rgba(6,9,15,0.92) 64%)" }} />
      </div>

      <div className="relative z-10" style={{ paddingTop: "95px" }}>
        <section className="relative px-6 pt-16 pb-24 max-w-6xl mx-auto">
          <motion.div
            className="absolute -top-10 -left-20 w-72 h-72 rounded-full blur-3xl"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "rgba(0,212,255,0.18)" }}
          />

          <motion.div
            className="absolute top-16 -right-14 w-72 h-72 rounded-full blur-3xl"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "rgba(139,92,246,0.17)" }}
          />

          <motion.div {...fadeUp(0)}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-[11px] tracking-[1.8px]"
              style={{
                color: "#8ce8ff",
                border: "1px solid rgba(110,229,255,0.35)",
                background: "linear-gradient(135deg, rgba(0,212,255,0.14), rgba(125,92,255,0.08))",
                backdropFilter: "blur(14px)",
                fontFamily: "var(--font-display)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> PREMIUM CAMPUS WAYFINDING
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.05)}
            className="max-w-4xl"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px,8vw,88px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              fontWeight: 800,
            }}
          >
            <span style={{ background: "linear-gradient(180deg, #fff 0%, rgba(236,242,255,0.78) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Navigate RIMT
            </span>
            <br />
            <span style={{ background: "linear-gradient(90deg, #67e8ff 0%, #9d7bff 52%, #d7ccff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              with Cinematic Precision
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="max-w-2xl mt-7 text-[15px] sm:text-[18px] leading-8"
            style={{ color: "rgba(227,236,255,0.68)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            A premium, map-first navigation experience for students — blending AI intelligence, immersive visuals, and effortless routing across campus interiors.
          </motion.p>

          <motion.div {...fadeUp(0.14)} className="flex flex-wrap gap-4 mt-10">
            <Link href="/navigator">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl cursor-pointer"
                style={{
                  color: "#87ecff",
                  border: "1px solid rgba(108,230,255,0.45)",
                  background: "linear-gradient(135deg, rgba(0,212,255,0.24), rgba(0,212,255,0.08))",
                  boxShadow: "0 10px 40px rgba(0,212,255,0.18)",
                }}
              >
                <Navigation className="w-4 h-4" /> Launch Navigator
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl"
              style={{
                color: "#c5b4ff",
                border: "1px solid rgba(165,138,255,0.35)",
                background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.06))",
                backdropFilter: "blur(12px)",
              }}
            >
              <Map className="w-4 h-4" /> Explore Experience
            </motion.button>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="mt-14 rounded-3xl p-4 sm:p-6"
            style={{
              border: "1px solid rgba(173,196,255,0.2)",
              background: "linear-gradient(150deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="relative overflow-hidden rounded-2xl p-7 sm:p-10" style={{ background: "linear-gradient(150deg, rgba(6,14,24,0.92), rgba(12,14,27,0.9))", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="absolute inset-0" style={{ background: "radial-gradient(70% 65% at 18% 30%, rgba(0,212,255,0.14), transparent 62%)" }} />
              <div className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 90% 10%, rgba(139,92,246,0.14), transparent 68%)" }} />

              <div className="relative z-10 grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-end">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] tracking-[1.6px] mb-4" style={{ color: "rgba(145,236,255,0.9)", fontFamily: "var(--font-display)" }}>
                    <Compass className="w-4 h-4" /> LIVE MAP PREVIEW
                  </div>
                  <h3 className="text-[22px] sm:text-[30px] font-semibold leading-tight" style={{ color: "#edf3ff", fontFamily: "var(--font-display)" }}>
                    Immersive route intelligence, visualized before you move.
                  </h3>
                </div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(180,220,255,0.22)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div className="aspect-[16/10] rounded-xl relative overflow-hidden" style={{ background: "#08111c", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div className="absolute inset-0 opacity-80" style={{ backgroundImage: "linear-gradient(rgba(121,160,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(121,160,255,0.14) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
                    <motion.div
                      className="absolute top-[18%] left-[8%] h-[2px] rounded-full"
                      animate={{ width: ["20%", "78%", "20%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      style={{ background: "linear-gradient(90deg, #5ce8ff, #a185ff)", boxShadow: "0 0 20px rgba(92,232,255,0.7)" }}
                    />
                    <motion.div
                      className="absolute bottom-[24%] left-[26%] w-2.5 h-2.5 rounded-full"
                      animate={{ x: [0, 80, 26, 0], y: [0, -24, 12, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      style={{ background: "#70ecff", boxShadow: "0 0 18px rgba(112,236,255,0.85)" }}
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] tracking-widest" style={{ color: "rgba(198,220,255,0.68)", fontFamily: "var(--font-display)" }}>
                      PREVIEW MODE
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.button
            className="flex flex-col items-center gap-2 mt-14 mx-auto"
            style={{ color: "rgba(184,231,255,0.72)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={scrollToFeatures}
          >
            <span className="text-[10px] tracking-[3.5px]" style={{ fontFamily: "var(--font-display)" }}>SCROLL</span>
            <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(132,225,255,0.7), transparent)" }} />
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </section>

        <section className="px-6 pb-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.05)}>
                <div className="p-6 rounded-2xl" style={{ border: "1px solid rgba(189,208,255,0.17)", background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", backdropFilter: "blur(16px)" }}>
                  <div className="text-[clamp(28px,4vw,40px)] leading-none" style={{ color: "#90e8ff", fontFamily: "var(--font-display)", fontWeight: 700 }}>{s.value}</div>
                  <div className="text-[12px] mt-2" style={{ color: "rgba(220,232,255,0.6)" }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section ref={featuresRef} className="px-6 pb-20 max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <h2 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 700, fontFamily: "var(--font-display)", color: "#edf3ff", letterSpacing: "-0.02em" }}>
              Built for a modern campus.
            </h2>
            <p className="mt-3" style={{ color: "rgba(218,228,255,0.56)", fontSize: 15 }}>
              Minimal, intelligent tools designed for everyday movement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.04)} whileHover={{ y: -4 }}>
                <div className="h-full p-6 rounded-2xl" style={{ border: "1px solid rgba(184,212,255,0.18)", background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))", backdropFilter: "blur(18px)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5" style={{ background: "linear-gradient(135deg, rgba(103,232,255,0.18), rgba(158,133,255,0.12))", border: "1px solid rgba(161,211,255,0.26)" }}>
                    {f.icon}
                  </div>
                  <h3 className="text-[15px] mb-2" style={{ color: "#edf3ff", fontFamily: "var(--font-display)", fontWeight: 600 }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(220,232,255,0.6)" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-20">
          <motion.div className="max-w-3xl mx-auto text-center rounded-3xl p-12" {...fadeUp(0)} style={{ border: "1px solid rgba(171,211,255,0.2)", background: "linear-gradient(145deg, rgba(14,22,34,0.88), rgba(20,16,36,0.8))", backdropFilter: "blur(22px)" }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: "#f0f5ff", fontFamily: "var(--font-display)" }}>Ready to move smarter?</h2>
            <p className="mt-4 mb-9" style={{ color: "rgba(220,232,255,0.62)", lineHeight: 1.75 }}>Experience premium campus routing engineered for speed, clarity, and confidence.</p>
            <Link href="/navigator">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl" style={{ color: "#87ebff", border: "1px solid rgba(102,228,255,0.45)", background: "linear-gradient(135deg, rgba(0,212,255,0.22), rgba(0,212,255,0.08))", boxShadow: "0 8px 30px rgba(0,212,255,0.16)" }}>
                Open Navigator <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
