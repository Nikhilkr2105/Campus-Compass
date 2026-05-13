"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Building2, X, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { BUILDINGS } from "@/data/buildings";
import { Building, BuildingType } from "@/types/navigation";

type FormState = Omit<Building, "facilities"> & { facilities: string };

const EMPTY: FormState = {
  id: "", name: "", short: "", x: 300, y: 300,
  type: "academic", icon: "🏢", floors: 1,
  color: "#8b5cf6", description: "", facilities: "",
};

const TYPES: BuildingType[] = [
  "entry","academic","facility","hostel","admin","emergency","parking",
];

const TYPE_COLORS: Record<BuildingType, string> = {
  entry:     "#00d4ff",
  academic:  "#8b5cf6",
  facility:  "#10b981",
  hostel:    "#ec4899",
  admin:     "#3b82f6",
  emergency: "#ef4444",
  parking:   "#6b7280",
};

// ── Field wrapper ─────────────────────────────────────
function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold tracking-[1px] mb-1.5"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────
function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
      style={{
        background:  "rgba(255,255,255,0.04)",
        border:      "1px solid rgba(255,255,255,0.08)",
        color:       "var(--text-1)",
        fontFamily:  "var(--font-body)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)";
        e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(0,212,255,0.07)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow   = "none";
      }}
    />
  );
}

export function BuildingForm() {
  const [buildings, setBuildings] = useState<Building[]>(BUILDINGS);
  const [form,      setForm]      = useState<FormState>(EMPTY);
  const [editing,   setEditing]   = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saved,     setSaved]     = useState(false);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setForm({ ...EMPTY, id: `b-${Date.now()}` });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (b: Building) => {
    setForm({ ...b, facilities: b.facilities.join(", ") });
    setEditing(b.id);
    setShowForm(true);
  };

  const save = () => {
    const entry: Building = {
      ...form,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      color: TYPE_COLORS[form.type] ?? form.color,
    };
    setBuildings((prev) =>
      editing
        ? prev.map((b) => (b.id === editing ? entry : b))
        : [...prev, entry]
    );
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = (id: string) =>
    setBuildings((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="flex flex-col gap-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-[20px] font-bold gradient-text-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Buildings
          </h2>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            {buildings.length} buildings registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border:     "1px solid rgba(16,185,129,0.25)",
                  color:      "var(--green)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Check className="w-3 h-3" /> Saved
              </motion.div>
            )}
          </AnimatePresence>
          <NeonButton color="cyan" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openNew}>
            Add Building
          </NeonButton>
        </div>
      </div>

      {/* Form drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{ opacity: 0, y: -6     }}
            transition={{ duration: 0.25  }}
          >
            <GlassCard neon className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="text-[11px] font-semibold tracking-[1.5px]"
                  style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
                >
                  {editing ? "EDIT BUILDING" : "NEW BUILDING"}
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="BUILDING NAME">
                  <Input value={form.name} onChange={(v) => setField("name", v)} placeholder="e.g. Block A — CSE" />
                </Field>

                <Field label="SHORT NAME">
                  <Input value={form.short} onChange={(v) => setField("short", v)} placeholder="e.g. Block A" />
                </Field>

                <Field label="ICON (EMOJI)">
                  <Input value={form.icon} onChange={(v) => setField("icon", v)} placeholder="💻" />
                </Field>

                <Field label="TYPE">
                  <select
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value as BuildingType)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border:     "1px solid rgba(255,255,255,0.08)",
                      color:      "var(--text-1)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}
                        style={{ background: "var(--bg-2)", color: "var(--text-1)" }}
                      >
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="FLOORS">
                  <Input value={form.floors} onChange={(v) => setField("floors", Number(v))} type="number" placeholder="4" />
                </Field>

                <Field label="MAP X / Y (SVG coords)">
                  <div className="flex gap-2">
                    <Input value={form.x} onChange={(v) => setField("x", Number(v))} type="number" placeholder="X" />
                    <Input value={form.y} onChange={(v) => setField("y", Number(v))} type="number" placeholder="Y" />
                  </div>
                </Field>

                <Field label="DESCRIPTION">
                  <Input value={form.description} onChange={(v) => setField("description", v)} placeholder="Short description..." />
                </Field>

                <Field label="FACILITIES (comma-separated)">
                  <Input value={form.facilities} onChange={(v) => setField("facilities", v)} placeholder="Lab 1, Lab 2, HOD Office" />
                </Field>
              </div>

              <div className="flex gap-3 mt-5">
                <NeonButton color="cyan" size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={save}>
                  {editing ? "Update" : "Save Building"}
                </NeonButton>
                <NeonButton color="red" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buildings list */}
      <div className="flex flex-col gap-2.5">
        {buildings.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <GlassCard className="px-4 py-3 flex items-center gap-4">
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: `${b.color}15`,
                  border:     `1px solid ${b.color}30`,
                }}
              >
                {b.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-semibold truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.name}
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                >
                  {b.floors} floors · ({b.x}, {b.y}) · {b.facilities.length} facilities
                </div>
              </div>

              {/* Type badge */}
              <span
                className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                style={{
                  background: `${b.color}15`,
                  border:     `1px solid ${b.color}30`,
                  color:       b.color,
                  fontFamily: "var(--font-body)",
                }}
              >
                {b.type}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(b)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(0,212,255,0.07)",
                    border:     "1px solid rgba(0,212,255,0.18)",
                    color:      "var(--cyan)",
                    cursor:     "pointer",
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => remove(b.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border:     "1px solid rgba(239,68,68,0.18)",
                    color:      "var(--red)",
                    cursor:     "pointer",
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}