import { useEffect, useState } from "react";
import { Users, Database, MessageSquare, Key, Clock, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, PageHeader, Badge } from "../ui";
import { getDashboard } from "../../api/client";

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

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Dynamic Hero Banner */}
      <div className="glass-panel pulse-glow" style={{
        position: "relative",
        overflow: "hidden",
        padding: "40px 48px",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "linear-gradient(to right, rgba(229, 57, 53, 0.15), rgba(255, 179, 0, 0.05))"
      }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, background: "var(--accent)", filter: "blur(100px)", opacity: 0.25, borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", bottom: -50, left: 100, width: 200, height: 200, background: "var(--accent-secondary)", filter: "blur(100px)", opacity: 0.15, borderRadius: "50%" }}></div>
        
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", zIndex: 1 }}>
          Welcome to <span style={{ color: "var(--accent-secondary)", textShadow: "0 0 16px rgba(255,179,0,0.5)" }}>ONGC</span> Command Center
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 600, zIndex: 1 }}>
          Real-time telemetry and AI natural language query analytics for the platform. Monitor active profiles, database health, and query performance instantly.
        </p>
      </div>

      {/* Abstract Stat Cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        
        {/* Card 1: Pipeline BG */}
        <div className="glass-panel hover-glow" style={{
          position: "relative", padding: 24, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(229, 57, 53, 0.3)"
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bg-pipeline.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.25, zIndex: 0 }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "rgba(229, 57, 53, 0.2)", padding: 8, borderRadius: 8 }}><MessageSquare size={20} color="var(--accent)" /></div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Queries</div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.total_queries_today}</div>
            <div style={{ fontSize: 12, color: "var(--success)", marginTop: 4 }}>+18% vs yesterday</div>
          </div>
        </div>

        {/* Card 2: Rig BG */}
        <div className="glass-panel hover-glow" style={{
          position: "relative", padding: 24, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255, 179, 0, 0.3)"
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bg-rig.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.25, zIndex: 0 }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "rgba(255, 179, 0, 0.2)", padding: 8, borderRadius: 8 }}><Database size={20} color="var(--accent-secondary)" /></div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active DBs</div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.active_profiles}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Online and trained</div>
          </div>
        </div>

        {/* Plain Glass Card 3 */}
        <div className="glass-panel hover-glow" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: 8, borderRadius: 8 }}><TrendingUp size={20} color="var(--success)" /></div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Success Rate</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.success_rate}%</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Platform wide average</div>
        </div>

        {/* Plain Glass Card 4 */}
        <div className="glass-panel hover-glow" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "rgba(59, 130, 246, 0.2)", padding: 8, borderRadius: 8 }}><Users size={20} color="var(--info)" /></div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Users</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.total_users}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Across all workspaces</div>
        </div>
      </div>

      {/* Main content grid: Chart + ONGC Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        
        {/* Chart */}
        <Card style={{ padding: "28px 32px" }}>
          <div style={{ fontWeight: 700, marginBottom: 28, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            Telemetry: Query Volume (Last 7 Days)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MOCK_CHART}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10, 12, 16, 0.9)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 8,
                  fontSize: 13,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                }}
              />
              <Area type="monotone" dataKey="queries" stroke="var(--accent)" strokeWidth={3} fill="url(#gTotal)" name="Total Queries" />
              <Area type="monotone" dataKey="success" stroke="var(--accent-secondary)" strokeWidth={3} fill="url(#gSuccess)" name="Successful" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ONGC News links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: 4 }}>
            ONGC Live Updates
          </div>
          
          <a href="https://x.com/ONGC_/status/2001586219617259749" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div className="glass-panel hover-glow" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ height: 140, borderRadius: 8, backgroundImage: "url('https://pbs.twimg.com/media/G8cP5qSaoAAz_-o.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Latest from ONGC X</div>
                <ExternalLink size={16} color="var(--text-muted)" />
              </div>
            </div>
          </a>

          <a href="https://infra.economictimes.indiatimes.com/news/ports-shipping/ongc-joins-forces-with-major-oil-firms-in-new-shipping-jv/126555635" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div className="glass-panel hover-glow" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ height: 140, borderRadius: 8, backgroundImage: "url('https://etimg.etb2bimg.com/photo/126555640.cms')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>New Shipping JV</div>
                <ExternalLink size={16} color="var(--text-muted)" />
              </div>
            </div>
          </a>
        </div>
      </div>

    </div>
  );
}
