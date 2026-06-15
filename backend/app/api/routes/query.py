from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
import time

from app.db.session import get_db
from app.schemas.schemas import QueryRequest, QueryResponse, QueryPreviewRequest, QueryPreviewResponse
from app.services.query_service import execute_natural_language_query, preview_sql
from app.services.token_service import validate_api_token_from_request
from app.core.security import get_current_user

router = APIRouter()


@router.post("", response_model=QueryResponse)
async def query(
    request: Request,
    body: QueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Main query endpoint. Accepts a Bearer API token in Authorization header.
    Converts natural language to SQL, executes it, returns structured results.
    """
    api_token = await validate_api_token_from_request(request, db)
    client_ip = request.client.host if request.client else "unknown"

    start = time.perf_counter()
    try:
        result = await execute_natural_language_query(
            db=db,
            question=body.question,
            api_token=api_token,
            client_ip=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Query execution failed: {e}")
        
    elapsed_ms = (time.perf_counter() - start) * 1000
    result["execution_time_ms"] = round(elapsed_ms, 2)
    return result


@router.post("/preview", response_model=QueryPreviewResponse)
async def preview_query(
    request: Request,
    body: QueryPreviewRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Preview the generated SQL without executing it.
    """
    api_token = await validate_api_token_from_request(request, db)
    try:
        return await preview_sql(db=db, question=body.question, api_token=api_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Preview failed: {e}")


@router.get("/history")
async def query_history(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Retrieve query history for the current user.
    """
    from app.services.audit_service import get_user_query_history
    return await get_user_query_history(db, current_user.id, page, page_size)
