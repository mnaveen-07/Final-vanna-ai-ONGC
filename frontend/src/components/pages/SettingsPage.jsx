import { useState } from "react";
import { User, Lock, Bell, Palette, Monitor, Terminal, Database, Save, Upload, KeyRound, ShieldAlert, Laptop } from "lucide-react";
import { Card, Input, Button, PageHeader } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully");
    }, 800);
  };

  const TABS = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "security", label: "Security & Passwords", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "advanced", label: "Advanced CLI", icon: Terminal },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Platform Settings"
        subtitle="Manage your personal preferences, security, and appearance settings."
      />

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* Sidebar Nav */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 8 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 12,
                  background: active ? "rgba(255, 107, 53, 0.1)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  transition: "all 0.2s",
                  borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent"
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "profile" && (
              <Card style={{ padding: 40, borderRadius: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px dashed var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      <User size={32} />
                    </div>
                    <button style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px var(--accent-glow)" }}>
                      <Upload size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>{user?.full_name || user?.username}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Update your photo and personal details.</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                  <Input label="Full Name" defaultValue={user?.full_name || ""} />
                  <Input label="Email Address" defaultValue="naveen@ongc.co.in" />
                  <Input label="Username" defaultValue={user?.username || ""} disabled />
                  <Input label="Role" defaultValue={user?.role?.toUpperCase()} disabled />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={handleSave} loading={loading} size="lg"><Save size={16} /> Save Changes</Button>
                </div>
              </Card>
            )}

            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card style={{ padding: 32, borderRadius: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><KeyRound size={20} /> Update Password</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Ensure your account is using a long, random password to stay secure.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 400 }}>
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                    <Button onClick={handleSave} loading={loading} style={{ alignSelf: "flex-start", marginTop: 8 }}>Update Password</Button>
                  </div>
                </Card>

                <Card style={{ padding: 32, borderRadius: 24, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.02)" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><ShieldAlert size={20} /> Danger Zone</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Once you delete your account, there is no going back. Please be certain.</p>
                  <Button variant="danger" size="lg">Delete Account</Button>
                </Card>
              </div>
            )}

            {activeTab === "appearance" && (
              <Card style={{ padding: 32, borderRadius: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Palette size={20} /> Interface Theme</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>Customize the look and feel of your command center.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                  {/* System Theme Card */}
                  <div className="hover-glow" style={{ padding: 16, border: "2px solid var(--accent)", borderRadius: 16, cursor: "pointer", background: "var(--bg-elevated)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>ACTIVE</div>
                    <div style={{ height: 100, background: "linear-gradient(135deg, #0f1117, #1e2535)", borderRadius: 8, marginBottom: 16, border: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "center" }}><Laptop size={32} color="var(--text-muted)" /></div>
                    <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>Deep Space (Default)</div>
                  </div>

                  {/* Light Theme Card */}
                  <div className="hover-glow" style={{ padding: 16, border: "1px solid var(--bg-border)", borderRadius: 16, cursor: "pointer", background: "var(--bg-surface)", opacity: 0.5 }}>
                    <div style={{ height: 100, background: "linear-gradient(135deg, #f8fafc, #e2e8f0)", borderRadius: 8, marginBottom: 16, border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}><Palette size={32} color="#94a3b8" /></div>
                    <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>Light Mode</div>
                  </div>

                  {/* High Contrast */}
                  <div className="hover-glow" style={{ padding: 16, border: "1px solid var(--bg-border)", borderRadius: 16, cursor: "pointer", background: "var(--bg-surface)", opacity: 0.5 }}>
                    <div style={{ height: 100, background: "#000", borderRadius: 8, marginBottom: 16, border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center" }}><Monitor size={32} color="#fff" /></div>
                    <div style={{ fontWeight: 600, fontSize: 14, textAlign: "center" }}>High Contrast</div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "advanced" && (
              <Card style={{ padding: 32, borderRadius: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Terminal size={20} /> Developer Tools</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>Access advanced CLI tools and platform debugging information.</p>
                
                <div style={{ background: "#0A0F1E", borderRadius: 16, padding: 24, border: "1px solid var(--bg-border)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
                  <div style={{ color: "var(--success)", marginBottom: 12 }}>$ vanna-cli status</div>
                  <div style={{ marginBottom: 4 }}>&gt; Core API: Online (v1.0.4)</div>
                  <div style={{ marginBottom: 4 }}>&gt; Frontend: Build 842a9b</div>
                  <div style={{ marginBottom: 4 }}>&gt; WebSockets: Connected</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 12 }}># Local storage cleared</div>
                </div>

                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <Button variant="ghost">Download Debug Logs</Button>
                  <Button variant="danger">Clear Local Cache</Button>
                </div>
              </Card>
            )}

          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
