import { useEffect, useState } from "react";
import { Users, Database, MessageSquare, Clock, TrendingUp, Activity, ShieldCheck, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, Badge, StatCard } from "../ui";
import { getDashboard } from "../../api/client";
import { motion } from "framer-motion";

const MOCK_STATS = {
  total_users: 12, active_profiles: 8, total_queries_today: 247,
  active_tokens: 19, avg_response_time_ms: 1840, success_rate: 96.4,
  most_queried_db: "PostgreSQL", recent_queries: [],
};

const MOCK_CHART = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  queries: Math.floor(Math.random() * 300 + 80),
  success: Math.floor(Math.random() * 280 + 60),
}));

const AI_FEED = [
  { id: 1, type: "query", text: "Complex aggregations executed successfully on PostgreSQL instance.", time: "2m ago", status: "success" },
  { id: 2, type: "model", text: "Local Llama 3 instance spun up for intense reasoning task.", time: "14m ago", status: "info" },
  { id: 3, type: "db", text: "MongoDB test database schema ingested successfully.", time: "1h ago", status: "success" },
  { id: 4, type: "alert", text: "Elevated response time detected on Oracle cluster.", time: "2h ago", status: "warning" },
  { id: 5, type: "auth", text: "New API token provisioned for 'Data Pipeline A'.", time: "5h ago", status: "info" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      
      {/* Dynamic Hero Banner */}
      <motion.div variants={itemVariants} className="glass-panel" style={{
        position: "relative",
        overflow: "hidden",
        padding: "48px 56px",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
      }}>
        {/* Decorative Orbs */}
        <div style={{ position: "absolute", top: -100, right: -50, width: 300, height: 300, background: "var(--accent)", filter: "blur(120px)", opacity: 0.15, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -100, left: 100, width: 250, height: 250, background: "var(--accent-tertiary)", filter: "blur(120px)", opacity: 0.15, borderRadius: "50%" }} />
        
        {/* Top Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,229,168,0.1)", border: "1px solid rgba(0,229,168,0.2)", padding: "6px 12px", borderRadius: 20 }}>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 8px var(--success)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", letterSpacing: "0.05em", textTransform: "uppercase" }}>System Online</span>
          </div>
          <Badge variant="info"><Cpu size={12} style={{ marginRight: 4 }}/> Default Model Active</Badge>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto", fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <h1 style={{ fontSize: 42, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", zIndex: 1, marginTop: 8 }}>
          Welcome back, <span style={{ background: "linear-gradient(90deg, var(--text-primary), var(--text-muted))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Naveen</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, zIndex: 1, lineHeight: 1.6 }}>
          Your AI Command Center is monitoring <strong>{stats.active_profiles} active databases</strong> and processing natural language telemetry in real-time.
        </p>
      </motion.div>

      {/* Abstract Stat Cards row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        <StatCard label="Total Queries Today" value={stats.total_queries_today} icon={MessageSquare} color="var(--accent)" trend="↑ 12%" />
        <StatCard label="Active Databases" value={stats.active_profiles} icon={Database} color="var(--accent-secondary)" trend="Stable" />
        <StatCard label="Platform Success Rate" value={`${stats.success_rate}%`} icon={ShieldCheck} color="var(--success)" trend="↑ 2.4%" />
        <StatCard label="Active Users" value={stats.total_users} icon={Users} color="var(--accent-tertiary)" trend="↑ 1" />
      </motion.div>

      {/* Main content grid: Chart + AI Feed */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
        
        {/* Chart */}
        <Card style={{ padding: "32px", borderRadius: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Query Volume</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Last 7 days performance metrics</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge variant="default">7D</Badge>
              <Badge variant="default">30D</Badge>
            </div>
          </div>
          
          <div style={{ flex: 1, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-tertiary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-tertiary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 15, 30, 0.9)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 12,
                    fontSize: 13,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(12px)"
                  }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Area type="monotone" dataKey="queries" stroke="var(--accent)" strokeWidth={3} fill="url(#gTotal)" name="Total Queries" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--accent)" }} />
                <Area type="monotone" dataKey="success" stroke="var(--accent-tertiary)" strokeWidth={3} fill="url(#gSuccess)" name="Successful" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--accent-tertiary)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Intelligence Feed */}
        <Card style={{ padding: "32px", borderRadius: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ background: "rgba(0, 229, 168, 0.1)", padding: 8, borderRadius: 10 }}><Activity size={18} color="var(--success)" /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>AI Intelligence Feed</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Real-time system events</div>
            </div>
          </div>
          
          <div style={{ position: "relative", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="timeline-line" />
            
            {AI_FEED.map((item, i) => (
              <motion.div 
                key={item.id} 
                className="hover-glow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ 
                  position: "relative", 
                  padding: "16px", 
                  background: "rgba(255,255,255,0.02)", 
                  borderRadius: 12,
                  border: "1px solid var(--bg-border)",
                  marginLeft: 12
                }}
              >
                <div style={{ 
                  position: "absolute", left: -25, top: 20, width: 10, height: 10, borderRadius: "50%", 
                  background: `var(--${item.status})`, border: "2px solid var(--bg-base)", zIndex: 2 
                }} />
                
                <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 8 }}>{item.text}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge variant={item.status}>{item.type}</Badge>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
}
