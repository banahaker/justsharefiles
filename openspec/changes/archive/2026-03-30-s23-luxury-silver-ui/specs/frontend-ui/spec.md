## MODIFIED Requirements

### Requirement: Upload page provides drag-and-drop file selection with client-side validation
The upload page SHALL use S23 Luxury Silver styling: silver-bg body, silver-surface card with silver shadow, 4px radius on all containers, Montserrat font with wide tracking. No blue or green accents.

#### Scenario: File size validation on the client
- **WHEN** a user selects or drops a file larger than 50MB
- **THEN** the UI displays an error message in red (`#EF4444`) before making any API call

#### Scenario: Valid file accepted
- **WHEN** a user selects or drops a file of 50MB or less
- **THEN** the file is staged and the dropzone border changes to `--color-brand-primary` (#9CA3AF)

### Requirement: Upload page includes expiration time selector
The expiration selector SHALL use S23 styling: unselected options use `bg-silver-surface` with `text-silver-text`; selected option uses `bg-silver-accent` (`#6B7280`) with white text; all options use 4px radius.

#### Scenario: Default expiration selected
- **WHEN** the upload page loads
- **THEN** 24 hours is pre-selected and visually distinguished with `bg-silver-accent` background

#### Scenario: User selects custom expiration
- **WHEN** a user selects a different expiration option
- **THEN** that option receives `bg-silver-accent` and others revert to `bg-silver-surface`

### Requirement: Upload result screen displays shareable link
The result screen SHALL use S23 styling: silver checkmark icon on `bg-silver-surface` circle (no green), H1 in Montserrat light with wide tracking, link field on `bg-silver-bg`, Copy button using `bg-silver-accent`.

#### Scenario: Share link shown after upload
- **WHEN** the upload completes successfully
- **THEN** the result screen SHALL display the share URL, a Copy button in silver-accent, and an "Upload another file" text link — all in S23 style

### Requirement: Download page at /d/[id] fetches and triggers download
All download page states (loading, success, error) SHALL use S23 styling with no blue or green accents.

#### Scenario: Loading state uses silver spinner
- **WHEN** the download page is fetching the download URL
- **THEN** the spinner border color SHALL be `--color-brand-accent` (`#6B7280`), not blue

#### Scenario: Success state uses silver palette
- **WHEN** the download initiates successfully
- **THEN** the success card SHALL use `bg-silver-surface`, silver-accent icon circle, Montserrat wide-tracked heading, and the "Share Your Own Files" CTA button in `bg-silver-accent`

#### Scenario: Expired or invalid link shows error
- **WHEN** the backend returns 404
- **THEN** the error card SHALL use `bg-silver-surface` with a red warning icon, and the "Upload a new file" button SHALL use `bg-silver-accent`

### Requirement: Upload progress bar uses S23 palette
The progress bar SHALL use `bg-silver-surface` as the track and `bg-silver-accent` as the fill, with no blue.

#### Scenario: Progress bar fill is silver-accent
- **WHEN** a file upload is in progress
- **THEN** the filled portion of the progress bar SHALL be `bg-silver-accent` color

### Requirement: All interactive elements meet WCAG AA and support keyboard navigation
All buttons and links SHALL have visible focus rings using `outline` with `--color-brand-accent` color and maintain WCAG AA contrast ratios. Reduced-motion media query SHALL disable transitions.

#### Scenario: Focus ring visible
- **WHEN** a user navigates with keyboard Tab to any button or link
- **THEN** a visible outline ring SHALL appear around the focused element

#### Scenario: Reduced motion respected
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** all CSS transitions and animations SHALL be disabled
