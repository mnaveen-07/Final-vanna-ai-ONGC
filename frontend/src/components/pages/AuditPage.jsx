import { useState, useEffect } from "react";
import { Search, Database, ShieldAlert, Activity, CheckCircle, XCircle, ArrowRight, User as UserIcon, Filter, ArrowUpDown } from "lucide-react";
import { Card, Input, Badge, PageHeader, EmptyState, Button, Select } from "../ui";
import { getAuditLogs } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_ICONS = {
  success: <CheckCircle size={14} color="var(--success)" />,
  error: <XCircle size={14} color="var(--danger)" />,
  failed: <XCircle size={14} color="var(--danger)" />,
  warning: <ShieldAlert size={14} color="var(--warning)" />,
};

function LogDetailsDrawer({ log, onClose }) {
  if (!log) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={{ width: 600, background: "var(--bg-surface)", borderLeft: "1px solid var(--bg-border)", position: "relative", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.5)" }}>
        
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Event Details</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{new Date(log.created_at).toLocaleString()}</div>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div style={{ padding: 32, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Query</div>
              <Badge variant={(log.execution_status === "error" || log.execution_status === "failed") ? "danger" : "default"}>NL Query</Badge>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>User Identity</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                <UserIcon size={16} color="var(--accent)" />
                {log.user?.username || "System"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>IP Address</div>
              <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{log.ip_address || "N/A"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: (log.execution_status === "error" || log.execution_status === "failed") ? "var(--danger)" : "var(--success)" }}>
                {STATUS_ICONS[log.execution_status] || STATUS_ICONS.success}
                {(log.execution_status || "success").toUpperCase()}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Query Payload</div>
            <pre style={{ background: "#0A0F1E", padding: 20, borderRadius: 12, border: "1px solid var(--bg-border)", overflowX: "auto", fontSize: 13, color: "#D4D4D4", fontFamily: "var(--font-mono)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {log.generated_sql || "No SQL generated"}
            </pre>
            {log.error_message && (
              <div style={{ marginTop: 16, padding: 16, background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, color: "var(--danger)", fontSize: 13, border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <strong>Error:</strong> {log.error_message}
              </div>
            )}
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // Sorting and Filtering States
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  // Apply Search, Filter, and Sort
  let processedLogs = logs.filter((l) => 
    (l.natural_language_query || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.ip_address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statusFilter !== "all") {
    processedLogs = processedLogs.filter((l) => {
      const isError = l.execution_status === "error" || l.execution_status === "failed";
      if (statusFilter === "success") return !isError;
      if (statusFilter === "error") return isError;
      return true;
    });
  }

  processedLogs.sort((a, b) => {
    const tA = new Date(a.created_at).getTime();
    const tB = new Date(b.created_at).getTime();
    return sortBy === "newest" ? tB - tA : tA - tB;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Security Activity Center"
        subtitle="Monitor all authentication, data access, and infrastructure changes across the ONGC Command Center platform."
      />

      {/* Controls Bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <Input 
          placeholder="Search queries, users, or IP..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
          icon={<Search size={16} />}
        />
        
        <Select
          options={[
            { value: "all", label: "All Statuses" },
            { value: "success", label: "Successful Queries" },
            { value: "error", label: "Failed Queries" }
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: 160 }}
        />

        <Select
          options={[
            { value: "newest", label: "Sort: Newest First" },
            { value: "oldest", label: "Sort: Oldest First" }
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ minWidth: 160 }}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Activity size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Analyzing security logs...</div>
        </div>
      ) : processedLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Security Events Found"
          description="There are no audit logs matching your current search and filter criteria."
          action={<Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>Clear Filters</Button>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden", borderRadius: 24, border: "1px solid var(--bg-border)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Timestamp</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>User / Entity</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Natural Language Query</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Status</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Performance</th>
                  <th style={{ padding: "20px 24px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processedLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className="hover-glow"
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderBottom: i === processedLogs.length - 1 ? "none" : "1px solid var(--bg-border)",
                        background: (log.execution_status === "error" || log.execution_status === "failed") ? "rgba(239, 68, 68, 0.05)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                        cursor: "pointer"
                      }}
                    >
                      <td style={{ padding: "18px 24px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: "18px 24px", color: "var(--text-primary)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <UserIcon size={12} color="var(--accent)" />
                        </div>
                        {log.user?.username || "System"}
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.natural_language_query}
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: (log.execution_status === "error" || log.execution_status === "failed") ? "var(--danger)" : "var(--success)" }}>
                          {STATUS_ICONS[log.execution_status] || STATUS_ICONS.success}
                          {(log.execution_status || "success").toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px", color: "var(--text-secondary)", fontSize: 13 }}>
                        {log.execution_time_ms ? `${log.execution_time_ms}ms` : "N/A"}
                      </td>
                      <td style={{ padding: "18px 24px", textAlign: "right" }}>
                        <Button variant="ghost" size="sm" style={{ padding: "6px 10px", borderRadius: 8 }}>
                          Details <ArrowRight size={14} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {selectedLog && <LogDetailsDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </AnimatePresence>

    </motion.div>
  );
}
