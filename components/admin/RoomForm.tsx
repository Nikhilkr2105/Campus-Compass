"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, DoorOpen, Users, Hash } from "lucide-react";
import { BUILDINGS } from "@/data/buildings";
import { RoomType, ROOM_COLORS } from "@/data/floors";
import {
  FormField, FormInput, FormSelect,
  SectionLabel, PageHeader, AdminCard, IconButton, StatusBadge,
} from "@/components/admin/ui/FormField";

/* ══════════════════════════════════════════════════════════
   TYPES + SEED DATA
══════════════════════════════════════════════════════════ */

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
  { id: "r1",  buildingId: "block-a", floor: 1, name: "CSE Lab 1",        number: "101", type: "lab",       capacity: 40  },
  { id: "r2",  buildingId: "block-a", floor: 1, name: "CSE Lab 2",        number: "102", type: "lab",       capacity: 40  },
  { id: "r3",  buildingId: "block-a", floor: 2, name: "AI/ML Lab",        number: "201", type: "lab",       capacity: 30  },
  { id: "r4",  buildingId: "block-a", floor: 3, name: "HOD CSE Office",   number: "301", type: "office",    capacity: 5   },
  { id: "r5",  buildingId: "block-b", floor: 1, name: "ECE Lab",          number: "101", type: "lab",       capacity: 35  },
  { id: "r6",  buildingId: "block-b", floor: 2, name: "PCB Lab",          number: "201", type: "lab",       capacity: 25  },
  { id: "r7",  buildingId: "library", floor: 1, name: "Reading Hall",     number: "G01", type: "hall",      capacity: 200 },
  { id: "r8",  buildingId: "library", floor: 2, name: "Digital Library",  number: "201", type: "lab",       capacity: 60  },
  { id: "r9",  buildingId: "seminar", floor: 1, name: "Main Seminar Hall",number: "G01", type: "hall",      capacity: 500 },
];

const ROOM_TYPES: RoomType[] = [
  "lab","classroom","office","hall","staircase","lift","washroom","corridor","entrance",
];

const ROOM_TYPE_LABELS: Partial<Record<RoomType, string>> = {
  lab:       "Laboratory",
  classroom: "Classroom",
  office:    "Office",
  hall:      "Hall",
};

const EMPTY: AdminRoom = {
  id: "", buildingId: "block-a", floor: 1,
  name: "", number: "", type: "lab", capacity: 30,
};

/* ══════════════════════════════════════════════════════════
   PRIMARY BUTTON (local — matches BuildingForm)
══════════════════════════════════════════════════════════ */

function PrimaryButton({
  onClick, children, icon, variant = "primary", size = "md",
}: {
  onClick:  () => void;
  children: React.ReactNode;
  icon?:    React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?:    "sm" | "md";
}) {
  const styles = {
    primary: { bg: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#ffffff", border: "none",            shadow: "0 2px 8px rgba(14,165,233,0.3)" },
    ghost:   { bg: "#f8fafc",                                  color: "#64748b", border: "1px solid #e2e8f0", shadow: "none"                          },
    danger:  { bg: "#fef2f2",                                  color: "#ef4444", border: "1px solid #fecaca", shadow: "none"                          },
  }[variant];
  const p = size === "sm" ? "px-3 py-2" : "px-4 py-2.5";
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ opacity: 0.9 }}
      className={`inline-flex items-center gap-2 ${p} rounded-lg text-[13px] font-medium`}
      style={{ background: styles.bg, color: styles.color, border: styles.border, boxShadow: styles.shadow, cursor: "pointer" }}
    >
      {icon}{children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOM FORM PANEL
══════════════════════════════════════════════════════════ */

function RoomFormPanel({
  form, editing, onClose, onSave, setField,
}: {
  form:     AdminRoom;
  editing:  string | null;
  onClose:  () => void;
  onSave:   () => void;
  setField: <K extends keyof AdminRoom>(k: K, v: AdminRoom[K]) => void;
}) {
  const maxFloor = BUILDINGS.find((b) => b.id === form.buildingId)?.floors ?? 5;
  const typeColor = ROOM_COLORS[form.type] ?? "#0ea5e9";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -6             }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminCard className="overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${typeColor}15`, border: `1px solid ${typeColor}30` }}
            >
              <DoorOpen className="w-4 h-4" style={{ color: typeColor }} />
            </div>
            <div>
              <div className="text-[14px] font-semibold" style={{ color: "#0f172a" }}>
                {editing ? "Edit Room" : "Add New Room"}
              </div>
              <div className="text-[11px]" style={{ color: "#94a3b8" }}>
                {editing ? "Update room details and assignment" : "Register a room in a campus building"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
          >
            <X className="w-4 h-4" style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Identity */}
          <SectionLabel>Room Identity</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <FormField label="Room Name" required hint="Descriptive name shown to students">
              <FormInput
                value={form.name}
                onChange={(v) => setField("name", v)}
                placeholder="e.g. CSE Lab 3"
              />
            </FormField>
            <FormField label="Room Number" hint="Door / corridor number">
              <FormInput
                value={form.number}
                onChange={(v) => setField("number", v)}
                placeholder="e.g. 201"
                prefix={<Hash className="w-3.5 h-3.5" />}
              />
            </FormField>
          </div>

          {/* Location */}
          <SectionLabel>Location</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <FormField label="Building" required>
              <FormSelect
                value={form.buildingId}
                onChange={(v) => setField("buildingId", v)}
              >
                {BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Floor" hint={`This building has ${maxFloor} floor(s)`}>
              <FormSelect
                value={form.floor}
                onChange={(v) => setField("floor", Number(v))}
              >
                {Array.from({ length: maxFloor }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>Floor {f}</option>
                ))}
              </FormSelect>
            </FormField>
          </div>

          {/* Configuration */}
          <SectionLabel>Configuration</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Room Type" required>
              <FormSelect
                value={form.type}
                onChange={(v) => setField("type", v as RoomType)}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ROOM_TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Seating Capacity" hint="Maximum occupancy">
              <FormInput
                value={form.capacity}
                onChange={(v) => setField("capacity", Number(v))}
                type="number"
                placeholder="40"
                prefix={<Users className="w-3.5 h-3.5" />}
                suffix={<span className="text-[11px]">seats</span>}
              />
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: "1px solid #f1f5f9", background: "#fafafa" }}
        >
          <div className="text-[11px]" style={{ color: "#94a3b8" }}>
            Fields marked <span style={{ color: "#0ea5e9" }}>*</span> are required
          </div>
          <div className="flex items-center gap-2.5">
            <PrimaryButton variant="ghost" size="sm" onClick={onClose}>Cancel</PrimaryButton>
            <PrimaryButton size="sm" onClick={onSave} icon={<Check className="w-3.5 h-3.5" />}>
              {editing ? "Update Room" : "Save Room"}
            </PrimaryButton>
          </div>
        </div>
      </AdminCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   FILTER PILL
══════════════════════════════════════════════════════════ */

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150"
      style={{
        background: active ? "#0ea5e9"  : "#f8fafc",
        color:      active ? "#ffffff"  : "#64748b",
        border:     active ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
        cursor:     "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */

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
    setTimeout(() => setSaved(false), 2500);
  };

  const remove = (id: string) =>
    setRooms((prev) => prev.filter((r) => r.id !== id));

  const filtered = filter === "all"
    ? rooms
    : rooms.filter((r) => r.buildingId === filter);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <PageHeader
        title="Rooms & Labs"
        subtitle={`${rooms.length} rooms registered across all buildings`}
        badge={
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.9 }}
              >
                <StatusBadge variant="success">
                  <Check className="w-2.5 h-2.5" />
                  Saved successfully
                </StatusBadge>
              </motion.div>
            )}
          </AnimatePresence>
        }
        actions={
          <PrimaryButton onClick={openNew} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Room
          </PrimaryButton>
        }
      />

      {/* ── Filters ── */}
      <div className="flex gap-2 flex-wrap">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All Buildings
        </FilterPill>
        {BUILDINGS.slice(0, 6).map((b) => (
          <FilterPill key={b.id} active={filter === b.id} onClick={() => setFilter(b.id)}>
            {b.shortName}
          </FilterPill>
        ))}
      </div>

      {/* ── Form panel ── */}
      <AnimatePresence>
        {showForm && (
          <RoomFormPanel
            form={form}
            editing={editing}
            onClose={() => setShowForm(false)}
            onSave={save}
            setField={setField}
          />
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <AdminCard className="overflow-hidden">
        {/* Table head */}
        <div
          className="grid px-4 py-3"
          style={{
            gridTemplateColumns: "2fr 1fr 80px 1fr 88px",
            borderBottom:        "1px solid #f1f5f9",
            background:          "#fafafa",
          }}
        >
          {["Room", "Building", "Floor", "Type", ""].map((h) => (
            <div
              key={h}
              className="text-[11px] font-semibold tracking-[0.5px]"
              style={{ color: "#94a3b8" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
            >
              <DoorOpen className="w-5 h-5" style={{ color: "#0ea5e9" }} />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-medium" style={{ color: "#0f172a" }}>No rooms found</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
                {filter === "all"
                  ? "Add your first room to get started"
                  : "No rooms in this building yet"}
              </div>
            </div>
          </div>
        )}

        {/* Rows */}
        {filtered.map((r, i) => {
          const building   = BUILDINGS.find((b) => b.id === r.buildingId);
          const typeColor  = ROOM_COLORS[r.type] ?? "#94a3b8";
          const typeLabel  = ROOM_TYPE_LABELS[r.type] ?? r.type;

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="grid px-4 py-3 items-center transition-colors duration-100"
              style={{
                gridTemplateColumns: "2fr 1fr 80px 1fr 88px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${typeColor}12`, border: `1px solid ${typeColor}25` }}
                >
                  <DoorOpen className="w-3.5 h-3.5" style={{ color: typeColor }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium truncate" style={{ color: "#0f172a" }}>
                    {r.name}
                  </div>
                  <div className="text-[11px]" style={{ color: "#94a3b8" }}>
                    #{r.number} · {r.capacity} seats
                  </div>
                </div>
              </div>

              {/* Building */}
              <div className="text-[12px] truncate" style={{ color: "#475569" }}>
                {building?.shortName ?? r.buildingId}
              </div>

              {/* Floor */}
              <div className="text-[12px]" style={{ color: "#475569" }}>
                Floor {r.floor}
              </div>

              {/* Type */}
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium w-fit"
                style={{
                  background: `${typeColor}10`,
                  border:     `1px solid ${typeColor}25`,
                  color:       typeColor,
                }}
              >
                {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 justify-end">
                <IconButton onClick={() => openEdit(r)} variant="primary" title="Edit room">
                  <Pencil className="w-3 h-3" />
                </IconButton>
                <IconButton onClick={() => remove(r.id)} variant="danger" title="Delete room">
                  <Trash2 className="w-3 h-3" />
                </IconButton>
              </div>
            </motion.div>
          );
        })}
      </AdminCard>
    </div>
  );
}