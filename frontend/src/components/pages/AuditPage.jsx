import { useState, useEffect } from "react";
import { Search, Database, ShieldAlert, Activity, CheckCircle, XCircle, ArrowRight, User as UserIcon } from "lucide-react";
import { Card, Input, Badge, PageHeader, EmptyState, Button } from "../ui";
import { getAuditLogs } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_ICONS = {
  success: <CheckCircle size={14} color="var(--success)" />,
  error: <XCircle size={14} color="var(--danger)" />,
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
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Action</div>
              <Badge variant={log.status === "error" ? "danger" : "default"}>{log.action}</Badge>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>User Identity</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                <UserIcon size={16} color="var(--accent)" />
                {log.username || "System"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>IP Address</div>
              <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{log.ip_address || "N/A"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: log.status === "error" ? "var(--danger)" : "var(--success)" }}>
                {STATUS_ICONS[log.status] || STATUS_ICONS.success}
                {log.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Payload</div>
            <pre style={{ background: "#0A0F1E", padding: 20, borderRadius: 12, border: "1px solid var(--bg-border)", overflowX: "auto", fontSize: 13, color: "#D4D4D4", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
              {JSON.stringify(log.details, null, 2)}
            </pre>
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

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((l) => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Security Activity Center"
        subtitle="Monitor all authentication, data access, and infrastructure changes across the ONGC Command Center platform."
      />

      <div style={{ marginBottom: 32 }}>
        <Input 
          placeholder="Search events by action, user, or IP address..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 500 }}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Activity size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Analyzing security logs...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Security Events Found"
          description="There are no audit logs matching your current search filters."
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden", borderRadius: 24, border: "1px solid var(--bg-border)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Timestamp</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>User / Entity</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Action</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Status</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}>Target</th>
                  <th style={{ padding: "20px 24px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--bg-border)" }}></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover-glow"
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderBottom: i === filteredLogs.length - 1 ? "none" : "1px solid var(--bg-border)",
                        background: log.status === "error" ? "rgba(239, 68, 68, 0.05)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
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
                        {log.username || "System"}
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <Badge variant="default">{log.action}</Badge>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: log.status === "error" ? "var(--danger)" : "var(--success)" }}>
                          {STATUS_ICONS[log.status] || STATUS_ICONS.success}
                          {log.status.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px", color: "var(--text-secondary)" }}>
                        {log.details?.target || log.details?.profile_name || log.details?.token_name || "Platform"}
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
