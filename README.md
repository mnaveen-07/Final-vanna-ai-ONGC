# VannaQuery Platform
### Centralized AI-Powered Database Query Intelligence Platform

A production-ready, Docker-based platform that connects to enterprise databases and enables **natural language querying** through Vanna AI.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     nginx :80                        │
└────────────┬────────────────────────┬────────────────┘
             │                        │
     ┌───────▼──────┐        ┌────────▼───────┐
     │  frontend    │        │  backend-api   │
     │  React :3000 │        │  FastAPI :8000 │
     └──────────────┘        └────────┬───────┘
                                      │
              ┌───────────────────────┼──────────────────┐
              │                       │                   │
     ┌────────▼──────┐      ┌─────────▼──────┐  ┌───────▼──────┐
     │  vanna-service│      │   postgres      │  │    redis     │
     │  FastAPI :8001│      │   :5432         │  │    :6379     │
     └───────────────┘      └─────────────────┘  └──────────────┘
```

---

## Project Structure

```
vanna-platform/
├── docker-compose.yml          # All services
├── .env.example                # Copy to .env and fill in
│
├── frontend/                   # React admin portal
│   ├── src/
│   │   ├── App.jsx             # Router + auth wrapper
│   │   ├── api/client.js       # Axios API client
│   │   ├── hooks/useAuth.js    # Auth context
│   │   └── components/
│   │       ├── layout/         # Sidebar, AppLayout
│   │       ├── pages/          # Dashboard, Query, Profiles, Tokens, Login
│   │       └── ui/             # Card, Button, Badge, Input, etc.
│   └── Dockerfile
│
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # FastAPI app + routers
│   │   ├── core/
│   │   │   ├── config.py       # Settings (env-based)
│   │   │   └── security.py     # JWT, hashing, RBAC
│   │   ├── models/models.py    # SQLAlchemy ORM models
│   │   ├── schemas/schemas.py  # Pydantic request/response
│   │   ├── db/
│   │   │   ├── base.py         # DeclarativeBase
│   │   │   └── session.py      # Async engine + get_db
│   │   ├── api/routes/
│   │   │   ├── auth.py         # Login, register, /me
│   │   │   ├── users.py        # User management (admin)
│   │   │   ├── profiles.py     # DB connection profiles
│   │   │   ├── tokens.py       # API token CRUD
│   │   │   ├── query.py        # NL query + preview
│   │   │   ├── audit.py        # Query logs
│   │   │   ├── dashboard.py    # Aggregated stats
│   │   │   └── schema_ingestion.py
│   │   └── services/
│   │       ├── query_service.py    # NL→SQL orchestration + safety check
│   │       ├── db_executor.py      # Multi-DB driver routing
│   │       ├── token_service.py    # Token create/validate/revoke
│   │       ├── profile_service.py  # Profile CRUD
│   │       ├── schema_service.py   # DDL extraction + Vanna training
│   │       ├── user_service.py     # User CRUD
│   │       ├── audit_service.py    # Query log writes
│   │       └── crypto_service.py   # Fernet encryption
│   ├── requirements.txt
│   └── Dockerfile
│
├── vanna-service/              # Vanna AI microservice
│   ├── main.py                 # FastAPI + Vanna endpoints
│   ├── requirements.txt
│   └── Dockerfile
│
└── nginx/
    └── nginx.conf
```

---

## Quick Start

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd vanna-platform
cp .env.example .env
```

Edit `.env` and set:
- `OPENAI_API_KEY` — your OpenAI key (used by Vanna)
- `SECRET_KEY` — a long random string for JWT signing
- `ENCRYPTION_KEY` — a valid Fernet key (generate below)

**Generate a Fernet key:**
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 2. Start all services

```bash
docker-compose up --build
```

| Service        | URL                          |
|----------------|------------------------------|
| Frontend Portal | http://localhost             |
| Backend API    | http://localhost/api         |
| API Docs       | http://localhost/docs        |
| Vanna Service  | http://localhost:8001/docs   |

### 3. Create first admin user

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","username":"admin","password":"Admin1234!","full_name":"Platform Admin"}'
```

---

## Using the Query API

External applications query your databases using API tokens:

```bash
# Run a natural language query
curl -X POST http://localhost/api/query \
  -H "Authorization: Bearer vnk_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"question": "Show total orders created this month"}'
```

**Response:**
```json
{
  "question": "Show total orders created this month",
  "generated_sql": "SELECT COUNT(*) as total FROM orders WHERE ...",
  "summary": "248 orders were created this month.",
  "data": [{"total": 248}],
  "row_count": 1,
  "execution_time_ms": 1240,
  "columns": ["total"]
}
```

---

## Security Model

| Layer | Implementation |
|---|---|
| User auth | JWT (HS256), bcrypt passwords |
| API token auth | SHA-256 hashed, prefix-displayed |
| DB passwords | Fernet symmetric encryption at rest |
| Query safety | Blocked keywords: INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/EXEC |
| Rate limiting | Per-token configurable (default: 60/min) |
| Read-only | Enforced per profile |
| RBAC | super_admin / admin / user / api_consumer |

---

## Supported Databases

| Database | Phase | Driver |
|---|---|---|
| PostgreSQL | ✅ Phase 1 | asyncpg |
| MySQL / MariaDB | ✅ Phase 1 | aiomysql |
| Microsoft SQL Server | ✅ Phase 1 | aioodbc |
| Oracle Database | ✅ Phase 1 | cx_Oracle |
| MongoDB | 🧪 Experimental | (Phase 2) |

---

## Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Vanna Service:**
```bash
cd vanna-service
pip install -r requirements.txt
OPENAI_API_KEY=sk-... uvicorn main:app --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## Database Migration (Alembic)

```bash
cd backend
alembic init migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## Roadmap (Future Scope)

- [ ] Write-back with approval workflows
- [ ] Fine-grained row-level access control
- [ ] Voice assistant integration
- [ ] Multi-LLM support (local models via Ollama)
- [ ] GraphQL API
- [ ] MongoDB intelligent aggregation
- [ ] BI dashboard export (Power BI, Metabase)
- [ ] LDAP / SSO integration
- [ ] Chat history memory per token
