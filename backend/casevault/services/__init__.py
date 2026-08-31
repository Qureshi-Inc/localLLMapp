from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from casevault.models import (
    User,
    Organization,
    Matter,
    MatterMembership,
    Document,
    QueryLog,
)
# ─────────── Exceptions ───────────


class AuthorizationError(Exception):
    """Raised when a user lacks access to a resource."""


class NotFoundError(Exception):
    """Raised when a requested resource does not exist."""


# ─────────── Authorization helper (core of this issue) ───────────


async def assert_user_can_access_matter(
    db: AsyncSession,
    user: User,
    matter_id: UUID,
) -> None:
    """Raise ``AuthorizationError`` if the user has no membership on the matter.

    This helper is the **per-matter isolation boundary** — it must be called
    in every service / route handler that retrieves data scoped to a matter.

    Branches covered:
    1. user.id is None  → denial (anonymous)
    2. no membership row → denial
    3. membership row found  → allow (no-op)
    """
    if user.id is None:
        raise AuthorizationError("anonymous users cannot access matters")

    stmt = (
        select(MatterMembership)
        .where(
            MatterMembership.matter_id == matter_id,
            MatterMembership.user_id == user.id,
        )
        .limit(1)
    )
    result = await db.execute(stmt)
    membership = await result.scalars().first()

    if membership is None:
        raise AuthorizationError(
            f"user {user.id} has no membership on matter {matter_id}"
        )

    # If we reach here: membership is not None → allow (implicit)


# ─────────── Organization helpers ───────────


async def get_organization_by_id(db: AsyncSession, org_id: UUID) -> Organization | None:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    return result.scalars().first()


async def create_organization(
    db: AsyncSession,
    name: str,
    slug: str,
) -> Organization:
    org = Organization(name=name, slug=slug)
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


# ─────────── User helpers ───────────


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


# ─────────── Matter helpers ───────────


async def get_matter_by_id(db: AsyncSession, matter_id: UUID) -> Matter | None:
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    return result.scalars().first()


async def list_matters_for_organization(
    db: AsyncSession,
    org_id: UUID,
    user_id: UUID,
) -> list[Matter]:
    """List all matters the given user belongs to within the organization."""
    stmt = (
        select(Matter)
        .join(Matter.matter_memberships)
        .where(
            Matter.organization_id == org_id,
            MatterMembership.user_id == user_id,
        )
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ─────────── Membership helpers ───────────


async def add_matter_membership(
    db: AsyncSession,
    matter_id: UUID,
    user_id: UUID,
    role: str = "viewer",
) -> MatterMembership:
    membership = MatterMembership(matter_id=matter_id, user_id=user_id, role=role)
    db.add(membership)
    await db.commit()
    await db.refresh(membership)
    return membership


# ─────────── Document helpers ───────────


async def create_document(
    db: AsyncSession,
    matter_id: UUID,
    filename: str,
    mime_type: str | None = None,
    uploaded_by: UUID | None = None,
    file_size: int | None = None,
) -> Document:
    doc = Document(
        matter_id=matter_id,
        filename=filename,
        mime_type=mime_type,
        uploaded_by=uploaded_by,
        file_size=file_size,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def list_documents_for_matter(db: AsyncSession, matter_id: UUID) -> list[Document]:
    result = await db.execute(select(Document).where(Document.matter_id == matter_id))
    return list(result.scalars().all())


# ─────────── Query / Access log helpers ───────────


async def log_query(
    db: AsyncSession,
    user_id: UUID | None,
    matter_id: UUID | None,
    query_text: str,
    response_text: str | None = None,
    model_used: str | None = None,
    latency_ms: int | None = None,
) -> QueryLog:
    log = QueryLog(
        user_id=user_id,
        matter_id=matter_id,
        query_text=query_text,
        response_text=response_text,
        model_used=model_used,
        latency_ms=latency_ms,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
