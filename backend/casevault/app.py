import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from casevault.config import settings
from casevault.routes import health, readyz, users, matters, documents


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )

    # ── Middleware ──

    # Request ID — injects X-Request-Id header if not present
    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response

    # CORS (permissive for development)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ──
    app.include_router(health.router, prefix="/api")
    app.include_router(readyz.router, prefix="/api")
    app.include_router(users.router)
    app.include_router(matters.router)
    app.include_router(documents.router)

    # ── Global error handler ──
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        return JSONResponse(
            status_code=422,
            content={
                "detail": exc.errors(),
                "request_id": request.state.request_id,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal server error",
                "detail": str(exc) if settings.debug else None,
                "request_id": request.state.request_id,
            },
        )

    return app


app = create_app()
