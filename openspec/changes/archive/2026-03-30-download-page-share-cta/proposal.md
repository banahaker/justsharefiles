## Why

Users who receive a share link and successfully download a file represent a high-intent audience — they already trust the platform. Without a visible call-to-action, this conversion opportunity is lost. Adding a "Share Your Own Files" button on the download page turns recipients into new uploaders.

## What Changes

- Add a prominent CTA button on the download page's success state ("Downloading..." screen) linking to the upload page (`/`)
- The button appears after a successful download is initiated, alongside the existing download confirmation message

## Capabilities

### New Capabilities

- `download-page-cta`: A call-to-action button on the download success screen that directs users to the upload page

### Modified Capabilities

## Impact

- Only `frontend/src/app/d/[id]/DownloadClient.tsx` is modified
- No backend, API, or infrastructure changes
- No new dependencies
