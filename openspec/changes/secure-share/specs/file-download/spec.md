## ADDED Requirements

### Requirement: Download endpoint returns presigned GET URL with forced attachment disposition
The system SHALL expose `GET /api/files/{id}/download` that validates the file exists and is unexpired, then returns a presigned MinIO GET URL with `Content-Disposition: attachment` forced via presigned URL parameters.

#### Scenario: Successful download request
- **WHEN** a client GETs `/api/files/{id}/download` for a valid, unexpired file within rate limit
- **THEN** the system returns `200 OK` with `{original_filename, download_url}` where `download_url` is a presigned MinIO GET URL

#### Scenario: Content-Disposition forced to attachment
- **WHEN** a presigned GET URL is generated
- **THEN** the URL SHALL include `ResponseContentDisposition=attachment; filename="{original_filename}"` to prevent XSS via inline content rendering

#### Scenario: File not found
- **WHEN** a client GETs `/api/files/{id}/download` and no record exists for `id`
- **THEN** the system returns `404 Not Found`

#### Scenario: File expired (lazy deletion)
- **WHEN** a client GETs `/api/files/{id}/download` and the record's `expires_at` is in the past
- **THEN** the system returns `404 Not Found`

#### Scenario: Rate limit exceeded
- **WHEN** a client IP exceeds 30 download requests within a 60-second window
- **THEN** the system returns `429 Too Many Requests`

### Requirement: Download lookup uses Redis cache with PostgreSQL fallback
The system SHALL check Redis first for file metadata on download requests, falling back to PostgreSQL on cache miss.

#### Scenario: Redis cache hit
- **WHEN** a download request arrives and `file:{id}` exists in Redis
- **THEN** the system uses the cached metadata without querying PostgreSQL

#### Scenario: Redis cache miss falls back to PostgreSQL
- **WHEN** a download request arrives and `file:{id}` does not exist in Redis
- **THEN** the system queries PostgreSQL for the file metadata
