"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, Menu, X, Bot } from "lucide-react";

const NAV_LINKS = ["Home", "Navigate", "Analytics", "Emergency", "Admin"];

const TICKER_ITEMS = [
  "🟢 Navigation System: ONLINE",
  "📍 14 Buildings Mapped",
  "⚡ AI Assistant: Active",
  "🔵 342 Students Online",
  "🗺️ Dijkstra Routing: Ready",
  "🏥 Medical Center: 24/7",
];

export function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [active, setActive]           = useState("Home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Main Navbar ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8"
        style={{
          background:     scrolled ? "rgba(2,4,8,0.92)" : "rgba(2,4,8,0.75)",
          borderBottom:   `1px solid ${scrolled ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.06)"}`,
          backdropFilter: "blur(28px)",
          transition:     "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))",
              border:     "1px solid rgba(0,212,255,0.35)",
            }}
          >
            <Compass className="w-4 h-4" style={{ color: "var(--cyan)" }} />
          </div>
          <div>
            <div
              className="text-sm font-bold gradient-text-cyan leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              RIMT Navigator
            </div>
            <div
              className="text-[9px] tracking-[2px] mt-0.5"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
            >
              SMART CAMPUS SYSTEM
            </div>
          </div>
        </div>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => setActive(link)}
              className="relative px-4 py-2 rounded-lg text-[13px] transition-all duration-200"
              style={{
                color:      active === link ? "var(--cyan)"   : "var(--text-2)",
                background: active === link ? "rgba(0,212,255,0.08)" : "transparent",
                fontFamily: "var(--font-body)",
                fontWeight: active === link ? 600 : 400,
              }}
            >
              {active === link && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:  "rgba(0,212,255,0.08)",
                    border:      "1px solid rgba(0,212,255,0.2)",
                    borderBottom:"2px solid var(--cyan)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link}</span>
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Live badge */}
          <span
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: "rgba(16,185,129,0.1)",
              border:     "1px solid rgba(16,185,129,0.3)",
              color:      "var(--green)",
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full inline-block animate-glow"
              style={{ background: "var(--green)" }}
            />
            LIVE
          </span>

          {/* AI button */}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 0 16px rgba(0,212,255,0.3)" }}
            whileTap={{ scale: 0.94 }}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{
              background: "rgba(0,212,255,0.08)",
              border:     "1px solid rgba(0,212,255,0.25)",
            }}
            title="AI Assistant"
          >
            <Bot className="w-4 h-4" style={{ color: "var(--cyan)" }} />
          </motion.button>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer select-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))",
              border:     "1.5px solid rgba(0,212,255,0.35)",
              color:      "var(--cyan)",
            }}
          >
            N
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: "var(--text-2)", background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* ── Mobile dropdown ── */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed top-[68px] left-0 right-0 z-40 overflow-hidden md:hidden"
        style={{
          background:   "rgba(6,13,24,0.97)",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            onClick={() => { setActive(link); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-6 py-4 text-sm text-left"
            style={{
              color:        active === link ? "var(--cyan)" : "var(--text-2)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              fontFamily:   "var(--font-body)",
              background:   active === link ? "rgba(0,212,255,0.05)" : "transparent",
            }}
          >
            {link}
          </button>
        ))}
      </motion.div>

      {/* ── Status Ticker ── */}
      <div
        className="fixed z-40 left-0 right-0 h-7 overflow-hidden flex items-center"
        style={{
          top:          "68px",
          background:   "rgba(0,212,255,0.03)",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
        }}
      >
        <div
          className="flex gap-14 whitespace-nowrap animate-ticker"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-[10px] tracking-[0.5px]"
              style={{ color: "rgba(0,212,255,0.55)" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}