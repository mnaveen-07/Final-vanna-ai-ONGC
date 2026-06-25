import { useEffect, useState } from "react";
import { Users, Database, MessageSquare, Activity, ShieldCheck, Cpu, Key, Clock, PieChart, RefreshCw, CheckCircle, XCircle, ChevronRight, TerminalSquare, TrendingUp } from "lucide-react";
import { AreaChart, Area, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, Badge, ChatBot } from "../ui";
import { getDashboard } from "../../api/client";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const MOCK_STATS = {
  total_users: 12, active_profiles: 8, total_queries_today: 247,
  active_tokens: 19, avg_response_time_ms: 1840, success_rate: 96.4,
  most_queried_db: "PostgreSQL", recent_queries: [],
};

const CHART_DATA = [
  { day: "16", volume: 12, success: 10, latency: 1500 },
  { day: "12", volume: 24, success: 22, latency: 2100 },
  { day: "8", volume: 18, success: 15, latency: 1800 },
  { day: "4", volume: 32, success: 30, latency: 3200 },
];

const PIE_DATA = [
  { name: 'Postgresql', value: 4, color: '#3B82F6' },
  { name: 'Mysql', value: 1, color: '#F59E0B' },
];

const RECENT_QUERIES = [
  { id: 1, query: "list all employees detail", time: "14:28", latency: "479ms", status: "SUCCESS" },
  { id: 2, query: "list all employees detail", time: "14:28", latency: "981ms", status: "SUCCESS" },
  { id: 3, query: "List all the employees who work in the IT department", time: "14:27", latency: "6.3s", status: "BLOCKED" },
  { id: 4, query: "list all employees detail", time: "11:25", latency: "6.8s", status: "SUCCESS" },
  { id: 5, query: "list all employees detail", time: "11:08", latency: "888ms", status: "SUCCESS" },
  { id: 6, query: "list all employees detail", time: "11:08", latency: "959ms", status: "BLOCKED" },
  { id: 7, query: "list all employees detail", time: "11:05", latency: "655ms", status: "SUCCESS" },
  { id: 8, query: "list all employees detail", time: "11:02", latency: "63.7s", status: "BLOCKED" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const successfulQueries = Math.round(stats.total_queries_today * (stats.success_rate / 100));
  const failedQueries = stats.total_queries_today - successfulQueries;

  return (
    <>
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 64 }}>
      
      {/* 1. Header Banner */}
      <motion.div variants={itemVariants} style={{ position: "relative", overflow: "hidden", padding: "40px", borderRadius: 24, background: "linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2, position: "relative" }}>
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <Badge variant="success" style={{ padding: "6px 12px", background: "rgba(16, 185, 129, 0.1)", color: "rgb(16, 185, 129)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>● ALL SYSTEMS OPERATIONAL</Badge>
              <Badge variant="warning" style={{ padding: "6px 12px", background: "rgba(245, 158, 11, 0.1)", color: "rgb(245, 158, 11)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>● OLLAMA LLM ACTIVE</Badge>
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 16px 0", color: "#fff", letterSpacing: "-0.02em" }}>
              Welcome back, <span style={{ color: "var(--accent)" }}>{user?.full_name?.split(' ')[0] || user?.username || 'User'}</span>
            </h1>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.6 }}>
              Your AI Command Center is monitoring <strong>{stats.active_profiles} active databases</strong> and has processed <br/>
              <strong style={{ color: "var(--accent)" }}>{stats.total_queries_today} total queries</strong> with a <strong style={{ color: "var(--success)" }}>{stats.success_rate}% success rate</strong>.
            </div>
          </div>
          
          {/* Clock Widget */}
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "24px 32px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", minWidth: 200 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
              <RefreshCw size={12} /> Refresh
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Stat Cards Row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><MessageSquare size={18} color="var(--accent)" /> <Badge variant="success" style={{background:"rgba(16,185,129,0.1)", color:"#10B981"}}>All Time</Badge></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{stats.total_queries_today}</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Queries</div>
          </div>
        </Card>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Database size={18} color="var(--success)" /></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{stats.active_profiles}</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Active Databases</div>
            <div style={{ fontSize: 11, color: "var(--success)" }}>Connected Profiles</div>
          </div>
        </Card>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><ShieldCheck size={18} color="var(--success)" /> <Badge variant="danger" style={{background:"rgba(239,68,68,0.1)", color:"#EF4444"}}>Degraded</Badge></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{stats.success_rate}%</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Success Rate</div>
          </div>
        </Card>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Key size={18} color="#3B82F6" /></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{stats.active_tokens}</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>API Tokens</div>
            <div style={{ fontSize: 11, color: "#3B82F6" }}>Active Keys</div>
          </div>
        </Card>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Clock size={18} color="#F59E0B" /></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{(stats.avg_response_time_ms / 1000).toFixed(1)}s</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Avg Latency</div>
            <div style={{ fontSize: 11, color: "#F59E0B" }}>End-to-end</div>
          </div>
        </Card>
        <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><Users size={18} color="#8B5CF6" /></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{stats.total_users}</div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Platform Users</div>
            <div style={{ fontSize: 11, color: "#8B5CF6" }}>Registered</div>
          </div>
        </Card>
      </motion.div>

      {/* 3. Query Health Overview */}
      <motion.div variants={itemVariants}>
        <Card style={{ padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}><Activity size={18} color="var(--accent)"/> Query Health Overview</div>
             <div style={{ display: "flex", gap: 16, fontSize: 13, fontWeight: 600 }}>
               <span style={{ color: "var(--success)", display: "flex", alignItems: "center" }}><CheckCircle size={14} style={{ marginRight: 6 }}/> {successfulQueries} Successful</span>
               <span style={{ color: "var(--danger)", display: "flex", alignItems: "center" }}><XCircle size={14} style={{ marginRight: 6 }}/> {failedQueries} Failed</span>
             </div>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, display: "flex", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${stats.success_rate}%`, background: "var(--success)" }} />
            <div style={{ width: `${100 - stats.success_rate}%`, background: "var(--danger)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
             <span>0%</span>
             <span style={{ color: "var(--success)" }}>{stats.success_rate}% success rate</span>
             <span>100%</span>
          </div>
        </Card>
      </motion.div>

      {/* 4. Charts Row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}><TrendingUp size={16} color="var(--accent)"/> Query Volume Trend</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>Last 7 days • Success vs Failed</div>
          <div style={{ flex: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} />
                <Tooltip contentStyle={{ background: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="volume" stroke="#EF4444" fillOpacity={1} fill="url(#colorFailed)" strokeWidth={2} />
                <Area type="monotone" dataKey="success" stroke="#10B981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}><Activity size={16} color="#F59E0B"/> Avg Response Latency</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>End-to-end query latency per day (ms)</div>
          <div style={{ flex: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} />
                <Tooltip contentStyle={{ background: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* 5. DB Engine & Recent Queries Row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
        <Card style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}><Database size={16} color="var(--success)"/> DB Engine Mix</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Connected database types</div>
          <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 250 }}>
             <ResponsiveContainer width="100%" height="100%">
               <RechartsPie>
                 <Pie data={stats.db_engine_mix || PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                   {(stats.db_engine_mix || PIE_DATA).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ background: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
               </RechartsPie>
             </ResponsiveContainer>
             <div style={{ position: "absolute", bottom: 20, left: 0, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
               {(stats.db_engine_mix || PIE_DATA).map((d) => (
                 <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                     <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                     <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                   </div>
                   <span style={{ fontWeight: 700, color: "#fff" }}>{d.value}</span>
                 </div>
               ))}
             </div>
          </div>
        </Card>

        <Card style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}><TerminalSquare size={16} color="#3B82F6"/> Recent Query Activity</div>
            <div onClick={() => navigate('/audit')} style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>View All →</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto" }}>
            {(stats.recent_queries || RECENT_QUERIES).map((q) => {
              const status = (q.execution_status || q.status || "UNKNOWN").toUpperCase();
              const timeStr = q.created_at ? new Date(q.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : q.time;
              
              let latencyStr = q.latency;
              if (q.execution_time_ms != null) {
                if (q.execution_time_ms > 1000) {
                  latencyStr = `${(q.execution_time_ms / 1000).toFixed(1)}s`;
                } else {
                  latencyStr = `${Math.round(q.execution_time_ms)}ms`;
                }
              }

              const isSuccess = status === "SUCCESS";
              
              return (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {isSuccess ? <CheckCircle size={18} color="#10B981" /> : <XCircle size={18} color="#EF4444" />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{q.natural_language_query || q.query}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                      <span>{timeStr}</span>
                      <span style={{ color: isSuccess ? "#F59E0B" : "var(--text-muted)" }}>{latencyStr}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={isSuccess ? "success" : "danger"} style={{ background: isSuccess ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: isSuccess ? "#10B981" : "#EF4444", border: "none" }}>{status}</Badge>
              </div>
            )})}
          </div>
        </Card>
      </motion.div>

      {/* 6. Quick Actions */}
      <motion.div variants={itemVariants} style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={14} color="var(--accent)" /> Quick Actions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div onClick={() => navigate('/query')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} className="hover-glow">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: "var(--accent)" }}><TerminalSquare size={20} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>AI Query Engine</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ask questions in plain English</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div onClick={() => navigate('/profiles')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} className="hover-glow">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: "var(--success)" }}><Database size={20} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Manage Databases</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Connect or configure DB profiles</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div onClick={() => navigate('/tokens')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} className="hover-glow">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: "#3B82F6" }}><Key size={20} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>API Tokens</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Generate or revoke access tokens</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div onClick={() => navigate('/audit')} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} className="hover-glow">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: "#F59E0B" }}><Activity size={20} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Audit Logs</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>View query history & telemetry</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </motion.div>

    </motion.div>
    <ChatBot />
    </>
  );
}
