"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Navigation,
  BarChart3,
  AlertTriangle,
  Shield,
  Sparkles,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useCallback, useId } from "react";

/* ─────────────────────────────────────────
   MOTION SYSTEM
   Single source of truth for all animation
   values across the navbar.
───────────────────────────────────────── */
const MOTION = {
  ease: [0.16, 1, 0.3, 1] as const,
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  shell: { duration: 0.32 },
  mount: { duration: 0.55 },
  menu: { duration: 0.22 },
  pill: { type: "spring" as const, stiffness: 420, damping: 34 },
  hover: { duration: 0.18 },
  tap: { duration: 0.1 },
} as const;

/* ─────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────── */
const NAV_LINKS = [
  {
    label: "Features",
    href: "#features",
    sectionId: "features",
    icon: Sparkles,
    accent: "#6b4fcf",
    homeOnly: true,
  },
  {
    label: "Home",
    href: "/",
    sectionId: null,
    icon: Home,           // FIX: was Navigation (duplicate)
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
   SHARED FOCUS RING STYLE
   Visible, on-brand, keyboard-only via
   :focus-visible (CSS handles show/hide).
───────────────────────────────────────── */
const focusRingStyle: React.CSSProperties = {
  outline: "none",
};

const FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-[#3882f6] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Stable unique ID for aria-controls
  const mobileNavId = useId();

  const isHome = pathname === "/";
  const frosted = isHome ? scrolled : true;

  /* ── Scroll + section detection ── */
  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 36);
        const el = document.getElementById("features");
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setActiveSection(
          rect.top <= 136 && rect.bottom > 136 ? "features" : null
        );
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  /* ── Close mobile on route change ── */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* ── Focus trap: return focus to hamburger on close ── */
  useEffect(() => {
    if (!mobileOpen) return;

    // Trap focus inside mobile menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        // Return focus to hamburger button
        document.getElementById("navbar-hamburger")?.focus();
      }

      if (e.key !== "Tab") return;

      const menu = document.getElementById(mobileNavId);
      if (!menu) return;

      const focusable = menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, mobileNavId]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      setActiveSection(sectionId);
      closeMobile();
    },
    [prefersReducedMotion, closeMobile]
  );

  /* ── Visual tokens ── */
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

  /* ── Active state helper ── */
  const isItemActive = useCallback(
    (item: NavLink) => {
      if (item.sectionId) return activeSection === item.sectionId;
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    },
    [activeSection, pathname]
  );

  const visibleLinks = NAV_LINKS.filter((l) => isHome || !l.homeOnly);

  /* ─────────────────────────────────────────
     NAV ITEM RENDERER
  ───────────────────────────────────────── */
  const renderNavItem = (item: NavLink, mobile = false) => {
    const active = isItemActive(item);
    const Icon = item.icon;

    const pillVariants = {
      hidden: { opacity: 0, scale: 0.92 },
      visible: { opacity: 1, scale: 1 },
    };

    const innerContent = (
      <>
        {/* Active background pill */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId={mobile ? "mobile-nav-active" : "top-nav-active"}
              variants={prefersReducedMotion ? undefined : pillVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={MOTION.pill}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: mobile ? 0 : 2,
                borderRadius: mobile ? 14 : 999,
                // FIX: animate these as motion values so they don't snap
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
        </AnimatePresence>

        {/* Icon badge */}
        <span
          aria-hidden="true"
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
            transition: "background 0.2s ease, color 0.2s ease",
            flexShrink: 0,
          }}
        >
          <Icon size={mobile ? 15 : 13} strokeWidth={2} />
        </span>

        {/* Label */}
        <span style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
      </>
    );

    const sharedMotionProps = {
      whileHover: prefersReducedMotion
        ? {}
        : { y: mobile ? 0 : -1, transition: { duration: MOTION.hover.duration } },
      whileTap: prefersReducedMotion
        ? {}
        : { scale: 0.97, transition: { duration: MOTION.tap.duration } },
    };

    const sharedStyle: React.CSSProperties = {
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
      transition: "color 0.2s ease",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent",
    };

    if (item.sectionId) {
      return (
        <motion.button
          key={item.label}
          type="button"
          onClick={() => scrollToSection(item.sectionId!)}
          aria-current={active ? "true" : undefined}   // FIX: "true" not "location"
          className={FOCUS_RING_CLASS}
          style={{
            ...sharedStyle,
            appearance: "none",
            background: "transparent",
            border: "none",
            textAlign: "left",
            width: mobile ? "100%" : "auto",
            ...focusRingStyle,
          }}
          {...sharedMotionProps}
        >
          {innerContent}
        </motion.button>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={closeMobile}
        aria-current={active ? "page" : undefined}
        className={FOCUS_RING_CLASS}
        style={{
          display: mobile ? "block" : "inline-flex",
          width: mobile ? "100%" : "auto",
          textDecoration: "none",
          borderRadius: mobile ? 14 : 999,
          ...focusRingStyle,
        }}
      >
        <motion.span
          style={{ ...sharedStyle, display: "flex" }}
          {...sharedMotionProps}
        >
          {innerContent}
        </motion.span>
      </Link>
    );
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <motion.header
      role="banner"
      initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.mount.duration, ease: MOTION.ease }}
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
          // FIX: backdropFilter now in animate={} so Framer interpolates it
          backdropFilter: frosted
            ? "blur(26px) saturate(1.2)"
            : "blur(14px) saturate(1.05)",
          WebkitBackdropFilter: frosted
            ? "blur(26px) saturate(1.2)"
            : "blur(14px) saturate(1.05)",
        }}
        transition={{ duration: MOTION.shell.duration, ease: MOTION.ease }}
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
          pointerEvents: "auto",
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          onClick={closeMobile}
          aria-label="RIMT Navigator — go to homepage"   // FIX: descriptive label
          className={FOCUS_RING_CLASS}
          style={{ textDecoration: "none", borderRadius: 18, ...focusRingStyle }}
        >
          <motion.div
            whileHover={prefersReducedMotion ? {} : { y: -1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
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
                flexShrink: 0,
              }}
            >
              <Navigation size={16} color="white" strokeWidth={2} aria-hidden="true" />
            </div>
            <div aria-hidden="true">   {/* aria-label on Link covers this */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: ink,
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.2,
                  transition: "color 0.25s ease",
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
                  transition: "color 0.25s ease",
                }}
              >
                Smart Campus
              </div>
            </div>
          </motion.div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav
          aria-label="Main navigation"   // FIX: label added
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
            transition: "background 0.32s ease, border-color 0.32s ease",
          }}
        >
          {visibleLinks.map((item) => renderNavItem(item))}
        </nav>

        {/* ── Right: CTA + hamburger ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/navigator"
            onClick={closeMobile}
            aria-label="Open Navigator app"
            className={`hidden sm:inline-flex ${FOCUS_RING_CLASS}`}
            style={{ textDecoration: "none", borderRadius: 14, ...focusRingStyle }}
          >
            <motion.div
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: 1.03,
                      y: -1,
                      boxShadow:
                        "0 12px 34px rgba(56,130,246,0.4), 0 2px 8px rgba(56,130,246,0.22)",
                    }
              }
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
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
              <Navigation size={14} strokeWidth={2} aria-hidden="true" />
              Open Navigator
              <ArrowRight size={13} strokeWidth={2.2} aria-hidden="true" />
            </motion.div>
          </Link>

          {/* FIX: 44px min, id for focus-return, aria-controls */}
          <motion.button
            id="navbar-hamburger"
            type="button"
            className={`lg:hidden ${FOCUS_RING_CLASS}`}
            whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileNavId}   // FIX: aria-controls added
            style={{
              width: 44,          // FIX: 40→44 (Apple HIG)
              height: 44,
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
              transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
              ...focusRingStyle,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={prefersReducedMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.18, ease: MOTION.easeOut }}
                  style={{ display: "flex" }}
                >
                  <X size={18} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={prefersReducedMotion ? false : { opacity: 0, rotate: 45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: -45, scale: 0.7 }}
                  transition={{ duration: 0.18, ease: MOTION.easeOut }}
                  style={{ display: "flex" }}
                >
                  <Menu size={18} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* FIX: backdrop overlay — contains menu visually */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.menu.duration }}
              onClick={closeMobile}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                background: "rgba(13,26,46,0.22)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            />

            <motion.div
              id={mobileNavId}
              role="dialog"                    // FIX: modal role
              aria-modal="true"                // FIX: aria-modal
              aria-label="Navigation menu"     // FIX: dialog label
              className="lg:hidden"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: MOTION.menu.duration, ease: MOTION.ease }}
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
              {/* FIX: nav label */}
              <nav aria-label="Mobile navigation" style={{ display: "grid", gap: 4, marginBottom: 8 }}>
                {visibleLinks.map((item) => renderNavItem(item, true))}
              </nav>

              <Link
                href="/navigator"
                onClick={closeMobile}
                aria-label="Open Navigator app"
                className={FOCUS_RING_CLASS}
                style={{ textDecoration: "none", display: "block", borderRadius: 16, ...focusRingStyle }}
              >
                {/* FIX: whileTap + whileHover consistent with desktop */}
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
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
                    cursor: "pointer",
                  }}
                >
                  <Navigation size={15} strokeWidth={2} aria-hidden="true" />
                  Open Navigator
                  <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
                </motion.div>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}