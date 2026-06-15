import { useState, useEffect } from "react";
import { Plus, Plug, Trash2, RefreshCw, Database, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Card, Button, Input, Select, Badge, PageHeader, EmptyState,
} from "../ui";
import {
  listProfiles, createProfile, deleteProfile,
  testConnection, ingestSchema,
} from "../../api/client";
import toast from "react-hot-toast";

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql",      label: "MySQL / MariaDB" },
  { value: "mssql",      label: "Microsoft SQL Server" },
  { value: "oracle",     label: "Oracle Database" },
  { value: "mongodb",    label: "MongoDB (Experimental)" },
];

const DEFAULT_PORTS = {
  postgresql: 5432, mysql: 3306, mssql: 1433, oracle: 1521, mongodb: 27017,
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

  const HOST_PLACEHOLDERS = {
    postgresql: "e.g. localhost or db.internal.com",
    mysql: "e.g. 127.0.0.1 or mysql.internal",
    mssql: "e.g. localhost or 192.168.1.100",
    oracle: "e.g. localhost or oracle-db.local",
    mongodb: "e.g. localhost or cluster0.mongodb.net",
  };

  return (
    <Card style={{ marginBottom: 24, borderColor: "#6366f1" }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>New Connection Profile</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Input label="Profile Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. HR Database" />
        <Select label="Database Type" options={DB_TYPES} value={form.db_type} onChange={(e) => handleDbTypeChange(e.target.value)} />
        <Input label="Host / IP" value={form.host} onChange={(e) => set("host", e.target.value)} placeholder={HOST_PLACEHOLDERS[form.db_type] || "e.g. db.internal.com"} />
        <Input label="Port" type="number" value={form.port} onChange={(e) => set("port", Number(e.target.value))} />
        <Input label="Database Name" value={form.database_name} onChange={(e) => set("database_name", e.target.value)} />
        <Input label="Username" value={form.username} onChange={(e) => set("username", e.target.value)} />
        <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={form.ssl_enabled} onChange={(e) => set("ssl_enabled", e.target.checked)} />
            <span style={{ color: "var(--text-secondary)" }}>SSL Enabled</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={form.read_only} onChange={(e) => set("read_only", e.target.checked)} />
            <span style={{ color: "var(--text-secondary)" }}>Read-Only Mode</span>
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Button onClick={handleSave} loading={saving}>Save Profile</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}

function ProfileCard({ profile, onDelete, onRefresh }) {
  const [testing, setTesting] = useState(false);
  const [ingesting, setIngesting] = useState(false);

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
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {profile.db_type.toUpperCase()} · {profile.host}:{profile.port}/{profile.database_name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Badge variant={STATUS_BADGE[profile.connection_status] || "default"}>
            {profile.connection_status}
          </Badge>
          {profile.read_only && <Badge variant="info">Read-Only</Badge>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="ghost" size="sm" onClick={handleTest} loading={testing}>
          <Plug size={12} />
          Test Connection
        </Button>
        <Button variant="ghost" size="sm" onClick={handleIngest} loading={ingesting}>
          <RefreshCw size={12} />
          Ingest Schema
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete} style={{ marginLeft: "auto" }}>
          <Trash2 size={12} />
          Delete
        </Button>
      </div>

      {profile.schema_ingested_at && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={10} />
          Schema last ingested: {new Date(profile.schema_ingested_at).toLocaleString()}
        </div>
      )}
    </Card>
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
    <div>
      <PageHeader
        title="Database Profiles"
        subtitle="Configure and manage your database connections"
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Profile
            </Button>
          )
        }
      />

      {showForm && (
        <ProfileForm
          onSave={(p) => { setProfiles((prev) => [...prev, p]); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading…</div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No profiles yet"
          description="Connect your first database to start querying"
          action={<Button onClick={() => setShowForm(true)}><Plus size={14} /> Add Profile</Button>}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onDelete={(id) => setProfiles((prev) => prev.filter((x) => x.id !== id))}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
