"""
OneBox Gemini AI Module

Handles intelligent structured extraction from notes and screenshot OCR text
using the official google-genai SDK.
Exclusively reads API key from GEMINI_API_KEY environment variable or .env file.
Configurable model via GEMINI_MODEL (defaults to gemini-3.5-flash).
"""

import os
import json
import logging
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError

from smart_dates import parse_natural_date

# Safe dotenv loading (does not overwrite existing environment variables)
try:
    from dotenv import load_dotenv
    backend_dir = Path(__file__).resolve().parent
    load_dotenv(backend_dir / ".env")
    load_dotenv(backend_dir.parent / ".env")
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("onebox.ai")

try:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError
except ImportError:
    genai = None
    types = None
    APIError = Exception


class AICategoryEnum(str, Enum):
    NOTE = "NOTE"
    TASK = "TASK"
    EVENT = "EVENT"
    DEADLINE = "DEADLINE"
    REMINDER = "REMINDER"
    OTHER = "OTHER"


class AIExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw text from user note or OCR screenshot")


class AIExtractResponse(BaseModel):
    title: str = Field(..., description="Concise, informative title (3-7 words, max 50 chars)")
    category: AICategoryEnum = Field(..., description="Category: NOTE, TASK, EVENT, DEADLINE, REMINDER, or OTHER")
    summary: str = Field(..., description="Brief 1-2 sentence explanation")
    action_items: List[str] = Field(default_factory=list, description="Actionable next steps")
    dates: List[str] = Field(default_factory=list, description="Explicit dates or time expressions found in text")
    remind_at: Optional[str] = Field(
        default=None,
        description="ISO 8601 formatted datetime string (e.g. '2026-11-22T17:00:00Z') if a specific date or time is indicated. Return null if none."
    )
    clarification_flags: List[str] = Field(
        default_factory=list,
        description="Ambiguities or missing details that need user review"
    )


class GeminiConfigError(Exception):
    """Raised when GEMINI_API_KEY is missing or invalid."""
    pass


class GeminiInputError(Exception):
    """Raised when input text is empty or invalid."""
    pass


class GeminiModelError(Exception):
    """Raised when requested model is not found or unsupported."""
    pass


class GeminiRateLimitError(Exception):
    """Raised when rate limit or quota is exceeded."""
    pass


class GeminiTemporaryUnavailableError(Exception):
    """Raised when Gemini experiences temporary high demand or 503."""
    pass


class GeminiProviderError(Exception):
    """Raised when the Gemini API encounters timeouts or generic provider errors."""
    pass


class GeminiResponseError(Exception):
    """Raised when the Gemini response is malformed or cannot be validated."""
    pass


def is_gemini_configured() -> bool:
    """Safe check: returns True if GEMINI_API_KEY is present and non-empty."""
    return bool(os.environ.get("GEMINI_API_KEY", "").strip())


def get_gemini_client() -> "genai.Client":
    """
    Initialize Google GenAI client exclusively using the GEMINI_API_KEY environment variable.
    Logs only presence, never the key value.
    """
    if genai is None:
        raise GeminiConfigError("The 'google-genai' SDK is not installed on the server.")

    api_key = os.environ.get("GEMINI_API_KEY")
    has_key = bool(api_key and api_key.strip())
    logger.info("Initializing Gemini client: key_present=%s", has_key)

    if not has_key:
        raise GeminiConfigError(
            "GEMINI_API_KEY environment variable is not configured on the server. "
            "Please set GEMINI_API_KEY in your environment or backend/.env file to use AI organization."
        )

    return genai.Client(api_key=api_key.strip())


SYSTEM_INSTRUCTION = (
    "You are an expert personal information organizer and smart reminder assistant for OneBox.\n"
    "Analyze the user's captured text and extract structured information strictly according to the schema:\n"
    "1. title: Concise and informative title (max 50 chars).\n"
    "2. category: Strictly one of NOTE, TASK, EVENT, DEADLINE, REMINDER, OTHER.\n"
    "   - Use DEADLINE if there is an explicit deadline or submission cutoff.\n"
    "   - Use EVENT if it describes a scheduled meeting, appointment, webinar, flight, or gathering.\n"
    "   - Use REMINDER if it is a personal reminder, alert, prompt, or follow-up note (e.g. 'remind me to call Mom').\n"
    "   - Use TASK if it describes an actionable to-do or chore.\n"
    "   - Use NOTE for ideas, general information, summaries, or references.\n"
    "   - Use OTHER if it does not fit the above categories.\n"
    "3. summary: A clear 1-2 sentence explanation of the content.\n"
    "4. action_items: Concrete actionable steps explicitly derived from the text. Return [] if none.\n"
    "5. dates: Explicit dates, deadlines, days of the week, or time expressions directly stated in the text "
    "(e.g., 'Friday 5 PM', 'March 15'). CRITICAL: Never invent, assume, or hallucinate dates.\n"
    "6. remind_at: If a specific date/time for the deadline, event, or reminder can be computed relative to "
    "the provided current reference date and time, output it as an exact ISO 8601 string (e.g. '2026-11-22T17:00:00Z'). "
    "Otherwise return null.\n"
    "7. clarification_flags: List any ambiguities, missing essential details (e.g., missing submission portal, "
    "unspecified meeting venue, or relative dates like 'tomorrow' without a base reference date). "
    "Return [] if everything is clear."
)


def extract_information(
    text: str,
    client: Optional["genai.Client"] = None,
    model: Optional[str] = None
) -> AIExtractResponse:
    """
    Extract structured information from text using Gemini AI with structured schema validation.
    Clearly distinguishes missing key, invalid key, model availability, rate limits, and temporary unavailability.
    """
    if not text or not text.strip():
        raise GeminiInputError("Text input cannot be empty.")

    clean_text = text.strip()
    target_model = model or os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")

    if client is None:
        client = get_gemini_client()

    now_utc = datetime.now(timezone.utc)
    ref_time_str = now_utc.strftime("%A, %Y-%m-%d %H:%M UTC")

    logger.info("Executing Gemini extraction: model=%s, input_chars=%d", target_model, len(clean_text))

    prompt = (
        f"Current reference date and time: {ref_time_str}\n\n"
        f"Analyze the following text and organize it into structured information:\n\n{clean_text}"
    )

    try:
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=AIExtractResponse,
            temperature=0.1,
        )

        response = client.models.generate_content(
            model=target_model,
            contents=prompt,
            config=config,
        )
    except APIError as ae:
        err_msg = str(ae)
        code = getattr(ae, 'code', None)
        logger.warning("Gemini APIError encountered: code=%s", code)

        # 1. Invalid or unauthorized API key
        if code in (401, 403) or "API_KEY_INVALID" in err_msg or "API key not valid" in err_msg or "PERMISSION_DENIED" in err_msg:
            raise GeminiConfigError("Invalid or unauthorized Gemini API key.")

        # 2. Rate limit or quota exceeded
        if code == 429 or "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg.upper():
            raise GeminiRateLimitError("Gemini API rate limit or quota exceeded. Please try again shortly.")

        # 3. Model not found or unavailable
        if code == 404 or "NOT_FOUND" in err_msg:
            raise GeminiModelError(f"The Gemini model '{target_model}' is not available or not supported.")

        # 4. Temporary high demand / service unavailable (503)
        if code == 503 or "UNAVAILABLE" in err_msg or "high demand" in err_msg.lower():
            raise GeminiTemporaryUnavailableError(
                f"Gemini model '{target_model}' is temporarily experiencing high demand. Please retry in a moment."
            )

        raise GeminiProviderError("Gemini API error occurred. Please try again.")

    except Exception as e:
        err_str = str(e)
        logger.error("Unexpected error in Gemini extraction: %s", type(e).__name__)
        if "API_KEY" in err_str.upper() or "APIKEY" in err_str.upper():
            raise GeminiConfigError("Invalid or unauthorized Gemini API key.")
        raise GeminiProviderError("Failed to communicate with Gemini API. Please check your network and credentials.")

    if not response or not response.text:
        raise GeminiResponseError("Empty response received from Gemini AI.")

    try:
        validated = AIExtractResponse.model_validate_json(response.text)

        # If Gemini didn't supply remind_at, attempt smart local parsing on extracted dates or text
        if not validated.remind_at:
            candidate = None
            for date_expr in validated.dates:
                candidate = parse_natural_date(date_expr, base_time=now_utc)
                if candidate:
                    break
            if not candidate and validated.category in (AICategoryEnum.DEADLINE, AICategoryEnum.EVENT, AICategoryEnum.REMINDER):
                candidate = parse_natural_date(clean_text, base_time=now_utc)
            if candidate:
                validated.remind_at = candidate.isoformat()

        logger.info("Gemini extraction successful: category=%s, title='%s', remind_at=%s", validated.category.value, validated.title, validated.remind_at)
        return validated
    except (ValidationError, json.JSONDecodeError):
        logger.error("Failed to parse Gemini response as AIExtractResponse JSON")
        raise GeminiResponseError("Failed to parse Gemini structured output into expected schema.")
