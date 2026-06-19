import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User, Search, Bell, Command, Database, Terminal, Shield, Key, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "center", paddingTop: 100 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: 600, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 16, overflow: "hidden", position: "relative", zIndex: 10000, boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--bg-border)" }}>
          <Search size={20} color="var(--accent)" />
          <input autoFocus placeholder="Type a command or search..." style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 16, outline: "none", padding: "0 16px" }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4 }}>ESC</div>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px", fontWeight: 600 }}>Quick Actions</div>
          {[
            { icon: Terminal, label: "AI Query Engine", path: "/query" },
            { icon: Database, label: "Manage Infrastructure", path: "/profiles" },
            { icon: Key, label: "Generate API Token", path: "/tokens" },
            { icon: Shield, label: "Security Activity", path: "/audit" },
            { icon: Settings, label: "Platform Settings", path: "/settings" }
          ].map((item) => (
            <div key={item.path} onClick={() => handleNav(item.path)} className="hover-glow" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, cursor: "pointer", color: "var(--text-secondary)" }}>
              <item.icon size={16} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem(`profile_pic_${user?.username}`));

  useEffect(() => {
    setProfilePic(localStorage.getItem(`profile_pic_${user?.username}`));
  }, [user?.username]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    
    const handlePicChange = () => setProfilePic(localStorage.getItem(`profile_pic_${user?.username}`));
    window.addEventListener("profilePicChanged", handlePicChange);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("profilePicChanged", handlePicChange);
    };
  }, []);

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
              border: "1px solid var(--bg-border)", width: 300, cursor: "pointer",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)"
            }}
            onClick={() => setPaletteOpen(true)}
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
                  boxShadow: "0 4px 12px rgba(255,107,53,0.1)",
                  overflow: "hidden"
                }}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user?.full_name?.charAt(0).toUpperCase() || <User size={20} />
                )}
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

      <AnimatePresence>
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </AnimatePresence>
    </div>
  );
}
