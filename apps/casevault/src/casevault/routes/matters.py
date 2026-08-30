"""Matter endpoints — the per-matter isolation boundary."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from casevault.db.engine import async_session
from casevault.models import Matter, MatterMembership
from casevault.schemas import (
    MatterCreate,
    MatterUpdate,
    MatterOut,
    MatterMembershipCreate,
    MatterMembershipOut,
)
from casevault.services import (
    get_matter_by_id,
    list_matters_for_organization,
    add_matter_membership,
    assert_user_can_access_matter,
)
from casevault.services import AuthorizationError

router = APIRouter()


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


# ─── Matters ───


@router.post("/matters", response_model=MatterOut, status_code=201)
async def create_matter(body: MatterCreate, db: AsyncSession = Depends(get_db)):
    matter = Matter(
        organization_id=body.organization_id,
        name=body.name,
        description=body.description,
        status=body.status or "active",
    )
    db.add(matter)
    await db.commit()
    await db.refresh(matter)
    return matter


@router.get("/matters", response_model=list[MatterOut])
async def list_matters(org_id: UUID, user_id: UUID, db: AsyncSession = Depends(get_db)):
    """List all matters a user belongs to within an organization."""
    matters = await list_matters_for_organization(db, org_id, user_id)
    return matters


@router.get("/matters/{matter_id}", response_model=MatterOut)
async def get_matter(matter_id: UUID, db: AsyncSession = Depends(get_db)):
    matter = await get_matter_by_id(db, matter_id)
    if not matter:
        raise HTTPException(status_code=404, detail="matter not found")
    return matter


@router.patch("/matters/{matter_id}", response_model=MatterOut)
async def update_matter(matter_id: UUID, body: MatterUpdate, db: AsyncSession = Depends(get_db)):
    matter = await get_matter_by_id(db, matter_id)
    if not matter:
        raise HTTPException(status_code=404, detail="matter not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(matter, key, value)
    await db.commit()
    await db.refresh(matter)
    return matter


# ─── Matter Memberships ───


@router.post(
    "/matters/{matter_id}/memberships",
    response_model=MatterMembershipOut,
    status_code=201,
)
async def add_membership(
    matter_id: UUID,
    body: MatterMembershipCreate,
    db: AsyncSession = Depends(get_db),
):
    membership = await add_matter_membership(
        db, matter_id, body.user_id, role=body.role
    )
    return membership


@router.delete("/matters/{matter_id}/memberships/{user_id}", status_code=204)
async def remove_membership(
    matter_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import delete

    stmt = delete(MatterMembership).where(
        MatterMembership.matter_id == matter_id,
        MatterMembership.user_id == user_id,
    )
    await db.execute(stmt)
    await db.commit()


# ─── Auth-guarded helpers ───


@router.get("/matters/{matter_id}/_auth")
async def check_matter_access(
    matter_id: UUID, user_id: UUID, db: AsyncSession = Depends(get_db)
):
    """Verify (and assert) that a user can access a matter.

    This endpoint exists so the ``assert_user_can_access_matter`` helper
    can be exercised via HTTP as well as via direct Python import.
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    try:
        await assert_user_can_access_matter(db, user, matter_id)
        return {"allowed": True}
    except AuthorizationError as e:
        return {"allowed": False, "reason": str(e)}
