import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request
from nanoid import generate

from ..core.db import get_pool
from ..core.redis import get_redis
from ..core.storage import generate_presigned_put_url, generate_presigned_get_url
from ..core.rate_limit import check_rate_limit
from ..models.schemas import UploadRequest, UploadResponse, DownloadResponse

NANOID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_file(payload: UploadRequest, request: Request):
    client_ip = request.client.host
    redis = get_redis()
    pool = get_pool()

    # Validate size
    if payload.size_bytes > 52428800:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")

    # Validate TTL
    if payload.ttl_seconds < 1 or payload.ttl_seconds > 2592000:
        raise HTTPException(status_code=422, detail="ttl_seconds must be between 1 and 2592000 (30 days).")

    # Rate limit
    await check_rate_limit(redis, "upload", client_ip, limit=10)

    # Generate ID and expiry
    file_id = generate(NANOID_ALPHABET, 21)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=payload.ttl_seconds)

    # Generate presigned PUT URL
    upload_url = generate_presigned_put_url(file_id)

    # Save to PostgreSQL
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO shared_files (id, original_filename, size_bytes, expires_at)
            VALUES ($1, $2, $3, $4)
            """,
            file_id, payload.filename, payload.size_bytes, expires_at
        )

    # Cache in Redis
    ttl_seconds = max(1, int((expires_at - now).total_seconds()))
    await redis.set(
        f"file:{file_id}",
        json.dumps({"original_filename": payload.filename, "expires_at": expires_at.isoformat()}),
        ex=ttl_seconds
    )

    return UploadResponse(id=file_id, upload_url=upload_url, expires_at=expires_at)


@router.get("/{file_id}/download", response_model=DownloadResponse)
async def download_file(file_id: str, request: Request):
    client_ip = request.client.host
    redis = get_redis()
    pool = get_pool()

    # Rate limit
    await check_rate_limit(redis, "download", client_ip, limit=30)

    # Try Redis cache first
    cached = await redis.get(f"file:{file_id}")
    now = datetime.now(timezone.utc)

    if cached:
        data = json.loads(cached)
        original_filename = data["original_filename"]
        expires_at = datetime.fromisoformat(data["expires_at"])
        if expires_at <= now:
            raise HTTPException(status_code=404, detail="File not found or has expired.")
    else:
        # Fallback to PostgreSQL
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT original_filename, expires_at FROM shared_files WHERE id = $1",
                file_id
            )
        if not row:
            raise HTTPException(status_code=404, detail="File not found or has expired.")

        expires_at = row["expires_at"].replace(tzinfo=timezone.utc) if row["expires_at"].tzinfo is None else row["expires_at"]
        if expires_at <= now:
            raise HTTPException(status_code=404, detail="File not found or has expired.")

        original_filename = row["original_filename"]

    # Generate presigned GET URL
    download_url = generate_presigned_get_url(file_id, original_filename)

    return DownloadResponse(original_filename=original_filename, download_url=download_url)
