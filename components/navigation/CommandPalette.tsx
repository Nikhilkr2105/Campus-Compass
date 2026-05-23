"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  X,
  Navigation,
  Clock,
  Zap,
  MapPin,
  ArrowRight,
  Command,
  Compass,
} from "lucide-react";

import { BUILDINGS } from "@/data/buildings";
import { Building } from "@/types/navigation";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  onSelectDestination: (name: string) => void;
  onSelectBuilding: (b: Building) => void;
  onSetSource: (name: string) => void;
  currentSource?: string;
}

type ResultType = "building" | "route" | "recent" | "quick";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  type: ResultType;
  color: string;
  building?: Building;
  score: number;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: "qa-library",  label: "Central Library", icon: "📚", color: "#0ea5e9" },
  { id: "qa-canteen",  label: "Main Canteen",     icon: "🍽️", color: "#f59e0b" },
  { id: "qa-medical",  label: "Medical Center",   icon: "🏥", color: "#ef4444" },
  { id: "qa-admin",    label: "Admin Block",      icon: "🏢", color: "#6366f1" },
  { id: "qa-sports",   label: "Sports Complex",   icon: "⚽", color: "#10b981" },
  { id: "qa-parking",  label: "Parking Zone",     icon: "🅿️", color: "#64748b" },
];

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;
  let qi = 0, score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 1; qi++; }
  }
  return qi === q.length ? Math.round((score / t.length) * 60) : 0;
}

// ─────────────────────────────────────────────────────────────
// RECENTS
// ─────────────────────────────────────────────────────────────

function useRecentSearches() {
  const KEY = "rimt-recent-searches";
  const get = (): string[] => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  };
  const add = useCallback((term: string) => {
    const prev = get().filter((t) => t !== term);
    const next = [term, ...prev].slice(0, 6);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);
  return { get, add };
}

// ─────────────────────────────────────────────────────────────
// TYPE TAG  — premium glass pill
// ─────────────────────────────────────────────────────────────

function TypeTag({ type }: { type: ResultType }) {
  const map: Record<ResultType, { label: string; bg: string; text: string; border: string }> = {
    building: { label: "Building", bg: "rgba(14,165,233,0.08)",  text: "#0369a1", border: "rgba(14,165,233,0.2)"  },
    route:    { label: "Route",    bg: "rgba(99,102,241,0.08)",  text: "#4338ca", border: "rgba(99,102,241,0.2)"  },
    recent:   { label: "Recent",   bg: "rgba(245,158,11,0.08)",  text: "#b45309", border: "rgba(245,158,11,0.2)"  },
    quick:    { label: "Quick",    bg: "rgba(16,185,129,0.08)",  text: "#047857", border: "rgba(16,185,129,0.2)"  },
  };
  const cfg = map[type];
  return (
    <span
      className="text-[9px] px-2 py-0.5 rounded-full font-semibold tracking-wide flex-shrink-0"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
        letterSpacing: "0.06em",
      }}
    >
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULT ROW  — premium card with lift hover
// ─────────────────────────────────────────────────────────────

interface ResultRowProps {
  result: SearchResult;
  isActive: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onMouseEnter: () => void;
}

function ResultRow({ result, isActive, onSelect, onNavigate, onMouseEnter }: ResultRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -1 }}
      onMouseEnter={onMouseEnter}
      onClick={onSelect}
      className="relative flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-xl cursor-pointer"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(14,165,233,0.07) 0%, rgba(99,102,241,0.04) 100%)"
          : "transparent",
        border: `1px solid ${isActive ? "rgba(14,165,233,0.18)" : "transparent"}`,
        boxShadow: isActive
          ? "0 2px 12px rgba(14,165,233,0.08), 0 1px 3px rgba(0,0,0,0.04)"
          : "none",
        transition: "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {/* Left accent bar */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 2.5,
            borderRadius: 99,
            background: "linear-gradient(180deg, #38bdf8, #6366f1)",
          }}
        />
      )}

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{
          background: isActive
            ? `${result.color}14`
            : "rgba(241,245,249,0.8)",
          border: `1px solid ${isActive ? `${result.color}30` : "rgba(226,232,240,0.9)"}`,
          transition: "all 0.18s ease",
        }}
      >
        {result.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-medium truncate"
          style={{
            color: isActive ? "#0f172a" : "#334155",
            fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
          }}
        >
          {result.label}
        </div>
        {result.sublabel && (
          <div
            className="text-[11px] truncate mt-0.5"
            style={{
              color: "#94a3b8",
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            }}
          >
            {result.sublabel}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <TypeTag type={result.type} />
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); onNavigate(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.25)",
              color: "#0284c7",
              cursor: "pointer",
              fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
            }}
          >
            <Navigation className="w-2.5 h-2.5" />
            Go
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION HEADER  — refined label
// ─────────────────────────────────────────────────────────────

function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div
      className="flex items-center gap-2 px-5 pt-3 pb-1.5"
      style={{ borderTop: "1px solid rgba(226,232,240,0.7)" }}
    >
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "#94a3b8" }} />
      <span
        className="text-[9px] font-semibold tracking-[2px]"
        style={{
          color: "#94a3b8",
          fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export function CommandPalette({
  onSelectDestination,
  onSelectBuilding,
  onSetSource,
  currentSource = "",
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<"destination" | "source">("destination");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recentStore = useRecentSearches();

  const openPalette = useCallback(() => {
    setOpen(true); setQuery(""); setActiveIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false); setQuery(""); setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (e.key === "Escape" && open) closePalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openPalette, closePalette]);

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim();
    if (!q) {
      const recents = recentStore.get().map((term, i): SearchResult => {
        const b = BUILDINGS.find((b) => b.name === term);
        return {
          id: `recent-${i}`, label: term,
          sublabel: b ? `${b.floors}F · ${b.type}` : "Recent search",
          icon: b?.icon ?? "🕐", type: "recent",
          color: b?.color ?? "#f59e0b", building: b, score: 100 - i,
        };
      });
      const quicks = QUICK_ACTIONS.map((qa, i): SearchResult => ({
        id: qa.id, label: qa.label, sublabel: "Quick destination",
        icon: qa.icon, type: "quick", color: qa.color,
        building: BUILDINGS.find((b) => b.name === qa.label),
        score: 80 - i,
      }));
      return [...recents, ...quicks].slice(0, 10);
    }
    return BUILDINGS.map((b): SearchResult => {
      const nameScore = fuzzyScore(q, b.name);
      const typeScore = fuzzyScore(q, b.type) * 0.5;
      const facilityScore = Math.max(0, ...b.facilities.map((f) => fuzzyScore(q, f) * 0.4));
      const best = Math.max(nameScore, typeScore, facilityScore);
      return {
        id: b.id, label: b.name,
        sublabel: `${b.floors} floor${b.floors > 1 ? "s" : ""} · ${b.type}`,
        icon: b.icon, type: "building", color: b.color, building: b, score: best,
      };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
  }, [query, recentStore]);

  const groups = useMemo(() => {
    if (query.trim()) {
      return [{ key: "results", label: "SEARCH RESULTS", icon: Search, items: results }];
    }
    const recents = results.filter((r) => r.type === "recent");
    const quicks = results.filter((r) => r.type === "quick");
    const out = [];
    if (recents.length) out.push({ key: "recents", label: "RECENT SEARCHES", icon: Clock, items: recents });
    if (quicks.length) out.push({ key: "quicks", label: "QUICK NAVIGATE", icon: Zap, items: quicks });
    return out;
  }, [results, query]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); break;
      case "ArrowUp":   e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); break;
      case "Enter":     e.preventDefault(); if (results[activeIndex]) handleSelect(results[activeIndex]); break;
      case "Escape":    closePalette(); break;
    }
  }, [open, results, activeIndex]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [activeIndex]);

  const handleSelect = useCallback((r: SearchResult) => {
    recentStore.add(r.label);
    if (r.building) onSelectBuilding(r.building);
    if (mode === "destination") onSelectDestination(r.label);
    else onSetSource(r.label);
    closePalette();
  }, [mode, onSelectDestination, onSetSource, onSelectBuilding]);

  const handleNavigate = useCallback((r: SearchResult) => {
    recentStore.add(r.label);
    onSelectDestination(r.label);
    if (r.building) onSelectBuilding(r.building);
    closePalette();
  }, [onSelectDestination, onSelectBuilding]);

  return (
    <>
      {/* ── Floating trigger ── */}
      <div className="fixed z-40" style={{ bottom: 140, right: 100 }}>
        <motion.button
          onClick={openPalette}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(14,165,233,0.18), 0 2px 8px rgba(0,0,0,0.08)" }}
          whileTap={{ scale: 0.96 }}
          className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(226,232,240,0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
            color: "#0284c7",
            cursor: "pointer",
          }}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span
            className="text-[12px] font-semibold hidden sm:inline"
            style={{ color: "#334155", fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Search campus
          </span>
          <kbd
            className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
            style={{
              background: "rgba(241,245,249,0.9)",
              border: "1px solid rgba(203,213,225,0.8)",
              color: "#94a3b8",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </motion.button>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50"
              style={{
                background: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              onClick={closePalette}
            />

            {/* Panel */}
            <motion.div
              key="cp-panel"
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ type: "spring", stiffness: 480, damping: 38, mass: 0.75 }}
              className="fixed z-50 left-1/2 overflow-hidden"
              style={{
                top: "clamp(5vh, 8vh, 64px)",
                width: "min(640px, calc(100vw - 24px))",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(203,213,225,0.7)",
                borderRadius: 20,
                boxShadow:
                  "0 0 0 1px rgba(14,165,233,0.06), " +
                  "0 32px 80px rgba(15,23,42,0.18), " +
                  "0 8px 24px rgba(15,23,42,0.08), " +
                  "inset 0 1px 0 rgba(255,255,255,1)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                maxHeight: "clamp(60vh, 80vh, 700px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Subtle top shimmer — replaces neon glow line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "15%",
                  right: "15%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(14,165,233,0.35), rgba(99,102,241,0.2), transparent)",
                  pointerEvents: "none",
                  borderRadius: 99,
                }}
              />

              {/* ── Header ── */}
              <div
                className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(226,232,240,0.8)", position: "relative" }}
              >
                {/* Compass badge — static, no pulsing */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.08))",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <Compass className="w-4 h-4" style={{ color: "#0284c7" }} />
                </div>

                {/* Input */}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === "destination"
                      ? "Where do you want to go?"
                      : "Set your starting point..."
                  }
                  className="flex-1 bg-transparent outline-none text-[15px]"
                  style={{
                    color: "#0f172a",
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    caretColor: "#0284c7",
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      onClick={() => setQuery("")}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(241,245,249,0.9)",
                        border: "1px solid rgba(203,213,225,0.8)",
                        color: "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* ── Current Source banner ── */}
              {currentSource && mode === "destination" && (
                <div
                  className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
                  style={{
                    background: "rgba(14,165,233,0.04)",
                    borderBottom: "1px solid rgba(14,165,233,0.1)",
                  }}
                >
                  <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#0284c7" }} />
                  <span
                    className="text-[11px]"
                    style={{ color: "#64748b", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
                  >
                    From:{" "}
                    <span style={{ color: "#0284c7", fontWeight: 600 }}>{currentSource}</span>
                  </span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(14,165,233,0.4)" }} />
                </div>
              )}

              {/* ── Results ── */}
              <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar pb-2">
                <AnimatePresence mode="popLayout">
                  {flat.length === 0 && query ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center py-14 gap-3"
                    >
                      <div className="text-3xl opacity-25">🔍</div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: 13,
                          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        }}
                      >
                        No buildings found for &ldquo;{query}&rdquo;
                      </div>
                    </motion.div>
                  ) : (
                    groups.map((group) => (
                      <div key={group.key}>
                        <SectionHeader label={group.label} icon={group.icon} />
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { transition: { staggerChildren: 0.03 } },
                          }}
                        >
                          {group.items.map((r) => {
                            const flatIndex = flat.findIndex((f) => f.id === r.id);
                            return (
                              <ResultRow
                                key={r.id}
                                result={r}
                                isActive={flatIndex === activeIndex}
                                onMouseEnter={() => setActiveIndex(flatIndex)}
                                onSelect={() => handleSelect(r)}
                                onNavigate={() => handleNavigate(r)}
                              />
                            );
                          })}
                        </motion.div>
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer hint ── */}
              <div
                className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
                style={{
                  borderTop: "1px solid rgba(226,232,240,0.8)",
                  background: "rgba(248,250,252,0.8)",
                }}
              >
                <div className="flex items-center gap-3">
                  {[
                    { keys: ["↑", "↓"], label: "navigate" },
                    { keys: ["↵"],      label: "select"   },
                    { keys: ["esc"],     label: "close"    },
                  ].map(({ keys, label }) => (
                    <span key={label} className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
                          style={{
                            background: "rgba(255,255,255,0.9)",
                            border: "1px solid rgba(203,213,225,0.9)",
                            color: "#64748b",
                            fontFamily: "var(--font-mono, monospace)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                      <span
                        className="text-[10px]"
                        style={{ color: "#94a3b8", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
                      >
                        {label}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <kbd
                    className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold flex items-center gap-0.5"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(203,213,225,0.9)",
                      color: "#64748b",
                      fontFamily: "var(--font-mono, monospace)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                  <span
                    className="text-[10px]"
                    style={{ color: "#94a3b8", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
                  >
                    open
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}