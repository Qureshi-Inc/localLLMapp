"""Document endpoints — guarded by per-matter authorization."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from casevault.db.engine import async_session
from casevault.models import Document
from casevault.schemas import (
    DocumentCreate,
    DocumentOut,
    DocumentStatus,
)
from casevault.services import (
    create_document,
    list_documents_for_matter,
    get_user_by_id,
    assert_user_can_access_matter,
)

router = APIRouter()


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


# ─── Documents ───


@router.post(
    "/matters/{matter_id}/documents",
    response_model=DocumentOut,
    status_code=201,
)
async def upload_document(
    matter_id: UUID,
    body: DocumentCreate,
    user_id: UUID = Query(None, description="uploader user ID"),
    db: AsyncSession = Depends(get_db),
):
    document = await create_document(
        db,
        matter_id=matter_id,
        filename=body.filename,
        mime_type=body.mime_type,
        uploaded_by=user_id,
    )
    return document


@router.get(
    "/matters/{matter_id}/documents",
    response_model=list[DocumentOut],
)
async def list_documents(
    matter_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """List all documents in a matter (after authorisation check)."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    await assert_user_can_access_matter(db, user, matter_id)

    docs = await list_documents_for_matter(db, matter_id)
    return docs


@router.get("/matters/{matter_id}/documents/{doc_id}", response_model=DocumentOut)
async def get_document(
    matter_id: UUID,
    doc_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="document not found")
    return doc
