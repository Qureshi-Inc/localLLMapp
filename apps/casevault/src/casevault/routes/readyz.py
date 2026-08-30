from fastapi import APIRouter

router = APIRouter()


@router.get("/readyz", summary="Readiness probe — returns 503 until DB + Qdrant + Ollama are reachable")
async def readyz():
    checks: dict = {}

    # Check PostgreSQL
    try:
        from casevault.db.engine import async_session

        async with async_session() as session:
            await session.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "unreachable"

    # Check Qdrant
    try:
        from casevault.config import settings
        import httpx

        async with httpx.AsyncClient() as client:
            await client.get(f"{settings.qdrant_url}/health")
        checks["qdrant"] = "ok"
    except Exception:
        checks["qdrant"] = "unreachable"

    # Check Ollama
    try:
        from casevault.config import settings
        import httpx

        async with httpx.AsyncClient() as client:
            await client.get(f"{settings.ollama_url}/api/tags")
        checks["ollama"] = "ok"
    except Exception:
        checks["ollama"] = "unreachable"

    all_ok = all(v == "ok" for v in checks.values())

    if all_ok:
        return {"status": "ok", "checks": checks}
    else:
        return {"status": "degraded", "checks": checks}, 503
