"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Navigation, MapPin, Shield, Accessibility } from "lucide-react";

/* ─────────────────────────────────────────
   EASING — matches LandingPage EASE constant
───────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  role: "student" | "faculty" | "admin" | "accessibility";
  src: string;
  stat: { value: string; label: string };
  accent: string;
  routeLabel: string;
}

/* ─────────────────────────────────────────
   TESTIMONIAL DATA
───────────────────────────────────────── */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "First week of college I was late to every class — buildings all looked the same. Campus Compass changed that. I opened it, spoke my destination, and it walked me there in 28 seconds. Now I navigate like I've been here for years.",
    name: "Priya Mehta",
    designation: "3rd Year · Computer Science",
    role: "student",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    stat: { value: "28s", label: "avg. route find" },
    accent: "#3882f6",
    routeLabel: "Hostel → Lab Block · F2",
  },
  {
    quote:
      "I used to spend 10 minutes at the start of every lecture directing students to my office or the seminar rooms. With Campus Compass I just drop a location pin in the notice — they arrive on time, every time. It changed how I run my department.",
    name: "Dr. Anand Krishnamurthy",
    designation: "Associate Professor · Electronics Dept.",
    role: "faculty",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    stat: { value: "100%", label: "punctual arrivals" },
    accent: "#c9922a",
    routeLabel: "Main Block → Seminar Hall · G",
  },
  {
    quote:
      "Managing a campus of 8,000 people meant flying blind on movement patterns. The analytics dashboard gave us our first real picture of how students actually move — we restructured three service counters based on footfall data alone.",
    name: "Ritu Sharma",
    designation: "Campus Administrator · Operations",
    role: "admin",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    stat: { value: "3×", label: "ops efficiency gain" },
    accent: "#6b4fcf",
    routeLabel: "Admin · Live Heatmap View",
  },
  {
    quote:
      "As someone who uses a wheelchair, campus navigation was genuinely difficult — unmarked ramps, lifts that were hard to find. The accessibility mode in Campus Compass knows every ramp and lift on every floor. For the first time I feel like the campus was designed for me too.",
    name: "Kavya Nair",
    designation: "2nd Year · Architecture · Wheelchair User",
    role: "accessibility",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    stat: { value: "♿ 100%", label: "barrier-free routes" },
    accent: "#0d9e6e",
    routeLabel: "Accessible · Ramp + Lift Routing",
  },
];

/* ─────────────────────────────────────────
   ROLE ICON MAP
───────────────────────────────────────── */
const ROLE_ICONS = {
  student: Navigation,
  faculty: MapPin,
  admin: Shield,
  accessibility: Accessibility,
};

/* ─────────────────────────────────────────
   BACKGROUND AVATAR STACK (left panel)
───────────────────────────────────────── */
function AvatarStack({
  testimonials,
  activeIndex,
  onSelect,
}: {
  testimonials: Testimonial[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1200,
      }}
    >
      {/* Ambient glow ring behind active */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${TESTIMONIALS[activeIndex].accent}22 0%, transparent 70%)`,
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      {/* Route overlay SVG — decorative */}
      <svg
        viewBox="0 0 320 320"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.18,
        }}
        aria-hidden
      >
        <defs>
          <radialGradient id="routeFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TESTIMONIALS[activeIndex].accent} stopOpacity="1" />
            <stop offset="100%" stopColor={TESTIMONIALS[activeIndex].accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Dotted campus-path ring */}
        <circle
          cx="160" cy="160" r="130"
          fill="none"
          stroke={TESTIMONIALS[activeIndex].accent}
          strokeWidth="1"
          strokeDasharray="4 8"
          opacity="0.5"
        />
        <circle
          cx="160" cy="160" r="100"
          fill="none"
          stroke={TESTIMONIALS[activeIndex].accent}
          strokeWidth="0.5"
          strokeDasharray="2 10"
          opacity="0.3"
        />
        {/* Diagonal route lines */}
        <motion.line
          x1="60" y1="60" x2="260" y2="260"
          stroke={TESTIMONIALS[activeIndex].accent}
          strokeWidth="0.8"
          strokeDasharray="6 6"
          animate={{ strokeDashoffset: [0, -24] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <line x1="60" y1="260" x2="260" y2="60"
          stroke={TESTIMONIALS[activeIndex].accent}
          strokeWidth="0.5"
          strokeDasharray="4 8"
          opacity="0.4"
        />
      </svg>

      {/* Avatar images — circular choreography */}
      {testimonials.map((t, i) => {
        const total = testimonials.length;
        const offset = (i - activeIndex + total) % total;
        const isActive = offset === 0;
        const isLeft = offset === total - 1;
        const isRight = offset === 1;

        let transform = "translateX(0px) translateY(0px) scale(0) rotateY(0deg)";
        let zIndex = 0;
        let opacity = 0;
        let pointerEvents: "auto" | "none" = "none";
        let size = 80;

        if (isActive) {
          transform = "translateX(0px) translateY(0px) scale(1) rotateY(0deg)";
          zIndex = 3;
          opacity = 1;
          pointerEvents = "auto";
          size = 200;
        } else if (isLeft) {
          transform = "translateX(-110px) translateY(-30px) scale(0.72) rotateY(14deg)";
          zIndex = 2;
          opacity = 0.7;
          pointerEvents = "auto";
          size = 200;
        } else if (isRight) {
          transform = "translateX(110px) translateY(-30px) scale(0.72) rotateY(-14deg)";
          zIndex = 2;
          opacity = 0.7;
          pointerEvents = "auto";
          size = 200;
        }

        return (
          <div
            key={t.src}
            onClick={() => !isActive && onSelect(i)}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              overflow: "hidden",
              transform,
              zIndex,
              opacity,
              pointerEvents,
              transition: "all 0.75s cubic-bezier(0.4, 2, 0.3, 1)",
              cursor: isActive ? "default" : "pointer",
              border: isActive
                ? `2.5px solid ${t.accent}88`
                : "1.5px solid rgba(255,255,255,0.1)",
              boxShadow: isActive
                ? `0 0 0 4px ${t.accent}22, 0 20px 60px rgba(0,0,0,0.5)`
                : "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={t.src}
              alt={t.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Gradient overlay on non-active */}
            {!isActive && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(8,14,28,0.4)",
                borderRadius: "50%",
              }} />
            )}
          </div>
        );
      })}

      {/* Active avatar: accent ring pulse */}
      <motion.div
        key={`ring-${activeIndex}`}
        animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: `1.5px solid ${TESTIMONIALS[activeIndex].accent}`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Route label pill */}
      <motion.div
        key={`route-${activeIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 999,
          background: "rgba(13,26,46,0.85)",
          border: `1px solid ${TESTIMONIALS[activeIndex].accent}33`,
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            width: 5, height: 5, borderRadius: "50%",
            background: TESTIMONIALS[activeIndex].accent,
            boxShadow: `0 0 8px ${TESTIMONIALS[activeIndex].accent}`,
          }}
        />
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.6px",
          color: "rgba(160,190,230,0.75)",
          fontFamily: "var(--font-sans)",
        }}>
          {TESTIMONIALS[activeIndex].routeLabel}
        </span>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROGRESS DOTS
───────────────────────────────────────── */
function ProgressDots({
  total,
  active,
  accent,
  onDotClick,
}: {
  total: number;
  active: number;
  accent: string;
  onDotClick: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to testimonial ${i + 1}`}
          style={{
            border: "none",
            cursor: "pointer",
            padding: 0,
            background: "transparent",
            display: "flex",
            alignItems: "center",
          }}
        >
          <motion.div
            animate={{
              width: i === active ? 24 : 6,
              background: i === active ? accent : "rgba(255,255,255,0.18)",
            }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ height: 6, borderRadius: 3 }}
          />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export function CampusCompassTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = TESTIMONIALS.length;

  const active = TESTIMONIALS[activeIndex];
  const RoleIcon = ROLE_ICONS[active.role];

  // Autoplay
  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % total);
    }, 5500);
  }, [total]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const handleNext = useCallback(() => {
    stopAutoplay();
    setActiveIndex((p) => (p + 1) % total);
  }, [total, stopAutoplay]);

  const handlePrev = useCallback(() => {
    stopAutoplay();
    setActiveIndex((p) => (p - 1 + total) % total);
  }, [total, stopAutoplay]);

  const handleSelect = useCallback((i: number) => {
    stopAutoplay();
    setActiveIndex(i);
  }, [stopAutoplay]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePrev, handleNext]);

  return (
    <section
      id="testimonials"
      aria-label="Testimonials from Campus Compass users"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
        background: "var(--navy)",
      }}
    >
      {/* Atmospheric background layers */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 60% at 15% 50%, rgba(56,130,246,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 50% 50% at 85% 50%, rgba(201,146,42,0.06) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 50% 90%, rgba(13,26,46,0.9) 0%, transparent 70%)
        `,
      }} />

      {/* Subtle grid overlay */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: `
          linear-gradient(rgba(56,130,246,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,130,246,1) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>

        {/* Section header */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 64 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          {/* Section label — matches existing SectionLabel style */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999,
            fontSize: 11, fontWeight: 600, letterSpacing: "2px",
            textTransform: "uppercase" as const,
            background: "rgba(56,130,246,0.12)", border: "1px solid rgba(56,130,246,0.28)",
            color: "#6ea8ff", fontFamily: "var(--font-sans)", marginBottom: 20,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6ea8ff", opacity: 0.85 }} />
            Trusted Voices
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 700,
            fontFamily: "var(--font-display)", color: "#fff",
            letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 12,
          }}>
            Trusted by the people who navigate<br />
            <span style={{
              background: "linear-gradient(135deg, #6ea8ff 0%, #c9922a 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              campuses every day.
            </span>
          </h2>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-body)", maxWidth: 380,
            margin: "0 auto", lineHeight: 1.75,
          }}>
            Students, faculty, and administrators on how Campus Compass changed their daily experience.
          </p>
        </motion.div>

        {/* Main testimonial layout */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 5vw, 72px)",
            alignItems: "center",
          }}
          className="testimonial-grid-responsive"
        >
          {/* LEFT: Circular avatar choreography */}
          <AvatarStack
            testimonials={TESTIMONIALS}
            activeIndex={activeIndex}
            onSelect={handleSelect}
          />

          {/* RIGHT: Quote content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Quote icon */}
            <motion.div
              key={`quote-icon-${activeIndex}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                width: 40, height: 40, borderRadius: 12, marginBottom: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${active.accent}18`,
                border: `1px solid ${active.accent}30`,
              }}
            >
              <Quote size={16} style={{ color: active.accent }} strokeWidth={2} />
            </motion.div>

            {/* Quote text with word-blur reveal */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p style={{
                  fontSize: "clamp(15px, 1.7vw, 18px)",
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  marginBottom: 36,
                  letterSpacing: "0.1px",
                }}>
                  {active.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                        delay: 0.02 * i,
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </p>

                {/* Attribution row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                  {/* Role icon badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${active.accent}18`, border: `1px solid ${active.accent}30`,
                  }}>
                    <RoleIcon size={15} style={{ color: active.accent }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 15, fontWeight: 700,
                      color: "rgba(255,255,255,0.92)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "-0.2px",
                      marginBottom: 2,
                    }}>
                      {active.name}
                    </div>
                    <div style={{
                      fontSize: 12, color: "rgba(255,255,255,0.38)",
                      fontFamily: "var(--font-body)", letterSpacing: "0.2px",
                    }}>
                      {active.designation}
                    </div>
                  </div>

                  {/* Stat pill */}
                  <div style={{
                    marginLeft: "auto",
                    padding: "8px 16px", borderRadius: 12,
                    background: `${active.accent}12`,
                    border: `1px solid ${active.accent}25`,
                    textAlign: "center", flexShrink: 0,
                  }}>
                    <div style={{
                      fontSize: 18, fontWeight: 700,
                      color: active.accent,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.5px",
                      lineHeight: 1.1,
                    }}>
                      {active.stat.value}
                    </div>
                    <div style={{
                      fontSize: 9, color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-body)", letterSpacing: "0.5px",
                      textTransform: "uppercase" as const, marginTop: 2,
                    }}>
                      {active.stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls: dots + arrows */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <ProgressDots
                total={total}
                active={activeIndex}
                accent={active.accent}
                onDotClick={handleSelect}
              />

              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { action: handlePrev, icon: ChevronLeft, label: "Previous testimonial" },
                  { action: handleNext, icon: ChevronRight, label: "Next testimonial" },
                ].map(({ action, icon: Icon, label }) => (
                  <motion.button
                    key={label}
                    onClick={action}
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    aria-label={label}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      border: "1px solid rgba(56,130,246,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", backdropFilter: "blur(8px)",
                      transition: "border-color 0.2s ease, background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${active.accent}18`;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${active.accent}50`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56,130,246,0.2)";
                    }}
                  >
                    <Icon size={16} color="rgba(255,255,255,0.65)" strokeWidth={2} />
                  </motion.button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Bottom: all 4 reviewer thumbnails row (mobile fallback / desktop accent) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
          style={{
            marginTop: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => handleSelect(i)}
              whileHover={{ scale: 1.12, zIndex: 10 }}
              aria-label={`View testimonial from ${t.name}`}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                overflow: "hidden", cursor: "pointer",
                border: i === activeIndex
                  ? `2px solid ${t.accent}`
                  : "2px solid rgba(255,255,255,0.1)",
                marginLeft: i > 0 ? -8 : 0,
                zIndex: i === activeIndex ? 5 : 4 - i,
                position: "relative",
                transition: "border-color 0.3s ease",
                background: "transparent",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <img
                src={t.src}
                alt={t.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {i !== activeIndex && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(8,14,28,0.5)",
                  borderRadius: "50%",
                }} />
              )}
            </motion.button>
          ))}
          <span style={{
            marginLeft: 16, fontSize: 13,
            color: "rgba(255,255,255,0.28)",
            fontFamily: "var(--font-body)",
          }}>
            {activeIndex + 1} / {total}
          </span>
        </motion.div>
      </div>

      {/* Responsive grid override */}
      <style jsx>{`
        @media (max-width: 768px) {
          .testimonial-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CampusCompassTestimonials;