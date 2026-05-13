"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin } from "lucide-react";

interface SmartSearchProps {
  value:        string;
  onChange:     (v: string) => void;
  suggestions:  string[];
  placeholder?: string;
  icon?:        React.ReactNode;
}

export function SmartSearch({
  value,
  onChange,
  suggestions,
  placeholder = "Search...",
  icon,
}: SmartSearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.length > 0
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : suggestions.slice(0, 5);

  const showDrop = focused && filtered.length > 0;

  return (
    <div className="relative">
      {/* Input row */}
      <div
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-300"
        style={{
          background:  focused ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)",
          border:      `1px solid ${focused ? "rgba(0,212,255,0.45)" : "rgba(255,255,255,0.09)"}`,
          boxShadow:   focused ? "0 0 0 3px rgba(0,212,255,0.07)" : "none",
        }}
      >
        {icon ?? (
          <Search
            className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200"
            style={{ color: focused ? "var(--cyan)" : "var(--text-3)" }}
          />
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[13px] leading-none"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              className="flex-shrink-0"
              style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: -6, scale: 0.98    }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background:    "rgba(6,13,24,0.98)",
              border:        "1px solid rgba(0,212,255,0.2)",
              backdropFilter:"blur(24px)",
              boxShadow:     "0 16px 40px rgba(0,0,0,0.5)",
            }}
          >
            {filtered.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onMouseDown={() => onChange(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors duration-150"
                style={{
                  color:        "var(--text-1)",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  fontFamily:   "var(--font-body)",
                  background:   "transparent",
                  border:       "none",
                  cursor:       "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "var(--cyan)" }} />
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}