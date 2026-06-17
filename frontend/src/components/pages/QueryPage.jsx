import { useState, useRef, useEffect } from "react";
import { Send, Eye, Download, Database, TerminalSquare, AlertCircle, CheckCircle, Sparkles, HelpCircle, Code2, Play } from "lucide-react";
import { Card, Button, CodeBlock, Badge, PageHeader } from "../ui";
import { runQuery, previewQuery } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const EXAMPLE_QUERIES = [
  { id: 1, text: "List all the employees who work in the IT department", icon: Users },
  { id: 2, text: "Find the email and mobile number for employees located in Chennai", icon: MapPin },
  { id: 3, text: "Show me all employees who have a grade of E4", icon: Award },
  { id: 4, text: "Count how many employees there are in each department", icon: BarChart2 },
];
import { Users, MapPin, Award, BarChart2 } from "lucide-react";

function ResultTable({ data, columns }) {
  if (!data?.length) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: 14 }}>
      No rows returned for this query.
    </div>
  );

  return (
    <div style={{ overflowX: "auto", background: "var(--bg-elevated)", borderRadius: 16, border: "1px solid var(--bg-border)", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  color: "var(--text-secondary)",
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
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              style={{
                borderBottom: i === data.length - 1 ? "none" : "1px solid var(--bg-border)",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                transition: "background 0.2s"
              }}
              className="hover:bg-[rgba(255,255,255,0.05)]"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: "14px 20px",
                    color: "var(--text-primary)",
                  }}
                >
                  {String(row[col] ?? "")}
                </td>
              ))}
            </motion.tr>
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
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "query_result.csv"; a.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 100 }}>
      <PageHeader
        title="AI Command Bar"
        subtitle="Translate natural language into precise SQL instantly using advanced LLMs."
      />

      {/* Main AI Input Area */}
      <motion.div 
        initial={{ y: 20 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="glass-panel" style={{ padding: 32, marginBottom: 40, borderRadius: 24, boxShadow: "0 12px 48px rgba(0,0,0,0.5)" }}
      >
        
        {/* Token Input */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, background: "rgba(0,0,0,0.2)", padding: "10px 16px", borderRadius: 12 }}>
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
            background: "var(--bg-base)", border: "1px solid var(--bg-border)", borderRadius: 20, padding: "8px 24px",
            display: "flex", flexDirection: "column", transition: "all 0.2s",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ marginTop: 18, color: "var(--accent)" }}><Sparkles size={24} /></div>
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
              placeholder="Ask anything about your databases..."
              style={{
                width: "100%", background: "transparent", border: "none", color: "var(--text-primary)",
                fontSize: 18, resize: "none", outline: "none", padding: "18px 0", minHeight: 64, fontFamily: "inherit"
              }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--bg-border)", padding: "16px 0", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handlePreview} loading={previewLoading} variant="ghost" size="sm" style={{ borderRadius: 20 }}>
                <Eye size={14} /> Preview SQL
              </Button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Press Enter to send</span>
              <Button onClick={handleQuery} loading={loading} size="lg" style={{ borderRadius: 24, padding: "10px 24px" }}>
                <Send size={16} /> Execute
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {!question && !result && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Suggested Queries
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {EXAMPLE_QUERIES.map((q, i) => (
                  <motion.button
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" }}
                    onClick={() => setQuestion(q.text)}
                    style={{
                      padding: "16px", borderRadius: 16, border: "1px solid var(--bg-border)",
                      background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", fontSize: 13, 
                      cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, textAlign: "left"
                    }}
                  >
                    <div style={{ background: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 8, alignSelf: "flex-start" }}><q.icon size={16} color="var(--text-primary)" /></div>
                    {q.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SQL Preview Box */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-panel" style={{ padding: 32, marginBottom: 40, borderRadius: 24, border: "1px solid rgba(0,229,168,0.3)", boxShadow: "0 12px 32px rgba(0,229,168,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--success)", fontWeight: 700, fontSize: 18 }}>
                <TerminalSquare size={20} />
                SQL Generation Preview
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="ghost" size="sm" onClick={() => toast("Query explained! (Mock)", { icon: "💡" })}><HelpCircle size={14} /> Explain</Button>
                <Button variant="success" size="sm" onClick={handleQuery} loading={loading}><Play size={14} /> Run Now</Button>
              </div>
            </div>
            <CodeBlock code={preview.generated_sql} />
            {preview.explanation && (
               <div style={{ marginTop: 20, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
                 {preview.explanation}
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel pulse-glow" style={{ padding: 24, marginBottom: 40, borderRadius: 16, borderLeft: "4px solid var(--danger)", background: "rgba(239, 68, 68, 0.05)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ background: "rgba(239,68,68,0.1)", padding: 8, borderRadius: 50 }}><AlertCircle size={24} color="var(--danger)" /></div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--danger)", fontSize: 16, marginBottom: 6 }}>Query Execution Failed</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{error}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result View */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 40, borderRadius: 24 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <CheckCircle size={24} color="var(--success)" />
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>Execution Results</h3>
                </div>
                <div style={{ fontSize: 15, color: "var(--text-muted)", fontStyle: "italic" }}>
                  "{result.question}"
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 16 }}>
                <Badge variant="default">{result.execution_time_ms}ms latency</Badge>
                <Badge variant="success">{result.row_count} records</Badge>
                <div style={{ width: 1, height: 20, background: "var(--bg-border)", margin: "0 4px" }} />
                <Button variant="ghost" size="sm" onClick={exportCSV} style={{ borderRadius: 12 }}>
                  <Download size={14} /> Export CSV
                </Button>
              </div>
            </div>

            {result.summary && (
              <div style={{
                padding: "20px 24px", background: "linear-gradient(90deg, rgba(255,107,53,0.1), transparent)", borderRadius: 16, borderLeft: "4px solid var(--accent)",
                fontSize: 15, color: "var(--text-primary)", marginBottom: 32, lineHeight: 1.7
              }}>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>AI Insight:</span> {result.summary}
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Code2 size={16} /> Executed SQL
              </div>
              <CodeBlock code={result.generated_sql} />
            </div>

            <div>
               <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Database size={16} /> Data Output
              </div>
              <ResultTable data={result.data} columns={result.columns} />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
