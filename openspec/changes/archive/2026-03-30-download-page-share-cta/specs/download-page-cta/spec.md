## ADDED Requirements

### Requirement: Download success screen shows a CTA to the upload page
The download page SHALL display a "Share Your Own Files" button linking to `/` on the download success ("Downloading...") screen, so that recipients are prompted to try uploading their own files.

#### Scenario: CTA visible after successful download initiation
- **WHEN** a user visits a valid share link and the download is initiated successfully
- **THEN** the success screen SHALL display a button or link labelled "Share Your Own Files" (or equivalent) that navigates to the upload page (`/`)

#### Scenario: CTA not shown on loading state
- **WHEN** the page is in the loading state (fetching the download URL)
- **THEN** no CTA button SHALL be displayed

#### Scenario: CTA not shown on error state
- **WHEN** the page displays an error (expired or invalid link)
- **THEN** no new CTA button from this change is shown (the existing "Upload a new file" link on the error state is unchanged)
