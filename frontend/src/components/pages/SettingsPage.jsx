import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../App";
import { Card, Input, Button, PageHeader, Badge } from "../ui";
import { Shield, User, Bell, Key, Moon, Sun, Monitor } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    current_password: "",
    new_password: "",
  });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, security, and platform appearance" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* Appearance (Theme) */}
        <Card style={{ gridColumn: "1 / -1", padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Monitor size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Appearance</span>
          </div>
          
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={() => setTheme("light")}
              className="hover-glow"
              style={{
                flex: 1, padding: 24, borderRadius: 12, cursor: "pointer",
                background: theme === "light" ? "var(--accent-glow)" : "var(--bg-elevated)",
                border: theme === "light" ? "2px solid var(--accent)" : "2px solid transparent",
                color: "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "all 0.2s"
              }}
            >
              <Sun size={32} color={theme === "light" ? "var(--accent)" : "var(--text-muted)"} />
              <div style={{ fontWeight: 600 }}>Light Mode</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Crisp & Clean</div>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className="hover-glow"
              style={{
                flex: 1, padding: 24, borderRadius: 12, cursor: "pointer",
                background: theme === "dark" ? "var(--accent-glow)" : "var(--bg-elevated)",
                border: theme === "dark" ? "2px solid var(--accent)" : "2px solid transparent",
                color: "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transition: "all 0.2s"
              }}
            >
              <Moon size={32} color={theme === "dark" ? "var(--accent)" : "var(--text-muted)"} />
              <div style={{ fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Command Center</div>
            </button>
          </div>
        </Card>

        {/* Profile */}
        <Card style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <User size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Profile Information</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>EMAIL ADDRESS</label>
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--bg-elevated)",
                  borderRadius: 12,
                  border: "1px solid var(--bg-border)",
                  fontSize: 14,
                  color: "var(--text-muted)",
                }}
              >
                {user?.email}
              </div>
            </div>

            <Input
              label="DISPLAY NAME"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>ACCOUNT ROLE</label>
              <Badge variant="info">{user?.role?.replace("_", " ").toUpperCase()}</Badge>
            </div>

            <Button onClick={() => toast.success("Profile updated")} size="md" style={{ marginTop: 8 }}>
              Save Profile Changes
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Shield size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Security Settings</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="CURRENT PASSWORD"
              type="password"
              value={form.current_password}
              onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
            />
            <Input
              label="NEW PASSWORD"
              type="password"
              value={form.new_password}
              onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
            />
            <Button
              onClick={() => toast.success("Password changed")}
              size="md"
              variant="ghost"
              style={{ marginTop: 8 }}
            >
              Update Password
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
