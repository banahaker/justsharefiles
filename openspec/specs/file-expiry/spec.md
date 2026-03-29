## Requirements

### Requirement: Files expire based on TTL specified at upload time
The system SHALL enforce file expiry such that files become inaccessible after `expires_at`, where `expires_at = upload_time + ttl_seconds`.

#### Scenario: Expired file returns 404
- **WHEN** any request is made for a file whose `expires_at` is in the past
- **THEN** the system returns `404 Not Found` regardless of whether the object exists in MinIO

### Requirement: Hourly background cleanup deletes expired database records
The system SHALL run an in-process APScheduler job every hour that deletes all `shared_files` rows where `expires_at < NOW()`.

#### Scenario: Expired records are deleted
- **WHEN** the hourly cleanup job runs
- **THEN** all rows in `shared_files` with `expires_at < NOW()` are deleted from PostgreSQL

#### Scenario: Cleanup job starts with application
- **WHEN** the FastAPI application starts
- **THEN** the APScheduler background scheduler is started and the hourly job is registered

### Requirement: Redis cache TTL matches file expiry
The system SHALL set Redis cache entries for file metadata with a TTL equal to the remaining seconds until `expires_at`, so cache entries expire automatically when the file expires.

#### Scenario: Cache entry expires with file
- **WHEN** a file metadata cache entry is written to Redis
- **THEN** the Redis key TTL SHALL be set to `max(1, int((expires_at - now()).total_seconds()))` seconds
