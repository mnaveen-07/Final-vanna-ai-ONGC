import { useState, useEffect } from "react";
import { Database, TableProperties, Columns, ChevronDown, ChevronRight, Hash, Type, AlignLeft } from "lucide-react";
import { Card, PageHeader, Select, EmptyState } from "../ui";
import { listProfiles, getProfileSchema } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function TableRow({ table }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="hover-glow"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: expanded ? "12px 12px 0 0" : 12,
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
            <TableProperties size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{table.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{table.columns?.length || 0} columns</div>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronDown size={20} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ 
              padding: "16px 20px", 
              background: "rgba(0,0,0,0.15)", 
              border: "1px solid var(--bg-border)", 
              borderTop: "none", 
              borderRadius: "0 0 12px 12px" 
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                {table.columns.map((col, idx) => (
                  <div key={idx} style={{ 
                    display: "flex", alignItems: "center", gap: 12, 
                    padding: "10px 14px", 
                    background: "var(--bg-elevated)", 
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.02)"
                  }}>
                    <div style={{ color: "var(--accent)", opacity: 0.8 }}>
                      {col.data_type.toLowerCase().includes("int") || col.data_type.toLowerCase().includes("number") ? (
                        <Hash size={14} />
                      ) : col.data_type.toLowerCase().includes("char") || col.data_type.toLowerCase().includes("text") ? (
                        <Type size={14} />
                      ) : (
                        <AlignLeft size={14} />
                      )}
                    </div>
                    <div style={{ flex: 1, fontWeight: 500, fontSize: 13, color: "var(--text-secondary)" }}>{col.name}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: 4 }}>
                      {col.data_type.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
              {(!table.columns || table.columns.length === 0) && (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No columns found for this table.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DatabaseManager() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    listProfiles()
      .then((res) => {
        setProfiles(res);
        if (res.length > 0) {
          // Select the first active profile by default
          const firstActive = res.find(p => p.connection_status === "connected") || res[0];
          setSelectedProfileId(firstActive.id.toString());
        }
      })
      .catch(() => toast.error("Failed to load profiles"))
      .finally(() => setLoadingProfiles(false));
  }, []);

  useEffect(() => {
    if (!selectedProfileId) {
      setSchema(null);
      return;
    }

    setLoading(true);
    getProfileSchema(selectedProfileId)
      .then((res) => {
        setSchema(res);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch database schema");
        setSchema([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedProfileId]);

  const profileOptions = profiles.map(p => ({
    value: p.id.toString(),
    label: `${p.name} (${p.db_type})`
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Database Manager"
        subtitle="Explore the schemas, tables, and columns of your connected databases."
        action={
          <div style={{ width: 280 }}>
            {profiles.length > 0 && (
              <Select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                options={profileOptions}
              />
            )}
          </div>
        }
      />

      {loadingProfiles ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Database size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Discovering infrastructure...</div>
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No Databases Found"
          description="You need to provision and connect a database profile first."
        />
      ) : loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Columns size={32} className="pulse-glow" style={{ opacity: 0.5, color: "var(--accent)" }} />
          <div>Analyzing database schema...</div>
        </div>
      ) : schema && schema.length > 0 ? (
        <motion.div layout style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Showing schema for <strong>{profiles.find(p => p.id.toString() === selectedProfileId)?.name}</strong></span>
            <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 12 }}>
              {schema.length} Total Tables
            </span>
          </div>
          {schema.map((table, i) => (
            <TableRow key={`${table.name}-${i}`} table={table} />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={TableProperties}
          title="Schema Empty"
          description="No tables were found in this database. It might be empty or the service account lacks permissions to read the schema."
        />
      )}
    </motion.div>
  );
}
