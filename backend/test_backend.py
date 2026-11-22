import io
import json
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
from PIL import Image
from fastapi.testclient import TestClient

# Ensure current directory is in path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import app
from database import DB_PATH

client = TestClient(app)


def create_dummy_image(format: str = "PNG", size=(100, 40), color="white") -> bytes:
    """Helper to generate valid image bytes in-memory for testing."""
    img = Image.new("RGB", size, color=color)
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    return buffer.getvalue()


def run_tests():
    print("=== Running OneBox Backend Tests (Milestone 1, 2 & 3) ===")

    # 1. Health check & status endpoints
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("[PASS] Root health check")

    res = client.get("/api/ocr/status")
    assert res.status_code == 200
    assert "supported_formats" in res.json()
    print(f"[PASS] OCR status check: available={res.json()['available']}")

    res = client.get("/api/ai/status")
    assert res.status_code == 200
    assert "model" in res.json()
    print(f"[PASS] AI status check: model={res.json()['model']}")

    # ==========================================
    # MILESTONE 3: GEMINI AI EXTRACTION TESTS (MOCKED)
    # ==========================================
    sample_ai_payload = {
        "title": "DBMS Assignment Submission",
        "category": "DEADLINE",
        "summary": "Submit DBMS assignment by Friday 5 PM.",
        "action_items": ["Finalize SQL queries", "Export PDF report"],
        "dates": ["Friday 5 PM"],
        "clarification_flags": ["Submission portal URL not specified"]
    }

    # 2. Successful AI extraction
    mock_response = MagicMock()
    mock_response.text = json.dumps(sample_ai_payload)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.return_value = mock_response

            res = client.post("/api/ai/extract", json={"text": "Submit the DBMS assignment by Friday 5 PM."})
            assert res.status_code == 200, f"AI extraction failed: {res.text}"
            data = res.json()
            assert data["title"] == "DBMS Assignment Submission"
            assert data["category"] == "DEADLINE"
            assert len(data["action_items"]) == 2
            assert data["dates"] == ["Friday 5 PM"]
            assert data["clarification_flags"] == ["Submission portal URL not specified"]
            print("[PASS] Successful AI extraction with structured output")

    # 3. Missing GEMINI_API_KEY
    with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
        res = client.post("/api/ai/extract", json={"text": "Organize my team meeting note."})
        assert res.status_code == 503, f"Expected 503, got {res.status_code}"
        assert "GEMINI_API_KEY" in res.json()["detail"]
        print("[PASS] Missing API key handled with 503")

    # 4. Invalid / Empty input
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        res = client.post("/api/ai/extract", json={"text": ""})
        assert res.status_code == 400 or res.status_code == 422
        print("[PASS] Empty input rejected")

        res = client.post("/api/ai/extract", json={"text": "   "})
        assert res.status_code == 400
        print("[PASS] Whitespace-only input rejected")

    # 5. Gemini Provider Error / Timeout
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.side_effect = Exception("Connection timed out")

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 502, f"Expected 502, got {res.status_code}"
            assert "Failed to communicate with Gemini API" in res.json()["detail"]
            print("[PASS] Provider connection failure handled with 502")

    # 6. Rate Limit / Quota Exceeded (429)
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            from google.genai.errors import APIError
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.side_effect = APIError(
                code=429,
                response_json={"error": {"code": 429, "message": "RESOURCE_EXHAUSTED: Rate limit exceeded"}}
            )

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 429, f"Expected 429, got {res.status_code}"
            assert "rate limit" in res.json()["detail"].lower() or "quota" in res.json()["detail"].lower()
            print("[PASS] Rate limit handled with 429")

    # 7. Malformed response from Gemini
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            bad_response = MagicMock()
            bad_response.text = "NOT_VALID_JSON_FORMAT_AT_ALL"
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.return_value = bad_response

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 502, f"Expected 502, got {res.status_code}"
            assert "parse" in res.json()["detail"].lower() or "invalid" in res.json()["detail"].lower()
            print("[PASS] Malformed JSON response handled with 502")

    # 8. Invalid / Unauthorized API key (401)
    with patch.dict(os.environ, {"GEMINI_API_KEY": "invalid-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            from google.genai.errors import APIError
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.side_effect = APIError(
                code=400,
                response_json={"error": {"code": 400, "message": "API_KEY_INVALID: API key not valid"}}
            )

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 401, f"Expected 401, got {res.status_code}"
            assert "invalid or unauthorized" in res.json()["detail"].lower()
            print("[PASS] Invalid API key handled with 401")

    # 9. Model not found (502)
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            from google.genai.errors import APIError
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.side_effect = APIError(
                code=404,
                response_json={"error": {"code": 404, "message": "NOT_FOUND: models/unknown is not found"}}
            )

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 502, f"Expected 502, got {res.status_code}"
            assert "not available" in res.json()["detail"].lower()
            print("[PASS] Model availability issue handled with 502")

    # 10. Temporary high demand / 503
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-mock-key"}):
        with patch("ai.genai.Client") as mock_client_cls:
            from google.genai.errors import APIError
            mock_instance = MagicMock()
            mock_client_cls.return_value = mock_instance
            mock_instance.models.generate_content.side_effect = APIError(
                code=503,
                response_json={"error": {"code": 503, "message": "UNAVAILABLE: Model experiencing high demand"}}
            )

            res = client.post("/api/ai/extract", json={"text": "Valid note to process"})
            assert res.status_code == 503, f"Expected 503, got {res.status_code}"
            assert "high demand" in res.json()["detail"].lower() or "unavailable" in res.json()["detail"].lower()
            print("[PASS] Temporary high demand handled with 503")

    # ==========================================
    # MILESTONE 2: OCR ENDPOINT TESTS (MOCKED)
    # ==========================================
    png_bytes = create_dummy_image("PNG")
    jpg_bytes = create_dummy_image("JPEG")
    webp_bytes = create_dummy_image("WEBP")

    with patch("ocr.resolve_tesseract_cmd", return_value=r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
        with patch("pytesseract.image_to_string", return_value="Submit the assignment by Friday"):
            res = client.post(
                "/api/ocr",
                files={"file": ("assignment.png", png_bytes, "image/png")}
            )
            assert res.status_code == 200, f"OCR failed: {res.text}"
            data = res.json()
            assert data["text"] == "Submit the assignment by Friday"
            assert data["filename"] == "assignment.png"
            print("[PASS] Successful OCR test (PNG)")

    # Empty OCR output
    with patch("ocr.resolve_tesseract_cmd", return_value=r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
        with patch("pytesseract.image_to_string", return_value=""):
            res = client.post(
                "/api/ocr",
                files={"file": ("blank.png", png_bytes, "image/png")}
            )
            assert res.status_code == 200
            assert res.json()["text"] == ""
            print("[PASS] Empty OCR output handled gracefully")

    # Unsupported file type (.txt)
    res = client.post(
        "/api/ocr",
        files={"file": ("notes.txt", b"Hello world text", "text/plain")}
    )
    assert res.status_code == 415
    print("[PASS] Unsupported file type rejected (415)")

    # Empty file upload (0 bytes)
    res = client.post(
        "/api/ocr",
        files={"file": ("empty.png", b"", "image/png")}
    )
    assert res.status_code == 400
    print("[PASS] Empty file rejected (400)")

    # Oversized file upload (>10 MB)
    large_bytes = b"0" * (10 * 1024 * 1024 + 1024)
    res = client.post(
        "/api/ocr",
        files={"file": ("huge.png", large_bytes, "image/png")}
    )
    assert res.status_code == 413
    print("[PASS] Oversized file rejected (413)")

    # Corrupted / invalid image data
    res = client.post(
        "/api/ocr",
        files={"file": ("corrupt.png", b"NOT_A_VALID_IMAGE_HEADER_BYTES", "image/png")}
    )
    assert res.status_code == 400
    print("[PASS] Invalid image data rejected (400)")

    # Missing Tesseract binary
    with patch("ocr.resolve_tesseract_cmd", return_value=None):
        res = client.post(
            "/api/ocr",
            files={"file": ("valid.png", png_bytes, "image/png")}
        )
        assert res.status_code == 503
        print("[PASS] Missing Tesseract binary handled gracefully with 503")

    # ==========================================
    # MILESTONE 1 REGRESSION TESTS (CRUD)
    # ==========================================
    # Create item with DEADLINE category
    res = client.post(
        "/api/items",
        json={"title": "AI Organized Deadline", "content": "Complete report before sprint ends", "category": "DEADLINE"}
    )
    assert res.status_code == 201
    item = res.json()
    item_id = item["id"]
    assert item["category"] == "DEADLINE"
    print(f"[PASS] CRUD: Create item with DEADLINE category (ID: {item_id})")

    # Get single item
    res = client.get(f"/api/items/{item_id}")
    assert res.status_code == 200
    assert res.json()["title"] == "AI Organized Deadline"
    print(f"[PASS] CRUD: Get item verified")

    # Filter items by DEADLINE category
    res = client.get("/api/items?category=DEADLINE")
    assert res.status_code == 200
    assert any(i["id"] == item_id for i in res.json())
    print(f"[PASS] CRUD: Filter by DEADLINE category verified")

    # Search items
    res = client.get("/api/items?search=Organized")
    assert res.status_code == 200
    assert any(i["id"] == item_id for i in res.json())
    print(f"[PASS] CRUD: Search verified")

    # Patch item
    res = client.patch(f"/api/items/{item_id}", json={"category": "TASK", "title": "Updated Task Title"})
    assert res.status_code == 200
    assert res.json()["category"] == "TASK"
    assert res.json()["title"] == "Updated Task Title"
    print(f"[PASS] CRUD: Patch verified")

    # Delete item
    res = client.delete(f"/api/items/{item_id}")
    assert res.status_code == 204
    res = client.get(f"/api/items/{item_id}")
    assert res.status_code == 404
    print(f"[PASS] CRUD: Delete verified")

    # Verify DB persistence
    assert DB_PATH.exists()
    print(f"[PASS] Persistence verified at {DB_PATH}")

    # ==========================================
    # SMART REMINDERS & DEADLINES TESTS
    # ==========================================
    # 1. Create a reminder with explicit remind_at
    from datetime import datetime, timezone, timedelta
    future_time = (datetime.now(timezone.utc) + timedelta(hours=3)).isoformat()
    past_time = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()

    res = client.post(
        "/api/items",
        json={
            "title": "Call dentist for checkup",
            "content": "Schedule routine cleaning appointment",
            "category": "REMINDER",
            "remind_at": future_time
        }
    )
    assert res.status_code == 201, f"Failed to create reminder: {res.text}"
    reminder_item = res.json()
    assert reminder_item["category"] == "REMINDER"
    assert reminder_item["remind_at"] is not None
    assert reminder_item["is_completed"] is False
    rem_id = reminder_item["id"]
    print(f"[PASS] Smart Reminders: Create item with REMINDER category and remind_at (ID: {rem_id})")

    # 2. Toggle complete
    res = client.post(f"/api/items/{rem_id}/complete")
    assert res.status_code == 200
    assert res.json()["is_completed"] is True
    assert res.json()["reminder_status"] == "COMPLETED"
    print("[PASS] Smart Reminders: Toggle complete verified")

    # Toggle back to incomplete
    res = client.post(f"/api/items/{rem_id}/complete")
    assert res.status_code == 200
    assert res.json()["is_completed"] is False
    assert res.json()["reminder_status"] == "PENDING"
    print("[PASS] Smart Reminders: Toggle back to incomplete verified")

    # 3. Snooze reminder by 120 minutes
    res = client.post(f"/api/items/{rem_id}/snooze", json={"minutes": 120})
    assert res.status_code == 200
    snoozed_data = res.json()
    assert snoozed_data["reminder_status"] == "SNOOZED"
    print("[PASS] Smart Reminders: Snooze reminder verified")

    # 4. Create an overdue deadline item
    res = client.post(
        "/api/items",
        json={
            "title": "Quarterly taxes submission",
            "content": "Submit Q3 tax report",
            "category": "DEADLINE",
            "remind_at": past_time
        }
    )
    assert res.status_code == 201
    overdue_id = res.json()["id"]

    # 5. Check reminders summary
    res = client.get("/api/reminders/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["overdue"] >= 1
    assert summary["total"] >= 2
    print(f"[PASS] Smart Reminders: Summary verified (overdue={summary['overdue']}, upcoming={summary['upcoming']})")

    # 6. Check reminders filtered listing
    res = client.get("/api/reminders?filter=overdue")
    assert res.status_code == 200
    overdue_list = res.json()
    assert any(i["id"] == overdue_id for i in overdue_list)
    print("[PASS] Smart Reminders: Overdue filter verified")

    # Clean up test reminder items
    client.delete(f"/api/items/{rem_id}")
    client.delete(f"/api/items/{overdue_id}")

    # ==========================================
    # MILESTONE 4: AWS S3 & OBJECT STORAGE TESTS
    # ==========================================
    # 1. S3 Status Check
    res = client.get("/api/s3/status")
    assert res.status_code == 200, f"S3 status failed: {res.text}"
    s3_status_data = res.json()
    assert "configured" in s3_status_data
    assert "bucket" in s3_status_data
    assert "region" in s3_status_data
    print(f"[PASS] S3 Status Check: configured={s3_status_data['configured']}, bucket={s3_status_data['bucket']}")

    # 2. Upload Object (PDF / document / notice)
    dummy_doc_content = b"%PDF-1.4 OneBox Notice Document Sample Content\nExam Schedule and Deadlines"
    res = client.post(
        "/api/upload",
        files={"file": ("notice_exam.pdf", dummy_doc_content, "application/pdf")}
    )
    assert res.status_code == 200, f"Object upload failed: {res.text}"
    upload_data = res.json()
    assert upload_data["file_name"] == "notice_exam.pdf"
    assert upload_data["file_size"] == len(dummy_doc_content)
    assert upload_data["file_type"] == "application/pdf"
    assert upload_data["s3_key"] is not None
    print(f"[PASS] S3 Upload Object: key={upload_data['s3_key']}, size={upload_data['file_size']} bytes")

    # 3. Create Note with attached S3 Object metadata
    res = client.post(
        "/api/items",
        json={
            "title": "Semester Final Exam Notice",
            "content": "Official exam timetable for December 2026. Review attached PDF.",
            "category": "DEADLINE",
            "file_name": upload_data["file_name"],
            "file_size": upload_data["file_size"],
            "file_type": upload_data["file_type"],
            "s3_key": upload_data["s3_key"],
            "s3_bucket": upload_data["s3_bucket"],
        }
    )
    assert res.status_code == 201, f"Failed to create item with S3 attachment: {res.text}"
    item_with_obj = res.json()
    assert item_with_obj["s3_key"] == upload_data["s3_key"]
    assert item_with_obj["file_name"] == "notice_exam.pdf"
    assert item_with_obj["download_url"] == f"/api/items/{item_with_obj['id']}/download"
    obj_item_id = item_with_obj["id"]
    print(f"[PASS] S3 Metadata in DB: item_id={obj_item_id}, download_url={item_with_obj['download_url']}")

    # 4. Download Object via /api/items/{id}/download
    res = client.get(f"/api/items/{obj_item_id}/download")
    assert res.status_code == 200, f"Download failed: {res.text}"
    assert res.content == dummy_doc_content, "Downloaded file content does not match uploaded content!"
    assert "attachment" in res.headers.get("content-disposition", "")
    print(f"[PASS] S3 Download Object: Verified {len(res.content)} bytes downloaded matching exact content")

    # 5. Presigned URL endpoint
    res = client.get(f"/api/items/{obj_item_id}/presigned-url")
    assert res.status_code == 200
    presigned_data = res.json()
    assert presigned_data["direct_download_url"] == f"/api/items/{obj_item_id}/download"
    print(f"[PASS] S3 Presigned URL: direct={presigned_data['direct_download_url']}")

    # 6. Upload directly to existing item
    res = client.post(
        f"/api/items/{obj_item_id}/upload",
        files={"file": ("updated_schedule.txt", b"Updated schedule notice details", "text/plain")}
    )
    assert res.status_code == 200
    updated_item = res.json()
    assert updated_item["file_name"] == "updated_schedule.txt"
    print(f"[PASS] S3 Update Attachment directly: file_name={updated_item['file_name']}")

    # Download updated attachment
    res = client.get(f"/api/items/{obj_item_id}/download")
    assert res.status_code == 200
    assert res.content == b"Updated schedule notice details"
    print("[PASS] S3 Download Updated Object verified")

    # 7. Delete item and verify cleanup
    res = client.delete(f"/api/items/{obj_item_id}")
    assert res.status_code == 204
    res = client.get(f"/api/items/{obj_item_id}/download")
    assert res.status_code == 404
    print("[PASS] S3 Cleanup on Item Delete verified")

    print("\nALL BACKEND, OCR, GEMINI AI, SMART REMINDER, AND AWS S3 TESTS PASSED SUCCESSFULLY! :)")


if __name__ == "__main__":
    run_tests()
