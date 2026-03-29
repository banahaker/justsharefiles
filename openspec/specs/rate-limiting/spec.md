## Requirements

### Requirement: Upload endpoint is rate limited per IP using fixed window
The system SHALL enforce a maximum of 10 upload requests per IP address per 60-second fixed window on `POST /api/files/upload`.

#### Scenario: Within rate limit
- **WHEN** a client IP makes 10 or fewer upload requests within a 60-second window
- **THEN** the request is processed normally

#### Scenario: Rate limit exceeded on upload
- **WHEN** a client IP makes more than 10 upload requests within a 60-second window
- **THEN** the system returns `429 Too Many Requests`

### Requirement: Download endpoint is rate limited per IP using fixed window
The system SHALL enforce a maximum of 30 download requests per IP address per 60-second fixed window on `GET /api/files/{id}/download`.

#### Scenario: Within rate limit
- **WHEN** a client IP makes 30 or fewer download requests within a 60-second window
- **THEN** the request is processed normally

#### Scenario: Rate limit exceeded on download
- **WHEN** a client IP makes more than 30 download requests within a 60-second window
- **THEN** the system returns `429 Too Many Requests`

### Requirement: Rate limiting implemented with Redis INCR and EXPIRE
The system SHALL implement fixed-window rate limiting using Redis keys with pattern `ratelimit:{type}:{ip}` where `INCR` increments the counter and `EXPIRE` is set only on the first increment (when value equals 1) to 60 seconds.

#### Scenario: First request in window sets TTL
- **WHEN** a client makes the first request in a new window
- **THEN** Redis key is created with value 1 and TTL of 60 seconds

#### Scenario: Subsequent requests increment counter
- **WHEN** a client makes additional requests within the same window
- **THEN** the Redis counter increments and the TTL is not reset
