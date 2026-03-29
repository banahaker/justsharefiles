## Requirements

### Requirement: Upload endpoint accepts file metadata and returns presigned PUT URL
The system SHALL expose `POST /api/files/upload` that accepts file metadata (filename, size, TTL), validates it, and returns a presigned PUT URL for direct browser-to-MinIO upload.

#### Scenario: Successful upload request
- **WHEN** a client POSTs `{filename, size_bytes, ttl_seconds}` with size ≤ 50MB and within rate limit
- **THEN** the system returns `200 OK` with `{id, upload_url, expires_at}` where `upload_url` is a presigned MinIO PUT URL valid for 5 minutes

#### Scenario: File too large
- **WHEN** a client POSTs with `size_bytes` greater than 52428800 (50MB)
- **THEN** the system returns `413 Payload Too Large`

#### Scenario: TTL exceeds maximum
- **WHEN** a client POSTs with `ttl_seconds` greater than 2592000 (30 days)
- **THEN** the system returns `422 Unprocessable Entity`

#### Scenario: Rate limit exceeded
- **WHEN** a client IP exceeds 10 upload requests within a 60-second window
- **THEN** the system returns `429 Too Many Requests`

### Requirement: Metadata persisted to PostgreSQL and Redis on upload request
The system SHALL save file metadata to PostgreSQL and Redis immediately when a presigned URL is issued (before the browser completes the upload).

#### Scenario: Metadata saved to PostgreSQL
- **WHEN** a valid upload request is processed
- **THEN** a record is inserted into `shared_files` with the generated NanoID, original filename, size in bytes, and calculated `expires_at`

#### Scenario: Metadata cached in Redis
- **WHEN** a valid upload request is processed
- **THEN** a Redis key `file:{id}` is set with JSON `{original_filename, expires_at}` and TTL equal to remaining seconds until `expires_at`

### Requirement: NanoID uses Base62 alphabet of length 21
The system SHALL generate file IDs using the `nanoid` library with alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz` and length 21.

#### Scenario: Generated ID format
- **WHEN** a valid upload request is processed
- **THEN** the returned `id` SHALL consist solely of characters from `[0-9A-Za-z]` and be exactly 21 characters long
