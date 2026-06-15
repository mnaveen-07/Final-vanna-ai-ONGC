import { useState, useRef, useEffect } from "react";
import { Send, Eye, Download, MessageSquare, Database, TerminalSquare, AlertCircle, CheckCircle } from "lucide-react";
import { Card, Button, CodeBlock, Badge, PageHeader } from "../ui";
import { runQuery, previewQuery } from "../../api/client";
import toast from "react-hot-toast";

const EXAMPLE_QUERIES = [
  "Show total gatepasses created this month",
  "List top 10 regions by drilling activity",
  "How many active users logged in yesterday?",
  "Show average response time for offshore rigs",
];

function ResultTable({ data, columns }) {
  if (!data?.length) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: 14 }}>
      No rows returned for this query.
    </div>
  );

  return (
    <div style={{ overflowX: "auto", background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--bg-border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.03)" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid var(--bg-border)",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="hover-glow"
              style={{
                borderBottom: i === data.length - 1 ? "none" : "1px solid var(--bg-border)",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s"
              }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: "12px 16px",
                    color: "var(--text-primary)",
                  }}
                >
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QueryPage() {
  const [question, setQuestion] = useState("");
  const [apiToken, setApiToken] = useState(localStorage.getItem("query_token") || "");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const textareaRef = useRef(null);

  const saveToken = (t) => {
    setApiToken(t);
    localStorage.setItem("query_token", t);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [question]);

  const handleQuery = async () => {
    if (!question.trim()) return toast.error("Enter a question");
    if (!apiToken.trim()) return toast.error("Enter an API token in Settings or below");
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await runQuery(question, apiToken);
      setResult({ ...res, question });
      toast.success(`${res.row_count} row(s) returned`);
      setQuestion("");
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!question.trim()) return;
    if (!apiToken.trim()) return toast.error("Enter an API token");
    setPreviewLoading(true);
    try {
      const res = await previewQuery(question, apiToken);
      setPreview(res);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result?.data?.length) return;
    const header = result.columns.join(",");
    const rows = result.data.map((r) => result.columns.map((c) => `"${r[c] ?? ""}"`).join(","));
    const csv = [header, ...rows].join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "query_result.csv"; a.click();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 100 }}>
      <PageHeader
        title="AI Query Assistant"
        subtitle="Translate natural language into precise SQL instantly."
      />

      {/* Main AI Input Area */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 32, borderRadius: 20 }}>
        
        {/* Token Input (Only show prominently if missing, otherwise subtle) */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <Database size={16} color="var(--text-muted)" />
          <input
            type="password"
            placeholder="Enter API Token (vnk_...)"
            value={apiToken}
            onChange={(e) => saveToken(e.target.value)}
            style={{
              background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 13, outline: "none", flex: 1
            }}
          />
          {apiToken && <Badge variant="success">Connected</Badge>}
        </div>

        {/* Chat Box */}
        <div 
          className="input-focus-ring"
          style={{
            background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 16, padding: "4px 16px",
            display: "flex", flexDirection: "column", transition: "all 0.2s"
          }}
        >
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleQuery();
              }
            }}
            placeholder="Ask a question about your database..."
            style={{
              width: "100%", background: "transparent", border: "none", color: "var(--text-primary)",
              fontSize: 16, resize: "none", outline: "none", padding: "16px 0", minHeight: 56, fontFamily: "inherit"
            }}
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--bg-border)", padding: "12px 0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handlePreview} loading={previewLoading} variant="ghost" size="sm" style={{ borderRadius: 20 }}>
                <Eye size={14} /> Preview SQL
              </Button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Press Enter to send</span>
              <Button onClick={handleQuery} loading={loading} style={{ borderRadius: 20, padding: "8px 20px" }}>
                <Send size={16} /> Send
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {!question && !result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Suggested Prompts
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="hover-glow"
                  style={{
                    padding: "8px 16px", borderRadius: 20, border: "1px solid var(--bg-border)",
                    background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SQL Preview Box */}
      {preview && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 32, borderRadius: 16, borderLeft: "4px solid var(--accent-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--accent-secondary)", fontWeight: 600 }}>
            <TerminalSquare size={18} />
            SQL Preview
          </div>
          <CodeBlock code={preview.generated_sql} />
          {preview.explanation && (
             <div style={{ marginTop: 12, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
               {preview.explanation}
             </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel pulse-glow" style={{ padding: 24, marginBottom: 32, borderRadius: 16, borderLeft: "4px solid var(--danger)", background: "rgba(220, 38, 38, 0.05)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle size={20} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 700, color: "var(--danger)", fontSize: 15, marginBottom: 4 }}>Query Execution Failed</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Result View */}
      {result && (
        <div className="glass-panel" style={{ padding: 32, borderRadius: 20, animation: "fadeIn 0.4s ease" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <CheckCircle size={20} color="var(--success)" />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Query Results</h3>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                "{result.question}"
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Badge variant="default">{result.execution_time_ms}ms</Badge>
              <Badge variant="success">{result.row_count} rows</Badge>
              <Button variant="ghost" size="sm" onClick={exportCSV} style={{ borderRadius: 20 }}>
                <Download size={14} /> Export CSV
              </Button>
            </div>
          </div>

          {result.summary && (
            <div style={{
              padding: "16px 20px", background: "var(--accent-glow)", borderRadius: 12, border: "1px solid rgba(229, 57, 53, 0.2)",
              fontSize: 15, color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.6
            }}>
              <span style={{ fontWeight: 600, color: "var(--accent)" }}>AI Insight:</span> {result.summary}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Executed SQL
            </div>
            <CodeBlock code={result.generated_sql} />
          </div>

          <div>
             <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Data Output
            </div>
            <ResultTable data={result.data} columns={result.columns} />
          </div>

        </div>
      )}

    </div>
  );
}
