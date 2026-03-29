## Context

Greenfield full-stack application. No existing codebase to migrate. Primary deployment target is a reviewer's local machine via `docker-compose up`. The architecture must work flawlessly out of the box — zero manual setup beyond copying `.env.example` to `.env`.

Key constraint: file bytes must never pass through the FastAPI backend. All file I/O is direct between the browser and MinIO via presigned URLs. The backend only handles metadata and URL generation.

## Goals / Non-Goals

**Goals:**
- Single `docker-compose up` starts the entire stack (frontend, backend, postgres, redis, minio)
- Files transfer directly browser ↔ MinIO, backend is metadata-only
- Presigned URLs work from the reviewer's browser (localhost), configurable for production
- File links expire as specified; expired links return 404
- Rate limiting protects both upload and download endpoints per IP

**Non-Goals:**
- User accounts or authentication
- File listing or management UI
- Production TLS/HTTPS (out of scope for local demo)
- Resumable uploads
- pg_cron or any Postgres extension beyond stock postgres:15

## Decisions

### D1: Presigned URL dual-endpoint pattern

**Decision**: Configure two separate boto3 clients — one for internal operations (`http://minio:9000`, used for bucket/object operations), one for URL generation (uses `MINIO_EXTERNAL_ENDPOINT`, defaults to `http://localhost:9000`).

**Why**: MinIO's hostname `minio` resolves inside Docker's network but not in the browser. Presigned URLs are signed against the endpoint hostname, so they must use the externally-accessible address. Using a single client would either break internal connections or generate unusable URLs.

**Alternatives considered**: URL rewriting after generation — brittle and error-prone with signature validation.

---

### D2: APScheduler instead of pg_cron for cleanup

**Decision**: Use `APScheduler` (in-process) with an hourly job: `DELETE FROM shared_files WHERE expires_at < NOW()`.

**Why**: `pg_cron` requires a non-standard Postgres image, introducing potential build failures on reviewer machines. Standard `postgres:15` works universally. Lazy deletion (on every GET) is the primary expiry mechanism; background cleanup is just housekeeping.

**Alternatives considered**: Cron container (extra Docker service complexity), pg_cron (custom image risk).

---

### D3: Fixed Window rate limiting via Redis INCR/EXPIRE

**Decision**: Rate limit keys `ratelimit:{type}:{ip}` use Redis `INCR` + `EXPIRE` (set on first increment only). Upload: 10/min, Download: 30/min.

**Why**: Simpler than sliding window, no Lua scripts, atomic enough for this scale. Burst at window boundary is acceptable for a demo application.

**Alternatives considered**: Sliding window with sorted sets — more accurate but significantly more complex.

---

### D4: NanoID with explicit Base62 alphabet

**Decision**: Use `nanoid` Python package with alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`, length 21.

**Why**: Default nanoid uses URL-safe alphabet including `-` and `_`. Base62 is safer in more URL contexts (e.g., no ambiguity with query string separators) while maintaining sufficient entropy (~125 bits).

---

### D5: MinIO object key = NanoID only

**Decision**: Store files at key `{nanoid}` in the `uploads` bucket. Original filename stored only in PostgreSQL/Redis.

**Why**: Avoids URL encoding issues with special characters in filenames. The filename is only needed for the `Content-Disposition` header on download, which is set as a presigned URL parameter — not derived from the object key.

---

### D6: Next.js App Router with `output: "export"`

**Decision**: Use Next.js App Router, static export (`output: "export"`), served by Nginx. Download page at `/d/[id]`.

**Why**: Static export produces a deployable bundle without needing a Node.js server at runtime. Nginx serves the static files and reverse-proxies `/api/*` to the FastAPI backend — clean separation.

---

### D7: Redis cache TTL = remaining seconds to expiry

**Decision**: When writing to Redis cache (`file:{nanoid}`), set TTL to `max(1, int((expires_at - now()).total_seconds()))`.

**Why**: Cache entries auto-expire in Redis at exactly the same time as in PostgreSQL. No stale cache serving expired files. No separate cache invalidation needed.

---

### D8: minio-setup init container with health-gated startup

**Decision**: `minio-setup` service uses `minio/mc` image. `depends_on: minio: condition: service_healthy`. MinIO healthcheck uses `curl -f http://localhost:9000/minio/health/live`.

**Why**: Without health-gating, `mc mb` can fail if MinIO isn't fully ready, silently leaving the bucket uncreated and making the app fail mysteriously on first upload.

## Risks / Trade-offs

- **Fixed window rate limit burst** → Acceptable for demo scope; document in README
- **Orphaned MinIO objects** (browser PUT succeeds, app has no record) → Objects expire naturally via MinIO lifecycle policy or are invisible without a valid DB record; no security risk
- **Orphaned DB records** (browser PUT fails, DB record exists) → GET returns 404 (object not in MinIO); background cleanup removes DB record after expiry
- **APScheduler in multi-worker uvicorn** → If scaled to multiple workers, each runs its own scheduler. For single-instance Docker Compose deployment this is fine; document as single-instance assumption
- **No HTTPS on MinIO** → Presigned URL signatures are HMAC-based; replay possible on local network. Acceptable for local demo, not for production

## Open Questions

- None — all decisions made during explore session with user.
