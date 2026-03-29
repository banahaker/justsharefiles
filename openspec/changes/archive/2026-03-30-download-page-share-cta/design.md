## Context

The download page (`DownloadClient.tsx`) currently has a "downloading" success state that shows a confirmation message but offers no next action. Users who land here via a share link are engaged and already familiar with the product — the best moment to prompt them to try uploading themselves.

## Goals / Non-Goals

**Goals:**
- Add a CTA on the download success screen that links to the upload page
- Keep the design consistent with the existing TailwindCSS visual style

**Non-Goals:**
- Adding CTAs to the loading or error states
- Any analytics or tracking integration
- Backend or API changes

## Decisions

### Single anchor tag linking to `/`
A plain `<a href="/">` is sufficient — no router state to carry over, no async logic. Consistent with the existing "Upload a new file" link already present on the error state.

## Risks / Trade-offs

- None significant — isolated single-component change with no side effects.
