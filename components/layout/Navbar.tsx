"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Menu, X, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home",      href: "/",          section: "hero"     },
  { label: "Navigate",  href: "/navigator", section: null       },
  { label: "Analytics", href: "/analytics", section: null       },
  { label: "Emergency", href: "/emergency", section: null       },
  { label: "Admin",     href: "/admin",     section: null       },
];

const TICKER_ITEMS = [
  "🟢 Navigation System: ONLINE",
  "📍 22 Buildings Mapped",
  "⚡ AI Assistant: Active",
  "🔵 342 Students Online",
  "🗺️ Dijkstra Routing: Ready",
  "🏥 Medical Center: 24/7",
];

const CHAT_TOGGLE_EVENT = "rimt-ai-chat:toggle";
const CHAT_STATE_EVENT = "rimt-ai-chat:state";

export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen,   setChatOpen]   = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleChatState = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      setChatOpen(Boolean(detail?.open));
    };

    window.addEventListener(CHAT_STATE_EVENT, handleChatState);
    return () => window.removeEventListener(CHAT_STATE_EVENT, handleChatState);
  }, []);

  const handleNavClick = useCallback((href: string, section: string | null) => {
    if (href === "/" && section && pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
    setMobileOpen(false);
  }, [pathname, router]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleChatToggle = useCallback(() => {
    window.dispatchEvent(new Event(CHAT_TOGGLE_EVENT));
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8"
        style={{
          background:     scrolled ? "rgba(2,4,8,0.95)" : "rgba(2,4,8,0.80)",
          borderBottom:   `1px solid ${scrolled ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.06)"}`,
          backdropFilter: "blur(28px)",
          transition:     "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/", "hero")}
          className="flex items-center gap-3"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(0,212,255,0.35)" }}
          >
            <Compass className="w-4 h-4" style={{ color: "var(--cyan)" }} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold gradient-text-cyan leading-none" style={{ fontFamily: "var(--font-display)" }}>
              RIMT Navigator
            </div>
            <div className="text-[9px] tracking-[2px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>
              SMART CAMPUS SYSTEM
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ label, href, section }) => {
            const active = isActive(href);
            return (
              <button
                key={href}
                onClick={() => handleNavClick(href, section)}
                className="relative px-4 py-2 rounded-lg text-[13px] transition-all duration-200"
                style={{
                  color:        active ? "var(--cyan)"          : "var(--text-2)",
                  background:   active ? "rgba(0,212,255,0.08)" : "transparent",
                  fontFamily:   "var(--font-body)",
                  fontWeight:   active ? 600 : 400,
                  borderBottom: `2px solid ${active ? "var(--cyan)" : "transparent"}`,
                  border:       "none",
                  cursor:       "pointer",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          <span
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)" }}
          >
            <span className="w-[5px] h-[5px] rounded-full inline-block animate-glow" style={{ background: "var(--green)" }} />
            LIVE
          </span>

          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 0 16px rgba(0,212,255,0.3)" }}
            whileTap={{ scale: 0.94 }}
            onClick={handleChatToggle}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer"
            style={{
              background: chatOpen ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.08)",
              border:     `1px solid ${chatOpen ? "rgba(0,212,255,0.45)" : "rgba(0,212,255,0.25)"}`,
            }}
            title="AI Assistant"
          >
            <Bot className="w-4 h-4" style={{ color: "var(--cyan)" }} />
          </motion.button>

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer select-none"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))", border: "1.5px solid rgba(0,212,255,0.35)", color: "var(--cyan)" }}
            title="Profile"
          >
            N
          </div>

          <button
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[68px] left-0 right-0 z-40 md:hidden"
            style={{ background: "rgba(6,13,24,0.98)", borderBottom: "1px solid rgba(0,212,255,0.1)", backdropFilter: "blur(20px)" }}
          >
            {NAV_LINKS.map(({ label, href, section }) => (
              <button
                key={href}
                onClick={() => handleNavClick(href, section)}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm text-left transition-colors"
                style={{
                  color:        isActive(href) ? "var(--cyan)" : "var(--text-2)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontFamily:   "var(--font-body)",
                  background:   isActive(href) ? "rgba(0,212,255,0.05)" : "transparent",
                  border:       "none",
                  cursor:       "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticker */}
      <div
        className="fixed z-40 left-0 right-0 h-7 overflow-hidden flex items-center"
        style={{ top: "68px", background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}
      >
        <div className="flex gap-14 whitespace-nowrap animate-ticker" style={{ fontFamily: "var(--font-display)" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-[10px] tracking-[0.5px]" style={{ color: "rgba(0,212,255,0.55)" }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
