import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Database, Key, MessageSquare,
  ScrollText, Settings, Brain, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const NAV = [
  { to: "/dashboard",  label: "Overview",    icon: LayoutDashboard },
  { to: "/query",      label: "AI Command",  icon: MessageSquare },
  { to: "/profiles",   label: "Databases",   icon: Database },
  { to: "/tokens",     label: "API Tokens",  icon: Key },
  { to: "/audit",      label: "Audit Logs",  icon: ScrollText },
  { to: "/settings",   label: "Settings",    icon: Settings },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        width: 260,
        margin: "16px 0 16px 16px",
        borderRadius: 24,
        background: "var(--bg-surface)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--bg-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden"
      }}
    >
      {/* Logo Area */}
      <div style={{ padding: "32px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px var(--accent-glow)",
            }}
          >
            <Brain size={20} color="#050816" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              ONGC Vanna
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Command Center</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0 12px", marginBottom: 12 }}>Platform Menu</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              marginBottom: 4,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "rgba(255, 107, 53, 0.1)" : "transparent",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)", borderRadius: 4, boxShadow: "0 0 12px var(--accent-glow)" }}
                  />
                )}
                <Icon size={18} color={isActive ? "var(--accent)" : "currentColor"} />
                {label}
                {isActive && (
                  <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--accent)" }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </motion.aside>
  );
}
