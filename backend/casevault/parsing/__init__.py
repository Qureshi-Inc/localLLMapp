"""
Document parsing submodule — Docling + Tesseract OCR.

Public entry points:
- ``extract_pdf_pages(file_path)`` → ``(pages_dicts, error_or_None)``
- ``extract_docx_pages(file_path)`` → ``(pages_dicts, error_or_None)``
- ``extract_eml(email_path)``    → ``(string, error_or_None)``
"""

from casevault.parsing.docling import (
    extract_pdf_pages,
    extract_docx_pages,
)

__all__ = [
    "extract_pdf_pages",
    "extract_docx_pages",
]
