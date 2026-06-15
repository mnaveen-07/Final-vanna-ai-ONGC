import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
        
        {/* Top Header */}
        <header
          style={{
            height: 64,
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 20,
            borderBottom: "1px solid var(--bg-border)",
            background: "var(--bg-surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.full_name || user?.username}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {user?.role?.replace("_", " ")}
              </span>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--accent-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                fontWeight: 700,
                fontSize: 14,
                border: "1px solid rgba(229, 57, 53, 0.2)"
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || <User size={18} />}
            </div>
          </div>

          <div style={{ width: 1, height: 24, background: "var(--bg-border)" }} />

          <button
            onClick={handleLogout}
            className="hover-glow"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid var(--bg-border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "32px 36px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
