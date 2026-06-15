import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Database, Key, MessageSquare,
  ScrollText, Settings, LogOut, Brain, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const NAV = [
  { to: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { to: "/query",      label: "Query",         icon: MessageSquare },
  { to: "/profiles",   label: "DB Profiles",   icon: Database },
  { to: "/tokens",     label: "API Tokens",    icon: Key },
  { to: "/audit",      label: "Audit Logs",    icon: ScrollText },
  { to: "/settings",   label: "Settings",      icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "var(--bg-surface)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--bg-border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--bg-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px var(--accent-glow)",
            }}
          >
            <Brain size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
              ONGC Vanna
            </div>
            <div style={{ fontSize: 11, color: "var(--accent-secondary)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Command Center</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-glow)" : "transparent",
              borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
              transition: "all 0.15s",
            })}
          >
            <Icon size={16} />
            {label}
            {window.location.pathname === to && (
              <ChevronRight size={12} style={{ marginLeft: "auto" }} />
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
