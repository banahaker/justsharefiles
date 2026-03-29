## Why

The current UI uses generic Tailwind defaults — blue buttons, white cards, gray backgrounds — that look indistinguishable from any auto-generated app. For a file-sharing product targeting professionals, first impressions matter. Applying the S23 Luxury Silver visual language replaces generic with intentional: a cool brushed-metal palette, Montserrat typography with wide tracking, machined 4px radius, and diffused silver shadows that signal precision and trust.

## What Changes

- Replace generic `bg-gray-50` / blue-button / white-card defaults with S23 Luxury Silver design tokens
- Add Montserrat font (Google Fonts) to the layout
- Introduce CSS custom properties for the full S23 token set (colors, radius, shadow, typography)
- Restyle all four frontend screens: upload idle, upload success, download loading, download success, download error
- Update Tailwind config to map S23 tokens to utility classes
- Replace all `blue-*` and `green-*` accents with silver/platinum palette
- Add reduced-motion support and visible focus rings per WCAG AA

## Capabilities

### New Capabilities

- `s23-design-system`: CSS token layer, Tailwind config extension, and Montserrat font integration defining the S23 Luxury Silver visual language

### Modified Capabilities

- `frontend-ui`: All UI screens restyled to S23 — upload page, upload success, download page states (loading / success / error)

## Impact

- `frontend/src/app/globals.css` — add CSS custom properties and font import
- `frontend/tailwind.config.js` — extend theme with S23 token aliases
- `frontend/src/app/layout.tsx` — add Montserrat font class to body
- `frontend/src/app/page.tsx` — full restyle of upload flow
- `frontend/src/app/d/[id]/DownloadClient.tsx` — full restyle of download flow
- No backend, API, or infrastructure changes
- No new npm dependencies (Montserrat via Google Fonts CDN)
