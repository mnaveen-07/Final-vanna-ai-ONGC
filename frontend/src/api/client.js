import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (email, username, password, full_name) =>
  api.post("/api/auth/register", { email, username, password, full_name }).then((r) => r.data);

export const getMe = () => api.get("/api/auth/me").then((r) => r.data);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get("/api/dashboard").then((r) => r.data);

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const listProfiles = () => api.get("/api/profiles").then((r) => r.data);
export const createProfile = (data) => api.post("/api/profiles", data).then((r) => r.data);
export const updateProfile = (id, data) => api.put(`/api/profiles/${id}`, data).then((r) => r.data);
export const deleteProfile = (id) => api.delete(`/api/profiles/${id}`);
export const testConnection = (id) => api.post(`/api/profiles/${id}/test`).then((r) => r.data);
export const ingestSchema = (id) => api.post(`/api/profiles/${id}/ingest-schema`).then((r) => r.data);
export const getProfileSchema = (id) => api.get(`/api/profiles/${id}/schema`).then((r) => r.data);

// ─── Tokens ───────────────────────────────────────────────────────────────────
export const listTokens = () => api.get("/api/tokens").then((r) => r.data);
export const createToken = (data) => api.post("/api/tokens", data).then((r) => r.data);
export const revokeToken = (id) => api.delete(`/api/tokens/${id}`);
export const rotateToken = (id) => api.post(`/api/tokens/${id}/rotate`).then((r) => r.data);
export const deleteToken = (id) => api.delete(`/api/tokens/${id}/hard`);

// ─── Query ────────────────────────────────────────────────────────────────────
export const runQuery = (question, token) =>
  axios.post(
    `${BASE_URL}/api/query`,
    { question },
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((r) => r.data);

export const previewQuery = (question, token) =>
  axios.post(
    `${BASE_URL}/api/query/preview`,
    { question },
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((r) => r.data);

// ─── Audit ────────────────────────────────────────────────────────────────────
export const getAuditLogs = (params) =>
  api.get("/api/audit", { params }).then((r) => r.data);

export default api;
