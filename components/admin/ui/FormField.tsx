"use client";

import { useState, useId } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS (light surface — matches landing page)
   accent:  sky-500  #0ea5e9
   border:  slate-200 #e2e8f0
   text:    slate-900 / slate-500 / slate-400
══════════════════════════════════════════════════════════ */

// ── Section label ─────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 mb-4"
    >
      <span
        className="text-[10px] font-semibold tracking-[1.5px] uppercase"
        style={{ color: "#94a3b8" /* slate-400 */ }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#f1f5f9" }} />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────
interface FieldProps {
  label:    string;
  hint?:    string;
  error?:   string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, success, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[12px] font-medium"
        style={{ color: "#374151" /* gray-700 */ }}
      >
        {label}
        {required && (
          <span className="ml-0.5" style={{ color: "#0ea5e9" }}>*</span>
        )}
      </label>

      {children}

      {/* hint / error / success — only one shown */}
      {error ? (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: "#ef4444" }} />
          <span className="text-[11px]" style={{ color: "#ef4444" }}>{error}</span>
        </div>
      ) : success ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#10b981" }} />
          <span className="text-[11px]" style={{ color: "#10b981" }}>{success}</span>
        </div>
      ) : hint ? (
        <span className="text-[11px]" style={{ color: "#94a3b8" }}>{hint}</span>
      ) : null}
    </div>
  );
}

// ── Text input ────────────────────────────────────────────
interface InputProps {
  value:       string | number;
  onChange:    (v: string) => void;
  placeholder?: string;
  type?:        string;
  error?:       boolean;
  disabled?:    boolean;
  prefix?:      React.ReactNode;
  suffix?:      React.ReactNode;
}

export function FormInput({
  value, onChange, placeholder, type = "text", error, disabled, prefix, suffix,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "#ef4444"
    : focused
    ? "#0ea5e9"
    : "#e2e8f0";

  const shadow = focused
    ? error
      ? "0 0 0 3px rgba(239,68,68,0.12)"
      : "0 0 0 3px rgba(14,165,233,0.12)"
    : "none";

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden transition-all duration-150"
      style={{
        border:    `1.5px solid ${borderColor}`,
        boxShadow: shadow,
        background: disabled ? "#f8fafc" : "#ffffff",
      }}
    >
      {prefix && (
        <div
          className="px-3 flex items-center flex-shrink-0"
          style={{
            borderRight: `1px solid ${borderColor}`,
            color:       "#94a3b8",
            background:  "#f8fafc",
            height:      "100%",
            alignSelf:   "stretch",
          }}
        >
          {prefix}
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 px-3 py-2.5 text-[13px] outline-none bg-transparent"
        style={{
          color:      disabled ? "#94a3b8" : "#0f172a",
          fontFamily: "inherit",
        }}
      />
      {suffix && (
        <div className="px-3 flex items-center flex-shrink-0" style={{ color: "#94a3b8" }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────
interface SelectProps {
  value:    string | number;
  onChange: (v: string) => void;
  error?:   boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FormSelect({ value, onChange, error, disabled, children }: SelectProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "#ef4444"
    : focused
    ? "#0ea5e9"
    : "#e2e8f0";

  const shadow = focused
    ? error
      ? "0 0 0 3px rgba(239,68,68,0.12)"
      : "0 0 0 3px rgba(14,165,233,0.12)"
    : "none";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-150 appearance-none"
      style={{
        border:     `1.5px solid ${borderColor}`,
        boxShadow:  shadow,
        background: disabled ? "#f8fafc" : "#ffffff",
        color:      disabled ? "#94a3b8" : "#0f172a",
        fontFamily: "inherit",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat:   "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight:       "36px",
        cursor:     "pointer",
      }}
    >
      {children}
    </select>
  );
}

// ── Textarea ──────────────────────────────────────────────
interface TextareaProps {
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  rows?:        number;
  error?:       boolean;
}

export function FormTextarea({ value, onChange, placeholder, rows = 3, error }: TextareaProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? "#ef4444" : focused ? "#0ea5e9" : "#e2e8f0";
  const shadow = focused
    ? error
      ? "0 0 0 3px rgba(239,68,68,0.12)"
      : "0 0 0 3px rgba(14,165,233,0.12)"
    : "none";

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none transition-all duration-150"
      style={{
        border:     `1.5px solid ${borderColor}`,
        boxShadow:  shadow,
        background: "#ffffff",
        color:      "#0f172a",
        fontFamily: "inherit",
      }}
    />
  );
}

// ── Status badge ──────────────────────────────────────────
type BadgeVariant = "info" | "warning" | "success" | "critical" | "neutral";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; border: string; text: string; dot: string }> = {
  info:     { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  warning:  { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
  success:  { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#22c55e" },
  critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#ef4444" },
  neutral:  { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", dot: "#94a3b8" },
};

export function StatusBadge({
  variant = "neutral",
  children,
  pulse,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  pulse?:   boolean;
}) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: s.dot,
          ...(pulse ? { animation: "badge-pulse 2s ease-in-out infinite" } : {}),
        }}
      />
      {children}
    </span>
  );
}

// ── Page header ───────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
}: {
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
  badge?:    React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ color: "#0f172a", fontFamily: "var(--font-display, inherit)" }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "#64748b" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ── Admin card (light surface) ────────────────────────────
export function AdminCard({
  children,
  className = "",
  style,
  noBorder,
}: {
  children:  React.ReactNode;
  className?: string;
  style?:    React.CSSProperties;
  noBorder?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-white ${className}`}
      style={{
        border:    noBorder ? "none" : "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Inline action button (icon only) ─────────────────────
export function IconButton({
  onClick,
  variant = "default",
  children,
  title,
}: {
  onClick:   () => void;
  variant?:  "default" | "danger" | "primary";
  children:  React.ReactNode;
  title?:    string;
}) {
  const styles = {
    default: { bg: "#f8fafc", border: "#e2e8f0", color: "#64748b", hover: "#f1f5f9" },
    danger:  { bg: "#fef2f2", border: "#fecaca", color: "#ef4444", hover: "#fee2e2" },
    primary: { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb", hover: "#dbeafe" },
  }[variant];

  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 flex-shrink-0"
      style={{
        background: styles.bg,
        border:     `1px solid ${styles.border}`,
        color:      styles.color,
        cursor:     "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = styles.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = styles.bg)}
    >
      {children}
    </button>
  );
}