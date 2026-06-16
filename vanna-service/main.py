"""
Vanna AI Microservice — Ollama Edition
Uses a locally running Ollama model instead of OpenAI.
Ollama must be running on the host machine at port 11434.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from vanna.ollama import Ollama
from vanna.chromadb import ChromaDB_VectorStore
import os

app = FastAPI(title="Vanna AI Service (Ollama)", version="1.0.0")

# ─── Pick your model ─────────────────────────────────────────────────────────
# Options: "sqlcoder" (best accuracy), "llama3.1" (balanced), "mistral" (light)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")
# When running in Docker, Ollama runs on the HOST machine, not inside a container.
# Use host.docker.internal (Mac/Windows) or 172.17.0.1 (Linux) to reach it.
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")

import re

def clean_sql_output(raw: str) -> str:
    """Remove Qwen3 thinking tags and extract clean SQL."""

    if not raw:
        return ""

    # Remove <think>...</think>
    raw = re.sub(
        r'<think>.*?</think>',
        '',
        raw,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Extract SQL from ```sql or ```json blocks
    match = re.search(
        r'```(?:sql|json)\s*(.*?)\s*```',
        raw,
        flags=re.DOTALL | re.IGNORECASE
    )

    if match:
        sql = match.group(1).strip()
    else:
        sql = raw.strip()
    
    # Disabled overly aggressive sanity check that was failing valid queries.
    if sql.lower().startswith("the provided context is insufficient"):
        raise ValueError("The AI could not generate a SQL query. Have you clicked 'Ingest Schema' for this database profile yet?")
        
    return sql
# ─── Initialize Vanna with Ollama + ChromaDB ─────────────────────────────────

class VannaPlatform(ChromaDB_VectorStore, Ollama):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        
        # Prevent vanna from trying to pull the model automatically, 
        # which causes a timeout and crashes the container if the model is large.
        Ollama._Ollama__pull_model_if_ne = lambda self, client, model: None
        
        Ollama.__init__(self, config=config)


vn_instances = {}

def get_vn(profile_id: int) -> VannaPlatform:
    if profile_id not in vn_instances:
        path = f"/app/models/chromadb/profile_{profile_id}"
        os.makedirs(path, exist_ok=True)
        vn_instances[profile_id] = VannaPlatform(config={
            "model": OLLAMA_MODEL,
            "ollama_host": OLLAMA_HOST,
            "path": path,
        })
    return vn_instances[profile_id]


# ─── Models ──────────────────────────────────────────────────────────────────

class GenerateSQLRequest(BaseModel):
    question: str
    profile_id: int
    db_type: Optional[str] = None

class GenerateSQLResponse(BaseModel):
    sql: str
    explanation: str
    summary: Optional[str] = None

class TrainRequest(BaseModel):
    profile_id: int
    ddl: Optional[str] = None
    documentation: Optional[str] = None
    question_sql_pair: Optional[dict] = None

class IngestSchemaRequest(BaseModel):
    profile_id: int
    ddl_statements: List[str]
    documentation: Optional[str] = None


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/generate-sql", response_model=GenerateSQLResponse)
async def generate_sql(body: GenerateSQLRequest):
    try:
        vn = get_vn(body.profile_id)
        if body.db_type and body.db_type.lower() == "mongodb":
            strict_prompt = f"{body.question}\n\nCRITICAL INSTRUCTION: The target database is MongoDB. You must output ONLY a valid JSON object with exactly two keys: 'collection' (the name of the MongoDB collection) and 'pipeline' (the JSON array for the aggregation pipeline). Do NOT wrap it in code blocks. Do NOT output SQL. Do NOT include conversational text. Start immediately with {{"
        else:
            strict_prompt = f"{body.question}\n\nCRITICAL INSTRUCTION: You must output ONLY the raw SQL query. Do NOT wrap it in code blocks. Do NOT include any conversational text, explanations, or comments. Start immediately with the query."
        raw_sql = vn.generate_sql(question=strict_prompt)

        sql = clean_sql_output(raw_sql)

        if not sql:
            raise ValueError(
                "Ollama returned empty SQL — try rephrasing"
            )

        # Skip generate_explanation — it doubles response time by making a second Ollama call
        explanation = "AI-generated SQL query based on your database schema."

        return {
            "sql": sql,
            "explanation": explanation,
            "summary": f"SQL generated for: {body.question}",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SQL generation failed: {str(e)}"
        )


@app.post("/train")
async def train(body: TrainRequest):
    try:
        vn = get_vn(body.profile_id)
        if body.ddl:
            vn.train(ddl=body.ddl)
        if body.documentation:
            vn.train(documentation=body.documentation)
        if body.question_sql_pair:
            vn.train(
                question=body.question_sql_pair.get("question"),
                sql=body.question_sql_pair.get("sql"),
            )
        return {"status": "trained", "profile_id": body.profile_id, "model": OLLAMA_MODEL}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest-schema")
async def ingest_schema(body: IngestSchemaRequest):
    trained = 0
    errors = []
    vn = get_vn(body.profile_id)
    for ddl in body.ddl_statements:
        try:
            vn.train(ddl=ddl)
            trained += 1
        except Exception as e:
            errors.append(str(e))
    if body.documentation:
        vn.train(documentation=body.documentation)
    return {
        "status": "ok",
        "ddl_trained": trained,
        "errors": errors,
        "profile_id": body.profile_id,
        "model": OLLAMA_MODEL,
    }


@app.get("/health")
async def health():
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_HOST}/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
            model_loaded = any(OLLAMA_MODEL in m for m in models)
    except Exception as e:
        return {"status": "error", "ollama": "unreachable", "detail": str(e)}
    return {
        "status": "ok" if model_loaded else "model_not_pulled",
        "service": "vanna-ai-service",
        "ollama_host": OLLAMA_HOST,
        "model": OLLAMA_MODEL,
        "model_loaded": model_loaded,
        "available_models": models,
    }
