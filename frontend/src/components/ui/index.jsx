// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div
      className="glass-panel hover-glow"
      style={{
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  success: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  danger:  { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
  info:    { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  default: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
};

export function Badge({ variant = "default", children }) {
  const { bg, color } = BADGE_COLORS[variant] || BADGE_COLORS.default;
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
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
}) {
  const base = {
    borderRadius: 8,
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontWeight: 500,
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "6px 12px" : "9px 16px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const variants = {
    primary:  { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 12px var(--accent-glow)" },
    danger:   { background: "var(--danger)", color: "#fff", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" },
    ghost:    { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--bg-border)" },
    success:  { background: "var(--success)", color: "#fff", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)" },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className="hover-glow" style={{ ...base, ...variants[variant] }}>
      {loading ? "Loading…" : children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
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
          padding: "12px 16px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          transition: "all 0.2s",
          ...style,
        }}
      />
      {error && <span style={{ fontSize: 11, color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, options = [], style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
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
          padding: "12px 16px",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          transition: "all 0.2s",
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
export function StatCard({ label, value, icon: Icon, color = "#6366f1", trend }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
          {trend && (
            <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>{trend}</div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: `${color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={20} color={color} />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      {Icon && <Icon size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />}
      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 13, marginBottom: 16 }}>{description}</div>}
      {action}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
export function CodeBlock({ code, language = "sql" }) {
  return (
    <pre
      className="sql-mono"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--bg-border)",
        borderRadius: 8,
        padding: "14px 16px",
        overflowX: "auto",
        color: "#a5b4fc",
        fontSize: 12,
        lineHeight: 1.7,
      }}
    >
      {code}
    </pre>
  );
}
