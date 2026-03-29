## ADDED Requirements

### Requirement: Presigned PUT URLs use external MinIO endpoint for browser accessibility
The system SHALL generate presigned PUT URLs using `MINIO_EXTERNAL_ENDPOINT` as the URL host, so generated URLs are resolvable from the client's browser.

#### Scenario: Presigned PUT URL uses external endpoint
- **WHEN** an upload presigned URL is generated
- **THEN** the URL host SHALL match `MINIO_EXTERNAL_ENDPOINT` (default: `http://localhost:9000`), not the internal `minio:9000` hostname

#### Scenario: Presigned PUT URL expires in 5 minutes
- **WHEN** an upload presigned URL is generated
- **THEN** the URL SHALL expire in 300 seconds (5 minutes)

### Requirement: Presigned GET URLs use external MinIO endpoint with forced attachment disposition
The system SHALL generate presigned GET URLs using `MINIO_EXTERNAL_ENDPOINT` as the URL host, with `ResponseContentDisposition` set to `attachment; filename="{original_filename}"`.

#### Scenario: Presigned GET URL uses external endpoint
- **WHEN** a download presigned URL is generated
- **THEN** the URL host SHALL match `MINIO_EXTERNAL_ENDPOINT`, not the internal `minio:9000` hostname

#### Scenario: Presigned GET URL forces attachment download
- **WHEN** a download presigned URL is generated
- **THEN** the URL SHALL include `ResponseContentDisposition=attachment; filename="{original_filename}"` to prevent inline rendering

### Requirement: Two separate boto3 clients for internal ops and URL generation
The system SHALL use one boto3 client configured with `endpoint_url=http://minio:9000` for internal operations, and a separate client configured with `endpoint_url=MINIO_EXTERNAL_ENDPOINT` for presigned URL generation.

#### Scenario: Internal client resolves minio hostname
- **WHEN** the backend performs bucket/object operations (e.g., checking object existence)
- **THEN** it uses the internal boto3 client connected to `http://minio:9000`

#### Scenario: URL-signing client uses external endpoint
- **WHEN** the backend generates a presigned URL
- **THEN** it uses the external boto3 client configured with `MINIO_EXTERNAL_ENDPOINT`
