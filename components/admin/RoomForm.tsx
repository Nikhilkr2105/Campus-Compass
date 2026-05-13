"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, DoorOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { BUILDINGS } from "@/data/buildings";
import { RoomType, ROOM_COLORS } from "@/data/floors";

interface AdminRoom {
  id:         string;
  buildingId: string;
  floor:      number;
  name:       string;
  number:     string;
  type:       RoomType;
  capacity:   number;
}

const SEED_ROOMS: AdminRoom[] = [
  { id: "r1",  buildingId: "block-a", floor: 1, name: "CSE Lab 1",      number: "101", type: "lab",       capacity: 40 },
  { id: "r2",  buildingId: "block-a", floor: 1, name: "CSE Lab 2",      number: "102", type: "lab",       capacity: 40 },
  { id: "r3",  buildingId: "block-a", floor: 2, name: "AI/ML Lab",      number: "201", type: "lab",       capacity: 30 },
  { id: "r4",  buildingId: "block-a", floor: 3, name: "HOD CSE Office", number: "301", type: "office",    capacity: 5  },
  { id: "r5",  buildingId: "block-b", floor: 1, name: "ECE Lab",        number: "101", type: "lab",       capacity: 35 },
  { id: "r6",  buildingId: "block-b", floor: 2, name: "PCB Lab",        number: "201", type: "lab",       capacity: 25 },
  { id: "r7",  buildingId: "library", floor: 1, name: "Reading Hall",   number: "G01", type: "hall",      capacity: 200},
  { id: "r8",  buildingId: "library", floor: 2, name: "Digital Library",number: "201", type: "lab",       capacity: 60 },
  { id: "r9",  buildingId: "seminar", floor: 1, name: "Main Seminar Hall", number: "G01", type: "hall",   capacity: 500},
];

const ROOM_TYPES: RoomType[] = [
  "lab","classroom","office","hall","staircase","lift","washroom","corridor","entrance",
];

const EMPTY: AdminRoom = {
  id: "", buildingId: "block-a", floor: 1,
  name: "", number: "", type: "lab", capacity: 30,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
        background: "rgba(255,255,255,0.04)",
        border:     "1px solid rgba(255,255,255,0.08)",
        color:      "var(--text-1)",
        fontFamily: "var(--font-body)",
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

function StyledSelect({
  value, onChange, children,
}: {
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border:     "1px solid rgba(255,255,255,0.08)",
        color:      "var(--text-1)",
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </select>
  );
}

export function RoomForm() {
  const [rooms,    setRooms]    = useState<AdminRoom[]>(SEED_ROOMS);
  const [form,     setForm]     = useState<AdminRoom>(EMPTY);
  const [editing,  setEditing]  = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [filter,   setFilter]   = useState<string>("all");

  const setField = <K extends keyof AdminRoom>(k: K, v: AdminRoom[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setForm({ ...EMPTY, id: `rm-${Date.now()}` });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (r: AdminRoom) => {
    setForm(r);
    setEditing(r.id);
    setShowForm(true);
  };

  const save = () => {
    setRooms((prev) =>
      editing
        ? prev.map((r) => (r.id === editing ? form : r))
        : [...prev, form]
    );
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = (id: string) =>
    setRooms((prev) => prev.filter((r) => r.id !== id));

  const filtered = filter === "all"
    ? rooms
    : rooms.filter((r) => r.buildingId === filter);

  // Max floor for selected building
  const maxFloor = BUILDINGS.find((b) => b.id === form.buildingId)?.floors ?? 5;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2
            className="text-[20px] font-bold gradient-text-cyan"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Rooms & Labs
          </h2>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            {rooms.length} rooms registered across all buildings
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
            Add Room
          </NeonButton>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: "all", name: "All Buildings" }, ...BUILDINGS.slice(0, 6)].map((b) => (
          <button
            key={b.id}
            onClick={() => setFilter(b.id)}
            className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
            style={{
              background: filter === b.id ? "rgba(0,212,255,0.1)"  : "rgba(255,255,255,0.03)",
              border:     `1px solid ${filter === b.id ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.07)"}`,
              color:      filter === b.id ? "var(--cyan)" : "var(--text-3)",
              cursor:     "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            {"name" in b ? b.name : "All Buildings"}
          </button>
        ))}
      </div>

      {/* Form */}
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
                  {editing ? "EDIT ROOM" : "NEW ROOM"}
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="ROOM NAME">
                  <Input value={form.name} onChange={(v) => setField("name", v)} placeholder="e.g. CSE Lab 3" />
                </Field>

                <Field label="ROOM NUMBER">
                  <Input value={form.number} onChange={(v) => setField("number", v)} placeholder="e.g. 201" />
                </Field>

                <Field label="BUILDING">
                  <StyledSelect
                    value={form.buildingId}
                    onChange={(v) => setField("buildingId", v)}
                  >
                    {BUILDINGS.map((b) => (
                      <option key={b.id} value={b.id}
                        style={{ background: "var(--bg-2)", color: "var(--text-1)" }}
                      >
                        {b.name}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>

                <Field label="FLOOR">
                  <StyledSelect
                    value={form.floor}
                    onChange={(v) => setField("floor", Number(v))}
                  >
                    {Array.from({ length: maxFloor }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}
                        style={{ background: "var(--bg-2)", color: "var(--text-1)" }}
                      >
                        Floor {f}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>

                <Field label="ROOM TYPE">
                  <StyledSelect
                    value={form.type}
                    onChange={(v) => setField("type", v as RoomType)}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}
                        style={{ background: "var(--bg-2)", color: "var(--text-1)" }}
                      >
                        {t}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>

                <Field label="CAPACITY">
                  <Input value={form.capacity} onChange={(v) => setField("capacity", Number(v))} type="number" placeholder="40" />
                </Field>
              </div>

              <div className="flex gap-3 mt-5">
                <NeonButton color="cyan" size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={save}>
                  {editing ? "Update" : "Save Room"}
                </NeonButton>
                <NeonButton color="red" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms table */}
      <GlassCard neon className="overflow-hidden">
        {/* Table head */}
        <div
          className="grid px-4 py-2.5"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
            borderBottom:        "1px solid rgba(255,255,255,0.06)",
            background:          "rgba(255,255,255,0.02)",
          }}
        >
          {["Room Name", "Building", "Floor", "Type", ""].map((h) => (
            <div
              key={h}
              className="text-[10px] font-semibold tracking-[1px]"
              style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div
            className="px-4 py-8 text-center text-[13px]"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
          >
            No rooms found
          </div>
        )}
        {filtered.map((r, i) => {
          const building = BUILDINGS.find((b) => b.id === r.buildingId);
          const typeColor = ROOM_COLORS[r.type] ?? "var(--text-3)";
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="grid px-4 py-3 items-center"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                borderBottom:        i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${typeColor}18`, border: `1px solid ${typeColor}33` }}
                >
                  <DoorOpen className="w-3 h-3" style={{ color: typeColor }} />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[12px] font-medium truncate"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {r.name}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                  >
                    #{r.number} · {r.capacity} seats
                  </div>
                </div>
              </div>

              {/* Building */}
              <div
                className="text-[12px] truncate"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                {building?.short ?? r.buildingId}
              </div>

              {/* Floor */}
              <div
                className="text-[12px]"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                Floor {r.floor}
              </div>

              {/* Type */}
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-medium inline-block w-fit"
                style={{
                  background: `${typeColor}15`,
                  border:     `1px solid ${typeColor}30`,
                  color:       typeColor,
                  fontFamily: "var(--font-body)",
                }}
              >
                {r.type}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 justify-end">
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(r)}
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(0,212,255,0.07)",
                    border:     "1px solid rgba(0,212,255,0.18)",
                    color:      "var(--cyan)",
                    cursor:     "pointer",
                  }}
                >
                  <Pencil className="w-2.5 h-2.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => remove(r.id)}
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border:     "1px solid rgba(239,68,68,0.18)",
                    color:      "var(--red)",
                    cursor:     "pointer",
                  }}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </GlassCard>
    </div>
  );
}