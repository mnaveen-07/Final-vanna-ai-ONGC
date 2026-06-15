-- Platform metadata database initialization
-- Tables are auto-created by SQLAlchemy on startup
-- This file handles any pre-seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Seed a default super admin (password: Admin1234!)
-- hashed with bcrypt cost 12
-- DO NOT leave this in production — change password immediately after first login
INSERT INTO users (email, username, hashed_password, full_name, role, is_active)
VALUES (
  'admin@platform.local',
  'superadmin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ3BPKQ6',
  'Super Administrator',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;
