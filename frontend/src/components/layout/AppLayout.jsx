import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User, Search, Bell, Command } from "lucide-react";
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
        
        {/* Premium Top Header */}
        <header
          style={{
            height: 80,
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            zIndex: 10,
          }}
        >
          {/* Global Search / Command Palette Mockup */}
          <div 
            className="hover-glow"
            style={{ 
              display: "flex", alignItems: "center", gap: 12, 
              background: "var(--bg-surface)", padding: "10px 16px", borderRadius: 12,
              border: "1px solid var(--bg-border)", width: 300, cursor: "text",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)"
            }}
            onClick={() => toast("Command Palette coming soon!", { icon: "⌘" })}
          >
            <Search size={16} color="var(--text-muted)" />
            <span style={{ color: "var(--text-muted)", fontSize: 13, flex: 1 }}>Search anywhere...</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
              <Command size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>K</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Notifications */}
            <button className="hover-glow" style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative" }}>
              <Bell size={20} color="var(--text-secondary)" />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "var(--accent)", borderRadius: "50%", border: "2px solid var(--bg-base)" }} />
            </button>

            <div style={{ width: 1, height: 24, background: "var(--bg-border)" }} />

            {/* Profile Dropdown Area */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {user?.full_name || user?.username}
                </span>
                <span style={{ fontSize: 11, color: "var(--accent-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,107,53,0.05))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "1px solid rgba(255, 107, 53, 0.2)",
                  boxShadow: "0 4px 12px rgba(255,107,53,0.1)"
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || <User size={20} />}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hover-glow"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--bg-border)",
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "16px 40px 40px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
