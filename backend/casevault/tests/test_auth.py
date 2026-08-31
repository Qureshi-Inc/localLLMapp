"""Tests for the per-matter authorization helper.

Branches under test:
  1. user.id is None      → denial
  2. no membership row     → denial
  3. membership row found  → allow (implicit)
"""

import pytest
import pytest_asyncio
from uuid import UUID, uuid4

import sqlalchemy.ext.asyncio
from sqlalchemy import select

from casevault.models import User, Matter, MatterMembership

_AUTO = object()
from casevault.services import AuthorizationError, assert_user_can_access_matter


# ─── Fixtures ───


def _make_user(user_id=_AUTO, *, role: str = "attorney") -> User:
    """user_id not passed -> random UUID; user_id=...UUID -> that UUID; user_id=None -> anonymous."""
    if user_id is _AUTO:
        uid = uuid4()
    else:
        uid = user_id  # may be None (anonymous)
    return User(
        id=uid,
        organization_id=uuid4(),
        email=f"user_{uuid4().hex[:6]}@test.com",
        name=f"Test User {uuid4().hex[:4]}",
        role=role,
    )


def _make_membership(user_id: UUID, matter_id: UUID, role: str = "viewer") -> MatterMembership:
    return MatterMembership(
        matter_id=matter_id,
        user_id=user_id,
        role=role,
    )


class FakeResult:
    """Minimal fake for the result of a SQLAlchemy async execute."""

    def __init__(self, obj=None):
        self._obj = obj

    def scalars(self):
        return self

    async def first(self):
        return self._obj


# We rely on Python's mock support (unittest.mock) — no pytest-mock needed.
from unittest.mock import AsyncMock, MagicMock


class FakeSession:
    """Minimal async session stub that lets the caller inject mock results."""

    def __init__(self, mock_fn=None):
        self._mock_fn = mock_fn
        self._executed: list = []

    async def execute(self, stmt):
        self._executed.append(stmt)
        if self._mock_fn:
            return self._mock_fn(stmt)
        return FakeResult(None)


@pytest_asyncio.fixture
def session_with_membership():
    """Session that finds a membership row."""
    matter_id = uuid4()
    user_id = uuid4()
    membership = _make_membership(user_id, matter_id)

    def mock_fn(stmt):
        return FakeResult(membership)

    return FakeSession(mock_fn), matter_id, user_id


@pytest_asyncio.fixture
def session_no_membership():
    """Session that returns no membership row."""
    return FakeSession(mock_fn=lambda stmt: FakeResult(None))


# ─── Tests ───


class TestAnonymousUser:
    """Branch 1: user.id is None → denial."""

    @pytest.mark.asyncio
    async def test_anonymous_user_is_denied(self):
        user = _make_user(user_id=None)
        matter_id = uuid4()
        session = FakeSession()
        with pytest.raises(AuthorizationError, match="anonymous"):
            await assert_user_can_access_matter(session, user, matter_id)

    @pytest.mark.asyncio
    async def test_anonymous_user_does_not_query_db(self):
        """Anonymous user is denied before any DB query is made (early-out)."""
        user = _make_user(user_id=None)
        matter_id = uuid4()
        session = FakeSession()
        with pytest.raises(AuthorizationError):
            await assert_user_can_access_matter(session, user, matter_id)
        assert len(session._executed) == 0


class TestNoMembership:
    """Branch 2: no membership row → denial."""

    @pytest.mark.asyncio
    async def test_attorney_without_membership_is_denied(self):
        user = _make_user(role="attorney")
        matter_id = uuid4()
        session = FakeSession(mock_fn=lambda stmt: FakeResult(None))
        with pytest.raises(AuthorizationError, match="no membership"):
            await assert_user_can_access_matter(session, user, matter_id)

    @pytest.mark.asyncio
    async def test_paralegal_without_membership_is_denied(self):
        user = _make_user(role="paralegal")
        matter_id = uuid4()
        session = FakeSession(mock_fn=lambda stmt: FakeResult(None))
        with pytest.raises(AuthorizationError, match="no membership"):
            await assert_user_can_access_matter(session, user, matter_id)

    @pytest.mark.asyncio
    async def test_admin_without_membership_is_denied(self):
        user = _make_user(role="admin")
        matter_id = uuid4()
        session = FakeSession(mock_fn=lambda stmt: FakeResult(None))
        with pytest.raises(AuthorizationError, match="no membership"):
            await assert_user_can_access_matter(session, user, matter_id)


class TestHasMembership:
    """Branch 3: membership row found → allow."""

    @pytest.mark.asyncio
    async def test_viewer_member_can_access(self, session_with_membership):
        session, matter_id, user_id = session_with_membership
        user = _make_user(user_id=user_id, role="paralegal")
        await assert_user_can_access_matter(session, user, matter_id)
        # no exception → allowed

    @pytest.mark.asyncio
    async def test_owner_member_can_access(self):
        user_id = uuid4()
        matter_id = uuid4()
        membership = _make_membership(user_id, matter_id, role="owner")

        session = FakeSession(mock_fn=lambda stmt: FakeResult(membership))
        user = _make_user(user_id=user_id, role="attorney")

        await assert_user_can_access_matter(session, user, matter_id)

    @pytest.mark.asyncio
    async def test_editor_member_can_access(self):
        user_id = uuid4()
        matter_id = uuid4()
        membership = _make_membership(user_id, matter_id, role="editor")

        session = FakeSession(mock_fn=lambda stmt: FakeResult(membership))
        user = _make_user(user_id=user_id, role="paralegal")

        await assert_user_can_access_matter(session, user, matter_id)


class TestBranchCoverage:
    """Helper to verify we have branches for every early-out and late-out path."""

    @pytest.mark.asyncio
    async def test_no_early_out_for_valid_user(self):
        """When user.id is valid, a DB query should be issued (late-out path)."""
        user_id = uuid4()
        matter_id = uuid4()
        membership = _make_membership(user_id, matter_id)

        executed = []

        def mock_fn(stmt):
            executed.append(stmt)
            return FakeResult(membership)

        session = FakeSession(mock_fn=mock_fn)
        user = _make_user(user_id=user_id)
        await assert_user_can_access_matter(session, user, matter_id)
        assert len(executed) == 1
