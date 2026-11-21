"""
OneBox OCR Module

This module handles optical character recognition (OCR) from uploaded screenshot images
using pytesseract and Pillow. Supports configuring the Tesseract executable location
via the TESSERACT_CMD environment variable or standard Windows installation paths.
"""

import io
import os
import shutil
from pathlib import Path
from typing import Optional
from PIL import Image
import pytesseract

# Candidate paths for Tesseract OCR on Windows systems
DEFAULT_WINDOWS_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
]


def resolve_tesseract_cmd() -> Optional[str]:
    """
    Locate the Tesseract OCR executable.
    Checks in the following order:
      1. TESSERACT_CMD environment variable
      2. System PATH (via shutil.which)
      3. Common Windows installation directories
    """
    # 1. Custom environment variable
    custom_path = os.environ.get("TESSERACT_CMD")
    if custom_path and os.path.isfile(custom_path):
        return custom_path

    # 2. In PATH
    which_path = shutil.which("tesseract")
    if which_path:
        return which_path

    # 3. Known Windows directories
    for candidate in DEFAULT_WINDOWS_PATHS:
        if os.path.isfile(candidate):
            return candidate

    return None


def is_tesseract_installed() -> bool:
    """Check if the Tesseract binary is discoverable."""
    cmd = resolve_tesseract_cmd()
    return cmd is not None


def configure_tesseract():
    """Configure pytesseract to point to the resolved Tesseract binary if found."""
    cmd = resolve_tesseract_cmd()
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd


# Initialize configuration on module import
configure_tesseract()


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extract text from raw image bytes using Pillow and pytesseract.

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        Extracted and stripped text string.

    Raises:
        ValueError: If image_bytes cannot be parsed by Pillow (corrupt or invalid).
        RuntimeError: If Tesseract OCR binary is missing or fails execution.
    """
    if not image_bytes:
        raise ValueError("Image data is empty.")

    # Validate image data with Pillow
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.load()  # Force loading to verify image integrity
            # Convert palette/RGBA to RGB if needed to ensure compatibility with OCR engines
            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGB")

            # Ensure Tesseract binary is configured
            cmd = resolve_tesseract_cmd()
            if not cmd:
                raise RuntimeError(
                    "Tesseract OCR is not installed or not found. "
                    "Please install Tesseract OCR for Windows (e.g. from https://github.com/UB-Mannheim/tesseract/wiki) "
                    "and add it to PATH or set the TESSERACT_CMD environment variable."
                )

            pytesseract.pytesseract.tesseract_cmd = cmd

            try:
                extracted = pytesseract.image_to_string(img)
                return extracted.strip()
            except pytesseract.TesseractNotFoundError:
                raise RuntimeError(
                    "Tesseract OCR executable was not found. "
                    "Please install Tesseract OCR for Windows and set TESSERACT_CMD."
                )
            except pytesseract.TesseractError as te:
                raise RuntimeError(f"Tesseract OCR engine error: {str(te)}")

    except (OSError, SyntaxError) as e:
        raise ValueError(f"Invalid or unreadable image file: {str(e)}")
