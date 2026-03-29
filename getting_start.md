# OpenSpec: Secure File Sharing Application

## 1. Project Overview
Build a secure, scalable, file-sharing web application. The application allows users to upload files and generate a hard-to-guess, temporary sharing link. Files are transferred directly between the client and MinIO (Object Storage) using Presigned URLs to decouple I/O from the backend server. 

## 2. Tech Stack & Environment
*   **Architecture:** Monorepo deploying via Docker Compose.
*   **Frontend:** React (Next.js with `output: "export"`) served by Nginx.
*   **Backend:** Python 3.11+ with FastAPI.
*   **Database:** PostgreSQL 15+ (Requires `pg_cron` extension).
*   **Cache & Rate Limiter:** Redis.
*   **Storage:** MinIO (S3 compatible).
*   **Package Manager:** `uv` or `pip` for Python, `npm` for Node.

## 3. Directory Structure Requirement
Generate the project using the following exact structure:
```text
/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile (Multi-stage: builder -> slim)
│   ├── requirements.txt (fastapi, uvicorn, asyncpg, redis, boto3, nanoid, pydantic-settings)
│   └── app/ (FastAPI application with routers, models, core configs)
├── frontend/
│   ├── Dockerfile (Multi-stage: node build -> nginx alpine)
│   ├── nginx.conf (Reverse proxy /api to backend:8000)
│   ├── package.json (Next.js, TailwindCSS, Axios)
│   └── src/
└── infra/
    ├── postgres/init.sql (Table creation & pg_cron setup)
    └── minio/create-bucket.sh (mc script to initialize bucket)
```

## 4. Database Schema (PostgreSQL)
Create an `init.sql` script to initialize the following:

**Table: `shared_files`**
*   `id` (VARCHAR 21, Primary Key) - The NanoID.
*   `original_filename` (VARCHAR 255, Not Null) - To display to the user.
*   `size_bytes` (BIGINT, Not Null) - File size limit max 50MB.
*   `created_at` (TIMESTAMPTZ, Default NOW()).
*   `expires_at` (TIMESTAMPTZ, Not Null).

**Indexes & Extensions:**
*   Enable `pg_cron` extension.
*   Create a B-Tree Index on `expires_at` for fast querying.
*   Create a `pg_cron` job running every hour to `DELETE FROM shared_files WHERE expires_at < NOW();`.

## 5. Cache & Rate Limit Schema (Redis)
*   **Metadata Cache:** 
    *   Key: `file:{nanoid}` 
    *   Value: JSON string containing `original_filename` and `expires_at`.
    *   TTL: Set to exactly match the remaining seconds until `expires_at`.
*   **Rate Limiter:**
    *   Implement a Sliding Window or Fixed Window mechanism.
    *   Upload limit: Max 10 requests per minute per IP.
    *   Download request limit: Max 30 requests per minute per IP.

## 6. Core Business Logic & API Specification

### 6.1 Upload Flow (POST `/api/files/upload`)
*   **Request JSON Payload:**
    *   `filename` (string)
    *   `size_bytes` (integer)
    *   `ttl_seconds` (integer, max: 2592000 for 30 days)
*   **Backend Logic:**
    1. Verify `size_bytes` <= 50MB. Return `413 Payload Too Large` if exceeded.
    2. Check Rate Limit by Client IP. Return `429 Too Many Requests` if exceeded.
    3. Generate a secure Base62 NanoID (length 21).
    4. Calculate `expires_at` = `NOW() + ttl_seconds`.
    5. Generate a **Presigned PUT URL** using `boto3` (MinIO endpoint). Expiration: 5 minutes.
    6. Save metadata to PostgreSQL and Redis.
*   **Response (200 OK):**
    ```json
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "upload_url": "http://localhost:9000/uploads/V1StGXR8_Z5jdHi6B-myT?signature=...",
      "expires_at": "2024-12-31T23:59:59Z"
    }
    ```

### 6.2 Download Flow (GET `/api/files/{id}/download`)
*   **Backend Logic:**
    1. Check Rate Limit by Client IP.
    2. Query Redis for `file:{id}`. If miss, query PostgreSQL.
    3. **Lazy Deletion Check:** If not found OR `expires_at` < `NOW()`, immediately return `404 Not Found`.
    4. Generate a **Presigned GET URL** using `boto3`. 
    5. **CRITICAL SECURITY:** Force the `ResponseContentDisposition` to `attachment; filename="{original_filename}"` in the `boto3.generate_presigned_url` parameters to prevent XSS.
*   **Response (200 OK):**
    ```json
    {
      "original_filename": "report.pdf",
      "download_url": "http://localhost:9000/uploads/V1StGXR8_Z5jdHi6B-myT?signature=..."
    }
    ```

## 7. Infrastructure Constraints & Rules for the AI

Please strictly adhere to the following rules when writing the code:

1.  **MinIO Network Trap:** The backend container connects to MinIO via `http://minio:9000`, but the generated Presigned URLs will be used by the client's browser on the host machine. You MUST configure `boto3` to use an environment variable `MINIO_EXTERNAL_ENDPOINT` (e.g., `http://localhost:9000`) when generating URLs, so the client can resolve the address.
2.  **Docker Compose Initialization:** Include a temporary `minio-setup` container using the `minio/mc` image. It must wait for the MinIO container to be healthy, then run `mc mb local/uploads` to create the bucket, set a 30-day lifecycle policy if possible, and exit.
3.  **CORS:** The FastAPI app must configure CORS middleware to allow origins from the frontend domain.
4.  **Frontend Implementation:** Build a clean, minimal UI using Next.js & TailwindCSS. It needs an upload dropzone (with file size validation on the client-side), an expiration time selector, a result screen showing the generated share link, and a download page that extracts the NanoID from the URL parameters to fetch the download link.

---
**End of Spec**
---

### 💡 如何使用這份 Spec？

你把這份 Markdown 直接丟給 OpenSpec（或類似的 Vibe Coding 工具如 Cursor / GitHub Copilot Agent），它就能：
1. 精準知道要開哪些資料夾。
2. 知道 FastAPI 的 `requirements.txt` 要裝 `boto3` 跟 `nanoid`。
3. 知道 `docker-compose.yml` 裡面需要寫一個 `minio-setup` 來避開我剛剛說的地雷。
4. 知道產生 URL 時必須帶上 `attachment` 標頭防止 XSS（這是資安實力的展現）。

這份 Spec 已經幫你把所有高階工程師的思維全部轉化成 AI 聽得懂的「指令」了。準備好讓 AI 幫你寫出這個驚豔面試官的專案了嗎？