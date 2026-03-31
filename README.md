# SecureShare

A self-hosted file sharing web app. Upload a file, get a time-limited share link. Files are transferred directly between the browser and object storage — the backend never touches file bytes.

## Features

- Drag-and-drop or click-to-select file upload (max 50 MB)
- Configurable link expiry: 1 hour, 24 hours, 7 days, or 30 days
- Files transferred via presigned URLs (browser ↔ MinIO directly)
- Rate limiting: 10 uploads/min and 30 downloads/min per IP
- Automatic cleanup of expired files (runs hourly)
- Single `docker compose up` startup — no manual setup required

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (static export) + Tailwind CSS, served by Nginx |
| Backend | FastAPI + asyncpg + redis-py |
| Object Storage | MinIO  |
| Database | PostgreSQL 15 |
| Cache / Rate Limit | Redis 7 |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose v2
- Ports `3000`, `5432`, `9000`, `9001` available on your machine

## Quick Start

**1. Clone the repository**

```bash
git clone <repo-url>
cd file-sharing
```

**2. Create your environment file**

```bash
cp .env.example .env
```

The default values work out of the box for local development. No changes needed to get started.

**3. Start all services**

```bash
docker compose up --build
```

The first build takes a few minutes. On subsequent runs, `--build` can be omitted.

**4. Open the app**

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

All variables live in `.env` (copied from `.env.example`). The file is gitignored — never commit it.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `secureshare` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `secureshare_pass` | PostgreSQL password |
| `POSTGRES_DB` | `secureshare` | PostgreSQL database name |
| `DATABASE_URL` | `postgresql://secureshare:secureshare_pass@postgres:5432/secureshare` | Full connection string used by the backend |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO root username |
| `MINIO_ROOT_PASSWORD` | `minioadmin123` | MinIO root password |
| `MINIO_ENDPOINT` | `http://minio:9000` | Internal MinIO endpoint (used by backend for bucket operations) |
| `MINIO_EXTERNAL_ENDPOINT` | `http://localhost:9000` | Public MinIO endpoint (embedded in presigned URLs sent to the browser) |
| `MINIO_BUCKET` | `uploads` | Bucket name for file storage |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins for the backend API |

> **`MINIO_EXTERNAL_ENDPOINT` is the most important variable to change for non-local deployments.** It must be reachable from the end user's browser, because download URLs point directly to MinIO. Set it to your public domain or IP, e.g. `https://files.example.com:9000`.

## Accessing Services

| Service | URL | Notes |
|---|---|---|
| App | http://localhost:3000 | Main user-facing interface |
| Backend API | http://localhost:3000/api | Proxied through Nginx |
| MinIO Console | http://localhost:9001 | Object storage admin UI |
| PostgreSQL | `localhost:5432` | Exposed for local inspection |

### Connecting to PostgreSQL locally

```bash
psql postgresql://secureshare:secureshare_pass@localhost:5432/secureshare
```

Or with any GUI client (TablePlus, DBeaver, etc.) using:
- Host: `localhost`
- Port: `5432`
- User / Password / Database: from your `.env`

## Project Structure

```
file-sharing/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings (reads from .env)
│   │   │   ├── database.py      # asyncpg connection pool
│   │   │   ├── redis_client.py  # redis.asyncio client
│   │   │   ├── storage.py       # MinIO presigned URL generation
│   │   │   └── rate_limit.py    # Fixed-window rate limiter
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── routers/
│   │   │   └── files.py         # /upload and /download endpoints
│   │   └── main.py              # FastAPI app, lifespan, APScheduler
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # Upload page
│   │   ├── layout.tsx           # Root layout (fonts, metadata)
│   │   ├── globals.css          # S23 design tokens (CSS custom properties)
│   │   └── d/[id]/
│   │       ├── page.tsx         # Static shell for dynamic download routes
│   │       └── DownloadClient.tsx  # Download page (client component)
│   ├── nginx.conf               # Nginx config: SPA routing + API proxy
│   ├── tailwind.config.js       # S23 token → Tailwind utility class mapping
│   └── Dockerfile
├── infra/
│   └── postgres/
│       └── init.sql             # Creates shared_files table on first run
├── docker-compose.yml
└── .env.example
```

## API Reference

### `POST /api/files/upload`

Request a presigned upload URL.

**Request body**

```json
{
  "filename": "report.pdf",
  "size_bytes": 1048576,
  "ttl_seconds": 86400
}
```

**Constraints**
- `size_bytes` must be ≤ 52,428,800 (50 MB) — returns `413` if exceeded
- `ttl_seconds` must be between `1` and `2,592,000` (30 days) — returns `422` otherwise

**Response `200`**

```json
{
  "id": "xK9mN2pQrT5uVwY8zAb",
  "upload_url": "http://localhost:9000/uploads/xK9mN2pQrT5uVwY8zAb?...",
  "expires_at": "2024-01-02T12:00:00Z"
}
```

The client PUTs the file directly to `upload_url` (MinIO). The backend is not involved in the transfer.

---

### `GET /api/files/{id}/download`

Retrieve a presigned download URL for a file.

**Response `200`**

```json
{
  "download_url": "http://localhost:9000/uploads/xK9mN2pQrT5uVwY8zAb?...",
  "original_filename": "report.pdf"
}
```

**Response `404`** — link has expired or does not exist
**Response `429`** — rate limit exceeded

---

## Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /api/files/upload` | 10 requests / minute / IP |
| `GET /api/files/{id}/download` | 30 requests / minute / IP |

Limits use a fixed-window strategy backed by Redis. Exceeding the limit returns `429 Too Many Requests`.

## Stopping and Resetting

**Stop services (keep data)**

```bash
docker compose down
```

**Stop and delete all data** (files, database, redis)

```bash
docker compose down -v
```

## Deploying

For a production deployment, change the following in `.env`:

1. Set strong passwords for `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`.
2. Set `MINIO_EXTERNAL_ENDPOINT` to the public URL of your MinIO instance (must be accessible from end users' browsers).
3. Set `CORS_ORIGINS` to your frontend's public URL.
4. Ensure ports `9000` (MinIO API) is publicly accessible if you rely on the browser-direct presigned URL pattern.
