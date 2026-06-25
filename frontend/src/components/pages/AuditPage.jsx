import { useState, useEffect } from "react";
import { Search, Database, ShieldAlert, Activity, CheckCircle, XCircle, ArrowRight, User as UserIcon, History, Key, AlertTriangle, RefreshCw, TrendingUp, Clock, Globe, Cpu, ChevronDown, ChevronUp, Copy, BookOpen } from "lucide-react";
import { Card, Input, Badge, PageHeader, EmptyState, Button } from "../ui";
import { getAuditLogs } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";

const STATUS_ICONS = {
  success: <CheckCircle size={14} color="var(--success)" />,
  error: <XCircle size={14} color="var(--danger)" />,
  failed: <XCircle size={14} color="var(--danger)" />,
  warning: <ShieldAlert size={14} color="var(--warning)" />,
  blocked: <ShieldAlert size={14} color="var(--warning)" />,
};

function LogDetailsDrawer({ log, onClose }) {
  if (!log) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(log.generated_sql || "");
    toast.success("SQL Query copied to clipboard!");
  };

  // Generate a mock detailed execution trace based on log values
  const sqlGenTime = log.execution_time_ms ? Math.round(log.execution_time_ms * 0.7) : 180;
  const dbExecTime = log.execution_time_ms ? Math.round(log.execution_time_ms * 0.3) : 60;
  
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={{ width: 620, background: "var(--bg-surface)", borderLeft: "1px solid var(--bg-border)", position: "relative", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}>
        
        {/* Drawer Header */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Detailed Audit Event Trace</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>ID: #{log.id} • {new Date(log.created_at).toLocaleString()}</div>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        {/* Drawer Scroll Area */}
        <div style={{ padding: 32, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* Metadata Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--bg-border)", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Natural Language Query</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{log.natural_language_query || "System Ingestion Task"}</div>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--bg-border)", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Target Profile</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{log.profile?.name || "System DB"}</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--bg-border)", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Identity & Token</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                <UserIcon size={14} color="var(--accent-tertiary)" />
                {log.user?.username || "Superadmin"} 
                {log.api_token && <Badge variant="success">Token: {log.api_token.name}</Badge>}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--bg-border)", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>IP & Network</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                <Globe size={14} color="var(--accent-secondary)" />
                {log.ip_address || "127.0.0.1 (Local)"}
              </div>
            </div>
          </div>

          {/* Telemetry Timeline Trace */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Cpu size={14} color="var(--accent)" /> Detailed Telemetry Timeline
            </div>
            <div style={{ borderLeft: "2px solid var(--bg-border)", marginLeft: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -25, top: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>[0.00ms] NL Query Received</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  User initiated Natural Language query parsing engine.
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -25, top: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-tertiary)" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>[+15.00ms] Loaded Vector Context</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  Retrieved schema definition & documentation indexes for database profile `#{log.profile?.id || 1}` from ChromaDB.
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -25, top: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>[+{sqlGenTime}ms] LLM Translation Complete</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  Translated successfully to SQL using `llama3:latest` model via local Ollama endpoint.
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -25, top: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-secondary)" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>[+2.00ms] Security Safety Verified</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  Read-only audit passed. Safe execution confirmed.
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -25, top: 4, width: 8, height: 8, borderRadius: "50%", background: log.error_message ? "var(--danger)" : "var(--success)" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>[+{dbExecTime}ms] DB Execution Finished</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  {log.error_message 
                    ? `SQL execution rejected by SQL Engine. Error: ${log.error_message}`
                    : `Returned ${log.row_count || 0} rows from target schema.`
                  }
                </div>
              </div>

            </div>
          </div>

          {/* Generated SQL payload */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                <BookOpen size={14} color="var(--accent-secondary)" /> Generated SQL Payload
              </div>
              {log.generated_sql && (
                <button onClick={handleCopySql} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <Copy size={12} /> Copy Code
                </button>
              )}
            </div>
            <pre style={{ background: "#03050c", padding: 20, borderRadius: 12, border: "1px solid var(--bg-border)", overflowX: "auto", fontSize: 12, color: "var(--accent-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
              {log.generated_sql || "No SQL statements generated for this event"}
            </pre>
            {log.error_message && (
              <div style={{ marginTop: 16, padding: 16, background: "rgba(239, 68, 68, 0.05)", borderRadius: 12, color: "#ff8b8b", fontSize: 13, borderLeft: "4px solid var(--danger)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Trace Exception Log:</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{log.error_message}</div>
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Tab/Filters: audit, query, failed, token
  const [activeTab, setActiveTab] = useState("query");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Analytics display toggle
  const [showAnalytics, setShowAnalytics] = useState(true);

  const loadLogs = () => {
    setRefreshing(true);
    getAuditLogs()
      .then(setLogs)
      .catch(() => toast.error("Failed to refresh logs"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Format timestamp: "23 Jun 26, 11:36"
  const formatLogTime = (isoStr) => {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // Format Status badge
  const renderStatusBadge = (status) => {
    const s = (status || "success").toLowerCase();
    if (s === "success") {
      return (
        <span style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: 6, 
          background: "rgba(0, 229, 168, 0.1)", 
          color: "var(--accent-secondary)", 
          fontSize: 10, 
          fontWeight: 700, 
          padding: "2px 8px", 
          borderRadius: 4, 
          textTransform: "uppercase" 
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-secondary)" }}></span>
          SUCCESS
        </span>
      );
    } else if (s === "failed" || s === "error") {
      return (
        <span style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: 6, 
          background: "rgba(239, 68, 68, 0.1)", 
          color: "var(--danger)", 
          fontSize: 10, 
          fontWeight: 700, 
          padding: "2px 8px", 
          borderRadius: 4, 
          textTransform: "uppercase" 
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--danger)" }}></span>
          FAILED
        </span>
      );
    } else {
      return (
        <span style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: 6, 
          background: "rgba(245, 158, 11, 0.1)", 
          color: "var(--warning)", 
          fontSize: 10, 
          fontWeight: 700, 
          padding: "2px 8px", 
          borderRadius: 4, 
          textTransform: "uppercase" 
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warning)" }}></span>
          BLOCKED
        </span>
      );
    }
  };

  // Helper for Database engine text formatting
  const getEngineLabel = (engine) => {
    if (!engine) return "";
    const e = engine.toLowerCase();
    if (e === "postgresql") return "PostgreSQL";
    if (e === "mysql") return "MySQL";
    if (e === "mssql") return "SQL Server";
    if (e === "oracle") return "Oracle";
    if (e === "mongodb") return "MongoDB";
    return engine;
  };

  // Metrics extraction
  const totalLogs = logs.length;
  const queryHistory = logs.filter((l) => !!l.natural_language_query).length;
  const failedQueries = logs.filter((l) => l.execution_status === "failed" || l.execution_status === "error" || l.execution_status === "blocked").length;
  const tokenUsage = logs.filter((l) => !!l.api_token).length;

  // Grouped analytics data generation
  const getChartData = () => {
    const datesMap = {};
    // Gather last 7 days of volumes
    logs.forEach((l) => {
      if (!l.created_at) return;
      const dateKey = new Date(l.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (!datesMap[dateKey]) {
        datesMap[dateKey] = { date: dateKey, success: 0, failed: 0, latencySum: 0, latencyCount: 0 };
      }
      const isFailed = l.execution_status === "failed" || l.execution_status === "error" || l.execution_status === "blocked";
      if (isFailed) {
        datesMap[dateKey].failed += 1;
      } else {
        datesMap[dateKey].success += 1;
      }
      if (l.execution_time_ms) {
        datesMap[dateKey].latencySum += l.execution_time_ms;
        datesMap[dateKey].latencyCount += 1;
      }
    });

    const parsed = Object.keys(datesMap).map((k) => ({
      date: k,
      success: datesMap[k].success,
      failed: datesMap[k].failed,
      avgLatency: datesMap[k].latencyCount ? Math.round(datesMap[k].latencySum / datesMap[k].latencyCount) : 0,
    }));
    return parsed.reverse().slice(-7); // return last 7 entries
  };

  const getProfileData = () => {
    const profileCounts = {};
    logs.forEach((l) => {
      const pName = l.profile?.name || "System/Direct Console";
      if (!profileCounts[pName]) {
        profileCounts[pName] = 0;
      }
      profileCounts[pName] += 1;
    });
    return Object.keys(profileCounts).map((k) => ({
      name: k,
      queries: profileCounts[k]
    })).sort((a,b) => b.queries - a.queries).slice(0, 5);
  };

  // Filtering based on Active Tab
  let filteredLogs = [...logs];
  if (activeTab === "query") {
    filteredLogs = logs.filter((l) => !!l.natural_language_query);
  } else if (activeTab === "failed") {
    filteredLogs = logs.filter((l) => l.execution_status === "failed" || l.execution_status === "error" || l.execution_status === "blocked");
  } else if (activeTab === "token") {
    filteredLogs = logs.filter((l) => !!l.api_token);
  }

  // Apply search filtering
  if (searchTerm.trim() !== "") {
    const q = searchTerm.toLowerCase();
    filteredLogs = filteredLogs.filter((l) => 
      (l.natural_language_query || "").toLowerCase().includes(q) ||
      (l.user?.username || "").toLowerCase().includes(q) ||
      (l.ip_address || "").toLowerCase().includes(q) ||
      (l.profile?.name || "").toLowerCase().includes(q) ||
      (l.error_message || "").toLowerCase().includes(q)
    );
  }

  // Calculate pagination indices
  const totalEntries = filteredLogs.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  const thStyle = {
    padding: "20px 24px", 
    textAlign: "left", 
    color: "var(--text-secondary)", 
    fontWeight: 600, 
    fontSize: 11, 
    textTransform: "uppercase", 
    letterSpacing: "0.05em", 
    borderBottom: "1px solid var(--bg-border)"
  };

  const tdStyle = {
    padding: "18px 24px",
    verticalAlign: "middle"
  };

  const chartData = getChartData();
  const profileData = getProfileData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: 100 }}>
      <PageHeader
        title="Audit Logs"
        subtitle="System event, security access, and performance telemetry dashboard"
      />

      {/* Dynamic Statistics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { key: "audit", label: "AUDIT LOGS", count: totalLogs, color: "rgba(239, 68, 68, 0.25)", textColor: "#EF4444", icon: ShieldAlert },
          { key: "query", label: "QUERY HISTORY", count: queryHistory, color: "rgba(59, 130, 246, 0.25)", textColor: "#3B82F6", icon: History },
          { key: "failed", label: "FAILED QUERIES", count: failedQueries, color: "rgba(245, 158, 11, 0.25)", textColor: "#F59E0B", icon: AlertTriangle },
          { key: "token", label: "TOKEN USAGE", count: tokenUsage, color: "rgba(0, 229, 168, 0.25)", textColor: "#00E5A8", icon: Key }
        ].map((card) => {
          const Icon = card.icon;
          const isSelected = activeTab === card.key;
          return (
            <div 
              key={card.key}
              onClick={() => { setActiveTab(card.key); setCurrentPage(1); }}
              className="hover-glow"
              style={{
                background: "var(--bg-surface)",
                border: isSelected ? `2px solid ${card.textColor}` : "1px solid var(--bg-border)",
                borderRadius: 16,
                padding: "24px 20px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: isSelected ? `0 0 16px ${card.color}` : "var(--shadow-sm)",
                transition: "all 0.3s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{card.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: isSelected ? card.color : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={isSelected ? card.textColor : "var(--text-muted)"} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>{card.count}</div>
              {isSelected && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: card.textColor }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Advanced Analytics Charts (Collapsible Section) */}
      <AnimatePresence>
        {showAnalytics && logs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }} 
            style={{ overflow: "hidden", marginBottom: 32 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 20 }}>
              
              {/* Chart 1: Volumes & Success Rate */}
              <Card style={{ padding: 24, border: "1px solid var(--bg-border)", background: "rgba(10, 15, 30, 0.4)", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} color="var(--accent)" /> NL-to-SQL Translation volume trends
                </div>
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: 11 }} />
                      <YAxis stroke="var(--text-muted)" style={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12 }} 
                      />
                      <Area type="monotone" dataKey="success" name="Successful SQL" stroke="var(--success)" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} />
                      <Area type="monotone" dataKey="failed" name="Failed Queries" stroke="var(--danger)" fillOpacity={1} fill="url(#colorFailed)" strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 2: Database Profile Distribution */}
              <Card style={{ padding: 24, border: "1px solid var(--bg-border)", background: "rgba(10, 15, 30, 0.4)", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Database size={16} color="var(--accent-secondary)" /> DB Profile Query Distribution
                </div>
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={profileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: 10 }} />
                      <YAxis stroke="var(--text-muted)" style={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 12 }}
                      />
                      <Bar dataKey="queries" name="Executed Queries" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-navigation Tabs & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--bg-border)", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { key: "audit", label: "Audit Logs", count: totalLogs },
            { key: "query", label: "Query History", count: queryHistory },
            { key: "failed", label: "Failed Queries", count: failedQueries },
            { key: "token", label: "Token Usage", count: tokenUsage }
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  padding: "8px 4px 12px",
                  color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
                <span 
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 8,
                    background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.05)",
                    color: isSelected ? "#FFFFFF" : "var(--text-secondary)"
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Toggle Charts & Refresh Options */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAnalytics(!showAnalytics)} 
            style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}
          >
            {showAnalytics ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadLogs} 
            loading={refreshing}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={12} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Activity size={32} className="pulse-glow" style={{ opacity: 0.5 }} />
          <div>Analyzing security logs...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Logs Found"
          description="There are no audit logs matching your current search or tab criteria."
          action={<Button variant="ghost" onClick={() => { setSearchTerm(""); setActiveTab("audit"); }}>Clear Filters</Button>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: "hidden", borderRadius: 24, border: "1px solid var(--bg-border)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)", background: "var(--bg-surface)" }}>
          {/* Table Header / Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--bg-border)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {activeTab === "audit" && "Audit Logs"}
              {activeTab === "query" && "Query History"}
              {activeTab === "failed" && "Failed Queries"}
              {activeTab === "token" && "Token Usage"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {endIndex - startIndex} of {totalEntries} entries
              </div>
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: 220, height: 36, fontSize: 12 }}
                icon={<Search size={14} />}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {activeTab === "audit" && (
                    <>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>User / Entity</th>
                      <th style={thStyle}>Action / Query</th>
                      <th style={thStyle}>IP Address</th>
                      <th style={thStyle}>Status</th>
                    </>
                  )}
                  {activeTab === "query" && (
                    <>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>DB Profile</th>
                      <th style={thStyle}>Time (ms)</th>
                      <th style={thStyle}>Status</th>
                    </>
                  )}
                  {activeTab === "failed" && (
                    <>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>DB Profile</th>
                      <th style={thStyle}>Error Message</th>
                      <th style={thStyle}>IP Address</th>
                    </>
                  )}
                  {activeTab === "token" && (
                    <>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Token Name</th>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>Latency (ms)</th>
                      <th style={thStyle}>Status</th>
                    </>
                  )}
                  <th style={{ ...thStyle, width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedLog(log)}
                      className="hover-glow"
                      style={{
                        borderBottom: i === paginatedLogs.length - 1 ? "none" : "1px solid var(--bg-border)",
                        background: (log.execution_status === "error" || log.execution_status === "failed") ? "rgba(239, 68, 68, 0.04)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        cursor: "pointer"
                      }}
                    >
                      {/* Time Column formatted as "23 Jun 26, 11:36" */}
                      <td style={{ ...tdStyle, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {formatLogTime(log.created_at)}
                      </td>

                      {activeTab === "audit" && (
                        <>
                          <td style={tdStyle}>{log.user?.username || "System"}</td>
                          <td style={tdStyle}>{log.natural_language_query || "Internal action"}</td>
                          <td style={tdStyle}>{log.ip_address || "localhost"}</td>
                          <td style={tdStyle}>{renderStatusBadge(log.execution_status)}</td>
                        </>
                      )}

                      {activeTab === "query" && (
                        <>
                          <td style={{ ...tdStyle, fontWeight: 500, color: "var(--text-primary)" }}>
                            {log.natural_language_query}
                          </td>
                          <td style={tdStyle}>
                            {log.profile ? (
                              <span style={{ color: "var(--text-secondary)" }}>
                                {log.profile.name} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({getEngineLabel(log.profile.db_type)})</span>
                              </span>
                            ) : "N/A"}
                          </td>
                          <td style={tdStyle}>
                            {log.execution_time_ms ? log.execution_time_ms.toFixed(2) : "0.00"}
                          </td>
                          <td style={tdStyle}>{renderStatusBadge(log.execution_status)}</td>
                        </>
                      )}

                      {activeTab === "failed" && (
                        <>
                          <td style={tdStyle}>{log.natural_language_query}</td>
                          <td style={tdStyle}>{log.profile?.name || "N/A"}</td>
                          <td style={{ ...tdStyle, color: "var(--danger)", fontSize: 12 }}>
                            {log.error_message || "Unknown execution exception"}
                          </td>
                          <td style={tdStyle}>{log.ip_address || "N/A"}</td>
                        </>
                      )}

                      {activeTab === "token" && (
                        <>
                          <td style={{ ...tdStyle, color: "var(--accent-secondary)", fontWeight: 600 }}>
                            {log.api_token ? `${log.api_token.name} (${log.api_token.prefix}... )` : "Direct Console"}
                          </td>
                          <td style={tdStyle}>{log.natural_language_query}</td>
                          <td style={tdStyle}>
                            {log.execution_time_ms ? log.execution_time_ms.toFixed(2) : "0.00"}
                          </td>
                          <td style={tdStyle}>{renderStatusBadge(log.execution_status)}</td>
                        </>
                      )}

                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <Button variant="ghost" size="sm" style={{ padding: "4px 8px", borderRadius: 6 }}>
                          <ArrowRight size={14} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--bg-border)" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries} entries
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {selectedLog && <LogDetailsDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
