from pydantic import BaseModel
from datetime import datetime

class UploadRequest(BaseModel):
    filename: str
    size_bytes: int
    ttl_seconds: int

class UploadResponse(BaseModel):
    id: str
    upload_url: str
    expires_at: datetime

class DownloadResponse(BaseModel):
    original_filename: str
    download_url: str
