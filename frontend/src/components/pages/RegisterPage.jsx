import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Brain } from "lucide-react";
import { register } from "../../api/client";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !username || !password) {
      return toast.error("Email, Username, and Password are required");
    }
    setLoading(true);
    try {
      await register(email, username, password, fullName);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || d).join("; ") : detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundImage: "linear-gradient(rgba(5, 8, 22, 0.7), rgba(5, 8, 22, 0.9)), url('https://etimg.etb2bimg.com/photo/126555640.cms')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      padding: 20 
    }}>
      <div 
        style={{ 
          display: "flex", 
          width: "100%", 
          maxWidth: 960, 
          minHeight: 640, 
          background: "var(--bg-elevated)", 
          borderRadius: 24, 
          overflow: "hidden", 
          border: "1px solid var(--bg-border)", 
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)" 
        }}
      >
        {/* Left Side: Image Branding */}
        <div 
          style={{ 
            flex: 1, 
            background: "linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url('https://etimg.etb2bimg.com/photo/101641355.cms')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative", 
            padding: 48, 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between" 
          }}
        >
          {/* Subtle noise overlay */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')", pointerEvents: "none" }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 64, height: 64, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <img src="https://upload.wikimedia.org/wikipedia/en/9/9a/ONGC_Logo.svg" alt="ONGC Logo" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
            </div>
          </div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Get access to the ONGC AI Command Center
            </h1>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic", borderLeft: "3px solid #fff", paddingLeft: 16 }}>
              "Fueling India's Growth: The largest crude oil and natural gas Company in India, contributing around 71 per cent to Indian domestic production."
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div style={{ flex: 1, padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--bg-surface)" }}>
          <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
            <div style={{ marginBottom: 32 }}>
              <Brain size={28} color="var(--accent)" style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>Create an account</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Access your natural language queries, database infrastructure, and audit logs.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                className="input-focus-ring"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                className="input-focus-ring"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>Your email</label>
              <input
                type="email"
                placeholder="user@ongc.co.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                className="input-focus-ring"
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  style={{
                    width: "100%",
                    background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 12,
                    padding: "12px 48px 12px 16px",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  className="input-focus-ring"
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="hover-glow"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, var(--info), #4f46e5)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 16px rgba(59, 130, 246, 0.25)",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Creating account…" : "Get Started"}
            </button>

            <div style={{ marginTop: 32, textAlign: "center", fontSize: 14 }}>
              <span style={{ color: "var(--text-secondary)" }}>Already have an account? </span>
              <Link to="/login" style={{ color: "var(--info)", textDecoration: "none", fontWeight: 600 }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
