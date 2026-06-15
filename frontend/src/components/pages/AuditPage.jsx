import { useEffect, useState, useMemo } from "react";
import { ScrollText, Search, RefreshCw, Terminal, Filter, ArrowUpDown } from "lucide-react";
import { Card, Badge, PageHeader, Button } from "../ui";
import { getAuditLogs } from "../../api/client";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  success: "success",
  failed: "danger",
  blocked: "warning",
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time_desc"); // time_desc, time_asc, duration_desc, rows_desc

  const load = (p = 1) => {
    setLoading(true);
    getAuditLogs({ page: p, page_size: 50 })
      .then(setLogs)
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const processedLogs = useMemo(() => {
    let result = [...logs];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.natural_language_query?.toLowerCase().includes(q) ||
          l.user?.full_name?.toLowerCase().includes(q) ||
          l.user?.username?.toLowerCase().includes(q) ||
          l.generated_sql?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((l) => l.execution_status?.toLowerCase() === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "time_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "duration_desc":
          return (b.execution_time_ms || 0) - (a.execution_time_ms || 0);
        case "rows_desc":
          return (b.row_count || 0) - (a.row_count || 0);
        case "time_desc":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return result;
  }, [logs, search, statusFilter, sortBy]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete history of all queries executed through the platform"
        action={
          <Button variant="ghost" onClick={() => load()} loading={loading} style={{ borderRadius: 20 }}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        }
      />

      {/* Controls Bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        
        {/* Search */}
        <div className="input-focus-ring" style={{ position: "relative", flex: 1, minWidth: 280, borderRadius: 20, transition: "all 0.2s" }}>
          <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--accent)" }} />
          <input
            placeholder="Search intent, user, or SQL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", background: "var(--bg-surface)", border: "1px solid var(--bg-border)",
              borderRadius: 20, padding: "12px 16px 12px 42px", color: "var(--text-primary)",
              fontSize: 14, outline: "none", boxShadow: "var(--shadow-sm)",
            }}
          />
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-surface)", borderRadius: 20, padding: "4px", border: "1px solid var(--bg-border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ padding: "0 12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
              <Filter size={14} /> Status:
            </div>
            {["all", "success", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "6px 16px", borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                  background: statusFilter === status ? "var(--accent-glow)" : "transparent",
                  color: statusFilter === status ? "var(--accent)" : "var(--text-secondary)",
                  transition: "all 0.2s", textTransform: "capitalize"
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-surface)", borderRadius: 20, padding: "4px 12px", border: "1px solid var(--bg-border)", boxShadow: "var(--shadow-sm)" }}>
            <ArrowUpDown size={14} color="var(--text-muted)" style={{ marginRight: 8 }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 13,
                fontWeight: 500, outline: "none", cursor: "pointer"
              }}
            >
              <option value="time_desc" style={{ background: "var(--bg-base)" }}>Newest First</option>
              <option value="time_asc" style={{ background: "var(--bg-base)" }}>Oldest First</option>
              <option value="duration_desc" style={{ background: "var(--bg-base)" }}>Slowest Queries</option>
              <option value="rows_desc" style={{ background: "var(--bg-base)" }}>Most Rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {loading && logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading telemetry…</div>
        ) : processedLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
            <ScrollText size={48} style={{ opacity: 0.2, margin: "0 auto 16px", color: "var(--accent)" }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>No logs found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--bg-border)" }}>
                  {["Time", "User", "Intent", "Status", "SQL Segment", "Metrics", "IP"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "16px 20px", textAlign: "left", color: "var(--text-muted)",
                        fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover-glow"
                    style={{ borderBottom: "1px solid var(--bg-border)", transition: "all 0.2s", background: "transparent" }}
                  >
                    <td style={{ padding: "16px 20px", color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      {log.user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700, fontSize: 12 }}>
                            {log.user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>{log.user.full_name}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>@{log.user.username}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
                          <Terminal size={14} /> System / API
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px", color: "var(--text-secondary)", fontWeight: 500,
                        maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                      title={log.natural_language_query}
                    >
                      {log.natural_language_query}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <Badge variant={STATUS_BADGE[log.execution_status] || "default"}>
                        {log.execution_status}
                      </Badge>
                    </td>
                    <td
                      className="sql-mono"
                      style={{
                        padding: "16px 20px", color: "var(--accent-secondary)",
                        maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                      title={log.generated_sql}
                    >
                      {log.generated_sql || "—"}
                    </td>
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{log.row_count ?? "0"} rows</span>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--bg-border)" }}></span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{log.execution_time_ms ? `${Math.round(log.execution_time_ms)}ms` : "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>
                      {log.ip_address || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
