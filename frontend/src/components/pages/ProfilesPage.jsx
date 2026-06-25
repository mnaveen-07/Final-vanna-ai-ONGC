import { useState, useEffect } from "react";
import { Plus, Plug, Trash2, RefreshCw, Database, CheckCircle, XCircle, Clock, Server, Activity, Shield, Copy } from "lucide-react";
import {
  Card, Button, Input, Select, Badge, PageHeader, EmptyState,
} from "../ui";
import {
  listProfiles, createProfile, deleteProfile,
  testConnection, ingestSchema,
} from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql",      label: "MySQL / MariaDB" },
  { value: "mssql",      label: "Microsoft SQL Server" },
  { value: "oracle",     label: "Oracle Database" },
  { value: "mongodb",    label: "MongoDB" },
];

const DEFAULT_PORTS = {
  postgresql: 5432, mysql: 3306, mssql: 1433, oracle: 1521, mongodb: 27017,
};

const DB_THEMES = {
  postgresql: { color: "#336791", name: "PostgreSQL", icon: Database },
  mysql:      { color: "#E48E00", name: "MySQL", icon: Database },
  mssql:      { color: "#CC292B", name: "SQL Server", icon: Server },
  oracle:     { color: "#F80000", name: "Oracle", icon: Database },
  mongodb:    { color: "#47A248", name: "MongoDB", icon: Server },
  default:    { color: "#6366f1", name: "Database", icon: Database }
};

const STATUS_BADGE = {
  connected:  "success",
  failed:     "danger",
  untested:   "default",
};

function ProfileForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "", db_type: "postgresql", host: "", port: 5432,
    database_name: "", username: "", password: "", ssl_enabled: false, read_only: true,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleDbTypeChange = (v) => {
    set("db_type", v);
    set("port", DEFAULT_PORTS[v] || 5432);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const p = await createProfile(form);
      toast.success(`Profile "${p.name}" created`);
      onSave(p);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
      <Card style={{ marginBottom: 32, border: "1px solid var(--accent)", boxShadow: "0 12px 32px var(--accent-glow)", background: "rgba(10, 15, 30, 0.8)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 24, color: "var(--text-primary)" }}>Provision New Infrastructure</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Input label="Profile Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Production Cluster A" />
          <Select label="Database Engine" options={DB_TYPES} value={form.db_type} onChange={(e) => handleDbTypeChange(e.target.value)} />
          <Input label="Host Endpoint" value={form.host} onChange={(e) => set("host", e.target.value)} placeholder="db.internal.network" />
          <Input label="Port" type="number" value={form.port} onChange={(e) => set("port", Number(e.target.value))} />
          <Input label="Database Name" value={form.database_name} onChange={(e) => set("database_name", e.target.value)} />
          <Input label="Service Account Username" value={form.username} onChange={(e) => set("username", e.target.value)} />
          <Input label="Password / Token" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end", paddingBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={form.ssl_enabled} onChange={(e) => set("ssl_enabled", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Require SSL/TLS Encryption</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
              <input type="checkbox" checked={form.read_only} onChange={(e) => set("read_only", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Enforce Read-Only Mode</span>
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <Button onClick={handleSave} loading={saving} size="lg">Provision Cluster</Button>
          <Button variant="ghost" onClick={onCancel} size="lg">Cancel</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ProfileCard({ profile, onDelete, onRefresh }) {
  const [testing, setTesting] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  
  const theme = DB_THEMES[profile.db_type] || DB_THEMES.default;
  const Icon = theme.icon;

  // Mocking telemetry for visual flair
  const latency = profile.connection_status === "connected" ? Math.floor(Math.random() * 40 + 10) : 0;
  const schemaCount = profile.connection_status === "connected" ? Math.floor(Math.random() * 150 + 20) : 0;

  const handleTest = async () => {
    setTesting(true);
    try {
      const r = await testConnection(profile.id);
      toast.success(r.message || "Connection successful");
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const r = await ingestSchema(profile.id);
      toast.success(`Schema ingested: ${r.tables_discovered} tables`);
      onRefresh();
    } catch (e) {
      toast.error("Schema ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete profile "${profile.name}"?`)) return;
    try {
      await deleteProfile(profile.id);
      toast.success("Profile deleted");
      onDelete(profile.id);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
      <Card style={{ padding: "28px", borderTop: `4px solid ${theme.color}`, background: "var(--bg-surface)", display: "flex", flexDirection: "column", height: "100%" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.color}22`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${theme.color}44` }}>
              <Icon size={24} color={theme.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{profile.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: theme.color }}>{theme.name}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                {profile.host}:{profile.port}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Badge variant={STATUS_BADGE[profile.connection_status] || "default"}>
              {profile.connection_status === "connected" && <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", marginRight: 6, display: "inline-block" }} />}
              {profile.connection_status}
            </Badge>
            {profile.read_only && <Badge variant="info"><Shield size={10} style={{ marginRight: 4 }}/> Read-Only</Badge>}
          </div>
        </div>

        {/* Telemetry Mockup & Connection Details */}
        <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-muted)", width: 80 }}>Database:</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{profile.database_name || "N/A"}</span></div>
              {profile.database_name && <Button variant="ghost" size="sm" style={{ padding: 4, height: "auto" }} onClick={() => { navigator.clipboard.writeText(profile.database_name); toast.success("Database name copied"); }}><Copy size={14} /></Button>}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-muted)", width: 80 }}>Username:</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{profile.username || "N/A"}</span></div>
              {profile.username && <Button variant="ghost" size="sm" style={{ padding: 4, height: "auto" }} onClick={() => { navigator.clipboard.writeText(profile.username); toast.success("Username copied"); }}><Copy size={14} /></Button>}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-muted)", width: 80 }}>Password:</span><span style={{ color: "var(--text-primary)", fontFamily: "monospace", letterSpacing: 2 }}>••••••••</span></div>
              {profile.password && <Button variant="ghost" size="sm" style={{ padding: 4, height: "auto" }} onClick={() => { navigator.clipboard.writeText(profile.password); toast.success("Password copied"); }}><Copy size={14} /></Button>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Latency</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={16} color="var(--success)" /> {latency}ms
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Schemas Tracked</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{schemaCount}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", flexWrap: "wrap" }}>
          <Button variant="ghost" size="sm" onClick={handleTest} loading={testing} style={{ flex: 1 }}>
            <Plug size={14} /> Test
          </Button>
          <Button variant="ghost" size="sm" onClick={handleIngest} loading={ingesting} style={{ flex: 1 }}>
            <RefreshCw size={14} /> Sync
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }} title="Destroy Infrastructure">
            <Trash2 size={14} />
          </Button>
        </div>

        {profile.schema_ingested_at && (
          <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <Clock size={12} />
            Last synced {new Date(profile.schema_ingested_at).toLocaleString()}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    listProfiles()
      .then(setProfiles)
      .catch(() => toast.error("Failed to load profiles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Enterprise Infrastructure"
        subtitle="Manage and monitor your connected data warehouses, operational databases, and clusters."
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)} size="lg" style={{ borderRadius: 24 }}>
              <Plus size={16} />
              Connect Database
            </Button>
          )
        }
      />

      <AnimatePresence>
        {showForm && (
          <ProfileForm
            onSave={(p) => { setProfiles((prev) => [...prev, p]); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <RefreshCw size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Discovering infrastructure...</div>
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No Infrastructure Provisioned"
          description="Connect your first PostgreSQL, MySQL, Oracle, or MongoDB instance to start analyzing your data."
          action={<Button onClick={() => setShowForm(true)} size="lg"><Plus size={16} /> Connect Database</Button>}
        />
      ) : (
        <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 24 }}>
          <AnimatePresence>
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                onDelete={(id) => setProfiles((prev) => prev.filter((x) => x.id !== id))}
                onRefresh={load}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
