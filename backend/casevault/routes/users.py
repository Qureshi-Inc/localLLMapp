"""User and Organization endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from casevault.db.engine import async_session
from casevault.models import User, Organization
from casevault.schemas import (
    UserCreate,
    UserUpdate,
    UserOut,
    OrganizationCreate,
    OrganizationOut,
)
from casevault.services import get_user_by_id, create_organization

router = APIRouter()


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


# ─── Organizations ───


@router.post("/organizations", response_model=OrganizationOut, status_code=201)
async def create_org(body: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    org = await create_organization(db, body.name, body.slug)
    return org


@router.get("/organizations/{org_id}", response_model=OrganizationOut)
async def get_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="organization not found")
    return org


# ─── Users ───


@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    user = User(
        organization_id=body.organization_id,
        email=body.email,
        name=body.name,
        role=body.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: UUID, body: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
