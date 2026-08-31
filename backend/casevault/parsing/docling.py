"""
Docling extraction, Tesseract OCR fallback.
"""

from pathlib import Path
from typing import Optional, Tuple


# Accepted MIME types for upload (narrowed to enforce parseability)
ACCEPTED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "message/rfc822",
    "application/eml",
}

# Maximum upload size (50 MB)
MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024

# PDF rendering resolution for OCR
DPI: int = 300

# ─────────────────────────────────────────────────────────────────
# ENTRY POINTS
# ─────────────────────────────────────────────────────────────────


def extract_pdf_pages(
    file_path: Path,
) -> Tuple[list[dict], Optional[str]]:
    """Use **Docling** to extract text with layout and page anchors.

    Returns a list of per-page dicts and an optional error message.
    Each dict has ``page_no``, ``text``, and ``needs_ocr`` keys.
    """
    try:
        from docling.document_converter import DocumentConverter
    except ImportError:
        return [], "docling not installed"

    converter = DocumentConverter()
    result = converter.convert(str(file_path))

    pages: list[dict] = []
    for page in result.pages:
        page_no = page.page_number  # 1-based
        text = page.text.strip() if page.text else ""

        needs_ocr = _detect_scanned(text)

        page_entry: dict = {
            "page_no": page_no,
            "text": text if not needs_ocr else None,
            "needs_ocr": needs_ocr,
        }

        # If a page has no text and it's a PDF, try OCR
        if needs_ocr:
            ocr_result = _ocr_file(file_path, page_no)
            if ocr_result:
                page_entry["text"] = ocr_result.get("text")
                page_entry["needs_ocr"] = True
            else:
                page_entry["notes"] = "ocr failed — page scanned but unreadable"

        pages.append(page_entry)

    return pages, None


def extract_docx_pages(
    file_path: Path,
) -> Tuple[list[dict], Optional[str]]:
    """Extract pages from a **.docx** file using Docling."""
    try:
        from docling.document_converter import DocumentConverter
    except ImportError:
        return [], "docling not installed"

    converter = DocumentConverter()
    result = converter.convert(str(file_path))

    pages: list[dict] = []
    for page in result.pages:
        pages.append(
            {
                "page_no": page.page_number,
                "text": page.text.strip() or None,
                "needs_ocr": False,
            }
        )

    return pages, None


def extract_eml(email_path: Path) -> Tuple[str, Optional[str]]:
    """Extract plain text from a **.eml** file."""
    try:
        import email
        from email import policy
        import email._policybase
        from email.parser import BytesParser
    except ImportError:
        return "", "email parsing requires stdlib (should always be available)"

    with open(str(email_path), "rb") as f:
        msg = BytesParser(policy=policy.default).parse(f)

    body_parts: list[str] = []
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and part.get_content_disposition() != "attachment":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    body_parts.append(payload.decode(charset, errors="replace").strip())
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            body_parts.append(payload.decode(charset, errors="replace").strip())

    return "\n\n---\n\n".join(body_parts).strip() or None, None


# ─────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────


def _detect_scanned(text: str) -> bool:
    """Return ``True`` if document appears to have no text layer (scanned)."""
    if not text:
        return True
    # A document is "scanned" if it produces very little text
    return len(text.strip()) < 10


def _ocr_file(
    file_path: Path,
    page_no: int,
) -> Optional[dict]:
    """Render *page_no* of a PDF to an image and run Tesseract OCR.

    Returns the dict or ``None`` on failure.
    """
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except ImportError:
        return None

    try:
        images = convert_from_path(
            str(file_path),
            dpi=DPI,
            first_page=page_no,
            last_page=page_no,
        )
    except Exception:
        return None

    if not images:
        return None

    text = pytesseract.image_to_string(images[0], lang="eng").strip()

    if text:
        return {
            "page_no": page_no,
            "text": text,
            "needs_ocr": True,
        }
    return None
