"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Map } from "lucide-react";
import {
  BuildingCategory,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  BUILDINGS,
} from "@/data/buildings";

const CATEGORIES: BuildingCategory[] = [
  "academic",
  "admin",
  "hostel",
  "emergency",
  "parking",
  "cafeteria",
  "facility",
  "sports",
];

interface MapLegendProps {
  activeFilter: BuildingCategory | "all";
  onFilterChange: (cat: BuildingCategory | "all") => void;
}

export function MapLegend({ activeFilter, onFilterChange }: MapLegendProps) {
  const [open, setOpen] = useState(true);

  const countByCategory = (cat: BuildingCategory) =>
    BUILDINGS.filter((b) => b.type === cat).length;

  return (
    <div
      className="absolute bottom-5 left-5 z-20"
      style={{ minWidth: 200 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:     "rgba(6,13,24,0.95)",
          border:         "1px solid rgba(0,212,255,0.18)",
          backdropFilter: "blur(20px)",
          boxShadow:      "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{
            background: "none",
            border:     "none",
            cursor:     "pointer",
            borderBottom: open ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <Map className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
            <span
              className="text-[11px] font-semibold tracking-[1.5px]"
              style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
            >
              MAP LEGEND
            </span>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.div>
        </button>

        {/* Items */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-3 py-2 flex flex-col gap-0.5">
                {/* All filter */}
                <button
                  onClick={() => onFilterChange("all")}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-all"
                  style={{
                    background:
                      activeFilter === "all"
                        ? "rgba(0,212,255,0.1)"
                        : "transparent",
                    border: `1px solid ${activeFilter === "all" ? "rgba(0,212,255,0.25)" : "transparent"}`,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, #00d4ff, #8b5cf6)",
                      }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        color:
                          activeFilter === "all"
                            ? "var(--text-1)"
                            : "var(--text-2)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      All Buildings
                    </span>
                  </div>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    {BUILDINGS.length}
                  </span>
                </button>

                {CATEGORIES.map((cat) => {
                  const color  = CATEGORY_COLORS[cat];
                  const label  = CATEGORY_LABELS[cat];
                  const count  = countByCategory(cat);
                  const active = activeFilter === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => onFilterChange(active ? "all" : cat)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg w-full transition-all"
                      style={{
                        background: active ? `${color}15` : "transparent",
                        border:     `1px solid ${active ? `${color}35` : "transparent"}`,
                        cursor:     "pointer",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background: color,
                            boxShadow:  active ? `0 0 6px ${color}` : "none",
                          }}
                        />
                        <span
                          className="text-[11px]"
                          style={{
                            color:      active ? "var(--text-1)" : "var(--text-2)",
                            fontFamily: "var(--font-body)",
                            fontWeight: active ? 500 : 400,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: active ? color : "var(--text-3)", fontFamily: "var(--font-body)" }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}