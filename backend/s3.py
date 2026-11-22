"""
OneBox AWS S3 Storage Service Module

Manages uploading, downloading, streaming, and presigned URLs for objects
(screenshots, notices, PDFs, documents) stored in AWS S3 with metadata in SQLite.
"""

import os
import re
import uuid
import logging
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

# Safe dotenv loading
try:
    from dotenv import load_dotenv
    backend_dir = Path(__file__).resolve().parent
    load_dotenv(backend_dir / ".env")
    load_dotenv(backend_dir.parent / ".env")
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("onebox.s3")

try:
    import boto3
    from botocore.exceptions import ClientError, EndpointConnectionError, NoCredentialsError
except ImportError:
    boto3 = None
    ClientError = Exception
    EndpointConnectionError = Exception
    NoCredentialsError = Exception

# Local fallback directory in case S3 bucket is pending creation
LOCAL_STORAGE_DIR = Path(__file__).resolve().parent / "storage"
LOCAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def get_s3_config() -> Dict[str, Optional[str]]:
    """Retrieve AWS S3 credentials from environment variables."""
    return {
        "access_key": os.environ.get("AWS_ACCESS_KEY_ID"),
        "secret_key": os.environ.get("AWS_SECRET_ACCESS_KEY"),
        "region": os.environ.get("AWS_REGION", "ap-southeast-2"),
        "bucket": os.environ.get("AWS_S3_BUCKET", "onebox-objects-ayush"),
    }


def is_s3_configured() -> bool:
    """Check if all required AWS S3 configuration values are present."""
    cfg = get_s3_config()
    return bool(cfg["access_key"] and cfg["secret_key"] and cfg["bucket"])


def get_s3_client():
    """Create and return an authenticated boto3 S3 client."""
    if boto3 is None:
        raise RuntimeError("The 'boto3' package is not installed on the server.")

    cfg = get_s3_config()
    if not (cfg["access_key"] and cfg["secret_key"]):
        raise ValueError("AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) are missing.")

    return boto3.client(
        "s3",
        aws_access_key_id=cfg["access_key"].strip(),
        aws_secret_access_key=cfg["secret_key"].strip(),
        region_name=cfg["region"].strip() if cfg["region"] else "ap-southeast-2"
    )


def check_s3_status() -> Dict[str, Any]:
    """
    Check AWS S3 connection and bucket accessibility status.
    Returns safe diagnostic information without leaking secret keys.
    """
    cfg = get_s3_config()
    has_keys = bool(cfg["access_key"] and cfg["secret_key"])
    bucket_name = cfg["bucket"] or "onebox-objects-ayush"
    region = cfg["region"] or "ap-southeast-2"

    if not has_keys:
        return {
            "configured": False,
            "connected": False,
            "bucket": bucket_name,
            "region": region,
            "message": "AWS credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) not found in .env"
        }

    try:
        s3 = get_s3_client()
        s3.head_bucket(Bucket=bucket_name)
        return {
            "configured": True,
            "connected": True,
            "bucket": bucket_name,
            "region": region,
            "message": f"Successfully connected to AWS S3 bucket '{bucket_name}' in '{region}'"
        }
    except ClientError as ce:
        err_code = ce.response.get("Error", {}).get("Code", "")
        if err_code in ("404", "NoSuchBucket"):
            msg = (
                f"S3 bucket '{bucket_name}' does not exist in region '{region}'. "
                f"Please open AWS S3 Console and click 'Create bucket' named '{bucket_name}' in '{region}'."
            )
        elif err_code in ("403", "AccessDenied"):
            msg = f"Access denied to S3 bucket '{bucket_name}'. Please verify IAM permissions."
        else:
            msg = f"S3 error: {err_code}"
        return {
            "configured": True,
            "connected": False,
            "bucket": bucket_name,
            "region": region,
            "error_code": err_code,
            "message": msg
        }
    except Exception as e:
        return {
            "configured": True,
            "connected": False,
            "bucket": bucket_name,
            "region": region,
            "message": f"Connection error: {str(e)}"
        }


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and remove unsupported characters."""
    base = Path(filename).name
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    return clean or "uploaded_file"


def upload_object(
    file_bytes: bytes,
    filename: str,
    content_type: str = "application/octet-stream",
    item_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Upload an object (screenshot, notice, PDF, document) to AWS S3.
    If S3 bucket is not yet created, safely stores locally with automatic forward compatibility.
    Returns metadata dict with s3_key, s3_bucket, file_name, file_size, file_type.
    """
    safe_name = sanitize_filename(filename)
    unique_prefix = uuid.uuid4().hex[:8]
    item_folder = f"item_{item_id}/" if item_id else ""
    s3_key = f"objects/{item_folder}{unique_prefix}_{safe_name}"

    cfg = get_s3_config()
    bucket_name = cfg["bucket"] or "onebox-objects-ayush"

    # Attempt S3 upload
    s3_uploaded = False
    s3_error_detail = None

    if is_s3_configured():
        try:
            s3 = get_s3_client()
            s3.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=file_bytes,
                ContentType=content_type,
            )
            s3_uploaded = True
            logger.info("Successfully uploaded %s (%d bytes) to S3 bucket %s with key %s", safe_name, len(file_bytes), bucket_name, s3_key)
        except Exception as e:
            s3_error_detail = str(e)
            logger.warning("S3 put_object failed (%s). Saving to local backup storage.", e)

    # If S3 upload did not complete, store in local storage fallback
    if not s3_uploaded:
        local_path = LOCAL_STORAGE_DIR / f"{unique_prefix}_{safe_name}"
        local_path.write_bytes(file_bytes)
        logger.info("Saved %s to local storage at %s", safe_name, local_path)

    return {
        "file_name": safe_name,
        "file_size": len(file_bytes),
        "file_type": content_type,
        "s3_key": s3_key,
        "s3_bucket": bucket_name,
        "stored_in_s3": s3_uploaded,
        "s3_error": s3_error_detail
    }


def get_object_stream(s3_key: str, bucket: Optional[str] = None):
    """
    Retrieve an object as a stream from S3 or local storage fallback.
    Returns (generator_or_stream, content_type, content_length, filename).
    """
    cfg = get_s3_config()
    bucket_name = bucket or cfg["bucket"] or "onebox-objects-ayush"
    safe_filename = Path(s3_key).name.split("_", 1)[-1] if "_" in Path(s3_key).name else Path(s3_key).name

    # 1. Try S3 first
    if is_s3_configured():
        try:
            s3 = get_s3_client()
            response = s3.get_object(Bucket=bucket_name, Key=s3_key)
            return (
                response["Body"],
                response.get("ContentType", "application/octet-stream"),
                response.get("ContentLength"),
                safe_filename
            )
        except Exception as e:
            logger.warning("S3 get_object failed for %s (%s). Checking local fallback.", s3_key, e)

    # 2. Try local storage fallback
    # Check if file exists matching filename
    filename_in_key = Path(s3_key).name
    local_file = LOCAL_STORAGE_DIR / filename_in_key
    if not local_file.exists():
        # Match by suffix
        for f in LOCAL_STORAGE_DIR.iterdir():
            if f.name == filename_in_key or f.name.endswith(safe_filename):
                local_file = f
                break

    if local_file.exists():
        def iterfile():
            with open(local_file, "rb") as f:
                while chunk := f.read(64 * 1024):
                    yield chunk

        return (
            iterfile(),
            "application/octet-stream",
            local_file.stat().st_size,
            safe_filename
        )

    raise FileNotFoundError(f"Object with key '{s3_key}' not found in S3 or local storage.")


def get_presigned_download_url(s3_key: str, filename: Optional[str] = None, expires_in: int = 3600) -> Optional[str]:
    """Generate a presigned S3 URL for direct client-side downloading."""
    if not is_s3_configured():
        return None

    try:
        s3 = get_s3_client()
        cfg = get_s3_config()
        bucket_name = cfg["bucket"] or "onebox-objects-ayush"

        params = {
            "Bucket": bucket_name,
            "Key": s3_key,
        }
        if filename:
            params["ResponseContentDisposition"] = f'attachment; filename="{sanitize_filename(filename)}"'

        url = s3.generate_presigned_url(
            "get_object",
            Params=params,
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.warning("Failed to generate presigned URL for %s: %s", s3_key, e)
        return None


def delete_object(s3_key: str, bucket: Optional[str] = None) -> bool:
    """Delete object from S3 and local storage."""
    deleted = False
    cfg = get_s3_config()
    bucket_name = bucket or cfg["bucket"] or "onebox-objects-ayush"

    if is_s3_configured():
        try:
            s3 = get_s3_client()
            s3.delete_object(Bucket=bucket_name, Key=s3_key)
            deleted = True
        except Exception as e:
            logger.warning("Failed to delete %s from S3: %s", s3_key, e)

    # Also clean up local fallback if present
    filename_in_key = Path(s3_key).name
    local_file = LOCAL_STORAGE_DIR / filename_in_key
    if local_file.exists():
        try:
            local_file.unlink()
            deleted = True
        except Exception:
            pass

    return deleted
