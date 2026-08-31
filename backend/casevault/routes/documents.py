"""Document endpoints — guarded by per-matter authorization + ingestion."""

import uuid as _uuid
from pathlib import Path
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from casevault.config import settings
from casevault.db.engine import async_session
from casevault.models import Document, DocumentPage
from casevault.schemas import DocumentOut
from casevault.services import (
    assert_user_can_access_matter,
    create_document,
    get_user_by_id,
    list_documents_for_matter,
)
from casevault.parsing.docling import ACCEPTED_MIME_TYPES

router = APIRouter()


# ───────────────────────────── helpers ──────────────────────────

STORAGE_PATH = Path(getattr(settings, "storage_path", "/var/lib/casevault/storage"))


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


def _dir_for(matter_id_str: str) -> Path:
    d = STORAGE_PATH / matter_id_str
    d.mkdir(parents=True, exist_ok=True)
    return d


def _validate_mime(mime_type: Optional[str]) -> str:
    """Validate MIME type is in the allowed list."""
    if mime_type and mime_type.split(";")[0] not in ACCEPTED_MIME_TYPES:
        raise HTTPException(422, f"mime type {mime_type!r} is not accepted")
    return mime_type or "application/octet-stream"


# ───────────────────────── routes ───────────────────────────────


@router.post(
    "/matters/{matter_id}/documents",
    response_model=DocumentOut,
    status_code=201,
)
async def upload_document(
    matter_id: UUID,
    file: UploadFile = File(...),
    user_id: Optional[UUID] = Query(None, description="uploader user ID"),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document to a matter (multipart)."""
    user = await get_user_by_id(db, user_id) if user_id else None
    if user and user.id:
        await assert_user_can_access_matter(db, user, matter_id)

    if not file.filename:
        raise HTTPException(400, "filename is required")

    mime_type = _validate_mime(file.content_type)

    content = await file.read()
    max_size = 50 * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(413, f"file too large (max {max_size // 1024 // 1024} MB)")

    doc_id_str = str(_uuid.uuid4())
    file_path = _dir_for(str(matter_id)) / doc_id_str
    file_path.write_bytes(content)

    doc = await create_document(
        db,
        matter_id=matter_id,
        filename=file.filename,
        mime_type=mime_type,
        uploaded_by=user_id,
        file_size=len(content),
    )

    return doc


@router.get("/matters/{matter_id}/documents")
async def list_documents(
    matter_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """List all documents in a matter (after authorisation check)."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "user not found")

    await assert_user_can_access_matter(db, user, matter_id)

    docs = await list_documents_for_matter(db, matter_id)
    return docs


@router.get("/matters/{matter_id}/documents/{doc_id}",
            response_model=DocumentOut)
async def get_document(
    matter_id: UUID,
    doc_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Get document metadata + status."""
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "document not found")
    return doc


@router.get("/documents/{doc_id}/original")
async def get_document_original(
    doc_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Stream the original uploaded file (authorisation-checked)."""
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "document not found")

    user = await get_user_by_id(db, user_id)
    if user and user.id:
        await assert_user_can_access_matter(db, user, doc.matter_id)

    path = _dir_for(str(doc.matter_id)) / str(doc_id)
    if not path.exists():
        raise HTTPException(404, "original file not found")

    return FileResponse(
        str(path),
        media_type=doc.mime_type or "application/octet-stream",
        filename=doc.filename,
    )


@router.delete("/matters/{matter_id}/documents/{doc_id}")
async def delete_document(
    matter_id: UUID,
    doc_id: UUID,
    user_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document: removes DB rows + pages + stored file."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(404, "user not found")

    await assert_user_can_access_matter(db, user, matter_id)

    doc = await db.get(Document, doc_id)
    if not doc or doc.matter_id != matter_id:
        raise HTTPException(404, "document not found")

    result = await db.execute(select(DocumentPage).where(DocumentPage.document_id == doc.id))
    pages = result.scalars().all()
    for page in pages:
        await db.delete(page)

    await db.delete(doc)
    await db.commit()

    file_path = _dir_for(str(matter_id)) / str(doc_id)
    if file_path.exists():
        file_path.unlink()

    return {"detail": "deleted"}
