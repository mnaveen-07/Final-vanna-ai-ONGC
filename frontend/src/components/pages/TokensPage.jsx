import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, RotateCcw, Key, AlertTriangle } from "lucide-react";
import { Card, Button, Input, Select, Badge, PageHeader, EmptyState } from "../ui";
import { listTokens, createToken, revokeToken, rotateToken, listProfiles } from "../../api/client";
import toast from "react-hot-toast";

function TokenForm({ profiles, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", profile_id: "", rate_limit_per_minute: 60 });
  const [saving, setSaving] = useState(false);

  const profileOptions = profiles.map((p) => ({ value: p.id, label: `${p.name} (${p.db_type})` }));

  const handleSave = async () => {
    if (!form.name || !form.profile_id) return toast.error("Fill in all fields");
    setSaving(true);
    try {
      const t = await createToken({ ...form, profile_id: Number(form.profile_id) });
      onSave(t);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create token");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ marginBottom: 24, borderColor: "#6366f1" }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>New API Token</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Input label="Token Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. HR Assistant Token" />
        <Select label="Database Profile" options={[{ value: "", label: "Select profile…" }, ...profileOptions]}
          value={form.profile_id} onChange={(e) => setForm((f) => ({ ...f, profile_id: e.target.value }))} />
        <Input label="Rate Limit / Minute" type="number" value={form.rate_limit_per_minute}
          onChange={(e) => setForm((f) => ({ ...f, rate_limit_per_minute: Number(e.target.value) }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Button onClick={handleSave} loading={saving}>Generate Token</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}

function NewTokenReveal({ token, onClose }) {
  const copy = () => {
    navigator.clipboard.writeText(token.token);
    toast.success("Token copied!");
  };

  return (
    <Card style={{ marginBottom: 24, borderColor: "var(--success)" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <AlertTriangle size={16} color="var(--warning)" />
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--warning)" }}>
          Copy your token now — it won't be shown again
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <code
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "var(--bg-elevated)",
            borderRadius: 8,
            border: "1px solid var(--bg-border)",
            fontSize: 12,
            fontFamily: "monospace",
            color: "#a5b4fc",
            wordBreak: "break-all",
          }}
        >
          {token.token}
        </code>
        <Button variant="primary" size="sm" onClick={copy}><Copy size={12} />Copy</Button>
      </div>
      <Button variant="ghost" size="sm" style={{ marginTop: 12 }} onClick={onClose}>Done</Button>
    </Card>
  );
}

export default function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listTokens(), listProfiles()])
      .then(([t, p]) => { setTokens(t); setProfiles(p); })
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this token?")) return;
    await revokeToken(id);
    setTokens((prev) => prev.filter((t) => t.id !== id));
    toast.success("Token revoked");
  };

  const handleRotate = async (id) => {
    const t = await rotateToken(id);
    setTokens((prev) => prev.filter((x) => x.id !== id));
    setNewToken(t);
    toast.success("Token rotated");
  };

  return (
    <div>
      <PageHeader
        title="API Tokens"
        subtitle="Manage tokens for external applications to query your databases"
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Token
            </Button>
          )
        }
      />

      {showForm && (
        <TokenForm
          profiles={profiles}
          onSave={(t) => { setNewToken(t); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {newToken && <NewTokenReveal token={newToken} onClose={() => { setTokens((p) => [...p, newToken]); setNewToken(null); }} />}

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading…</div>
      ) : tokens.length === 0 ? (
        <EmptyState icon={Key} title="No tokens yet" description="Generate a token to let external apps query your databases" />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--bg-border)" }}>
                {["Name", "Prefix", "Profile", "Rate Limit", "Usage", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="hover-glow" style={{ borderBottom: "1px solid var(--bg-border)", transition: "all 0.2s", background: "transparent" }}>
                  <td style={{ padding: "16px 20px", color: "var(--text-primary)", fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: "16px 20px", fontFamily: "monospace", color: "var(--accent-secondary)", fontSize: 12 }}>{t.token_prefix}…</td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>Profile ID: {t.profile_id}</td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{t.rate_limit_per_minute}/min</td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{t.usage_count} calls</td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={t.is_active ? "success" : "danger"}>{t.is_active ? "Active" : "Revoked"}</Badge>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {t.is_active && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleRotate(t.id)}>
                            <RotateCcw size={14} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleRevoke(t.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
