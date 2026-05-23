"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Building2, X, Check, MapPin, Layers } from "lucide-react";
import { BUILDINGS, Building, BuildingCategory } from "@/data/buildings";
import {
  FormField, FormInput, FormSelect, FormTextarea,
  SectionLabel, PageHeader, AdminCard, IconButton, StatusBadge,
} from "@/components/admin/ui/FormField";

/* ══════════════════════════════════════════════════════════
   TYPES + CONSTANTS
══════════════════════════════════════════════════════════ */

type FormState = Omit<Building, "facilities"> & { facilities: string };

const EMPTY: FormState = {
  id: "", name: "", shortName: "", x: 300, y: 300,
  type: "academic", icon: "🏢", floors: 1,
  color: "#0ea5e9", description: "", facilities: "",
};

const TYPES: BuildingCategory[] = [
  "academic","admin","hostel","emergency","parking","cafeteria","facility","sports",
];

const TYPE_META: Record<BuildingCategory, { color: string; label: string }> = {
  academic:  { color: "#6366f1", label: "Academic"  },
  admin:     { color: "#0ea5e9", label: "Admin"     },
  facility:  { color: "#10b981", label: "Facility"  },
  hostel:    { color: "#ec4899", label: "Hostel"    },
  emergency: { color: "#ef4444", label: "Emergency" },
  parking:   { color: "#64748b", label: "Parking"   },
  cafeteria: { color: "#f59e0b", label: "Cafeteria" },
  sports:    { color: "#f97316", label: "Sports"    },
};

/* ══════════════════════════════════════════════════════════
   PRIMARY BUTTON
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
    primary: {
      bg:     "linear-gradient(135deg, #0ea5e9, #0284c7)",
      color:  "#ffffff",
      border: "none",
      shadow: "0 2px 8px rgba(14,165,233,0.3)",
    },
    ghost: {
      bg:     "#f8fafc",
      color:  "#64748b",
      border: "1px solid #e2e8f0",
      shadow: "none",
    },
    danger: {
      bg:     "#fef2f2",
      color:  "#ef4444",
      border: "1px solid #fecaca",
      shadow: "none",
    },
  }[variant];

  const padding = size === "sm" ? "px-3 py-2" : "px-4 py-2.5";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 ${padding} rounded-lg text-[13px] font-medium transition-opacity`}
      style={{
        background: styles.bg,
        color:      styles.color,
        border:     styles.border,
        boxShadow:  styles.shadow,
        cursor:     "pointer",
      }}
      whileHover={{ opacity: 0.92 }}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════
   BUILDING FORM PANEL
══════════════════════════════════════════════════════════ */

function BuildingFormPanel({
  form,
  editing,
  onClose,
  onSave,
  setField,
}: {
  form:     FormState;
  editing:  string | null;
  onClose:  () => void;
  onSave:   () => void;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const typeColor = TYPE_META[form.type]?.color ?? "#0ea5e9";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -6             }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminCard className="overflow-hidden">
        {/* Form header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{
                background: `${typeColor}15`,
                border:     `1px solid ${typeColor}30`,
              }}
            >
              {form.icon || "🏢"}
            </div>
            <div>
              <div className="text-[14px] font-semibold" style={{ color: "#0f172a" }}>
                {editing ? "Edit Building" : "Add New Building"}
              </div>
              <div className="text-[11px]" style={{ color: "#94a3b8" }}>
                {editing ? "Update existing building details" : "Register a new campus building"}
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

        {/* Form body */}
        <div className="p-5">
          {/* Section: Identity */}
          <SectionLabel>Identity</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <FormField label="Building Name" required hint="Full official name">
              <FormInput
                value={form.name}
                onChange={(v) => setField("name", v)}
                placeholder="e.g. Block A — Computer Science"
              />
            </FormField>
            <FormField label="Short Name" hint="Shown on map labels">
              <FormInput
                value={form.shortName}
                onChange={(v) => setField("shortName", v)}
                placeholder="e.g. Block A"
              />
            </FormField>
            <FormField label="Icon" hint="Emoji representing building">
              <FormInput
                value={form.icon}
                onChange={(v) => setField("icon", v)}
                placeholder="💻"
              />
            </FormField>
          </div>

          {/* Section: Classification */}
          <SectionLabel>Classification</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <FormField label="Building Type" required>
              <FormSelect
                value={form.type}
                onChange={(v) => setField("type", v as BuildingCategory)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Number of Floors" hint="Total floors including ground">
              <FormInput
                value={form.floors}
                onChange={(v) => setField("floors", Number(v))}
                type="number"
                placeholder="4"
                prefix={<Layers className="w-3.5 h-3.5" />}
              />
            </FormField>
          </div>

          {/* Section: Map Position */}
          <SectionLabel>Map Position</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <FormField label="X Coordinate" hint="Horizontal position on SVG map">
              <FormInput
                value={form.x}
                onChange={(v) => setField("x", Number(v))}
                type="number"
                placeholder="300"
                prefix={<MapPin className="w-3.5 h-3.5" />}
                suffix={<span className="text-[11px]">px</span>}
              />
            </FormField>
            <FormField label="Y Coordinate" hint="Vertical position on SVG map">
              <FormInput
                value={form.y}
                onChange={(v) => setField("y", Number(v))}
                type="number"
                placeholder="300"
                prefix={<MapPin className="w-3.5 h-3.5" />}
                suffix={<span className="text-[11px]">px</span>}
              />
            </FormField>
          </div>

          {/* Section: Details */}
          <SectionLabel>Details</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Description" hint="Brief summary for students">
              <FormTextarea
                value={form.description}
                onChange={(v) => setField("description", v)}
                placeholder="Describe what this building houses..."
                rows={2}
              />
            </FormField>
            <FormField label="Facilities" hint="Comma-separated list">
              <FormTextarea
                value={form.facilities}
                onChange={(v) => setField("facilities", v)}
                placeholder="Lab 1, Lab 2, HOD Office, Server Room"
                rows={2}
              />
            </FormField>
          </div>
        </div>

        {/* Form footer */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: "1px solid #f1f5f9", background: "#fafafa" }}
        >
          <div className="text-[11px]" style={{ color: "#94a3b8" }}>
            Fields marked <span style={{ color: "#0ea5e9" }}>*</span> are required
          </div>
          <div className="flex items-center gap-2.5">
            <PrimaryButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              size="sm"
              onClick={onSave}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              {editing ? "Update Building" : "Save Building"}
            </PrimaryButton>
          </div>
        </div>
      </AdminCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */

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
    const typeColor = TYPE_META[form.type]?.color ?? form.color;
    const entry: Building = {
      ...form,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      color: typeColor,
    };
    setBuildings((prev) =>
      editing
        ? prev.map((b) => (b.id === editing ? entry : b))
        : [...prev, entry]
    );
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const remove = (id: string) =>
    setBuildings((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <PageHeader
        title="Buildings"
        subtitle={`${buildings.length} buildings registered on campus`}
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
          <PrimaryButton
            onClick={openNew}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Building
          </PrimaryButton>
        }
      />

      {/* ── Form panel ── */}
      <AnimatePresence>
        {showForm && (
          <BuildingFormPanel
            form={form}
            editing={editing}
            onClose={() => setShowForm(false)}
            onSave={save}
            setField={setField}
          />
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {buildings.length === 0 && (
        <AdminCard className="py-16 flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
          >
            <Building2 className="w-6 h-6" style={{ color: "#0ea5e9" }} />
          </div>
          <div className="text-center">
            <div className="text-[14px] font-semibold" style={{ color: "#0f172a" }}>
              No buildings yet
            </div>
            <div className="text-[12px] mt-1" style={{ color: "#94a3b8" }}>
              Add your first campus building to get started
            </div>
          </div>
          <PrimaryButton onClick={openNew} icon={<Plus className="w-3.5 h-3.5" />}>
            Add First Building
          </PrimaryButton>
        </AdminCard>
      )}

      {/* ── Buildings list ── */}
      {buildings.length > 0 && (
        <div className="flex flex-col gap-2">
          {buildings.map((b, i) => {
            const meta = TYPE_META[b.type];
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <AdminCard
                  className="px-4 py-3.5 flex items-center gap-4 group transition-shadow duration-150"
                  style={{
                    cursor: "default",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `${meta.color}12`,
                      border:     `1px solid ${meta.color}25`,
                    }}
                  >
                    {b.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "#0f172a" }}
                    >
                      {b.name}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 flex items-center gap-2"
                      style={{ color: "#94a3b8" }}
                    >
                      <span>{b.floors} floor{b.floors !== 1 ? "s" : ""}</span>
                      <span style={{ color: "#e2e8f0" }}>·</span>
                      <span>({b.x}, {b.y})</span>
                      <span style={{ color: "#e2e8f0" }}>·</span>
                      <span>{b.facilities.length} facilities</span>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span
                    className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0"
                    style={{
                      background: `${meta.color}10`,
                      border:     `1px solid ${meta.color}25`,
                      color:       meta.color,
                    }}
                  >
                    {meta.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <IconButton
                      onClick={() => openEdit(b)}
                      variant="primary"
                      title="Edit building"
                    >
                      <Pencil className="w-3 h-3" />
                    </IconButton>
                    <IconButton
                      onClick={() => remove(b.id)}
                      variant="danger"
                      title="Delete building"
                    >
                      <Trash2 className="w-3 h-3" />
                    </IconButton>
                  </div>
                </AdminCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}