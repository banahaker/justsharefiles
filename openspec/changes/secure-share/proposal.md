## Why

There is no simple, self-hosted solution for temporarily sharing large files without requiring accounts or third-party services. This project delivers a deployable, secure file-sharing application that lets users upload files and generate time-limited sharing links — runnable locally with a single `docker-compose up`.

## What Changes

- New full-stack monorepo application built from scratch (no existing code modified)
- New **upload flow**: client requests a presigned PUT URL, uploads directly to MinIO, backend stores metadata
- New **download flow**: client requests a presigned GET URL, downloads directly from MinIO, backend enforces expiry
- New **rate limiting**: fixed-window IP-based limits on upload (10/min) and download (30/min) endpoints
- New **automatic expiry**: lazy deletion on every GET request + hourly APScheduler background cleanup task
- New **Docker Compose stack**: FastAPI backend, Next.js/Nginx frontend, PostgreSQL, Redis, MinIO — all wired with healthchecks and init containers

## Capabilities

### New Capabilities

- `file-upload`: Accept file metadata, validate size/rate limits, generate presigned PUT URL, persist metadata to PostgreSQL and Redis cache
- `file-download`: Validate file exists and is unexpired, generate presigned GET URL with forced content-disposition attachment header
- `file-expiry`: Time-based expiry enforced via lazy deletion on reads and periodic background cleanup
- `rate-limiting`: Fixed-window Redis rate limiting per IP for upload and download endpoints
- `presigned-url-generation`: boto3-based presigned URL generation using separate internal (minio:9000) and external (MINIO_EXTERNAL_ENDPOINT) endpoints
- `frontend-ui`: Next.js upload dropzone with client-side validation, expiration selector, share link result screen, and download page at `/d/[id]`
- `infrastructure`: Docker Compose stack with healthchecks, minio-setup init container, PostgreSQL schema, Redis, environment configuration

### Modified Capabilities

## Impact

- **New dependencies**: FastAPI, asyncpg, redis-py, boto3, nanoid, APScheduler, pydantic-settings, uvicorn (backend); Next.js, TailwindCSS, Axios (frontend)
- **New infrastructure**: PostgreSQL 15, Redis, MinIO — all containerized
- **No existing code modified** — greenfield project
- **Reviewer impact**: `docker-compose up` starts all services; presigned URLs use `localhost:9000` by default, configurable via `MINIO_EXTERNAL_ENDPOINT`
