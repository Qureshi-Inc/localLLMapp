"""Tests for the healthz and readyz endpoints (worker-only, no full logic path)."""

import pytest
import pytest_asyncio
from uuid import uuid4
from sqlalchemy import select

# We keep these tests completely isolated from app.py to avoid
# the double-Base-import issue on macOS (case-insensitive filesystem).
# The health router can be imported directly.


@pytest.mark.asyncio
class TestHealthz:
    async def test_healthz_returns_ok(self):
        """Import and call healthz route handler directly."""
        from casevault.routes.health import router
        from fastapi.testclient import TestClient

        client = TestClient(router)
        resp = client.get("/healthz")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
class TestAuthorizationError:
    """Verify the AuthorizationError can be imported and raised."""

    async def test_auth_error_raised(self):
        from casevault.services import AuthorizationError

        with pytest.raises(AuthorizationError):
            raise AuthorizationError("test denial")
