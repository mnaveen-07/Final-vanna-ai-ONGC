import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Database, Loader2, Sparkles, Code2, AlertCircle } from "lucide-react";
import { runQuery } from "../../api/client";

let globalChatOpen = false;
let globalChatHistory = [
  { type: "bot", text: "Hi! Ask me anything about your databases.", id: 1 }
];

function ResultPreview({ msg }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!msg.data || !msg.columns || msg.data.length === 0) return null;

  const rowsToShow = expanded ? msg.data : msg.data.slice(0, 5);

  return (
    <div style={{ 
      background: "var(--bg-base)", border: "1px solid var(--bg-border)", borderRadius: 12, 
      padding: "12px", overflowX: "auto"
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
        <Database size={12}/> Results Preview
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
            {msg.columns.map(col => (
              <th key={col} style={{ padding: "6px 8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsToShow.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: "1px solid var(--bg-border)" }}>
              {msg.columns.map(col => (
                <td key={col} style={{ padding: "6px 8px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{String(row[col] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {msg.data.length > 5 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{ 
              background: "transparent", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", 
              padding: "4px 12px", borderRadius: 12, cursor: "pointer", fontSize: 11, fontWeight: 500,
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
          >
            {expanded ? "Show Less" : `Show All (${msg.data.length} rows)`}
          </button>
        </div>
      )}
    </div>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(globalChatOpen);
  const [messages, setMessages] = useState(globalChatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState(localStorage.getItem("query_token") || "");
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    globalChatOpen = isOpen;
  }, [isOpen]);

  useEffect(() => {
    globalChatHistory = messages;
  }, [messages]);

  const saveToken = (t) => {
    setApiToken(t);
    localStorage.setItem("query_token", t);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!apiToken.trim()) {
      setMessages(prev => [...prev, { type: "error", text: "Please provide an API token first.", id: Date.now() }]);
      return;
    }

    const userMsg = { type: "user", text: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await runQuery(userMsg.text, apiToken);
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: res.summary || `Returned ${res.row_count} rows in ${res.execution_time_ms}ms.`,
        sql: res.generated_sql,
        data: res.data,
        columns: res.columns,
        id: Date.now() + 1
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { type: "error", text: e.response?.data?.detail || e.message, id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const chatbotContent = (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              width: 60,
              height: 60,
              borderRadius: 30,
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)",
              color: "white",
              border: "none",
              boxShadow: "0 12px 24px rgba(255, 107, 53, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 9999
            }}
          >
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-panel"
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              width: 420,
              height: 600,
              maxHeight: "80vh",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "var(--shadow-hover)",
              zIndex: 9999,
              background: "var(--bg-surface)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--bg-border)"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px",
              background: "linear-gradient(90deg, rgba(255, 107, 53, 0.1), rgba(59, 130, 246, 0.05))",
              borderBottom: "1px solid var(--bg-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  background: "var(--accent)", padding: 8, borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)"
                }}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Vanna AI Assistant</div>
                  <div style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success)" }} />
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Token Input */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--bg-border)", background: "var(--bg-elevated)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg-base)", padding: "8px 12px", borderRadius: 12 }}>
                <Database size={14} color="var(--text-muted)" />
                <input
                  type="password"
                  placeholder="API Token (vnk_...)"
                  value={apiToken}
                  onChange={(e) => saveToken(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 12, outline: "none", flex: 1 }}
                />
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: msg.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.type === "user" ? "var(--accent)" : msg.type === "error" ? "rgba(239, 68, 68, 0.1)" : "var(--bg-elevated)",
                    color: msg.type === "user" ? "#fff" : msg.type === "error" ? "var(--danger)" : "var(--text-primary)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    border: msg.type === "error" ? "1px solid rgba(239, 68, 68, 0.3)" : msg.type === "bot" ? "1px solid var(--bg-border)" : "none",
                    boxShadow: msg.type === "user" ? "0 4px 12px var(--accent-glow)" : "none"
                  }}>
                    {msg.type === "error" && <AlertCircle size={16} style={{ marginBottom: 4, display: "block" }} />}
                    {msg.text}
                  </div>
                  
                  {msg.sql && (
                    <div style={{ 
                      background: "var(--bg-base)", border: "1px solid var(--bg-border)", borderRadius: 12, 
                      padding: "12px", fontSize: 11, color: "var(--text-secondary)", overflowX: "auto", fontFamily: "monospace"
                    }}>
                      <div style={{ color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Code2 size={12}/> Generated SQL</div>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{msg.sql}</pre>
                    </div>
                  )}

                  <ResultPreview msg={msg} />
                </motion.div>
              ))}
              {loading && (
                <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={18} color="var(--accent)" /></motion.div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "16px", borderTop: "1px solid var(--bg-border)", background: "var(--bg-elevated)" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, background: "var(--bg-base)",
                border: "1px solid var(--bg-border)", borderRadius: 24, padding: "6px 6px 6px 16px",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
              }}>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                    background: "var(--accent)", color: "white", border: "none", borderRadius: 20,
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)"
                  }}
                >
                  <Send size={16} style={{ marginLeft: -2 }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(chatbotContent, document.body);
}
