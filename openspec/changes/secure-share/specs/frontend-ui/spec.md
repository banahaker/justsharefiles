## ADDED Requirements

### Requirement: Upload page provides drag-and-drop file selection with client-side validation
The system SHALL provide a Next.js upload page (at `/`) with a drag-and-drop dropzone that validates file size client-side before initiating any API requests.

#### Scenario: File size validation on the client
- **WHEN** a user selects or drops a file larger than 50MB
- **THEN** the UI displays an error message before making any API call

#### Scenario: Valid file accepted
- **WHEN** a user selects or drops a file of 50MB or less
- **THEN** the file is staged for upload and the expiration selector is shown

### Requirement: Upload page includes expiration time selector
The system SHALL provide a UI control to select the file TTL from preset options before initiating upload.

#### Scenario: Default expiration selected
- **WHEN** the upload page loads
- **THEN** a default expiration option is pre-selected (e.g., 24 hours)

#### Scenario: User selects custom expiration
- **WHEN** a user selects an expiration option (e.g., 1 hour, 24 hours, 7 days, 30 days)
- **THEN** the selected `ttl_seconds` value is used in the upload API request

### Requirement: Upload result screen displays shareable link
The system SHALL display a shareable link after a successful upload that the user can copy.

#### Scenario: Share link shown after upload
- **WHEN** the presigned PUT upload to MinIO completes successfully
- **THEN** the UI displays the full share URL in format `{origin}/d/{id}` with a copy-to-clipboard button

### Requirement: Download page at /d/[id] fetches and triggers download
The system SHALL provide a Next.js download page at `/d/[id]` that extracts the NanoID from the URL, fetches the presigned GET URL, and triggers the file download.

#### Scenario: Valid link triggers download
- **WHEN** a user visits `/d/{id}` for a valid, unexpired file
- **THEN** the page fetches `GET /api/files/{id}/download` and redirects to or opens the presigned download URL

#### Scenario: Expired or invalid link shows error
- **WHEN** a user visits `/d/{id}` and the backend returns `404`
- **THEN** the UI displays a clean "This link has expired or does not exist" message

### Requirement: UI is clean and minimal using TailwindCSS
The system SHALL implement the frontend using TailwindCSS with a clean, minimal design suitable for a professional demo.

#### Scenario: Consistent styling
- **WHEN** the application is loaded
- **THEN** all pages use TailwindCSS utility classes with a consistent visual style
