## 1. Project Scaffold & Configuration

- [x] 1.1 Create root `docker-compose.yml` with all services: postgres, redis, minio, minio-setup, backend, frontend
- [x] 1.2 Add MinIO healthcheck (`curl -f http://localhost:9000/minio/health/live`) and minio-setup `depends_on: minio: condition: service_healthy`
- [x] 1.3 Create `.env.example` with all required variables and working local defaults (`MINIO_EXTERNAL_ENDPOINT=http://localhost:9000`, DB creds, Redis URL, MinIO keys)

## 2. Database & Infrastructure Init Scripts

- [x] 2.1 Create `infra/postgres/init.sql` with `shared_files` table (id VARCHAR(21) PK, original_filename, size_bytes, created_at, expires_at) and B-Tree index on `expires_at`
- [x] 2.2 Create `infra/minio/create-bucket.sh` using `mc` to configure alias and run `mc mb --ignore-existing local/uploads`

## 3. Backend — Core Setup

- [x] 3.1 Create `backend/requirements.txt` with: fastapi, uvicorn, asyncpg, redis, boto3, nanoid, pydantic-settings, apscheduler
- [x] 3.2 Create `backend/Dockerfile` multi-stage: builder installs deps with pip, slim final image copies app
- [x] 3.3 Create `backend/app/core/config.py` with pydantic-settings `Settings` class for all env vars (DB URL, Redis URL, MinIO internal endpoint, MINIO_EXTERNAL_ENDPOINT, bucket name, access keys)

## 4. Backend — Database & Redis Clients

- [x] 4.1 Create `backend/app/core/db.py` with asyncpg connection pool (startup/shutdown lifespan hooks)
- [x] 4.2 Create `backend/app/core/redis.py` with async Redis client initialization

## 5. Backend — MinIO / Storage

- [x] 5.1 Create `backend/app/core/storage.py` with two boto3 S3 clients: `internal_client` (endpoint=`minio:9000`) and `external_client` (endpoint=`MINIO_EXTERNAL_ENDPOINT`)
- [x] 5.2 Implement `generate_presigned_put_url(key, expires=300)` using `external_client`
- [x] 5.3 Implement `generate_presigned_get_url(key, filename)` using `external_client` with `ResponseContentDisposition=attachment; filename="{filename}"`

## 6. Backend — Rate Limiter

- [x] 6.1 Create `backend/app/core/rate_limit.py` implementing fixed-window rate limiter using Redis `INCR` + `EXPIRE` (set TTL=60 only when value==1)
- [x] 6.2 Implement `check_rate_limit(redis, key_type: str, ip: str, limit: int)` returning bool — raises `429 HTTPException` if exceeded

## 7. Backend — API Models & Router

- [x] 7.1 Create `backend/app/models/schemas.py` with Pydantic models: `UploadRequest`, `UploadResponse`, `DownloadResponse`
- [x] 7.2 Create `backend/app/routers/files.py` with `POST /files/upload` endpoint: validate size ≤ 50MB → check rate limit → generate NanoID (Base62, len=21) → compute expires_at → generate presigned PUT URL → insert to PostgreSQL → write Redis cache → return response
- [x] 7.3 Implement `GET /files/{id}/download` endpoint: check rate limit → query Redis (fallback PostgreSQL) → lazy expiry check → generate presigned GET URL → return response

## 8. Backend — APScheduler Cleanup & App Entrypoint

- [x] 8.1 Create `backend/app/main.py` with FastAPI app, CORS middleware (allow all origins or configurable), include files router under `/api` prefix
- [x] 8.2 Add APScheduler `BackgroundScheduler` in app lifespan: start on startup, register hourly job `DELETE FROM shared_files WHERE expires_at < NOW()`, shutdown on teardown

## 9. Frontend — Project Setup

- [x] 9.1 Create `frontend/package.json` with Next.js, TailwindCSS, Axios, and TypeScript dependencies
- [x] 9.2 Configure `next.config.js` with `output: "export"` and `trailingSlash: true`
- [x] 9.3 Set up TailwindCSS config (`tailwind.config.js`, `postcss.config.js`, global CSS import)
- [x] 9.4 Create `frontend/Dockerfile` multi-stage: `node:18-alpine` build stage runs `npm ci && npm run build`, `nginx:alpine` final stage copies `out/` and nginx config
- [x] 9.5 Create `frontend/nginx.conf` serving static files and reverse-proxying `/api/` to `backend:8000`

## 10. Frontend — Upload Page

- [x] 10.1 Create `src/app/page.tsx` (or `src/pages/index.tsx`) with drag-and-drop dropzone component
- [x] 10.2 Add client-side file size validation: reject files > 50MB with inline error message before API call
- [x] 10.3 Add expiration time selector with options: 1 hour, 24 hours, 7 days, 30 days (default: 24 hours)
- [x] 10.4 On form submit: POST to `/api/files/upload`, then PUT directly to the returned `upload_url` using Axios with correct Content-Type header
- [x] 10.5 After successful upload, display result screen with full share URL (`{origin}/d/{id}`) and copy-to-clipboard button

## 11. Frontend — Download Page

- [x] 11.1 Create `src/app/d/[id]/page.tsx` (or `src/pages/d/[id].tsx`) that extracts `id` from URL params on client side
- [x] 11.2 On mount, fetch `GET /api/files/{id}/download`; on success redirect/open `download_url`
- [x] 11.3 On 404 response, display clean "This link has expired or does not exist" error component
- [x] 11.4 Show loading state while fetching download URL

## 12. Integration & Verification

- [x] 12.1 Verify `docker-compose up` starts all services cleanly from a cold state (no prior volumes)
- [x] 12.2 Test full upload flow: select file → upload → copy share link
- [x] 12.3 Test full download flow: open share link → file downloads with correct filename
- [x] 12.4 Test expiry: upload with 1-second TTL, verify link returns 404 after expiry
- [x] 12.5 Verify presigned URLs use `localhost:9000` (not `minio:9000`) in the browser
