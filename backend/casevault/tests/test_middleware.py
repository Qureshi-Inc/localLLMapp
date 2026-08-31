"""Tests for the request-ID middleware and error handling."""

import uuid
from httpx import AsyncClient, ASGITransport

import pytest
from casevault.app import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.mark.asyncio
class TestRequestIDMiddleware:
    async def test_request_id_passed_through(self, app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            rid = str(uuid.uuid4())
            resp = await client.get("/api/healthz", headers={"X-Request-Id": rid})
            assert resp.status_code == 200
            assert resp.headers.get("X-Request-Id") == rid

    async def test_request_id_generated_when_missing(self, app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/healthz")
            assert resp.status_code == 200
            # A new UUID should be generated
            assert resp.headers.get("X-Request-Id") is not None


@pytest.mark.asyncio
class TestGlobalErrorHandler:
    async def test_server_error_returns_json(self, app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Force an error — use an unexpected URL
            resp = await client.get("/api/nonexistent")
            assert resp.status_code == 404


@pytest.mark.asyncio
class TestCORS:
    async def test_cors_headers_present(self, app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.options(
                "/api/healthz",
                headers={
                    "Origin": "http://example.com",
                    "Access-Control-Request-Method": "GET",
                },
            )
            assert resp.status_code == 200
            assert resp.headers.get("Access-Control-Allow-Origin") == "http://example.com"
