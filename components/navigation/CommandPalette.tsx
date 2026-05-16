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
  Hash,
  Command,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
  Compass,
} from "lucide-react";
import { BUILDINGS } from "@/data/buildings";
import { Building } from "@/types/navigation";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  onSelectDestination: (name: string) => void;
  onSelectBuilding:    (b: Building) => void;
  onSetSource:         (name: string) => void;
  currentSource?:      string;
}

type ResultType = "building" | "route" | "recent" | "quick";

interface SearchResult {
  id:          string;
  label:       string;
  sublabel?:   string;
  icon:        string;
  type:        ResultType;
  color:       string;
  building?:   Building;
  score:       number;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: "qa-library",  label: "Central Library",         icon: "📚", color: "#10b981" },
  { id: "qa-canteen",  label: "Main Canteen",             icon: "🍽️", color: "#f59e0b" },
  { id: "qa-medical",  label: "Medical Center",           icon: "🏥", color: "#ef4444" },
  { id: "qa-admin",    label: "Admin Block",              icon: "🏢", color: "#3b82f6" },
  { id: "qa-sports",   label: "Sports Complex",           icon: "⚽", color: "#f97316" },
  { id: "qa-parking",  label: "Parking Zone",             icon: "🅿️", color: "#6b7280" },
  { id: "qa-workshop", label: "Workshop Block",           icon: "🔧", color: "#06b6d4" },
  { id: "qa-seminar",  label: "Seminar Hall",             icon: "🎓", color: "#8b5cf6" },
];

const CATEGORY_COLORS: Record<string, string> = {
  academic:  "#8b5cf6",
  admin:     "#3b82f6",
  hostel:    "#ec4899",
  emergency: "#ef4444",
  parking:   "#6b7280",
  cafeteria: "#f59e0b",
  facility:  "#10b981",
  sports:    "#f97316",
  entry:     "#00d4ff",
};

// ─────────────────────────────────────────────────────────────
// FUZZY SCORE
// ─────────────────────────────────────────────────────────────

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;

  // character-level fuzzy
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += 1;
      qi++;
    }
  }
  return qi === q.length ? Math.round((score / t.length) * 60) : 0;
}

// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE HOOK
// ─────────────────────────────────────────────────────────────

function useRecentSearches() {
  const KEY = "rimt-recent-searches";

  const get = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  };

  const add = useCallback((term: string) => {
    const prev  = get().filter((t) => t !== term);
    const next  = [term, ...prev].slice(0, 6);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  const remove = useCallback((term: string) => {
    const next = get().filter((t) => t !== term);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  return { get, add, remove };
}

// ─────────────────────────────────────────────────────────────
// TYPE TAG
// ─────────────────────────────────────────────────────────────

function TypeTag({ type }: { type: ResultType }) {
  const map: Record<ResultType, { label: string; color: string }> = {
    building: { label: "Building", color: "rgba(0,212,255,0.7)"   },
    route:    { label: "Route",    color: "rgba(139,92,246,0.7)"  },
    recent:   { label: "Recent",   color: "rgba(245,158,11,0.7)"  },
    quick:    { label: "Quick",    color: "rgba(16,185,129,0.7)"  },
  };
  const cfg = map[type];
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide flex-shrink-0"
      style={{
        background: `${cfg.color}18`,
        border:     `1px solid ${cfg.color}44`,
        color:       cfg.color,
        fontFamily: "var(--font-display)",
      }}
    >
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULT ROW
// ─────────────────────────────────────────────────────────────

interface ResultRowProps {
  result:       SearchResult;
  isActive:     boolean;
  onSelect:     () => void;
  onNavigate:   () => void;
  onMouseEnter: () => void;
}

function ResultRow({ result, isActive, onSelect, onNavigate, onMouseEnter }: ResultRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={onMouseEnter}
      className="relative flex items-center gap-3 px-4 py-3 cursor-pointer group"
      style={{
        background:   isActive ? "rgba(0,212,255,0.07)" : "transparent",
        borderLeft:   `2px solid ${isActive ? result.color : "transparent"}`,
        transition:   "all 0.15s ease",
      }}
      onClick={onSelect}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{
          background: isActive ? `${result.color}22` : `${result.color}12`,
          border:     `1px solid ${isActive ? `${result.color}55` : `${result.color}28`}`,
          boxShadow:  isActive ? `0 0 10px ${result.color}33` : "none",
          transition: "all 0.15s ease",
        }}
      >
        {result.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-medium truncate"
          style={{
            color:      isActive ? "var(--text-1)" : "var(--text-2)",
            fontFamily: "var(--font-body)",
          }}
        >
          {result.label}
        </div>
        {result.sublabel && (
          <div
            className="text-[11px] truncate mt-0.5"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            {result.sublabel}
          </div>
        )}
      </div>

      {/* Tag + action */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <TypeTag type={result.type} />
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => { e.stopPropagation(); onNavigate(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: "rgba(0,212,255,0.12)",
              border:     "1px solid rgba(0,212,255,0.3)",
              color:      "var(--cyan)",
              cursor:     "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <Navigation className="w-2.5 h-2.5" />
            Go
          </motion.button>
        )}
        {isActive && (
          <div
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ color: "var(--text-3)", background: "rgba(255,255,255,0.05)", fontFamily: "var(--font-body)" }}
          >
            ↵
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────

function SectionHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div
      className="flex items-center gap-2 px-4 pt-3 pb-1.5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(0,212,255,0.45)" }} />
      <span
        className="text-[9px] font-semibold tracking-[2px]"
        style={{ color: "rgba(240,244,255,0.3)", fontFamily: "var(--font-display)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function CommandPalette({
  onSelectDestination,
  onSelectBuilding,
  onSetSource,
  currentSource = "",
}: CommandPaletteProps) {
  const [open,        setOpen]        = useState(false);
  const [query,       setQuery]       = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode,        setMode]        = useState<"destination" | "source">("destination");

  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const recentStore = useRecentSearches();

  // ── Open/close ─────────────────────────────────────────────
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
    setMode("destination");
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Keyboard shortcut Cmd/Ctrl+K ───────────────────────────
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

  // ── Build results ───────────────────────────────────────────
  const results: SearchResult[] = useMemo(() => {
    const q = query.trim();

    if (!q) {
      // Show recents + quick actions when empty
      const recents = recentStore.get().map((term, i): SearchResult => {
        const b = BUILDINGS.find((b) => b.name === term);
        return {
          id:       `recent-${i}`,
          label:    term,
          sublabel: b ? `${b.floors}F · ${b.type}` : "Recent search",
          icon:     b?.icon ?? "🕐",
          type:     "recent",
          color:    b?.color ?? "#f59e0b",
          building: b,
          score:    100 - i,
        };
      });

      const quicks = QUICK_ACTIONS.map((qa, i): SearchResult => ({
        id:       qa.id,
        label:    qa.label,
        sublabel: "Quick destination",
        icon:     qa.icon,
        type:     "quick",
        color:    qa.color,
        building: BUILDINGS.find((b) => b.name === qa.label),
        score:    80 - i,
      }));

      return [...recents, ...quicks].slice(0, 10);
    }

    // Fuzzy search buildings
    const buildingResults = BUILDINGS
      .map((b): SearchResult => {
        const nameScore     = fuzzyScore(q, b.name);
        const typeScore     = fuzzyScore(q, b.type) * 0.5;
        const facilityScore = Math.max(
          0,
          ...b.facilities.map((f) => fuzzyScore(q, f) * 0.4)
        );
        const best = Math.max(nameScore, typeScore, facilityScore);
        return {
          id:       b.id,
          label:    b.name,
          sublabel: `${b.floors} floor${b.floors > 1 ? "s" : ""} · ${b.type} · ${b.facilities[0]}`,
          icon:     b.icon,
          type:     "building",
          color:    b.color,
          building: b,
          score:    best,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return buildingResults;
  }, [query]);

  // ── Keyboard navigation ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[activeIndex]) handleSelect(results[activeIndex]);
          break;
        case "Tab":
          e.preventDefault();
          if (results[activeIndex]) handleNavigate(results[activeIndex]);
          break;
        case "Escape":
          closePalette();
          break;
      }
    },
    [open, results, activeIndex, closePalette]
  );

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  // Reset active on query change
  useEffect(() => { setActiveIndex(0); }, [query]);

  // ── Actions ─────────────────────────────────────────────────
  const handleSelect = useCallback(
    (r: SearchResult) => {
      recentStore.add(r.label);
      if (r.building) onSelectBuilding(r.building);
      if (mode === "destination") {
        onSelectDestination(r.label);
      } else {
        onSetSource(r.label);
      }
      closePalette();
    },
    [mode, onSelectDestination, onSetSource, onSelectBuilding, closePalette, recentStore]
  );

  const handleNavigate = useCallback(
    (r: SearchResult) => {
      recentStore.add(r.label);
      onSelectDestination(r.label);
      if (r.building) onSelectBuilding(r.building);
      closePalette();
    },
    [onSelectDestination, onSelectBuilding, closePalette, recentStore]
  );

  const removeRecent = useCallback(
    (e: React.MouseEvent, label: string) => {
      e.stopPropagation();
      recentStore.remove(label);
      setQuery((q) => q); // force re-render
    },
    [recentStore]
  );

  // ── Group results by type ────────────────────────────────────
  const groups = useMemo(() => {
    if (query.trim()) {
      return [{ key: "results", label: "SEARCH RESULTS", icon: Search, items: results }];
    }
    const recents = results.filter((r) => r.type === "recent");
    const quicks  = results.filter((r) => r.type === "quick");
    const groups  = [];
    if (recents.length) groups.push({ key: "recents", label: "RECENT SEARCHES", icon: Clock, items: recents });
    if (quicks.length)  groups.push({ key: "quicks",  label: "QUICK NAVIGATE",  icon: Zap,   items: quicks  });
    return groups;
  }, [results, query]);

  // Flat ordered list for keyboard nav
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating trigger button ── */}
      <motion.button
        onClick={openPalette}
        whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(0,212,255,0.4)" }}
        whileTap={{ scale: 0.94 }}
        className="fixed z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
        style={{
          bottom:         88,
          right:          24,
          background:     "linear-gradient(135deg, rgba(0,212,255,0.14), rgba(139,92,246,0.08))",
          border:         "1px solid rgba(0,212,255,0.35)",
          backdropFilter: "blur(20px)",
          boxShadow:      "0 0 20px rgba(0,212,255,0.15), 0 4px 24px rgba(0,0,0,0.5)",
          color:          "var(--cyan)",
          cursor:         "pointer",
        }}
        title="Search campus (Ctrl+K)"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span
          className="text-[12px] font-semibold hidden sm:inline"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Search campus
        </span>
        <kbd
          className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
          style={{
            background: "rgba(255,255,255,0.07)",
            border:     "1px solid rgba(255,255,255,0.12)",
            color:      "rgba(240,244,255,0.5)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </motion.button>

      {/* ── Modal overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(2,4,8,0.75)", backdropFilter: "blur(4px)" }}
              onClick={closePalette}
            />

            {/* Panel */}
            <motion.div
              key="cp-panel"
              initial={{ opacity: 0, scale: 0.96, y: -24 }}
              animate={{ opacity: 1, scale: 1,    y: 0    }}
              exit={{ opacity: 0, scale: 0.96, y: -16     }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed z-50 left-1/2 overflow-hidden"
              style={{
                top:            "8vh",
                width:          "min(640px, calc(100vw - 32px))",
                transform:      "translateX(-50%)",
                background:     "linear-gradient(160deg, rgba(10,22,40,0.98), rgba(4,8,16,0.99))",
                border:         "1px solid rgba(0,212,255,0.22)",
                borderRadius:   24,
                boxShadow:
                  "0 0 0 1px rgba(0,212,255,0.08), " +
                  "0 32px 80px rgba(0,0,0,0.7), " +
                  "0 0 60px rgba(0,212,255,0.08), " +
                  "inset 0 0 40px rgba(0,212,255,0.02)",
                maxHeight:      "80vh",
                display:        "flex",
                flexDirection:  "column",
              }}
            >
              {/* ── Holographic top glow line ── */}
              <div
                style={{
                  position:         "absolute",
                  top:              0,
                  left:             "10%",
                  right:            "10%",
                  height:           1,
                  background:       "linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(139,92,246,0.4), transparent)",
                  pointerEvents:    "none",
                }}
              />

              {/* ── Header ── */}
              <div
                className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Animated search icon */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 6px rgba(0,212,255,0.3)",
                      "0 0 14px rgba(0,212,255,0.6)",
                      "0 0 6px rgba(0,212,255,0.3)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.12))",
                    border:     "1.5px solid rgba(0,212,255,0.4)",
                  }}
                >
                  <Compass className="w-4 h-4" style={{ color: "var(--cyan)" }} />
                </motion.div>

                {/* Mode selector */}
                <div
                  className="flex rounded-lg overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                >
                  {(["destination", "source"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className="px-3 py-1.5 text-[10px] font-semibold capitalize transition-all"
                      style={{
                        background: mode === m ? "rgba(0,212,255,0.12)" : "transparent",
                        color:      mode === m ? "var(--cyan)"           : "var(--text-3)",
                        border:     "none",
                        cursor:     "pointer",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {m === "destination" ? "TO" : "FROM"}
                    </button>
                  ))}
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
                  className="flex-1 bg-transparent outline-none text-[14px]"
                  style={{
                    color:       "var(--text-1)",
                    fontFamily:  "var(--font-body)",
                    caretColor:  "var(--cyan)",
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Clear / close */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => setQuery("")}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border:     "1px solid rgba(255,255,255,0.1)",
                        color:      "var(--text-3)",
                        cursor:     "pointer",
                      }}
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                  <button
                    onClick={closePalette}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border:     "1px solid rgba(255,255,255,0.08)",
                      color:      "var(--text-3)",
                      cursor:     "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <kbd style={{ fontFamily: "inherit" }}>ESC</kbd>
                  </button>
                </div>
              </div>

              {/* ── Current source indicator ── */}
              {currentSource && mode === "destination" && (
                <div
                  className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
                  style={{ background: "rgba(0,212,255,0.04)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}
                >
                  <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "var(--cyan)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    From:{" "}
                    <span style={{ color: "var(--cyan)", fontWeight: 500 }}>{currentSource}</span>
                  </span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
                  <span className="text-[11px] italic" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                    Select destination below
                  </span>
                </div>
              )}

              {/* ── Results list ── */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto no-scrollbar pb-2"
              >
                <AnimatePresence mode="popLayout">
                  {flat.length === 0 && query ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-14 gap-3"
                    >
                      <div className="text-3xl opacity-30">🔍</div>
                      <div style={{ color: "var(--text-3)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                        No buildings found for "{query}"
                      </div>
                    </motion.div>
                  ) : (
                    groups.map((group) => (
                      <div key={group.key}>
                        <SectionHeader label={group.label} icon={group.icon} />
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
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div
                className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
                style={{
                  borderTop:  "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                <div className="flex items-center gap-3">
                  {[
                    { keys: ["↑", "↓"],   label: "navigate"  },
                    { keys: ["↵"],         label: "select"    },
                    { keys: ["Tab"],       label: "go there"  },
                    { keys: ["Esc"],       label: "close"     },
                  ].map(({ keys, label }) => (
                    <div key={label} className="hidden sm:flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-1.5 py-0.5 rounded text-[9px]"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border:     "1px solid rgba(255,255,255,0.1)",
                              color:      "rgba(240,244,255,0.45)",
                              fontFamily: "var(--font-mono, monospace)",
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-glow" style={{ background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(16,185,129,0.7)", fontFamily: "var(--font-display)" }}>
                    {flat.length} result{flat.length !== 1 ? "s" : ""}
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