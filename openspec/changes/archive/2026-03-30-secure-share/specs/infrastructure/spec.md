## ADDED Requirements

### Requirement: Docker Compose stack starts all services with a single command
The system SHALL provide a `docker-compose.yml` that starts all required services (frontend/nginx, backend, postgres, redis, minio, minio-setup) with `docker-compose up`.

#### Scenario: Full stack starts from single command
- **WHEN** a user runs `docker-compose up` in the project root
- **THEN** all services start, initialize, and become healthy without manual intervention

### Requirement: MinIO service has a robust healthcheck
The MinIO service SHALL have a Docker healthcheck using `curl -f http://localhost:9000/minio/health/live` so dependent services wait for readiness.

#### Scenario: MinIO healthcheck passes when ready
- **WHEN** MinIO is fully initialized and accepting requests
- **THEN** the healthcheck command exits 0 and the service is marked healthy

### Requirement: minio-setup init container runs after MinIO is healthy
The `minio-setup` service SHALL use `minio/mc` image, depend on `minio` with `condition: service_healthy`, create the `uploads` bucket, and exit after completing setup.

#### Scenario: Bucket created on first startup
- **WHEN** the minio-setup container runs after MinIO is healthy
- **THEN** the `uploads` bucket is created via `mc mb local/uploads` and the container exits successfully

#### Scenario: Setup idempotent on restart
- **WHEN** the minio-setup container runs and the `uploads` bucket already exists
- **THEN** the container exits successfully without error (use `--ignore-existing` flag)

### Requirement: PostgreSQL initialized with shared_files schema
The system SHALL include an `infra/postgres/init.sql` script that creates the `shared_files` table with a B-Tree index on `expires_at` using standard `postgres:15` image (no extensions required).

#### Scenario: Schema created on first startup
- **WHEN** the PostgreSQL container starts for the first time
- **THEN** `init.sql` is executed, creating the `shared_files` table and `expires_at` index

### Requirement: Environment configuration via .env.example
The system SHALL include a `.env.example` file with all required environment variables pre-filled with working local defaults, including `MINIO_EXTERNAL_ENDPOINT=http://localhost:9000`.

#### Scenario: Reviewer can start with defaults
- **WHEN** a reviewer copies `.env.example` to `.env` without modification
- **THEN** the entire stack works correctly on their local machine

### Requirement: Backend multi-stage Dockerfile produces minimal production image
The backend `Dockerfile` SHALL use a multi-stage build (builder stage installs dependencies, final stage uses slim Python image) to minimize image size.

#### Scenario: Backend image builds successfully
- **WHEN** `docker build` is run on the backend Dockerfile
- **THEN** the image builds without error and the final stage uses a slim base image

### Requirement: Frontend multi-stage Dockerfile produces Nginx-served static build
The frontend `Dockerfile` SHALL use a multi-stage build (Node build stage runs `next build`, final stage uses `nginx:alpine`) with Nginx reverse-proxying `/api/*` to `backend:8000`.

#### Scenario: Frontend image builds and serves correctly
- **WHEN** the frontend container starts
- **THEN** Next.js static export is served by Nginx, and requests to `/api/*` are proxied to the backend

### Requirement: FastAPI configures CORS middleware
The FastAPI application SHALL configure CORS middleware to allow requests from the frontend domain.

#### Scenario: CORS headers present on API responses
- **WHEN** the browser sends a cross-origin request to the API
- **THEN** appropriate CORS headers are returned allowing the request
