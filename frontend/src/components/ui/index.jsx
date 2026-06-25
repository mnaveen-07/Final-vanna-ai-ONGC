import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel hover-glow ${className}`}
      style={{
        padding: 24,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  success: { bg: "rgba(0,229,168,0.15)", color: "#00E5A8", border: "rgba(0,229,168,0.3)" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  danger:  { bg: "rgba(239,68,68,0.15)",  color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  info:    { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  default: { bg: "rgba(184,192,212,0.15)", color: "#B8C0D4", border: "rgba(184,192,212,0.3)" },
};

export function Badge({ variant = "default", children }) {
  const { bg, color, border } = BADGE_COLORS[variant] || BADGE_COLORS.default;
  return (
    <span
      style={{
        background: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "inline-flex",
        alignItems: "center"
      }}
    >
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = "primary", size = "md",
  disabled = false, loading = false, style = {}, type = "button",
  className = ""
}) {
  const base = {
    borderRadius: 10,
    border: "1px solid transparent",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
    padding: size === "sm" ? "8px 14px" : size === "lg" ? "14px 28px" : "10px 20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: disabled ? 0.5 : 1,
    letterSpacing: "0.01em",
    ...style,
  };

  const variants = {
    primary:  { background: "var(--accent)", color: "#fff", boxShadow: "0 8px 24px rgba(255, 107, 53, 0.4)", borderColor: "rgba(255, 107, 53, 0.5)" },
    danger:   { background: "var(--danger)", color: "#fff", boxShadow: "0 8px 24px rgba(239, 68, 68, 0.3)", borderColor: "rgba(239, 68, 68, 0.5)" },
    ghost:    { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--bg-border)" },
    success:  { background: "var(--success)", color: "#0A0F1E", boxShadow: "0 8px 24px rgba(0, 229, 168, 0.3)", borderColor: "rgba(0, 229, 168, 0.5)" },
  };

  return (
    <motion.button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`hover-glow ${className}`} 
      style={{ ...base, ...variants[variant] }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {loading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={16} /></motion.div>}
      {!loading && children}
    </motion.button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <input
        {...props}
        className="input-focus-ring"
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--bg-border)"}`,
          borderRadius: 12,
          padding: "14px 18px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          ...style,
        }}
      />
      {error && <span style={{ fontSize: 12, color: "var(--danger)", marginTop: 2 }}>{error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, options = [], style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <select
        {...props}
        className="input-focus-ring"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "14px 18px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          appearance: "none",
          ...style,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = "var(--accent-tertiary)", trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card hover-glow"
      style={{ padding: 24 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{value}</div>
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              <span style={{ 
                fontSize: 12, fontWeight: 600, color: trend.startsWith("↑") ? "var(--success)" : "var(--danger)",
                background: trend.startsWith("↑") ? "rgba(0,229,168,0.1)" : "rgba(239,68,68,0.1)",
                padding: "2px 8px", borderRadius: 12
              }}>
                {trend}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
              border: `1px solid ${color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 16px ${color}22`
            }}
          >
            <Icon size={24} color={color} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}
    >
      {Icon && <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}><Icon size={48} style={{ margin: "0 auto 20px", opacity: 0.3, color: "var(--text-secondary)" }} /></motion.div>}
      <div style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>{title}</div>
      {description && <div style={{ fontSize: 14, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>{description}</div>}
      {action}
    </motion.div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--bg-border)" }}
    >
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 6, fontWeight: 400 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
export function CodeBlock({ code, language = "sql" }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
        {/* Placeholder for standard Code editor actions */}
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--danger)" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--warning)" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--success)" }} />
      </div>
      <pre
        className="sql-mono"
        style={{
          background: "#0A0F1E", /* Monaco dark theme feel */
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "32px 20px 20px 20px",
          overflowX: "auto",
          color: "#D4D4D4",
          fontSize: 13,
          lineHeight: 1.7,
          boxShadow: "inset 0 4px 20px rgba(0,0,0,0.5)"
        }}
      >
        {code}
      </pre>
    </div>
  );
}

export * from "./ChatBot";
