import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, RotateCcw, Key, Shield, Clock } from "lucide-react";
import { Card, Button, Input, Select, Badge, PageHeader, EmptyState } from "../ui";
import { listTokens, createToken, revokeToken, rotateToken, deleteToken, listProfiles } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function TokenForm({ profiles, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", profile_id: "", limit_per_minute: 60 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.profile_id) return toast.error("Name and Profile required");
    setSaving(true);
    try {
      const t = await createToken({
        name: form.name,
        connection_profile_id: parseInt(form.profile_id),
        limit_per_minute: parseInt(form.limit_per_minute)
      });
      toast.success("Token generated");
      onSave(t);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create token");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
      <Card style={{ marginBottom: 32, border: "1px solid var(--accent-secondary)", boxShadow: "0 12px 32px rgba(0,229,168,0.15)", background: "rgba(10, 15, 30, 0.8)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 24, color: "var(--text-primary)" }}>Generate New API Key</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Input label="Application / Key Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Production BI Dashboard" />
          <Select 
            label="Target Database Profile" 
            options={[{ value: "", label: "Select a profile..." }, ...profiles.map(p => ({ value: p.id, label: p.name }))]}
            value={form.profile_id} 
            onChange={(e) => setForm({ ...form, profile_id: e.target.value })} 
          />
          <Input label="Rate Limit (req / min)" type="number" value={form.limit_per_minute} onChange={(e) => setForm({ ...form, limit_per_minute: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <Button onClick={handleSave} loading={saving} variant="success" size="lg">Generate Key</Button>
          <Button variant="ghost" onClick={onCancel} size="lg">Cancel</Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newToken, setNewToken] = useState(null);

  useEffect(() => {
    Promise.all([listTokens(), listProfiles()])
      .then(([t, p]) => { setTokens(t); setProfiles(p); })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this token? Applications using it will instantly fail.")) return;
    await revokeToken(id);
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: false } : t)));
    toast.success("Token revoked");
  };

  const handleRotate = async (id) => {
    if (!window.confirm("Rotate this token? A new key will be generated.")) return;
    const t = await rotateToken(id);
    setTokens((prev) => prev.filter((x) => x.id !== id));
    setNewToken(t);
    toast.success("Token rotated successfully");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this token and its history?")) return;
    await deleteToken(id);
    setTokens((prev) => prev.filter((t) => t.id !== id));
    toast.success("Token deleted");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="API Access Keys"
        subtitle="Manage authentication tokens for programmatic access to the Natural Language querying engine."
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)} size="lg" variant="success" style={{ borderRadius: 24 }}>
              <Plus size={16} />
              Generate API Key
            </Button>
          )
        }
      />

      <AnimatePresence>
        {showForm && (
          <TokenForm
            profiles={profiles}
            onSave={(t) => { setTokens((prev) => [t, ...prev]); setShowForm(false); setNewToken(t); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newToken && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
            <Card style={{ marginBottom: 32, background: "rgba(0,229,168,0.05)", border: "1px solid rgba(0,229,168,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--success)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                <Shield size={24} /> Keep this key secret!
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                Make sure to copy your new API key right now. You won't be able to see it again!
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, border: "1px solid var(--bg-border)" }}>
                <code style={{ fontSize: 16, color: "var(--text-primary)", flex: 1, letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>{newToken.raw_token}</code>
                <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(newToken.raw_token); toast.success("Copied to clipboard!"); }}>
                  <Copy size={16} /> Copy
                </Button>
              </div>
              <Button style={{ marginTop: 20 }} variant="ghost" onClick={() => { setNewToken(null); setTokens(prev => [newToken.token_db, ...prev.filter(t => t.id !== newToken.token_db.id)]); }}>
                I have saved it securely
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Key size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Loading security credentials...</div>
        </div>
      ) : tokens.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No API Keys Generated"
          description="Create API keys to securely integrate ONGC Vanna with your external applications or BI tools."
          action={<Button onClick={() => setShowForm(true)} size="lg" variant="success"><Plus size={16} /> Generate API Key</Button>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden", borderRadius: 24, border: "1px solid var(--bg-border)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Application / Name</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Prefix / Identifier</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Target Profile</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Rate Limit</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Usage</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Status</th>
                  <th style={{ padding: "20px 24px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {tokens.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover-glow"
                      style={{
                        borderBottom: i === tokens.length - 1 ? "none" : "1px solid var(--bg-border)",
                        background: t.is_active ? "transparent" : "rgba(239, 68, 68, 0.05)",
                      }}
                    >
                      <td style={{ padding: "20px 24px", color: "var(--text-primary)", fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: "20px 24px", color: "var(--accent-secondary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{t.prefix}...</td>
                      <td style={{ padding: "20px 24px", color: "var(--text-secondary)", fontSize: 13 }}>Profile ID: {t.connection_profile_id}</td>
                      <td style={{ padding: "20px 24px", color: "var(--text-secondary)", fontSize: 13 }}>{t.limit_per_minute}/min</td>
                      <td style={{ padding: "20px 24px", color: "var(--text-secondary)", fontSize: 13 }}>{t.usage_count} calls</td>
                      <td style={{ padding: "20px 24px" }}>
                        <Badge variant={t.is_active ? "success" : "danger"}>
                          {t.is_active ? "ACTIVE" : "REVOKED"}
                        </Badge>
                      </td>
                      <td style={{ padding: "20px 24px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          {t.is_active ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleRotate(t.id)} title="Rotate Token" style={{ padding: 8, borderRadius: 8 }}>
                                <RotateCcw size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRevoke(t.id)} title="Revoke Token" style={{ padding: 8, borderRadius: 8, color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <Trash2 size={16} />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} title="Permanently Delete Token" style={{ padding: 8, borderRadius: 8, color: "var(--danger)", background: "rgba(239,68,68,0.1)" }}>
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
