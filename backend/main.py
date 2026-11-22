import asyncio
import logging
import os
from datetime import datetime, timezone, timedelta
from enum import Enum
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import or_

from smart_dates import parse_natural_date, get_reminder_urgency
from s3 import (
    upload_object,
    get_object_stream,
    get_presigned_download_url,
    delete_object,
    check_s3_status,
    is_s3_configured,
)

# Safe dotenv loading (does not overwrite existing environment variables)
try:
    from dotenv import load_dotenv
    backend_dir = Path(__file__).resolve().parent
    load_dotenv(backend_dir / ".env")
    load_dotenv(backend_dir.parent / ".env")
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("onebox.main")

from database import init_db, get_db, Item
from ocr import extract_text_from_image, is_tesseract_installed, resolve_tesseract_cmd
from ai import (
    AIExtractRequest,
    AIExtractResponse,
    extract_information,
    is_gemini_configured,
    GeminiConfigError,
    GeminiInputError,
    GeminiModelError,
    GeminiRateLimitError,
    GeminiTemporaryUnavailableError,
    GeminiProviderError,
    GeminiResponseError,
)

# Maximum upload limits
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit for OCR
MAX_OBJECT_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB limit for S3 objects (PDFs, screenshots, docs)
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
SUPPORTED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}

# Initialize database tables on startup
init_db()

app = FastAPI(
    title="OneBox API",
    description="Backend API for OneBox personal information organizer with OCR screenshot extraction, Gemini AI intelligence, and AWS S3 storage",
    version="1.3.0",
)

# CORS configuration for Vite / React dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CategoryEnum(str, Enum):
    NOTE = "NOTE"
    TASK = "TASK"
    EVENT = "EVENT"
    DEADLINE = "DEADLINE"
    REMINDER = "REMINDER"
    OTHER = "OTHER"


def derive_title(content: str, max_length: int = 50) -> str:
    """Derive a concise, meaningful title from the content if none was provided."""
    stripped = content.strip()
    if not stripped:
        return "Untitled Note"
    first_line = stripped.splitlines()[0].strip()
    if not first_line:
        first_line = stripped
    if len(first_line) > max_length:
        return first_line[: max_length - 3].rstrip() + "..."
    return first_line


# Pydantic Schemas
class ItemCreate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    content: str = Field(..., min_length=1)
    category: Optional[str] = Field(default="NOTE")
    remind_at: Optional[datetime] = Field(default=None)
    reminder_status: Optional[str] = Field(default="PENDING")
    is_completed: Optional[bool] = Field(default=False)
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    s3_key: Optional[str] = None
    s3_bucket: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Content cannot be empty or whitespace only.")
        return v.strip()

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> str:
        if not v:
            return "NOTE"
        normalized = v.strip().upper()
        allowed = {c.value for c in CategoryEnum}
        if normalized not in allowed:
            raise ValueError(f"Category must be one of: {', '.join(allowed)}")
        return normalized


class ItemUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    content: Optional[str] = None
    category: Optional[str] = None
    remind_at: Optional[datetime] = None
    reminder_status: Optional[str] = None
    is_completed: Optional[bool] = None
    clear_remind_at: Optional[bool] = False
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    s3_key: Optional[str] = None
    s3_bucket: Optional[str] = None
    clear_attachment: Optional[bool] = False

    @field_validator("content")
    @classmethod
    def validate_content_if_present(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Content cannot be empty or whitespace only.")
            return v.strip()
        return v

    @field_validator("category")
    @classmethod
    def validate_category_if_present(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            normalized = v.strip().upper()
            allowed = {c.value for c in CategoryEnum}
            if normalized not in allowed:
                raise ValueError(f"Category must be one of: {', '.join(allowed)}")
            return normalized
        return v


class ItemResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    remind_at: Optional[datetime] = None
    reminder_status: Optional[str] = "PENDING"
    is_completed: bool = False
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    s3_key: Optional[str] = None
    s3_bucket: Optional[str] = None
    download_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    file_name: str
    file_size: int
    file_type: str
    s3_key: str
    s3_bucket: str
    stored_in_s3: bool
    ocr_text: Optional[str] = None
    download_url: Optional[str] = None
    s3_error: Optional[str] = None


class S3StatusResponse(BaseModel):
    configured: bool
    connected: bool
    bucket: str
    region: str
    message: str


class PresignedUrlResponse(BaseModel):
    presigned_url: Optional[str] = None
    direct_download_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None


class SnoozeRequest(BaseModel):
    minutes: Optional[int] = Field(default=60, ge=1)
    remind_at: Optional[datetime] = None


class RemindersSummaryResponse(BaseModel):
    overdue: int
    today: int
    upcoming: int
    completed: int
    total: int


class OCRResponse(BaseModel):
    text: str
    filename: str


@app.get("/")
def root():
    has_key = is_gemini_configured()
    s3_cfg = is_s3_configured()
    return {
        "app": "OneBox API",
        "version": "1.3.0",
        "docs": "/docs",
        "status": "healthy",
        "ocr_available": is_tesseract_installed(),
        "ai_available": has_key,
        "s3_available": s3_cfg,
    }


# ==========================================
# OCR ENDPOINTS
# ==========================================
@app.get("/api/ocr/status")
def ocr_status():
    """Check Tesseract OCR availability and configuration status."""
    return {
        "available": is_tesseract_installed(),
        "executable": resolve_tesseract_cmd(),
        "supported_formats": ["PNG", "JPG", "JPEG", "WebP"],
        "max_size_mb": MAX_IMAGE_SIZE_BYTES // (1024 * 1024),
    }


@app.post("/api/ocr", response_model=OCRResponse)
async def perform_ocr(file: UploadFile = File(...)):
    """
    Accept an uploaded screenshot/image file, extract text via OCR, and return JSON.
    Does NOT save uploaded screenshots permanently.
    """
    filename = file.filename or "screenshot.png"
    ext = Path(filename).suffix.lower()

    # Validate file extension and MIME type
    if ext not in SUPPORTED_EXTENSIONS and file.content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type or ext}'. Supported formats: PNG, JPG, JPEG, WebP."
        )

    # Read uploaded bytes into memory (not persisted to disk)
    content = await file.read()

    # Validate empty file
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please upload a valid image."
        )

    # Validate file size limit
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed limit of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # Execute OCR in a worker thread to keep the FastAPI async loop unblocked
    try:
        extracted_text = await asyncio.to_thread(extract_text_from_image, content)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )

    return OCRResponse(text=extracted_text, filename=filename)


# ==========================================
# GEMINI AI ENDPOINTS
# ==========================================
@app.get("/api/ai/status")
def ai_status():
    """Check Gemini AI availability and model configuration."""
    has_key = is_gemini_configured()
    model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
    logger.info("AI status check: key_configured=%s, model=%s", has_key, model)
    return {
        "available": has_key,
        "model": model,
    }


@app.post("/api/ai/extract", response_model=AIExtractResponse)
async def ai_extract(request: AIExtractRequest):
    """
    Analyze captured text using Gemini AI and return structured suggestions.
    Does NOT automatically save the item to the database.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text input cannot be empty."
        )

    try:
        result = await asyncio.to_thread(extract_information, request.text)
        return result
    except GeminiConfigError as ce:
        msg = str(ce)
        if "invalid" in msg.lower() or "unauthorized" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=msg
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=msg
        )
    except GeminiInputError as ie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ie)
        )
    except GeminiModelError as me:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(me)
        )
    except GeminiRateLimitError as rle:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(rle)
        )
    except GeminiTemporaryUnavailableError as tue:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(tue)
        )
    except GeminiProviderError as pe:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(pe)
        )
    except GeminiResponseError as re:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(re)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing text with Gemini AI."
        )


# ==========================================
# AWS S3 STORAGE & ATTACHMENT ENDPOINTS
# ==========================================
@app.get("/api/s3/status", response_model=S3StatusResponse)
def s3_status():
    """Check AWS S3 connection and bucket accessibility status."""
    return check_s3_status()


@app.post("/api/upload", response_model=UploadResponse)
async def upload_file_object(file: UploadFile = File(...)):
    """
    Accept an uploaded object (screenshot, notice, PDF, document), store in AWS S3 (with local fallback),
    and if it's an image, also extract text via OCR for immediate note population.
    """
    filename = file.filename or "upload"
    content = await file.read()

    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please select a valid file."
        )

    if len(content) > MAX_OBJECT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_OBJECT_SIZE_BYTES // (1024 * 1024)}MB."
        )

    content_type = file.content_type or "application/octet-stream"
    ext = Path(filename).suffix.lower()

    # Upload to S3 (or fallback storage)
    upload_res = await asyncio.to_thread(
        upload_object,
        file_bytes=content,
        filename=filename,
        content_type=content_type
    )

    # If it's an image and OCR is available, run OCR in worker thread
    ocr_text = None
    if ext in SUPPORTED_EXTENSIONS or content_type in SUPPORTED_CONTENT_TYPES:
        try:
            ocr_text = await asyncio.to_thread(extract_text_from_image, content)
        except Exception as ocr_err:
            logger.info("OCR not performed on uploaded image: %s", ocr_err)

    return UploadResponse(
        file_name=upload_res["file_name"],
        file_size=upload_res["file_size"],
        file_type=upload_res["file_type"],
        s3_key=upload_res["s3_key"],
        s3_bucket=upload_res["s3_bucket"],
        stored_in_s3=upload_res["stored_in_s3"],
        ocr_text=ocr_text,
        download_url=None,
        s3_error=upload_res.get("s3_error")
    )


@app.post("/api/items/{item_id}/upload", response_model=ItemResponse)
async def upload_attachment_for_item(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and attach a file directly to an existing item."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if len(content) > MAX_OBJECT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_OBJECT_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # If item already had an attached object, clean it up
    if item.s3_key:
        await asyncio.to_thread(delete_object, item.s3_key, item.s3_bucket)

    upload_res = await asyncio.to_thread(
        upload_object,
        file_bytes=content,
        filename=file.filename or "attachment",
        content_type=file.content_type or "application/octet-stream",
        item_id=item_id
    )

    item.file_name = upload_res["file_name"]
    item.file_size = upload_res["file_size"]
    item.file_type = upload_res["file_type"]
    item.s3_key = upload_res["s3_key"]
    item.s3_bucket = upload_res["s3_bucket"]
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/items/{item_id}/download")
async def download_item_object(item_id: int, db: Session = Depends(get_db)):
    """Download the attached file object stored in S3 or local storage."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    if not item.s3_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This item does not have any attached file object."
        )

    try:
        stream_res = await asyncio.to_thread(get_object_stream, item.s3_key, item.s3_bucket)
        stream_body, content_type, content_length, filename = stream_res

        # If it's a botocore StreamingBody, read chunks
        async def content_generator():
            if hasattr(stream_body, "iter_chunks"):
                for chunk in stream_body.iter_chunks(chunk_size=64 * 1024):
                    yield chunk
            elif hasattr(stream_body, "read"):
                while chunk := stream_body.read(64 * 1024):
                    yield chunk
            elif callable(stream_body):
                for chunk in stream_body():
                    yield chunk
            elif hasattr(stream_body, "__iter__"):
                for chunk in stream_body:
                    yield chunk

        safe_filename = item.file_name or filename or "download"
        headers = {
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
        if content_length:
            headers["Content-Length"] = str(content_length)

        return StreamingResponse(
            content_generator(),
            media_type=item.file_type or content_type or "application/octet-stream",
            headers=headers
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attached file not found in storage."
        )
    except Exception as e:
        logger.error("Download error for item %d: %s", item_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve file: {str(e)}"
        )


@app.get("/api/items/{item_id}/presigned-url", response_model=PresignedUrlResponse)
def get_item_presigned_url(item_id: int, db: Session = Depends(get_db)):
    """Generate a presigned S3 URL for direct browser downloading if supported."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    if not item.s3_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This item does not have any attached file object."
        )

    url = get_presigned_download_url(item.s3_key, item.file_name)
    return PresignedUrlResponse(
        presigned_url=url,
        direct_download_url=f"/api/items/{item_id}/download",
        file_name=item.file_name,
        file_size=item.file_size,
    )


# ==========================================
# CRUD ITEM ENDPOINTS
# ==========================================
@app.post("/api/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item_in: ItemCreate, db: Session = Depends(get_db)):
    """Capture a new note/item with optional title, category, and reminder timestamp."""
    final_title = item_in.title.strip() if item_in.title and item_in.title.strip() else derive_title(item_in.content)

    # Smart natural date resolution for deadlines, events, or reminders if remind_at not explicitly passed
    target_remind_at = item_in.remind_at
    if target_remind_at is None and item_in.category in ("DEADLINE", "EVENT", "REMINDER"):
        target_remind_at = parse_natural_date(item_in.content)

    new_item = Item(
        title=final_title,
        content=item_in.content,
        category=item_in.category or "NOTE",
        remind_at=target_remind_at,
        reminder_status=item_in.reminder_status or "PENDING",
        is_completed=bool(item_in.is_completed),
        file_name=item_in.file_name,
        file_size=item_in.file_size,
        file_type=item_in.file_type,
        s3_key=item_in.s3_key,
        s3_bucket=item_in.s3_bucket,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@app.get("/api/items", response_model=List[ItemResponse])
def get_items(
    search: Optional[str] = Query(default=None, description="Search term for title or content"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    """Retrieve saved items, with optional keyword search and category filter."""
    query = db.query(Item)

    if category:
        cat_clean = category.strip().upper()
        if cat_clean and cat_clean != "ALL":
            query = query.filter(Item.category == cat_clean)

    if search:
        search_clean = search.strip()
        if search_clean:
            search_pattern = f"%{search_clean}%"
            query = query.filter(
                or_(
                    Item.title.ilike(search_pattern),
                    Item.content.ilike(search_pattern),
                )
            )

    items = query.order_by(Item.created_at.desc()).all()
    return items


@app.get("/api/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve a single item by its ID."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    return item


@app.patch("/api/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item_in: ItemUpdate, db: Session = Depends(get_db)):
    """Update title, content, category, completion or reminder timestamp of an existing item."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    has_changes = False

    if item_in.content is not None:
        item.content = item_in.content
        has_changes = True

    if item_in.title is not None:
        if item_in.title.strip():
            item.title = item_in.title.strip()
        else:
            item.title = derive_title(item.content)
        has_changes = True

    if item_in.category is not None:
        item.category = item_in.category
        has_changes = True

    if item_in.remind_at is not None:
        item.remind_at = item_in.remind_at
        has_changes = True
    elif getattr(item_in, "clear_remind_at", False):
        item.remind_at = None
        has_changes = True

    if item_in.reminder_status is not None:
        item.reminder_status = item_in.reminder_status
        has_changes = True

    if item_in.is_completed is not None:
        item.is_completed = item_in.is_completed
        if item.is_completed:
            item.reminder_status = "COMPLETED"
        elif item.reminder_status == "COMPLETED":
            item.reminder_status = "PENDING"
        has_changes = True

    if getattr(item_in, "clear_attachment", False):
        if item.s3_key:
            try:
                delete_object(item.s3_key, item.s3_bucket)
            except Exception:
                pass
        item.file_name = None
        item.file_size = None
        item.file_type = None
        item.s3_key = None
        item.s3_bucket = None
        has_changes = True
    elif item_in.s3_key is not None:
        item.file_name = item_in.file_name
        item.file_size = item_in.file_size
        item.file_type = item_in.file_type
        item.s3_key = item_in.s3_key
        item.s3_bucket = item_in.s3_bucket
        has_changes = True

    if has_changes:
        item.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(item)

    return item


@app.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an item by its ID, cleaning up any stored S3 object."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    if item.s3_key:
        try:
            delete_object(item.s3_key, item.s3_bucket)
        except Exception as e:
            logger.warning("Failed to clean up object %s on delete: %s", item.s3_key, e)

    db.delete(item)
    db.commit()
    return None


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensure a datetime object is timezone-aware UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


# ==========================================
# SMART REMINDERS & DEADLINES ENDPOINTS
# ==========================================
@app.post("/api/items/{item_id}/complete", response_model=ItemResponse)
def toggle_item_complete(item_id: int, db: Session = Depends(get_db)):
    """Toggle completion status for an item, deadline, or reminder."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    item.is_completed = not bool(item.is_completed)
    item.reminder_status = "COMPLETED" if item.is_completed else "PENDING"
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@app.post("/api/items/{item_id}/snooze", response_model=ItemResponse)
def snooze_item(item_id: int, snooze_in: SnoozeRequest, db: Session = Depends(get_db)):
    """Snooze a reminder or deadline by X minutes or set to a specific datetime."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    now = datetime.now(timezone.utc)
    if snooze_in.remind_at:
        item.remind_at = ensure_utc(snooze_in.remind_at)
    else:
        rem_at = ensure_utc(item.remind_at)
        base = rem_at if rem_at and rem_at > now else now
        item.remind_at = base + timedelta(minutes=snooze_in.minutes or 60)

    item.reminder_status = "SNOOZED"
    item.is_completed = False
    item.updated_at = now
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/reminders/summary", response_model=RemindersSummaryResponse)
def get_reminders_summary(db: Session = Depends(get_db)):
    """Return summary statistics of overdue, today, upcoming, and completed reminders."""
    now = datetime.now(timezone.utc)
    items = db.query(Item).filter(
        or_(
            Item.remind_at.isnot(None),
            Item.category.in_(["DEADLINE", "EVENT", "REMINDER"])
        )
    ).all()

    overdue = 0
    today = 0
    upcoming = 0
    completed = 0

    for item in items:
        if item.is_completed:
            completed += 1
            continue
        urgency = get_reminder_urgency(ensure_utc(item.remind_at), is_completed=item.is_completed, now=now)
        if urgency == "OVERDUE":
            overdue += 1
        elif urgency == "TODAY":
            today += 1
        elif urgency in ("UPCOMING", "FUTURE"):
            upcoming += 1

    return RemindersSummaryResponse(
        overdue=overdue,
        today=today,
        upcoming=upcoming,
        completed=completed,
        total=len(items)
    )


@app.get("/api/reminders", response_model=List[ItemResponse])
def get_reminders(
    filter: Optional[str] = Query(default="all", description="all, overdue, today, upcoming, completed"),
    db: Session = Depends(get_db)
):
    """Retrieve time-sensitive items (deadlines, events, reminders) filtered by urgency."""
    now = datetime.now(timezone.utc)
    query = db.query(Item).filter(
        or_(
            Item.remind_at.isnot(None),
            Item.category.in_(["DEADLINE", "EVENT", "REMINDER"])
        )
    )
    items = query.all()
    filter_clean = (filter or "all").lower().strip()
    results = []

    for item in items:
        urgency = get_reminder_urgency(ensure_utc(item.remind_at), is_completed=item.is_completed, now=now)
        if filter_clean == "completed" and item.is_completed:
            results.append(item)
        elif filter_clean == "overdue" and urgency == "OVERDUE":
            results.append(item)
        elif filter_clean == "today" and urgency == "TODAY":
            results.append(item)
        elif filter_clean == "upcoming" and urgency in ("UPCOMING", "TODAY", "FUTURE"):
            results.append(item)
        elif filter_clean == "all":
            results.append(item)

    # Sort: Incomplete first, then by remind_at ascending (nulls last)
    def sort_key(i: Item):
        is_comp = 1 if i.is_completed else 0
        remind_val = ensure_utc(i.remind_at)
        if remind_val is None:
            # Put items without explicit remind_at at the end
            remind_ts = datetime.max.replace(tzinfo=timezone.utc).timestamp()
        else:
            remind_ts = remind_val.timestamp()
        return (is_comp, remind_ts)

    results.sort(key=sort_key)
    return results
