"""
Ingestion worker — polls ``documents`` for statuses, parses with
Docling (+ OCR fallback), persist pages, update status.

Override via env vars:
- DATABASE_URL, QDRANT_URL, OLLAMA_URL, STORAGE_MODE, STORAGE_PATH
- POLL_INTERVAL (default 5 s)
"""

import json
import os
import time
import sys
from pathlib import Path
from typing import Optional

from tenacity import retry, stop_after_delay, wait_exponential

STORAGE_PATH = Path(os.environ.get("STORAGE_PATH", "/var/lib/casevault/storage"))
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "5"))
STORAGE_MODE = os.environ.get("STORAGE_MODE", "localfs")


# ─────────────────────────────────────────────────────────────────
# DB helpers (inline – avoids adding a full SQLAlchemy dep to worker)
# ─────────────────────────────────────────────────────────────────


def _poll_uploaded(db_url: str) -> Optional[str]:
    """Return the first document_id with status='uploaded', or None."""
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError:
        return None

    conn = psycopg.connect(db_url, row_factory=dict_row)
    cur = conn.cursor()
    cur.execute("SELECT id FROM documents WHERE status = 'uploaded' ORDER BY created_at LIMIT 1")
    row = cur.fetchone()
    conn.close()
    return row["id"] if row else None


def _claim(document_id: str, db_url: str) -> bool:
    """Atomically set status from 'uploaded' to 'parsing'."""
    try:
        import psycopg
    except ImportError:
        return False
    conn = psycopg.connect(db_url)
    cur = conn.cursor()
    cur.execute(
        """UPDATE documents SET status = 'parsing'
           WHERE id = %(id)s AND status = 'uploaded'
           RETURNING id""",
        {"id": document_id},
    )
    ok = cur.fetchone() is not None
    conn.close()
    return ok


def _update(document_id: str, status: str, error: Optional[str], db_url: str) -> None:
    try:
        import psycopg
    except ImportError:
        sys.stderr.write("psycopg not installed; skipping status update\n")
        return
    conn = psycopg.connect(db_url)
    cur = conn.cursor()
    cur.execute(
        "UPDATE documents SET status = %(status)s, document_metadata = %(meta)s WHERE id = %(id)s",
        {"id": document_id, "status": status, "meta": json.dumps({"error": error}) if error else "{}"},
    )
    conn.commit()
    conn.close()


# ─────────────────────────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────────────────────────


def _parse_document(document_id: str) -> None:
    """Parse a single document and persist pages to DB.

    Uses the backend's parsing module; runs synchronously inside
    the worker for simplicity (fine for <50 MB docs in v1).
    """
    db_url = os.environ.get("DATABASE_URL", "")
    
    # Import after env vars are set
    from casevault.parsing.docling import extract_pdf_pages, extract_docx_pages, extract_eml
    from casevault.db.engine import async_session, async_engine
    from casevault.models import Document, DocumentPage
    from sqlalchemy import select

    async def _inner():
        async with async_session() as session:
            # 1. Fetch document
            result = await session.execute(select(Document).where(Document.id == document_id))
            doc = result.scalar_one_or_none()
            if not doc:
                _update(document_id, "failed", "document not found", db_url)
                return

            file_path = STORAGE_PATH / str(doc.matter_id) / str(document_id)
            
            # 2. Dispatch extractor
            mime = doc.mime_type or ""
            result_data: tuple = ([], None)
            
            if "pdf" in mime:
                result_data = extract_pdf_pages(file_path)
            elif "docx" in mime or "ms-word" in mime:
                result_data = extract_docx_pages(file_path)
            elif "eml" in mime or "rfc822" in mime:
                text, err = extract_eml(file_path)
                if err:
                    _update(document_id, "failed", "eml parse failed", db_url)
                    return
                result_data = ([{"page_no": 1, "text": text, "needs_ocr": False}], None)
            else:
                _update(document_id, "failed", f"unsupported MIME type: {mime}", db_url)
                return

            pages, error = result_data

            if error:
                _update(document_id, "failed", error, db_url)
                return

            # 3. Persist pages
            for page_data in pages:
                page = DocumentPage(
                    document_id=document_id,
                    page_number=page_data["page_no"],
                    text_content=page_data.get("text"),
                )
                session.add(page)

            # 4. Update document status
            doc.status = "indexed"
            await session.commit()

    # Run without event-loop (simplify for worker)
    import asyncio
    asyncio.run(_inner())


if __name__ == "__main__":
    db_url = os.environ.get("DATABASE_URL", "postgresql://localhost/casevault")
    print(f"[ingestion-worker] starting (poll_interval={POLL_INTERVAL}s, db={db_url})")

    while True:
        doc_id = _poll_uploaded(db_url)
        if doc_id is None:
            time.sleep(POLL_INTERVAL)
            continue

        if not _claim(doc_id, db_url):
            continue  # another worker grabbed it

        try:
            print(f"[ingestion-worker] parsing document {doc_id}")
            _parse_document(doc_id)
            print(f"[ingestion-worker] done: {doc_id}")
        except Exception:
            import traceback
            traceback.print_exc()
            _update(doc_id, "failed", "worker error", db_url)
            time.sleep(10)

        time.sleep(1)
