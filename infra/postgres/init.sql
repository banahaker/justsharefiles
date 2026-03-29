CREATE TABLE IF NOT EXISTS shared_files (
    id VARCHAR(21) PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_files_expires_at ON shared_files (expires_at);
