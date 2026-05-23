"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navigation,
  BarChart3,
  AlertTriangle,
  Shield,
  Sparkles,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────
   EASING
───────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────
   NAV LINKS
   Matches all routes in the application.
   "Features" is home-page section scroll only.
───────────────────────────────────────── */
const NAV_LINKS = [
  {
    label: "Features",
    href: "#features",
    sectionId: "features",
    icon: Sparkles,
    accent: "#6b4fcf",
    homeOnly: true, // only rendered when on "/"
  },
  {
    label: "Home",
    href: "/",
    sectionId: null,
    icon: Navigation,
    accent: "#3882f6",
    homeOnly: false,
  },
  {
    label: "Navigate",
    href: "/navigator",
    sectionId: null,
    icon: Navigation,
    accent: "#3882f6",
    homeOnly: false,
  },
  {
    label: "Analytics",
    href: "/analytics",
    sectionId: null,
    icon: BarChart3,
    accent: "#c9922a",
    homeOnly: false,
  },
  {
    label: "Emergency",
    href: "/emergency",
    sectionId: null,
    icon: AlertTriangle,
    accent: "#d94040",
    homeOnly: false,
  },
  {
    label: "Admin",
    href: "/admin",
    sectionId: null,
    icon: Shield,
    accent: "#0d9e6e",
    homeOnly: false,
  },
] as const;

type NavLink = (typeof NAV_LINKS)[number];

/* ─────────────────────────────────────────
   NAVBAR
   - On "/":  transparent over hero, frosted on scroll
   - Elsewhere: always frosted (scrolled = true)
───────────────────────────────────────── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";

  // On internal pages we always show the frosted state
  const frosted = isHome ? scrolled : true;

  useEffect(() => {
    if (!isHome) {
      setScrolled(true); // internal pages: always frosted
      return;
    }

    let frame = 0;
    const updateNavState = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 36);

        const featuresEl = document.getElementById("features");
        if (!featuresEl) return;
        const marker = 136;
        const rect = featuresEl.getBoundingClientRect();
        setActiveSection(
          rect.top <= marker && rect.bottom > marker ? "features" : null
        );
      });
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateNavState);
      window.removeEventListener("resize", updateNavState);
    };
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  const scrollToSection = (sectionId: string) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
    closeMobile();
  };

  // Visual tokens that switch between transparent (hero) and frosted
  const shellBackground = frosted
    ? "rgba(255,255,255,0.84)"
    : "rgba(255,255,255,0.08)";
  const shellBorder = frosted
    ? "rgba(13,26,46,0.1)"
    : "rgba(255,255,255,0.18)";
  const shellShadow = frosted
    ? "0 18px 48px rgba(13,26,46,0.14), 0 1px 0 rgba(255,255,255,0.7) inset"
    : "0 12px 36px rgba(13,26,46,0.12), 0 1px 0 rgba(255,255,255,0.16) inset";
  const ink = frosted ? "var(--navy)" : "rgba(255,255,255,0.94)";
  const mutedInk = frosted ? "var(--text-2)" : "rgba(255,255,255,0.68)";

  const isItemActive = (item: NavLink) => {
    if (item.sectionId) return activeSection === item.sectionId;
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  };

  // Filter: on home page show all links; on internal pages hide homeOnly links
  const visibleLinks = NAV_LINKS.filter((l) => isHome || !l.homeOnly);

  const renderNavItem = (item: NavLink, mobile = false) => {
    const active = isItemActive(item);
    const Icon = item.icon;

    const content = (
      <motion.div
        whileHover={{ y: mobile ? 0 : -1 }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: mobile ? "flex-start" : "center",
          gap: mobile ? 10 : 7,
          width: mobile ? "100%" : "auto",
          minHeight: mobile ? 44 : 34,
          padding: mobile ? "10px 12px" : "8px 12px",
          borderRadius: mobile ? 14 : 999,
          color: active ? ink : mutedInk,
          fontFamily: "var(--font-sans)",
          fontSize: mobile ? 14 : 13,
          fontWeight: active ? 700 : 600,
          lineHeight: 1,
          transition: "color 0.25s ease",
        }}
      >
        {active && (
          <motion.span
            layoutId={mobile ? "mobile-nav-active" : "top-nav-active"}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            style={{
              position: "absolute",
              inset: mobile ? 0 : 2,
              borderRadius: mobile ? 14 : 999,
              background: frosted
                ? "rgba(56,130,246,0.1)"
                : "rgba(255,255,255,0.15)",
              border: frosted
                ? `1px solid ${item.accent}24`
                : "1px solid rgba(255,255,255,0.16)",
              boxShadow: frosted
                ? `0 8px 22px ${item.accent}14`
                : "0 8px 24px rgba(255,255,255,0.06)",
            }}
          />
        )}

        <span
          style={{
            position: "relative",
            zIndex: 1,
            width: mobile ? 28 : 20,
            height: mobile ? 28 : 20,
            borderRadius: mobile ? 9 : 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: active ? `${item.accent}16` : "transparent",
            color: active ? item.accent : "currentColor",
          }}
        >
          <Icon size={mobile ? 15 : 13} strokeWidth={2} />
        </span>
        <span style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
      </motion.div>
    );

    // Section scroll links (home page only)
    if (item.sectionId) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => scrollToSection(item.sectionId!)}
          aria-current={active ? "location" : undefined}
          style={{
            appearance: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            width: mobile ? "100%" : "auto",
            textAlign: "left",
          }}
        >
          {content}
        </button>
      );
    }

    // Route links
    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={closeMobile}
        aria-current={active ? "page" : undefined}
        style={{
          display: mobile ? "block" : "inline-flex",
          width: mobile ? "100%" : "auto",
          textDecoration: "none",
        }}
      >
        {content}
      </Link>
    );
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: EASE }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 20px",
        pointerEvents: "none",
      }}
    >
      {/* ── MAIN BAR ── */}
      <motion.div
        animate={{
          backgroundColor: shellBackground,
          borderColor: shellBorder,
          boxShadow: shellShadow,
        }}
        transition={{ duration: 0.32, ease: EASE }}
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          marginTop: 14,
          padding: "10px 12px",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          border: "1px solid",
          backdropFilter: frosted
            ? "blur(26px) saturate(1.2)"
            : "blur(14px) saturate(1.05)",
          WebkitBackdropFilter: frosted
            ? "blur(26px) saturate(1.2)"
            : "blur(14px) saturate(1.05)",
          pointerEvents: "auto",
          transition: "backdrop-filter 0.32s ease",
        }}
      >
        {/* Logo */}
        <Link href="/" onClick={closeMobile} style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 8px 4px 4px",
              borderRadius: 18,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 22px rgba(56,130,246,0.34)",
              }}
            >
              <Navigation size={16} color="white" strokeWidth={2} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: ink,
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.2,
                  transition: "color 0.3s ease",
                }}
              >
                RIMT Navigator
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: mutedInk,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.2px",
                  lineHeight: 1,
                  transition: "color 0.3s ease",
                }}
              >
                Smart Campus
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex"
          style={{
            alignItems: "center",
            gap: 2,
            padding: 4,
            borderRadius: 999,
            background: frosted
              ? "rgba(13,26,46,0.035)"
              : "rgba(255,255,255,0.08)",
            border: frosted
              ? "1px solid rgba(13,26,46,0.06)"
              : "1px solid rgba(255,255,255,0.11)",
            transition: "background 0.3s ease, border-color 0.3s ease",
          }}
        >
          {visibleLinks.map((item) => renderNavItem(item))}
        </nav>

        {/* Right: CTA + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/navigator"
            onClick={closeMobile}
            className="hidden sm:inline-flex"
            style={{ textDecoration: "none" }}
          >
            <motion.div
              whileHover={{
                scale: 1.03,
                y: -1,
                boxShadow:
                  "0 12px 34px rgba(56,130,246,0.4), 0 2px 8px rgba(56,130,246,0.22)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 40,
                padding: "10px 16px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow:
                  "0 8px 24px rgba(56,130,246,0.34), 0 2px 8px rgba(13,26,46,0.14)",
                fontFamily: "var(--font-sans)",
                whiteSpace: "nowrap",
              }}
            >
              <Navigation size={14} strokeWidth={2} />
              Open Navigator
              <ArrowRight size={13} strokeWidth={2.2} />
            </motion.div>
          </Link>

          <motion.button
            type="button"
            className="lg:hidden"
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: frosted
                ? "rgba(13,26,46,0.045)"
                : "rgba(255,255,255,0.1)",
              border: frosted
                ? "1px solid rgba(13,26,46,0.08)"
                : "1px solid rgba(255,255,255,0.16)",
              color: ink,
              cursor: "pointer",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>
      </motion.div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{
              maxWidth: 1160,
              margin: "8px auto 0",
              padding: 8,
              borderRadius: 22,
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(13,26,46,0.08)",
              boxShadow: "0 22px 60px rgba(13,26,46,0.18)",
              backdropFilter: "blur(26px) saturate(1.2)",
              WebkitBackdropFilter: "blur(26px) saturate(1.2)",
              pointerEvents: "auto",
            }}
          >
            <nav style={{ display: "grid", gap: 4, marginBottom: 8 }}>
              {visibleLinks.map((item) => renderNavItem(item, true))}
            </nav>

            <Link
              href="/navigator"
              onClick={closeMobile}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  minHeight: 46,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #3882f6, #1a4fa8)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: "0 10px 26px rgba(56,130,246,0.32)",
                }}
              >
                <Navigation size={15} strokeWidth={2} />
                Open Navigator
                <ArrowRight size={14} strokeWidth={2.2} />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}