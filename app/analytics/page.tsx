"use client";

import { motion } from "framer-motion";
import { KPICards, TopLocations, PopularRoutes } from "@/components/navigation/AnalyticsCards";
import { TrafficChart, BuildingSparklines } from "@/components/navigation/TrafficChart";

export default function AnalyticsPage() {
  return (
    <div
      className="min-h-screen bg-grid"
      style={{
        background: "var(--bg-1)",
        paddingTop: "95px",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 py-8">

        {/* ── Page header ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold"
              style={{
                background: "rgba(0,212,255,0.08)",
                border:     "1px solid rgba(0,212,255,0.2)",
                color:      "var(--cyan)",
                fontFamily: "var(--font-display)",
              }}
            >
              <span
                className="w-[5px] h-[5px] rounded-full animate-glow inline-block"
                style={{ background: "var(--cyan)" }}
              />
              LIVE DATA
            </span>
          </div>

          <h1
            className="gradient-text-cyan text-[clamp(24px,3.5vw,36px)] font-bold mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Analytics Dashboard
          </h1>
          <p
            className="text-[14px]"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            Real-time navigation insights across RIMT University campus
          </p>
        </motion.div>

        {/* ── KPI row ── */}
        <div className="mb-5">
          <KPICards />
        </div>

        {/* ── Traffic chart + Sparklines ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2">
            <TrafficChart />
          </div>
          <div>
            <BuildingSparklines />
          </div>
        </div>

        {/* ── Locations + Routes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopLocations />
          <PopularRoutes />
        </div>

        {/* ── Bottom status strip ── */}
        <motion.div
          className="mt-5 flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: "rgba(0,212,255,0.03)",
            border:     "1px solid rgba(0,212,255,0.1)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-6">
            {[
              { label: "Data source", value: "RIMT Nav System" },
              { label: "Refresh",     value: "Every 30s"       },
              { label: "Period",      value: "Last 7 days"     },
            ].map((s) => (
              <div key={s.label} className="hidden sm:block">
                <span
                  className="text-[10px]"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  {s.label}:{" "}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-[5px] h-[5px] rounded-full animate-glow"
              style={{ background: "var(--green)", display: "inline-block" }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--green)", fontFamily: "var(--font-body)" }}
            >
              Live
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}